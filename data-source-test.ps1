# Data Source Testing Script - Systematic Testing
# Test each data source individually to identify working vs failing sources

Write-Host "=== Data Source Systematic Testing ===" -ForegroundColor Green
Write-Host "Testing each data source individually..." -ForegroundColor Yellow

# Create WebClient and disable proxy
$webClient = New-Object System.Net.WebClient
$webClient.Proxy = $null

# Define all data sources (excluding aggregate, ai-analysis, history)
$dataSources = @(
    "36kr", "51cto", "52pojie", "acfun", "baidu", "bilibili", "cankaoxiaoxi",
    "chongbuluo", "cls", "coolapk", "csdn", "dgtle", "douban-group", "douban-movie",
    "douyin", "earthquake", "fastbull", "geekpark", "gelonghui", "genshin",
    "ghxi", "github", "guokr", "hackernews",
    "hellogithub", "honkai", "hostloc", "hupu", "huxiu", "ifanr", "ifeng",
    "ithome-xijiayi", "ithome", "jianshu", "jin10", "juejin",
    "kaopu", "kuaishou", "linuxdo", "lol", "miyoushe", "mktnews", "netease-news",
    "newsmth", "ngabbs", "nodeseek", "nowcoder", "nytimes", "pcbeta",
    "producthunt", "qq-news", "rss-test", "sina-news", "sina",
    "smzdm", "solidot", "sputniknewscn", "sspai", "starrail",
    "thepaper", "tieba", "toutiao", "v2ex", "wallstreetcn",
    "weatheralarm", "weibo", "weread", "xueqiu", "yystv", "zaobao",
    "zhihu-daily", "zhihu"
)

$workingSources = @()
$failingSources = @()
$totalSources = $dataSources.Count

Write-Host "Total data sources to test: $totalSources" -ForegroundColor Cyan
Write-Host "Starting individual tests..." -ForegroundColor Yellow

# Wait for service to be ready
Start-Sleep 5

foreach ($source in $dataSources) {
    try {
        Write-Host "Testing $source..." -NoNewline
        $url = "http://localhost:6688/$source"
        $response = $webClient.DownloadString($url)
        $data = $response | ConvertFrom-Json
        
        if ($data.data -and $data.data.Count -gt 0) {
            Write-Host " SUCCESS ($($data.data.Count) items)" -ForegroundColor Green
            $workingSources += $source
        } else {
            Write-Host " EMPTY (0 items)" -ForegroundColor Yellow
            $failingSources += $source
        }
    }
    catch {
        Write-Host " FAILED ($($_.Exception.Message))" -ForegroundColor Red
        $failingSources += $source
    }
    
    # Small delay between requests
    Start-Sleep 1
}

# Results summary
Write-Host "`n=== TESTING RESULTS ===" -ForegroundColor Green
Write-Host "Working sources: $($workingSources.Count)/$totalSources" -ForegroundColor Green
Write-Host "Failing sources: $($failingSources.Count)/$totalSources" -ForegroundColor Red
Write-Host "Success rate: $([math]::Round($workingSources.Count/$totalSources*100, 2))%" -ForegroundColor Yellow

Write-Host "`nWORKING SOURCES:" -ForegroundColor Green
$workingSources | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }

Write-Host "`nFAILING SOURCES:" -ForegroundColor Red
$failingSources | ForEach-Object { Write-Host "  ❌ $_" -ForegroundColor Red }

# Save results to file
$results = @{
    "timestamp" = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "total" = $totalSources
    "working" = $workingSources
    "failing" = $failingSources
    "success_rate" = [math]::Round($workingSources.Count/$totalSources*100, 2)
}

$results | ConvertTo-Json -Depth 3 | Out-File "test-results.json" -Encoding UTF8
Write-Host "`nResults saved to test-results.json" -ForegroundColor Cyan

$webClient.Dispose()
Write-Host "`nTesting completed!" -ForegroundColor Green
