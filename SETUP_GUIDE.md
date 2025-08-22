# UnityCure Setup Guide

## 🚀 Quick Start (Recommended)

The server has been configured to work **immediately** without any database setup!

### 1. Start the Backend Server
```bash
cd server
npm install
npm start
```

The server will automatically:
- ✅ Try to connect to MySQL (if available)
- ✅ Fall back to SQLite if MySQL is not available
- ✅ Create all necessary database tables
- ✅ Seed demo data
- ✅ Start the API server on port 5174

### 2. Test the APIs
Visit: http://localhost:5174/api

You should see the server running with demo credentials displayed in the console.

### 3. Test Login/Registration
Use these demo credentials:
- **Citizen**: `citizen@example.com` / `Test@123`
- **Hospital Staff**: `hospitaladmin@uc.com` / `Admin@123`
- **Doctor**: `doctor@uc.com` / `Doc@123`
- **Dispatcher**: `dispatcher@uc.com` / `Disp@123`
- **Platform Admin**: `platformadmin@uc.com` / `Root@123`

## 🗄️ Database Options

### Option 1: SQLite (Default - Works Immediately)
- ✅ **No setup required**
- ✅ **Works out of the box**
- ✅ **Perfect for development and testing**
- ✅ **Database file**: `server/unitycure.db`

### Option 2: MySQL (For Production)
If you want to use MySQL instead:

#### Install MySQL on Windows:
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run the installer
3. Choose "Developer Default" or "Server only"
4. Set a root password
5. Complete the installation

#### Create Database:
```sql
mysql -u root -p
CREATE DATABASE unitycure;
USE unitycure;
```

#### Configure Environment Variables:
Create a `.env` file in the server directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=unitycure
DB_PORT=3306
```

## 🔧 Frontend Options

### Option 1: Original HTML/JS Frontend
- **URL**: http://localhost:5174
- **Files**: `web/` directory
- **Features**: All existing functionality

### Option 2: React Frontend (New)
```bash
cd react-frontend
npm install
npm start
```
- **URL**: http://localhost:3000
- **Features**: Modern UI with API integration

## 📋 Available APIs

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Hospital Management
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get hospital by ID

### Chatbot
- `POST /api/chatbot` - Send message to AI chatbot
- `GET /api/chatbot/history/:userId` - Get chat history

### Other APIs
- `POST /api/appointments` - Create appointment
- `POST /api/sos` - Create SOS report
- `POST /api/feedback` - Submit feedback
- `POST /api/providers` - Register provider
- `POST /api/contact` - Submit contact form

## 🧪 Testing the APIs

### Test Login API:
```bash
curl -X POST http://localhost:5174/api/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"citizen@example.com","password":"Test@123"}'
```

### Test Hospital API:
```bash
curl http://localhost:5174/api/hospitals
```

### Test Chatbot API:
```bash
curl -X POST http://localhost:5174/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, how can you help me?"}'
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find process using port 5174
netstat -ano | findstr :5174

# Kill the process
taskkill /PID <PID> /F
```

### Database Connection Issues
- The server automatically falls back to SQLite
- Check console output for database type being used
- SQLite database file: `server/unitycure.db`

### CORS Issues
- CORS is enabled by default
- Frontend should work from any origin

## 📁 Project Structure

```
UNITYCURE_CURSOR/
├── server/                 # Backend API server
│   ├── index.js           # Main server file
│   ├── package.json       # Dependencies
│   └── unitycure.db       # SQLite database (auto-created)
├── web/                   # Original HTML/JS frontend
│   ├── login_page.html
│   ├── user_dashboard.html
│   └── ...
├── react-frontend/        # React frontend (optional)
│   ├── src/
│   └── package.json
└── SETUP_GUIDE.md        # This file
```

## 🎯 Next Steps

1. **Test the APIs** using the demo credentials
2. **Choose your frontend**: HTML/JS or React
3. **Customize the application** as needed
4. **Deploy to production** when ready

## 📞 Support

If you encounter any issues:
1. Check the console output for error messages
2. Verify the database type being used (SQLite/MySQL)
3. Test the APIs using curl or Postman
4. Check that all dependencies are installed

The server is designed to work immediately with SQLite, so you should be able to test all functionality right away!
