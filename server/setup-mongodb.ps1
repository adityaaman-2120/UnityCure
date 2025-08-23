# MongoDB Setup Script for UnityCure
# Run this script in PowerShell as Administrator

Write-Host "🚀 UnityCure MongoDB Setup Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "`n📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
Write-Host "`n📦 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is available: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not available!" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`n📦 Installing MongoDB dependencies..." -ForegroundColor Yellow
try {
    npm install mongodb mongoose
    Write-Host "✅ MongoDB dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running (local installation)
Write-Host "`n🗄️  Checking MongoDB connection..." -ForegroundColor Yellow
$mongoRunning = $false

# Try to connect to local MongoDB
try {
    $testConnection = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($testConnection.TcpTestSucceeded) {
        Write-Host "✅ MongoDB is running on localhost:27017" -ForegroundColor Green
        $mongoRunning = $true
    }
} catch {
    # Connection test failed
}

if (-not $mongoRunning) {
    Write-Host "⚠️  MongoDB is not running locally" -ForegroundColor Yellow
    Write-Host "`nMongoDB Installation Options:" -ForegroundColor Cyan
    Write-Host "1. Install MongoDB Community Server: https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "2. Use MongoDB Atlas (Cloud): https://www.mongodb.com/atlas" -ForegroundColor White
    Write-Host "3. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor White
    Write-Host "`nAfter installing MongoDB, you can start the server with:" -ForegroundColor Yellow
    Write-Host "npm start" -ForegroundColor White
}

# Create .env file template
Write-Host "`n📝 Creating .env template..." -ForegroundColor Yellow
$envContent = @"
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/unitycure

# Server Configuration
PORT=3000

# AI API Key (Optional)
AI_API_KEY=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

# For MongoDB Atlas, use this format:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unitycure
"@

$envPath = ".env"
if (-not (Test-Path $envPath)) {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "✅ Created .env file template" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file already exists, skipping..." -ForegroundColor Yellow
}

Write-Host "`n🎉 Setup completed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Ensure MongoDB is running" -ForegroundColor White
Write-Host "2. Update .env file with your MongoDB connection string if needed" -ForegroundColor White
Write-Host "3. Start the server: npm start" -ForegroundColor White
Write-Host "4. Visit http://localhost:3000 to test your application" -ForegroundColor White

Write-Host "`n📚 For detailed setup instructions, see MONGODB_SETUP.md" -ForegroundColor Yellow