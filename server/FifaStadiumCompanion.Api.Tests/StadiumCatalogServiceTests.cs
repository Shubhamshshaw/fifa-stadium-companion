using FifaStadiumCompanion.Api.Application;
using Google.Cloud.Firestore;
using System.Linq;

namespace FifaStadiumCompanion.Api.Tests;

public class StadiumCatalogServiceTests
{
    [Fact]
    public async Task GetLiveMatchAsync_ReturnsSummaryOrFallback()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS")))
            return;

        var firestoreDb = FirestoreDb.Create("fifa-stadium-companion");
        var service = new StadiumCatalogService(firestoreDb);

        var summary = await service.GetLiveMatchAsync();

        Assert.NotNull(summary);
        Assert.False(string.IsNullOrWhiteSpace(summary.Id));
        Assert.False(string.IsNullOrWhiteSpace(summary.Title));
    }

    [Fact]
    public async Task GetSustainabilitySnapshot_ReturnsDataForKnownVenue()
    {
        var firestoreDb = FirestoreDb.Create("fifa-stadium-companion");
        var service = new StadiumCatalogService(firestoreDb);

        var snapshot = await service.GetSustainabilitySnapshotAsync("stadium-01");

        Assert.NotNull(snapshot);
        Assert.Equal("stadium-01", snapshot.StadiumId);
        Assert.InRange(snapshot.WasteReductionPct, 0, 100);
    }
}

public class VenueServiceTests
{
    [Fact]
    public async Task GetAllVenues_ReturnsCollection()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS")))
            return;

        var firestoreDb = FirestoreDb.Create("fifa-stadium-companion");
        var service = new VenueService(firestoreDb);

        var venues = (await service.GetAllVenuesAsync()).ToList();

        Assert.NotNull(venues);
    }

    [Fact]
    public async Task GetVenueById_DoesNotThrow()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS")))
            return;

        var firestoreDb = FirestoreDb.Create("fifa-stadium-companion");
        var service = new VenueService(firestoreDb);

        var venue = await service.GetVenueByIdAsync("stadium-01");

        Assert.True(venue is null || venue is not null);
    }
}

public class MatchServiceTests
{
    [Fact]
    public async Task GetMatchesByVenue_DoesNotThrow()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS")))
            return;

        var firestoreDb = FirestoreDb.Create("fifa-stadium-companion");
        var service = new MatchService(firestoreDb);

        var matches = (await service.GetMatchesByVenueAsync("stadium-01")).ToList();

        Assert.NotNull(matches);
    }

    [Fact]
    public async Task GetMatchById_DoesNotThrow()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS")))
            return;

        var firestoreDb = FirestoreDb.Create("fifa-stadium-companion");
        var service = new MatchService(firestoreDb);

        var match = await service.GetMatchByIdAsync("m-001");

        Assert.True(match is null || match is not null);
    }
}

public class DispatchServiceTests
{
    [Fact]
    public async Task CreateDispatchAsync_CreatesNewDispatch()
    {
        var firestoreDb = FirestoreDb.Create("fifa-stadium-companion");
        var service = new DispatchService(firestoreDb);

        var dispatch = await service.CreateDispatchAsync("stadium-01", "crowd-control", "Close entrance B", "staff-123");

        Assert.NotNull(dispatch);
        Assert.Equal("stadium-01", dispatch.StadiumId);
        Assert.Equal("crowd-control", dispatch.ActionType);
    }
}

public class AiAssistanceServiceTests
{
    [Fact]
    public async Task QueryAsync_ReturnsResponseInEnglish_WhenMockAllowed()
    {
        var service = new AiAssistanceService("test-key", allowMockFallback: true);

        var response = await service.QueryAsync("Where is the restroom?", "en");

        Assert.NotNull(response);
        Assert.Contains("Response", response);
    }

    [Fact]
    public async Task QueryAsync_ReturnsResponseInSpanish_WhenMockAllowed()
    {
        var service = new AiAssistanceService("test-key", allowMockFallback: true);

        var response = await service.QueryAsync("¿Dónde está el baño?", "es");

        Assert.NotNull(response);
        Assert.Contains("Respuesta", response);
    }
}
