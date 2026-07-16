namespace FifaStadiumCompanion.Api.Application;

public sealed class StadiumCatalogService
{
    public StadiumSummary GetLiveMatch(string id)
    {
        return id switch
        {
            "m-001" => new StadiumSummary("m-001", "Mexico vs. Argentina", "stadium-01"),
            _ => new StadiumSummary("unknown", "No live match", "unknown")
        };
    }

    public SustainabilitySnapshot GetSustainabilitySnapshot(string stadiumId)
    {
        return new SustainabilitySnapshot(stadiumId, 24, 4.8m, 92);
    }
}

public sealed record StadiumSummary(string Id, string Title, string StadiumId);

public sealed record SustainabilitySnapshot(string StadiumId, int WasteReductionPct, decimal EnergySavingsPct, int WaterSavingsPct);
