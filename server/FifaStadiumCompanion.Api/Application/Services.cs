using FifaStadiumCompanion.Api.Domain;
using Google.Cloud.Firestore;
using System.Text.Json;

namespace FifaStadiumCompanion.Api.Application;

public sealed class VenueService
{
    private readonly CollectionReference _venuesCollection;

    public VenueService(FirestoreDb firestoreDb)
    {
        _venuesCollection = firestoreDb.Collection("venues");
    }

    public async Task<IEnumerable<Venue>> GetAllVenuesAsync()
    {
        var snapshot = await _venuesCollection.GetSnapshotAsync();
        return snapshot.Documents
            .Select(ToVenue)
            .Where(v => v is not null)
            .Select(v => v!)
            .ToList();
    }

    public async Task<Venue?> GetVenueByIdAsync(string stadiumId)
    {
        var snapshot = await _venuesCollection.Document(stadiumId).GetSnapshotAsync();
        return ToVenue(snapshot);
    }

    private static Venue? ToVenue(DocumentSnapshot doc)
    {
        if (!doc.Exists)
            return null;

        doc.TryGetValue("imageUrl", out string? imageUrl);
        return new Venue(
            Id: doc.Id,
            Name: doc.GetValue<string>("name"),
            City: doc.GetValue<string>("city"),
            Capacity: doc.GetValue<int>("capacity"),
            ImageUrl: imageUrl
        );
    }
}

public sealed class MatchService
{
    private readonly CollectionReference _matchesCollection;

    public MatchService(FirestoreDb firestoreDb)
    {
        _matchesCollection = firestoreDb.Collection("matches");
    }

    public async Task<IEnumerable<Match>> GetAllMatchesAsync()
    {
        var snapshot = await _matchesCollection.GetSnapshotAsync();
        return snapshot.Documents
            .Select(ToMatch)
            .Where(m => m is not null)
            .Select(m => m!)
            .ToList();
    }

    public async Task<IEnumerable<Match>> GetMatchesByVenueAsync(string stadiumId)
    {
        var query = _matchesCollection.WhereEqualTo("stadiumId", stadiumId);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents
            .Select(ToMatch)
            .Where(m => m is not null)
            .Select(m => m!)
            .ToList();
    }

    public async Task<Match?> GetMatchByIdAsync(string matchId)
    {
        var snapshot = await _matchesCollection.Document(matchId).GetSnapshotAsync();
        return ToMatch(snapshot);
    }

    private static Match? ToMatch(DocumentSnapshot doc)
    {
        if (!doc.Exists)
            return null;

        var scheduledTime = doc.GetValue<Timestamp>("scheduledTime").ToDateTime();
        var status = doc.TryGetValue("status", out string? statusValue) ? statusValue : "scheduled";

        return new Match(
            Id: doc.Id,
            Title: doc.GetValue<string>("title"),
            HomeTeam: doc.GetValue<string>("homeTeam"),
            AwayTeam: doc.GetValue<string>("awayTeam"),
            ScheduledTime: scheduledTime,
            StadiumId: doc.GetValue<string>("stadiumId"),
            Status: status
        );
    }
}

public sealed class DispatchService
{
    private readonly CollectionReference _dispatchesCollection;

    public DispatchService(FirestoreDb firestoreDb)
    {
        _dispatchesCollection = firestoreDb.Collection("dispatches");
    }

    public async Task<Dispatch> CreateDispatchAsync(string stadiumId, string actionType, string description, string? issuedBy = null)
    {
        var dispatch = new Dispatch(
            Id: Guid.NewGuid().ToString("N"),
            StadiumId: stadiumId,
            ActionType: actionType,
            Description: description,
            IssuedAt: DateTime.UtcNow,
            IssuedBy: issuedBy
        );

        await _dispatchesCollection.Document(dispatch.Id).SetAsync(new
        {
            dispatch.Id,
            dispatch.StadiumId,
            dispatch.ActionType,
            dispatch.Description,
            dispatch.IssuedAt,
            dispatch.IssuedBy
        });

        return dispatch;
    }

    public async Task<IEnumerable<Dispatch>> GetDispatchesByVenueAsync(string stadiumId)
    {
        var query = _dispatchesCollection.WhereEqualTo("stadiumId", stadiumId);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents
            .Select(ToDispatch)
            .Where(d => d is not null)
            .Select(d => d!)
            .ToList();
    }

    private static Dispatch? ToDispatch(DocumentSnapshot doc)
    {
        if (!doc.Exists)
            return null;

        doc.TryGetValue("issuedBy", out string? issuedBy);
        return new Dispatch(
            Id: doc.Id,
            StadiumId: doc.GetValue<string>("stadiumId"),
            ActionType: doc.GetValue<string>("actionType"),
            Description: doc.GetValue<string>("description"),
            IssuedAt: doc.GetValue<Timestamp>("issuedAt").ToDateTime(),
            IssuedBy: issuedBy
        );
    }
}

