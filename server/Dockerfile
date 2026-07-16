# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files
COPY ["FifaStadiumCompanion.Api/FifaStadiumCompanion.Api.csproj", "FifaStadiumCompanion.Api/"]

# Restore dependencies
RUN dotnet restore "FifaStadiumCompanion.Api/FifaStadiumCompanion.Api.csproj"

# Copy source code
COPY . .

# Build
RUN dotnet build "FifaStadiumCompanion.Api/FifaStadiumCompanion.Api.csproj" -c Release -o /app/build

# Publish stage
RUN dotnet publish "FifaStadiumCompanion.Api/FifaStadiumCompanion.Api.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy published app from build stage
COPY --from=build /app/publish .

# Expose port (Cloud Run uses port 8080)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Set entry point
ENTRYPOINT ["dotnet", "FifaStadiumCompanion.Api.dll"]
