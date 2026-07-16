using FifaStadiumCompanion.Api.Application;

namespace FifaStadiumCompanion.Api.Tests;

public class StadiumCatalogServiceTests
{
    [Fact]
    public void GetLiveMatch_ReturnsExpectedMatchForKnownId()
    {
        var service = new StadiumCatalogService();

        var match = service.GetLiveMatch("m-001");

        Assert.NotNull(match);
        Assert.Equal("m-001", match.Id);
        Assert.Equal("Mexico vs. Argentina", match.Title);
    }

    [Fact]
    public void GetSustainabilitySnapshot_ReturnsDataForKnownVenue()
    {
        var service = new StadiumCatalogService();

        var snapshot = service.GetSustainabilitySnapshot("stadium-01");

        Assert.NotNull(snapshot);
        Assert.Equal("stadium-01", snapshot.StadiumId);
        Assert.True(snapshot.WasteReductionPct >= 0);
    }
}

public class VenueServiceTests
{
    [Fact]
    public void GetAllVenues_ReturnsMultipleVenues()
    {
        var service = new VenueService();

        var venues = service.GetAllVenues().ToList();

        Assert.NotEmpty(venues);
        Assert.True(venues.Count >= 2);
    }

    [Fact]
    public void GetVenueById_ReturnsVenueForKnownId()
    {
        var service = new VenueService();

        var venue = service.GetVenueById("stadium-01");

        Assert.NotNull(venue);
        Assert.Equal("MetLife Stadium", venue.Name);
    }
}

public class MatchServiceTests
{
    [Fact]
    public void GetMatchesByVenue_ReturnsMatchesForKnownVenue()
    {
        var service = new MatchService();

        var matches = service.GetMatchesByVenue("stadium-01").ToList();

        Assert.NotEmpty(matches);
    }

    [Fact]
    public void GetMatchById_ReturnsMatchForKnownId()
    {
        var service = new MatchService();

        var match = service.GetMatchById("m-001");

        Assert.NotNull(match);
        Assert.Equal("Mexico vs. Argentina", match.Title);
    }
}

public class DispatchServiceTests
{
    [Fact]
    public async Task CreateDispatchAsync_CreatesNewDispatch()
    {
        var service = new DispatchService();

        var dispatch = await service.CreateDispatchAsync("stadium-01", "crowd-control", "Close entrance B", "staff-123");

        Assert.NotNull(dispatch);
        Assert.Equal("stadium-01", dispatch.StadiumId);
        Assert.Equal("crowd-control", dispatch.ActionType);
    }

    [Fact]
    public async Task GetDispatchesByVenue_ReturnsCreatedDispatches()
    {
        var service = new DispatchService();
        await service.CreateDispatchAsync("stadium-01", "alert", "High crowd density", "staff-123");

        var dispatches = service.GetDispatchesByVenue("stadium-01").ToList();

        Assert.NotEmpty(dispatches);
    }
}

public class AiAssistanceServiceTests
{
    [Fact]
    public async Task QueryAsync_ReturnsResponseInEnglish()
    {
        var service = new AiAssistanceService();

        var response = await service.QueryAsync("Where is the restroom?", "en");

        Assert.NotNull(response);
        Assert.Contains("Response to", response);
    }

    [Fact]
    public async Task QueryAsync_ReturnsResponseInSpanish()
    {
        var service = new AiAssistanceService();

        var response = await service.QueryAsync("¿Dónde está el baño?", "es");

        Assert.NotNull(response);
        Assert.Contains("Respuesta", response);
    }
}
