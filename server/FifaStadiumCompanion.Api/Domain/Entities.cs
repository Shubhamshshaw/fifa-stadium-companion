namespace FifaStadiumCompanion.Api.Domain;

public sealed record Venue(
    string Id,
    string Name,
    string City,
    int Capacity,
    string? ImageUrl = null
);

public sealed record Match(
    string Id,
    string Title,
    string HomeTeam,
    string AwayTeam,
    DateTime ScheduledTime,
    string StadiumId,
    string? Status = "scheduled"
);

public sealed record Dispatch(
    string Id,
    string StadiumId,
    string ActionType,
    string Description,
    DateTime IssuedAt,
    string? IssuedBy = null
);

public sealed record ConversationMessage(
    string Id,
    string SessionId,
    string Role,
    string Content,
    DateTime Timestamp
);

public sealed record SustainabilityMetrics(
    string StadiumId,
    int WasteReductionPct,
    decimal EnergySavingsPct,
    int WaterSavingsPct,
    DateTime MeasuredAt
);
