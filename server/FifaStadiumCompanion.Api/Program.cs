using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Api.Gax;
using Google.Cloud.Firestore;
using Google.Cloud.Firestore.V1;
using Grpc.Core;
using FifaStadiumCompanion.Api.Application;
using FifaStadiumCompanion.Api.Endpoints;
using FifaStadiumCompanion.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from a .env file if present
{
    Console.WriteLine($"AppContext.BaseDirectory={AppContext.BaseDirectory}");
    Console.WriteLine($"ContentRootPath={builder.Environment.ContentRootPath}");
    Console.WriteLine($"CurrentDirectory={Directory.GetCurrentDirectory()}");

    var searchRoots = new[]
    {
        new DirectoryInfo(builder.Environment.ContentRootPath),
        new DirectoryInfo(AppContext.BaseDirectory),
        new DirectoryInfo(Directory.GetCurrentDirectory())
    };

    string? foundPath = null;
    foreach (var root in searchRoots)
    {
        var directory = root;
        for (var i = 0; i < 10 && directory != null; i++)
        {
            var candidate = Path.Combine(directory.FullName, ".env");
            Console.WriteLine($"Checking env candidate: {candidate}");
            if (File.Exists(candidate))
            {
                foundPath = candidate;
                break;
            }
            directory = directory.Parent;
        }

        if (foundPath != null)
        {
            break;
        }
    }

    if (foundPath != null)
    {
        Console.WriteLine($"Loading env from: {foundPath}");
        var envLines = File.ReadAllLines(foundPath);
        foreach (var line in envLines)
        {
            if (string.IsNullOrWhiteSpace(line) || line.TrimStart().StartsWith("#"))
                continue;

            var parts = line.Split('=', 2);
            if (parts.Length == 2)
            {
                Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
            }
        }
    }
    else
    {
        Console.WriteLine("Env file not found in parent directories.");
    }
}

// Get configuration from environment
var useFirestoreEmulator = !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("FIRESTORE_EMULATOR_HOST"));
var useAuthEmulator = !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("FIREBASE_AUTH_EMULATOR_HOST"));

Console.WriteLine($"Environment.IsDevelopment()={builder.Environment.IsDevelopment()}");
Console.WriteLine($"ASPNETCORE_ENVIRONMENT={Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "(not set)"}");

// Always check for local emulators, regardless of environment
Console.WriteLine("Checking local Firebase emulator ports...");
if (!useFirestoreEmulator && IsTcpPortOpen("127.0.0.1", 8080))
{
    Environment.SetEnvironmentVariable("FIRESTORE_EMULATOR_HOST", "127.0.0.1:8080");
    useFirestoreEmulator = true;
    Console.WriteLine("Auto-configured FIRESTORE_EMULATOR_HOST=127.0.0.1:8080");
}

if (!useAuthEmulator && IsTcpPortOpen("127.0.0.1", 9099))
{
    Environment.SetEnvironmentVariable("FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9099");
    useAuthEmulator = true;
    Console.WriteLine("Auto-configured FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099");
}

var firebaseProjectId = Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID")
    ?? ((useFirestoreEmulator || useAuthEmulator)
        ? "fifa-stadium-companion"
        : throw new InvalidOperationException("FIREBASE_PROJECT_ID must be configured."));

var geminiApiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY")
    ?? throw new InvalidOperationException("GEMINI_API_KEY must be configured for AI assistance.");

Console.WriteLine($"ENV FIRESTORE_EMULATOR_HOST={Environment.GetEnvironmentVariable("FIRESTORE_EMULATOR_HOST")}");
Console.WriteLine($"ENV FIREBASE_AUTH_EMULATOR_HOST={Environment.GetEnvironmentVariable("FIREBASE_AUTH_EMULATOR_HOST")}");
Console.WriteLine($"useFirestoreEmulator={useFirestoreEmulator}, useAuthEmulator={useAuthEmulator}");
Console.WriteLine($"ProjectId={firebaseProjectId}");

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

FirestoreDb firestoreDb;
if (useFirestoreEmulator)
{
    var emulatorHost = Environment.GetEnvironmentVariable("FIRESTORE_EMULATOR_HOST") ?? "127.0.0.1:8080";
    Console.WriteLine($"Creating Firestore client for emulator at {emulatorHost} using insecure channel.");

    // Ensure a fake ADC JSON exists so Google library doesn't fail looking for credentials.
    var adc = Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS");
    if (string.IsNullOrWhiteSpace(adc))
    {
        var tmp = Path.Combine(Path.GetTempPath(), $"fsc-emulator-creds-{Guid.NewGuid():N}.json");
        var minimal = $@"{{
  ""type"": ""service_account"",
  ""project_id"": ""{firebaseProjectId}"",
  ""private_key_id"": ""fake"",
  ""private_key"": ""-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7W7B+W/oO6DwO\nLGpz/omv1q+6W1wXV7DfH0e+h9mZ5jBd7D5oVVB5Zz1vfU8IFnDpUqD9dU7q0ypD\nmIxC0+H9MnIbJQdF6h8U0wCqN+1j+0kS+6Z6w/q/3QV7LqGlJ0Zg5h9/h4LqN5/A\njQi8Rv8OFzVDhKnNbJxvQCBxZJ5xZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5\nZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z\n-----END PRIVATE KEY-----\n"",
  ""client_email"": ""emulator@fifa-stadium-companion.iam.gserviceaccount.com"",
  ""client_id"": ""1"",
  ""auth_uri"": ""https://accounts.google.com/o/oauth2/auth"",
  ""token_uri"": ""https://oauth2.googleapis.com/token"",
  ""auth_provider_x509_cert_url"": ""https://www.googleapis.com/oauth2/v1/certs"",
  ""client_x509_cert_url"": """"
}}";
        File.WriteAllText(tmp, minimal);
        Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", tmp);
        Console.WriteLine($"Wrote temp ADC file: {tmp}");
    }

    // Now create Firestore client using the emulator; GAX will not look for ADC since we set it.
    var firestoreDbBuilder = new FirestoreDbBuilder
    {
        ProjectId = firebaseProjectId,
        EmulatorDetection = EmulatorDetection.EmulatorOnly
    };

    firestoreDb = firestoreDbBuilder.Build();
}
else
{
    var firestoreDbBuilder = new FirestoreDbBuilder
    {
        ProjectId = firebaseProjectId,
        EmulatorDetection = EmulatorDetection.ProductionOnly
    };

    firestoreDb = firestoreDbBuilder.Build();
}

Console.WriteLine($"Firestore emulator active: {useFirestoreEmulator}");
Console.WriteLine($"FIRESTORE_EMULATOR_HOST={Environment.GetEnvironmentVariable("FIRESTORE_EMULATOR_HOST")}");

builder.Services.AddSingleton(firestoreDb);
builder.Services.AddSingleton<StadiumCatalogService>();
builder.Services.AddSingleton<VenueService>();
builder.Services.AddSingleton<MatchService>();
builder.Services.AddSingleton<DispatchService>();
builder.Services.AddSingleton<AiAssistanceService>(sp => new AiAssistanceService(geminiApiKey, allowMockFallback: true));
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

static bool IsTcpPortOpen(string host, int port)
{
    try
    {
        using var client = new System.Net.Sockets.TcpClient();
        var task = client.ConnectAsync(host, port);
        return task.Wait(250);
    }
    catch
    {
        return false;
    }
}
