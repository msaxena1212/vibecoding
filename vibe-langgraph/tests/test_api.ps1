# Vibe LangGraph API Test Suite (PowerShell)
# Use this script to test the backend API endpoints

$baseUrl = "http://127.0.0.1:8000/api/v1"

Write-Host "=== Testing Root Endpoint ==="
Invoke-RestMethod -Uri "http://127.0.0.1:8000/" -Method Get
Write-Host "`n"

Write-Host "=== Testing List Projects ==="
Invoke-RestMethod -Uri "$baseUrl/projects" -Method Get
Write-Host "`n"

Write-Host "=== Testing Generate Project (React Counter) ==="
$body = @{
    intent = "create a simple react counter app"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$baseUrl/generate/" -Method Post -ContentType "application/json" -Body $body
$response | ConvertTo-Json -Depth 10 | Write-Host
$projectId = $response.project_id
Write-Host "`nProject ID: $projectId`n"

if ($null -ne $projectId -and $projectId -ne "null") {
    Write-Host "=== Testing Get Project Messages ==="
    Invoke-RestMethod -Uri "$baseUrl/projects/$projectId/messages" -Method Get | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host "`n"
    
    Write-Host "=== Testing Modify Project (Add Reset Button) ==="
    $modifyBody = @{
        intent = "add a reset button to the counter"
        project_id = $projectId
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/generate/" -Method Post -ContentType "application/json" -Body $modifyBody | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host "`n"
}

Write-Host "=== Testing Explain/Chat (How it works?) ==="
$chatBody = @{
    intent = "greet me and tell me how this platform works"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/generate/" -Method Post -ContentType "application/json" -Body $chatBody | ConvertTo-Json -Depth 10 | Write-Host
Write-Host "`n"
