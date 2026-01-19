# Install Claude Code Agents
# Run: powershell -ExecutionPolicy Bypass -File install-agents.ps1

$agentsDir = "$env:USERPROFILE\.claude\agents"

# Create agents directory if it doesn't exist
if (-not (Test-Path $agentsDir)) {
    New-Item -ItemType Directory -Force -Path $agentsDir | Out-Null
    Write-Host "Created directory: $agentsDir" -ForegroundColor Green
}

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Copy all agent files
$agents = Get-ChildItem -Path $scriptDir -Filter "*.md"
$count = 0

foreach ($agent in $agents) {
    Copy-Item $agent.FullName -Destination $agentsDir -Force
    Write-Host "Installed: $($agent.BaseName)" -ForegroundColor Cyan
    $count++
}

Write-Host "`nSuccessfully installed $count agents to $agentsDir" -ForegroundColor Green
Write-Host "Restart Claude Code or run /agents to load them." -ForegroundColor Yellow
