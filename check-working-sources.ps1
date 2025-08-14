# Check Working Data Sources
# Quick test to identify which sources are actually working

Write-Host "Checking working data sources..." -ForegroundColor Green

# Create WebClient and disable proxy
$webClient = New-Object System.Net.WebClient
$webClient.Proxy = $null

# Test key data sources
$testSources = @(
    "jin10", "hackernews", "github", "producthunt", "ithome", "36kr", 
    "zhihu", "weibo", "baidu", "bilibili", "douyin", "v2ex",
    "cls", "xueqiu", "huxiu", "juejin", "csdn"
)

$workingSources = @()

foreach ($source in $testSources) {
    try {
        Write-Host "Testing $source..." -NoNewline
        $url = "http://localhost:6688/$source"
        $response = $webClient.DownloadString($url)
        $data = $response | ConvertFrom-Json
        
        if ($data.data -and $data.data.Count -gt 0) {
            Write-Host " SUCCESS ($($data.data.Count) items)" -ForegroundColor Green
            $workingSources += $source
        } else {
            Write-Host " EMPTY" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host " FAILED" -ForegroundColor Red
    }
    
    Start-Sleep 1
}

Write-Host "`nWorking sources:" -ForegroundColor Green
$workingSources | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }

Write-Host "`nTotal working: $($workingSources.Count)" -ForegroundColor Cyan

$webClient.Dispose()
