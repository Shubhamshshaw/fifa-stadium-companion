using FifaStadiumCompanion.Api.Domain;
using Google.Cloud.Firestore;
using System.Text.Json;

namespace FifaStadiumCompanion.Api.Application;

public sealed class VenueService
{
    private readonly CollectionReference _venuesCollection;

    public VenueService(FirestoreDb firestoreDb)
    {
        _venuesCollection = firestoreDb.Collection("stadiums");
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
    // Gemini REST API — generateContent endpoint (gemini-2.0-flash)
    private const string GeminiModel = "gemini-2.0-flash";
    private const string GeminiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

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
        if (string.IsNullOrWhiteSpace(_geminiApiKey))
        {
            if (_allowMockFallback)
                return GetMockResponse(question, language);

            throw new InvalidOperationException("GEMINI_API_KEY must be configured for AI assistance.");
        }

        var systemPrompt = GetSystemPromptForLanguage(language);

        // Gemini REST API request body: contents[].parts[].text
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = $"{systemPrompt}\n\nUser question: {question}" }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.7,
                maxOutputTokens = 512
            }
        };

        var httpContent = new StringContent(
            JsonSerializer.Serialize(requestBody),
            System.Text.Encoding.UTF8,
            "application/json"
        );

        try
        {
            var url = $"{GeminiBaseUrl}/{GeminiModel}:generateContent?key={_geminiApiKey}";
            var response = await _httpClient.PostAsync(url, httpContent);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                if (_allowMockFallback)
                    return GetMockResponse(question, language);

                throw new InvalidOperationException(
                    $"Gemini API request failed: {response.StatusCode} — {errorBody}");
            }

            var responseText = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(responseText);

            if (TryExtractAnswer(jsonDoc.RootElement, out var answer))
                return answer;

            if (_allowMockFallback)
                return GetMockResponse(question, language);

            throw new InvalidOperationException("Gemini API returned an unexpected response format.");
        }
        catch (Exception) when (_allowMockFallback)
        {
            return GetMockResponse(question, language);
        }
    }

    // Parses Gemini REST generateContent response:
    // { "candidates": [{ "content": { "parts": [{ "text": "..." }] } }] }
    private static bool TryExtractAnswer(JsonElement root, out string answer)
    {
        answer = string.Empty;

        if (!root.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            return false;

        var candidate = candidates[0];
        if (!candidate.TryGetProperty("content", out var contentObj))
            return false;

        if (!contentObj.TryGetProperty("parts", out var parts) || parts.GetArrayLength() == 0)
            return false;

        if (!parts[0].TryGetProperty("text", out var textEl))
            return false;

        answer = textEl.GetString() ?? string.Empty;
        return !string.IsNullOrWhiteSpace(answer);
    }

    private static string GetMockResponse(string question, string? language)
    {
        var q = question.ToLowerInvariant();
        var hint = q.Contains("capacity")  ? "Check your stadium card for the exact capacity figure shown above." :
                   q.Contains("exit") || q.Contains("safety") || q.Contains("emergency")
                                           ? "Emergency exits are marked in green at every gate level. Follow steward instructions at all times." :
                   q.Contains("food") || q.Contains("eat") || q.Contains("drink")
                                           ? "Concession stands are open on Levels 1 and 3. Halal-certified options available at all outlets." :
                   q.Contains("park")      ? "Official parking is at Lot A (Gate 1) and Lot C (Gate 7). Shuttles run every 10 minutes." :
                   q.Contains("ticket")   ? "Ticket scanning opens 2 hours before kick-off. Digital tickets accepted at all gates." :
                   q.Contains("transport") || q.Contains("metro") || q.Contains("bus")
                                           ? "The stadium is served by the Doha Metro Gold Line. Free shuttle buses run from the Fan Zone every 15 minutes." :
                                            "Our stewards are happy to assist you on-site. Look for staff in yellow vests at every gate entrance.";

        return language switch
        {
            "es" => $"Asistente del Estadio FIFA 2026: {hint}",
            "fr" => $"Assistant Stade FIFA 2026: {hint}",
            _   => $"FIFA 2026 Stadium Assistant: {hint}"
        };
    }

    private static string GetSystemPromptForLanguage(string? language) =>
        language switch
        {
            "es" => "Eres un asistente inteligente de un estadio del Mundial FIFA 2026, impulsado por Google Gemini. Responde en español de forma breve y precisa. Proporciona información útil sobre el estadio, seguridad, servicios, transporte y experiencia del partido para los aficionados.",
            "fr" => "Vous êtes un assistant intelligent d'un stade de la Coupe du Monde FIFA 2026, propulsé par Google Gemini. Répondez en français brièvement. Fournissez des informations utiles sur le stade, la sécurité, les services, les transports et l'expérience du match.",
            _   => "You are an intelligent FIFA World Cup 2026 stadium assistant powered by Google Gemini. Provide helpful, accurate, and concise answers for football fans about: stadium facilities, safety exits, food & beverage, transportation, crowd management, match schedules, and the overall fan experience. Limit answers to 2-3 sentences."
        };
}
