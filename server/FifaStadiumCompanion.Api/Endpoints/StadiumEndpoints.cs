using FifaStadiumCompanion.Api.Application;

namespace FifaStadiumCompanion.Api.Endpoints;

public static class StadiumEndpoints
{
    public static IEndpointRouteBuilder MapStadiumEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/stadiums", (VenueService service) =>
            Results.Ok(service.GetAllVenues().Select(v => new { v.Id, v.Name, v.City, v.Capacity, v.ImageUrl }))
        );

        app.MapGet("/api/stadiums/{stadiumId}", (string stadiumId, VenueService service) =>
        {
            var venue = service.GetVenueById(stadiumId);
            return venue != null ? Results.Ok(venue) : Results.NotFound();
        });

        app.MapGet("/api/stadiums/{stadiumId}/crowd", (string stadiumId) =>
        {
            var crowdLevel = stadiumId.GetHashCode() % 100;
            return Results.Ok(new { stadiumId, crowdLevel, status = "steady", trend = "stable" });
        });

        app.MapGet("/api/matches", (MatchService service) =>
            Results.Ok(service.GetMatchesByVenue("stadium-01").Select(m => new { m.Id, m.Title, m.HomeTeam, m.AwayTeam, m.ScheduledTime }))
        );

        app.MapGet("/api/matches/{matchId}/live", (string matchId, MatchService service) =>
        {
            var match = service.GetMatchById(matchId);
            return match != null ? Results.Ok(match) : Results.NotFound();
        });

        app.MapGet("/api/sustainability/{stadiumId}", (string stadiumId, StadiumCatalogService service) =>
        {
            var snapshot = service.GetSustainabilitySnapshot(stadiumId);
            return Results.Ok(snapshot);
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
