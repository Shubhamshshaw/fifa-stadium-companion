## seed-emulator.ps1 — Populates the Firestore emulator with FIFA WC 2026 demo data
$base = "http://localhost:8080/v1/projects/fifa-stadium-companion/databases/(default)/documents"

function Set-Doc($collection, $docId, $fields) {
    $url = "$base/$collection/$docId"
    $body = @{ fields = $fields } | ConvertTo-Json -Depth 10
    Invoke-RestMethod -Method Patch -Uri $url -Body $body -ContentType "application/json" | Out-Null
    Write-Host "  OK $collection/$docId"
}

function Str($v)  { @{ stringValue  = $v } }
function Int($v)  { @{ integerValue = "$v" } }
function Ts($v)   { @{ timestampValue = $v } }

## Stadiums
Write-Host "Seeding stadiums..."
$stadiums = @(
    @{ id="lusail";         name="Lusail Iconic Stadium"; city="Lusail, Qatar";       capacity=80000 },
    @{ id="al-bayt";        name="Al Bayt Stadium";        city="Al Khor, Qatar";      capacity=60000 },
    @{ id="khalifa";        name="Khalifa International";  city="Doha, Qatar";         capacity=45857 },
    @{ id="education-city"; name="Education City Stadium"; city="Al Rayyan, Qatar";    capacity=45350 },
    @{ id="al-janoub";      name="Al Janoub Stadium";      city="Al Wakrah, Qatar";    capacity=40000 },
    @{ id="stadium-974";    name="Stadium 974";             city="Doha, Qatar";         capacity=40000 },
    @{ id="al-thumama";     name="Al Thumama Stadium";     city="Doha, Qatar";         capacity=40000 },
    @{ id="ahmed-bin-ali";  name="Ahmed Bin Ali Stadium";  city="Al Rayyan, Qatar";    capacity=44740 }
)
foreach ($s in $stadiums) {
    Set-Doc "stadiums" $s.id @{
        name     = Str $s.name
        city     = Str $s.city
        capacity = Int $s.capacity
    }
}

## Matches
Write-Host "Seeding matches..."
$matches = @(
    @{ id="m1";  title="Qatar vs Ecuador";    home="Qatar";     away="Ecuador";     stadiumId="al-bayt";        time="2026-11-21T17:00:00Z"; status="completed" },
    @{ id="m2";  title="England vs Iran";     home="England";   away="Iran";        stadiumId="khalifa";        time="2026-11-21T14:00:00Z"; status="completed" },
    @{ id="m3";  title="France vs Australia"; home="France";    away="Australia";   stadiumId="education-city"; time="2026-11-22T11:00:00Z"; status="live" },
    @{ id="m4";  title="Brazil vs Serbia";    home="Brazil";    away="Serbia";      stadiumId="lusail";         time="2026-11-24T20:00:00Z"; status="live" },
    @{ id="m5";  title="Germany vs Japan";    home="Germany";   away="Japan";       stadiumId="khalifa";        time="2026-11-23T14:00:00Z"; status="scheduled" },
    @{ id="m6";  title="Spain vs Costa Rica"; home="Spain";     away="Costa Rica";  stadiumId="al-thumama";     time="2026-11-23T17:00:00Z"; status="scheduled" },
    @{ id="m7";  title="Argentina vs Poland"; home="Argentina"; away="Poland";      stadiumId="stadium-974";    time="2026-11-30T20:00:00Z"; status="scheduled" },
    @{ id="m8";  title="USA vs England";      home="USA";       away="England";     stadiumId="al-bayt";        time="2026-11-25T20:00:00Z"; status="scheduled" },
    @{ id="m9";  title="Portugal vs Ghana";   home="Portugal";  away="Ghana";       stadiumId="ahmed-bin-ali";  time="2026-11-24T17:00:00Z"; status="scheduled" },
    @{ id="m10"; title="Semi-Final";          home="TBD";       away="TBD";         stadiumId="lusail";         time="2026-12-13T17:00:00Z"; status="scheduled" }
)
foreach ($m in $matches) {
    Set-Doc "matches" $m.id @{
        title         = Str $m.title
        homeTeam      = Str $m.home
        awayTeam      = Str $m.away
        stadiumId     = Str $m.stadiumId
        scheduledTime = Ts  $m.time
        status        = Str $m.status
    }
}

## Dispatches
Write-Host "Seeding dispatches..."
$dispatches = @(
    @{ id="d1"; stadiumId="lusail";          actionType="crowd-control"; description="Gate 3 overflow detected. Direct fans to Gate 5.";     issuedAt="2026-11-24T19:45:00Z"; issuedBy="Staff Alpha" },
    @{ id="d2"; stadiumId="lusail";          actionType="alert";          description="Medical team required at Section C, Row 12.";           issuedAt="2026-11-24T20:10:00Z"; issuedBy="Staff Bravo" },
    @{ id="d3"; stadiumId="al-bayt";         actionType="crowd-control"; description="East stand at 95% capacity. Pause entry.";              issuedAt="2026-11-25T19:55:00Z"; issuedBy="Security Lead" },
    @{ id="d4"; stadiumId="khalifa";         actionType="alert";          description="Power fluctuation in Zone B. Engineers dispatched.";    issuedAt="2026-11-21T13:30:00Z"; issuedBy="Ops Control" },
    @{ id="d5"; stadiumId="education-city";  actionType="evacuation";    description="Drill exercise - North tunnel. Non-emergency.";         issuedAt="2026-11-22T10:00:00Z"; issuedBy="Safety Officer" }
)
foreach ($d in $dispatches) {
    Set-Doc "dispatches" $d.id @{
        stadiumId   = Str $d.stadiumId
        actionType  = Str $d.actionType
        description = Str $d.description
        issuedAt    = Ts  $d.issuedAt
        issuedBy    = Str $d.issuedBy
    }
}

Write-Host "Done! stadiums(8) matches(10) dispatches(5)"
