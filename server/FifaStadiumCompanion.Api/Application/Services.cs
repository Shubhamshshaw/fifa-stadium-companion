using FifaStadiumCompanion.Api.Domain;
using System.Text.Json;

namespace FifaStadiumCompanion.Api.Application;

public sealed class VenueService
{
    private static readonly List<Venue> Venues = new()
    {
        new("stadium-01", "MetLife Stadium", "New York", 82500, "https://via.placeholder.com/400?text=MetLife"),
        new("stadium-02", "SoFi Stadium", "Los Angeles", 70240, "https://via.placeholder.com/400?text=SoFi"),
        new("stadium-03", "AT&T Stadium", "Dallas", 80000, "https://via.placeholder.com/400?text=ATT"),
        new("stadium-04", "Arrowhead Stadium", "Kansas City", 76416, "https://via.placeholder.com/400?text=Arrowhead"),
        new("stadium-05", "Lumen Field", "Seattle", 69000, "https://via.placeholder.com/400?text=Lumen"),
        new("stadium-06", "Mercedes-Benz Stadium", "Atlanta", 81500, "https://via.placeholder.com/400?text=MBenz"),
    };

    public IEnumerable<Venue> GetAllVenues() => Venues;

    public Venue? GetVenueById(string stadiumId) => Venues.FirstOrDefault(v => v.Id == stadiumId);
}

public sealed class MatchService
{
    private static readonly List<Match> Matches = new()
    {
        new("m-001", "Mexico vs. Argentina", "Mexico", "Argentina", DateTime.UtcNow.AddHours(2), "stadium-01", "scheduled"),
        new("m-002", "USA vs. Canada", "USA", "Canada", DateTime.UtcNow.AddHours(6), "stadium-02", "scheduled"),
    };

    public IEnumerable<Match> GetMatchesByVenue(string stadiumId) => Matches.Where(m => m.StadiumId == stadiumId);

    public Match? GetMatchById(string matchId) => Matches.FirstOrDefault(m => m.Id == matchId);
}

public sealed class DispatchService
{
    private static readonly List<Dispatch> Dispatches = new();

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
        Dispatches.Add(dispatch);
        return dispatch;
    }

    public IEnumerable<Dispatch> GetDispatchesByVenue(string stadiumId) => Dispatches.Where(d => d.StadiumId == stadiumId);
}

public sealed class AiAssistanceService
{
    private readonly string _geminiApiKey;
    private readonly HttpClient _httpClient;
    private const string GeminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

    public AiAssistanceService(string? geminiApiKey = null)
    {
        _geminiApiKey = geminiApiKey ?? "";
        _httpClient = new HttpClient();
    }

    public async Task<string> QueryAsync(string question, string? language = "en")
    {
        // If no API key, return mock response
        if (string.IsNullOrWhiteSpace(_geminiApiKey))
        {
            return GetMockResponse(question, language);
        }

        try
        {
            // Prepare the request for Gemini API
            var systemPrompt = GetSystemPromptForLanguage(language);
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
                }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(
                $"{GeminiEndpoint}?key={_geminiApiKey}",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                return GetMockResponse(question, language);
            }

            var responseText = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(responseText);
            var jsonResponse = jsonDoc.RootElement;

            // Extract the AI response from the Gemini API response
            if (jsonResponse.TryGetProperty("candidates", out var candidates) &&
                candidates.GetArrayLength() > 0 &&
                candidates[0].TryGetProperty("content", out var responseContent) &&
                responseContent.TryGetProperty("parts", out var parts) &&
                parts.GetArrayLength() > 0 &&
                parts[0].TryGetProperty("text", out var text))
            {
                return text.GetString() ?? GetMockResponse(question, language);
            }

            return GetMockResponse(question, language);
        }
        catch
        {
            // On any error, return mock response
            return GetMockResponse(question, language);
        }
    }

    private string GetSystemPromptForLanguage(string? language) =>
        language switch
        {
            "es" => "Eres un asistente de fútbol en un estadio. Responde en español brevemente y de manera útil para un aficionado de fútbol.",
            "fr" => "Vous êtes un assistant de football dans un stade. Répondez en français brièvement et de manière utile pour un supporter de football.",
            _ => "You are a helpful football stadium assistant. Answer briefly and provide useful information for football fans."
        };

    private string GetMockResponse(string question, string? language) =>
        language switch
        {
            "es" => $"Respuesta a tu pregunta: {question}",
            "fr" => $"Réponse à ta question: {question}",
            _ => $"Response to your question: {question}"
        };
}