public sealed class AiAssistanceService
{
    private readonly string _geminiApiKey;
    private readonly bool _allowMockFallback;
    private readonly HttpClient _httpClient;
    private const string GeminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

    public AiAssistanceService(string geminiApiKey, bool allowMockFallback = false)
    {
        if (string.IsNullOrWhiteSpace(geminiApiKey) && !allowMockFallback)
        {
            throw new InvalidOperationException("GEMINI_API_KEY must be configured for AI assistance.");
        }

        _geminiApiKey = geminiApiKey ?? string.Empty;
        _allowMockFallback = allowMockFallback;
        _httpClient = new HttpClient();
    }

    public async Task<string> QueryAsync(string question, string? language = "en")
    {
        var systemPrompt = GetSystemPromptForLanguage(language);
        var requestBody = new
        {
            instances = new[]
            {
                new { content = $"{systemPrompt}\n\nUser question: {question}" }
            }
        };

        var content = new StringContent(
            JsonSerializer.Serialize(requestBody),
            System.Text.Encoding.UTF8,
            "application/json"
        );

        if (string.IsNullOrWhiteSpace(_geminiApiKey))
        {
            if (_allowMockFallback)
            {
                return GetMockResponse(question, language);
            }

            throw new InvalidOperationException("GEMINI_API_KEY must be configured for AI assistance.");
        }

        try
        {
            var response = await _httpClient.PostAsync(
                $"{GeminiEndpoint}?key={_geminiApiKey}",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                if (_allowMockFallback)
                {
                    return GetMockResponse(question, language);
                }

                throw new InvalidOperationException($"Gemini API request failed: {response.StatusCode} - {errorBody}");
            }

            var responseText = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(responseText);
            var root = jsonDoc.RootElement;

            if (TryExtractAnswer(root, out var answer))
                return answer;

            if (_allowMockFallback)
                return GetMockResponse(question, language);

            throw new InvalidOperationException("Gemini API returned an unexpected response format.");
        }
        catch
        {
            if (_allowMockFallback)
                return GetMockResponse(question, language);

            throw;
        }
    }

    private string GetMockResponse(string question, string? language)
    {
        return language switch
        {
            "es" => $"Respuesta a tu pregunta: {question}",
            "fr" => $"Réponse à ta question: {question}",
            _ => $"Response to your question: {question}"
        };
    }

    private static bool TryExtractAnswer(JsonElement root, out string answer)
    {
        if (root.TryGetProperty("predictions", out var predictions) && predictions.GetArrayLength() > 0)
        {
            var firstPrediction = predictions[0];
            if (firstPrediction.TryGetProperty("content", out var content) && content.ValueKind == JsonValueKind.String)
            {
                answer = content.GetString() ?? string.Empty;
                return !string.IsNullOrWhiteSpace(answer);
            }

            if (firstPrediction.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
            {
                var candidate = candidates[0];
                if (candidate.TryGetProperty("content", out var candidateContent) && candidateContent.ValueKind == JsonValueKind.String)
                {
                    answer = candidateContent.GetString() ?? string.Empty;
                    return !string.IsNullOrWhiteSpace(answer);
                }
            }
        }

        if (root.TryGetProperty("candidates", out var candidatesRoot) && candidatesRoot.GetArrayLength() > 0)
        {
            var candidate = candidatesRoot[0];
            if (candidate.TryGetProperty("content", out var content) && content.ValueKind == JsonValueKind.String)
            {
                answer = content.GetString() ?? string.Empty;
                return !string.IsNullOrWhiteSpace(answer);
            }

            if (candidate.TryGetProperty("content", out var contentObj) && contentObj.ValueKind == JsonValueKind.Object &&
                contentObj.TryGetProperty("parts", out var parts) && parts.GetArrayLength() > 0 &&
                parts[0].TryGetProperty("text", out var text))
            {
                answer = text.GetString() ?? string.Empty;
                return !string.IsNullOrWhiteSpace(answer);
            }
        }

        answer = string.Empty;
        return false;
    }

    private static string GetSystemPromptForLanguage(string? language) =>
        language switch
        {
            "es" => "Eres un asistente de fútbol en un estadio. Responde en español brevemente y de manera útil para un aficionado de fútbol.",
            "fr" => "Vous êtes un assistant de football dans un stade. Répondez en français brièvement et de manière utile pour un supporter de football.",
            _ => "You are a helpful football stadium assistant. Answer briefly and provide useful information for football fans."
        };
}
