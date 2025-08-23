# MongoDB Migration Setup Guide

## Prerequisites Installation

### 1. Install Node.js
1. Download Node.js from https://nodejs.org/
2. Install the LTS version (includes npm)
3. Restart your terminal/PowerShell after installation
4. Verify installation: `node --version` and `npm --version`

### 2. Install MongoDB
Choose one of these options:

#### Option A: MongoDB Community Server (Local Installation)
1. Download from https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Start MongoDB service
4. Default connection: `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Create free account at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get connection string (replace `<password>` with your password)
4. Set environment variable: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unitycure`

#### Option C: Docker (If you have Docker installed)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Installation Steps

### 1. Install Dependencies
```powershell
cd "c:\Users\sanjo\OneDrive\Desktop\UnityCure\UnityCure\server"
npm install
```

### 2. Set Environment Variables (Optional)
Create a `.env` file in the server directory:
```
MONGODB_URI=mongodb://localhost:27017/unitycure
PORT=3000
AI_API_KEY=your_api_key_here
```

### 3. Start the Server
```powershell
cd "c:\Users\sanjo\OneDrive\Desktop\UnityCure\UnityCure\server"
npm start
```

## What Changed

### Database Migration
- ✅ Converted from SQL (SQLite/MySQL) to MongoDB
- ✅ All existing data will be automatically migrated on first run
- ✅ Enhanced data models with proper indexing
- ✅ Geospatial queries for location-based features

### New Features Added
1. **Geospatial Queries**: Find nearby hospitals, providers, and SOS reports
2. **Better Data Structure**: More flexible document-based storage
3. **Enhanced Indexing**: Faster queries and better performance
4. **Automatic Migration**: Existing SQLite data is preserved
5. **Health Check Endpoint**: `/api/health` for monitoring

### API Enhancements
- All existing APIs work the same way
- Added new endpoints:
  - `GET /api/hospitals/nearby/:lat/:lng` - Find nearby hospitals
  - `GET /api/providers?lat=X&lng=Y` - Find nearby providers
  - `GET /api/sos?lat=X&lng=Y` - Find nearby SOS reports
  - `GET /api/health` - System health check

### Data Models
- **Users**: Authentication and role management
- **Hospitals**: Healthcare facilities with location data
- **Appointments**: Medical appointments
- **SOS Reports**: Emergency reports with geolocation
- **Feedback**: Rating and review system
- **Providers**: Healthcare provider registration
- **Contact Messages**: Contact form submissions
- **Chatbot Messages**: AI conversation history

## Testing the Migration

1. Start the server
2. Check logs for migration status
3. Test login with existing credentials:
   - `citizen@example.com` / `Test@123`
   - `hospitaladmin@uc.com` / `Admin@123`
4. Visit `http://localhost:3000/api/health` to check system status

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in config
- Verify network connectivity for Atlas

### Migration Issues
- Check server logs for detailed error messages
- Ensure SQLite file exists if migrating
- Verify MongoDB permissions

### Performance
- MongoDB automatically creates indexes for better performance
- Geospatial queries are optimized for location-based searches
- Connection pooling is configured for concurrent requests

## Benefits of MongoDB Migration

1. **Scalability**: Better horizontal scaling
2. **Flexibility**: Schema-less design for evolving requirements
3. **Geospatial**: Built-in location-based queries
4. **Performance**: Optimized for read-heavy workloads
5. **JSON Native**: Perfect match for JavaScript/Node.js
6. **Aggregation**: Powerful data processing capabilities
7. **Replication**: Built-in high availability
8. **Sharding**: Automatic data distribution

Your application is now ready to use MongoDB! 🎉