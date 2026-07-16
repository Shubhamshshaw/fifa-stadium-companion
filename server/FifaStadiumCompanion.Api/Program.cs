using FifaStadiumCompanion.Api.Application;
using FifaStadiumCompanion.Api.Endpoints;
using FifaStadiumCompanion.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file in development
if (builder.Environment.IsDevelopment())
{
    var envPath = Path.Combine(AppContext.BaseDirectory, "../../../.env");
    if (File.Exists(envPath))
    {
        var envLines = File.ReadAllLines(envPath);
        foreach (var line in envLines)
        {
            if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#"))
                continue;

            var parts = line.Split('=', 2);
            if (parts.Length == 2)
            {
                Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
            }
        }
    }
}

// Get configuration from environment
var firebaseProjectId = Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID") ?? "fifa-stadium-companion";
var geminiApiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");

builder.Services.AddSingleton<StadiumCatalogService>();
builder.Services.AddSingleton<VenueService>();
builder.Services.AddSingleton<MatchService>();
builder.Services.AddSingleton<DispatchService>();
builder.Services.AddSingleton(new AiAssistanceService(geminiApiKey ?? ""));
builder.Services.AddSingleton<IFirebaseAuthService, FirebaseAuthService>();

// Add HttpClient for external API calls
builder.Services.AddHttpClient();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocal", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowLocal");

app.MapGet("/", () => "FIFA Stadium Companion API - Ready for deployment");
app.MapStadiumEndpoints();

app.Run();
