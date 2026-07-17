using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;

namespace FifaStadiumCompanion.Api.Infrastructure;

public interface IFirebaseAuthService
{
    Task<FirebaseUser?> ValidateIdTokenAsync(string idToken);
}

public sealed record FirebaseUser(string Uid, string Email, List<string> Claims);

public sealed class FirebaseAuthService : IFirebaseAuthService
{
    public FirebaseAuthService()
    {
        EnsureFirebaseInitialized();
    }

    private static void EnsureFirebaseInitialized()
    {
        if (FirebaseApp.DefaultInstance != null)
            return;

        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.GetApplicationDefault()
        });
    }

    public async Task<FirebaseUser?> ValidateIdTokenAsync(string idToken)
    {
        if (string.IsNullOrWhiteSpace(idToken))
            return null;

        try
        {
            var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
            var claims = new List<string>();
            if (decodedToken.Claims.TryGetValue("role", out var role))
                claims.Add(role?.ToString() ?? "fan");

            var email = decodedToken.Claims.ContainsKey("email")
                ? decodedToken.Claims["email"]?.ToString() ?? string.Empty
                : string.Empty;

            return new FirebaseUser(
                Uid: decodedToken.Uid,
                Email: email,
                Claims: claims
            );
        }
        catch
        {
            return null;
        }
    }
}
