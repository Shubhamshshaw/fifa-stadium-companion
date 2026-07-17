using Google.Cloud.Firestore;
using FifaStadiumCompanion.Api.Domain;

namespace FifaStadiumCompanion.Api.Application;

public sealed class StadiumCatalogService
{
    private readonly CollectionReference _venuesCollection;
    private readonly CollectionReference _matchesCollection;

    public StadiumCatalogService(FirestoreDb firestoreDb)
    {
        _venuesCollection = firestoreDb.Collection("venues");
        _matchesCollection = firestoreDb.Collection("matches");
    }

    public async Task<StadiumSummary> GetLiveMatchAsync(string? stadiumId = null)
    {
        var query = _matchesCollection.WhereEqualTo("status", "live");
        if (!string.IsNullOrWhiteSpace(stadiumId))
        {
            query = query.WhereEqualTo("stadiumId", stadiumId);
        }

        var liveSnapshot = await query.GetSnapshotAsync();
        var liveMatch = liveSnapshot.Documents.Select(ToMatch).FirstOrDefault(m => m is not null);
        if (liveMatch is not null)
        {
            return new StadiumSummary(liveMatch.Id, liveMatch.Title, liveMatch.StadiumId);
        }

        var nextQuery = _matchesCollection.WhereGreaterThanOrEqualTo("scheduledTime", Timestamp.FromDateTime(DateTime.UtcNow));
        if (!string.IsNullOrWhiteSpace(stadiumId))
        {
            nextQuery = nextQuery.WhereEqualTo("stadiumId", stadiumId);
        }

        var upcomingSnapshot = await nextQuery.GetSnapshotAsync();
        var nextMatch = upcomingSnapshot.Documents.Select(ToMatch).FirstOrDefault(m => m is not null);

        return nextMatch is not null
            ? new StadiumSummary(nextMatch.Id, nextMatch.Title, nextMatch.StadiumId)
            : new StadiumSummary("none", "No live match available", stadiumId ?? "unknown");
    }

    private static Match? ToMatch(DocumentSnapshot document)
    {
        if (!document.Exists)
        {
            return null;
        }

        var match = new Match(
            document.Id,
            document.TryGetValue("title", out string title) ? title : string.Empty,
            document.TryGetValue("homeTeam", out string homeTeam) ? homeTeam : string.Empty,
            document.TryGetValue("awayTeam", out string awayTeam) ? awayTeam : string.Empty,
            document.TryGetValue("scheduledTime", out Timestamp scheduledTimestamp)
                ? scheduledTimestamp.ToDateTime()
                : DateTime.MinValue,
            document.TryGetValue("stadiumId", out string stadiumId) ? stadiumId : string.Empty,
            document.TryGetValue("status", out string status) ? status : string.Empty
        );

        return match;
    }

    public async Task<SustainabilitySnapshot> GetSustainabilitySnapshotAsync(string stadiumId)
    {
        var venueSnapshot = await _venuesCollection.Document(stadiumId).GetSnapshotAsync();
        var capacity = venueSnapshot.Exists && venueSnapshot.TryGetValue("capacity", out int venueCapacity)
            ? venueCapacity
            : 60000;

        var matchCount = (await _matchesCollection.WhereEqualTo("stadiumId", stadiumId).GetSnapshotAsync()).Count;

        var wasteReductionPct = Math.Clamp(30 + matchCount * 4 - capacity / 5000, 10, 95);
        var energySavingsPct = Math.Clamp(5m + (capacity / 10000m) * 8m + matchCount * 0.7m, 4.0m, 75.0m);
        var waterSavingsPct = Math.Clamp(70 + matchCount * 2 + (capacity % 20), 50, 98);

        return new SustainabilitySnapshot(stadiumId, wasteReductionPct, Math.Round(energySavingsPct, 1), waterSavingsPct, DateTime.UtcNow);
    }
}

public sealed record StadiumSummary(string Id, string Title, string StadiumId);

public sealed record SustainabilitySnapshot(string StadiumId, int WasteReductionPct, decimal EnergySavingsPct, int WaterSavingsPct, DateTime MeasuredAt);
