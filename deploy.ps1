# Cloudflare Pages Deployment Script
Write-Host "Building project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful! Deploying to Cloudflare Pages..." -ForegroundColor Green
    wrangler pages deploy out --project-name=your-project-name
} else {
    Write-Host "Build failed! Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

