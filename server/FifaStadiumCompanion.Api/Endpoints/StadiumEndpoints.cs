using FifaStadiumCompanion.Api.Application;

namespace FifaStadiumCompanion.Api.Endpoints;

public static class StadiumEndpoints
{
    public static IEndpointRouteBuilder MapStadiumEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/stadiums", async (VenueService service) =>
        {
            var venues = await service.GetAllVenuesAsync();
            return Results.Ok(venues.Select(v => new { v.Id, v.Name, v.City, v.Capacity, v.ImageUrl }));
        });

        app.MapGet("/api/stadiums/{stadiumId}", async (string stadiumId, VenueService service) =>
        {
            var venue = await service.GetVenueByIdAsync(stadiumId);
            return venue != null ? Results.Ok(venue) : Results.NotFound();
        });

        app.MapGet("/api/stadiums/{stadiumId}/crowd", async (string stadiumId, MatchService matchService, VenueService venueService) =>
        {
            var venue = await venueService.GetVenueByIdAsync(stadiumId);
            var matches = (await matchService.GetMatchesByVenueAsync(stadiumId)).ToList();
            var matchCount = matches.Count;
            var capacity = venue?.Capacity ?? 60000;
            var crowdLevel = Math.Clamp(30 + matchCount * 15 + capacity / 2000, 10, 100);
            var status = matchCount > 0 ? "busy" : "steady";
            var trend = matchCount > 0 ? "increasing" : "stable";
            return Results.Ok(new { stadiumId, crowdLevel, status, trend, nextMatchCount = matchCount });
        });

        app.MapGet("/api/matches", async (MatchService service) =>
        {
            var matches = await service.GetAllMatchesAsync();
            return Results.Ok(matches.Select(m => new { m.Id, m.Title, m.HomeTeam, m.AwayTeam, m.ScheduledTime, m.StadiumId, m.Status }));
        });

        app.MapGet("/api/matches/{matchId}/live", async (string matchId, MatchService service) =>
        {
            var match = await service.GetMatchByIdAsync(matchId);
            return match != null ? Results.Ok(match) : Results.NotFound();
        });

        app.MapGet("/api/matches/live", async (HttpRequest request, StadiumCatalogService service) =>
        {
            var stadiumId = request.Query["stadiumId"].FirstOrDefault();
            var summary = await service.GetLiveMatchAsync(stadiumId);
            return Results.Ok(summary);
        });

        app.MapGet("/api/sustainability/{stadiumId}", async (string stadiumId, StadiumCatalogService service) =>
        {
            var snapshot = await service.GetSustainabilitySnapshotAsync(stadiumId);
            return Results.Ok(snapshot);
        });

        app.MapGet("/api/dispatches/{stadiumId}", async (string stadiumId, DispatchService service) =>
        {
            var dispatches = await service.GetDispatchesByVenueAsync(stadiumId);
            return Results.Ok(dispatches);
        });

        app.MapPost("/api/dispatch", async (DispatchRequest request, DispatchService service) =>
        {
            var dispatch = await service.CreateDispatchAsync(request.StadiumId, request.ActionType, request.Description, request.IssuedBy);
            return Results.Created($"/api/dispatch/{dispatch.Id}", dispatch);
        });

        app.MapPost("/api/ai/query", async (AiQueryRequest request, AiAssistanceService service) =>
        {
            var reply = await service.QueryAsync(request.Query, request.Language);
            return Results.Ok(new { query = request.Query, reply, language = request.Language });
        });

        return app;
    }
}

public sealed record DispatchRequest(string StadiumId, string ActionType, string Description, string? IssuedBy = null);
public sealed record AiQueryRequest(string Query, string? Language = "en");
