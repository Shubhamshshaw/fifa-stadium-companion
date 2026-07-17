using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
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
var useFirestoreEmulator = !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("FIRESTORE_EMULATOR_HOST"));
var useAuthEmulator = !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("FIREBASE_AUTH_EMULATOR_HOST"));

var firebaseProjectId = Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID")
    ?? ((useFirestoreEmulator || useAuthEmulator)
        ? "fifa-stadium-companion"
        : throw new InvalidOperationException("FIREBASE_PROJECT_ID must be configured."));

var geminiApiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY")
    ?? throw new InvalidOperationException("GEMINI_API_KEY must be configured for AI assistance.");

if (FirebaseApp.DefaultInstance == null)
{
    var appOptions = new AppOptions { ProjectId = firebaseProjectId };

    if (useAuthEmulator || useFirestoreEmulator)
    {
        appOptions.Credential = GoogleCredential.FromAccessToken("owner");
    }
    else
    {
        try
        {
            appOptions.Credential = GoogleCredential.GetApplicationDefault();
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                "Firebase Admin credentials were not found. Set GOOGLE_APPLICATION_CREDENTIALS or start the Firestore/Auth emulator with FIRESTORE_EMULATOR_HOST/FIREBASE_AUTH_EMULATOR_HOST.",
                ex);
        }
    }

    FirebaseApp.Create(appOptions);
}

var firestoreDb = FirestoreDb.Create(firebaseProjectId);

builder.Services.AddSingleton(firestoreDb);
builder.Services.AddSingleton<StadiumCatalogService>();
builder.Services.AddSingleton<VenueService>();
builder.Services.AddSingleton<MatchService>();
builder.Services.AddSingleton<DispatchService>();
builder.Services.AddSingleton<AiAssistanceService>(sp => new AiAssistanceService(geminiApiKey));
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
