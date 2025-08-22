# UnityCure MySQL Backend

This is the Node.js Express backend with MySQL database for the UnityCure healthcare platform.

## Features

- **MySQL Database**: Full MySQL integration with connection pooling
- **User Authentication**: Login and registration APIs
- **Hospital Management**: CRUD operations for hospital data
- **AI Chatbot**: Integration with Perplexity AI API
- **Message Storage**: Chatbot conversation history
- **Contact Forms**: Contact message handling
- **CORS Support**: Cross-origin resource sharing enabled

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

## Database Setup

### 1. Install MySQL

**Windows:**
- Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
- Follow installation wizard
- Set root password during installation

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### 2. Create Database

Connect to MySQL and create the database:

```sql
mysql -u root -p
CREATE DATABASE unitycure;
USE unitycure;
```

### 3. Configure Environment Variables

Create a `.env` file in the server directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=unitycure
DB_PORT=3306

# Server Configuration
PORT=5174
```

## Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:5174`

## Database Schema

The server automatically creates the following tables:

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identifier VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  redirect VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Hospitals Table
```sql
CREATE TABLE hospitals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  contact VARCHAR(255),
  services JSON,
  specialty VARCHAR(255),
  emergency_services BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chatbot Messages Table
```sql
CREATE TABLE chatbot_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255),
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Other Tables
- `appointments` - Appointment bookings
- `sos_reports` - Emergency reports
- `feedback` - User feedback
- `providers` - Healthcare providers
- `contact_messages` - Contact form submissions

## API Endpoints

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

## Demo Data

The server automatically seeds demo data:

### Demo Users
- `citizen@example.com` / `Test@123` (Citizen)
- `hospitaladmin@uc.com` / `Admin@123` (Hospital Staff)
- `doctor@uc.com` / `Doc@123` (Doctor)
- `dispatcher@uc.com` / `Disp@123` (Dispatcher)
- `platformadmin@uc.com` / `Root@123` (Platform Admin)

### Demo Hospitals
- Unity General Hospital (Emergency, Cardiology, Pediatrics)
- City Medical Center (Surgery, Oncology, Neurology)
- Community Health Clinic (Primary Care, Vaccination, Mental Health)

## AI Chatbot Configuration

The chatbot uses the Perplexity AI API:

- **API Key**: Configured in the code
- **Model**: `llama-3.1-sonar-small-128k-online`
- **System Prompt**: Healthcare assistant role
- **Message Storage**: All conversations stored in MySQL

## Security Features

- **CORS**: Cross-origin requests enabled
- **Helmet**: Security headers
- **Input Validation**: Request validation
- **SQL Injection Protection**: Parameterized queries
- **Error Handling**: Comprehensive error responses

## Development

### Project Structure
```
server/
├── index.js           # Main server file
├── config.js          # Database configuration
├── package.json       # Dependencies
└── README.md         # This file
```

### Adding New APIs

1. Add route handler in `index.js`
2. Use MySQL connection pool for database operations
3. Implement proper error handling
4. Add input validation
5. Test with the React frontend

### Database Operations

Example MySQL query:
```javascript
const [rows] = await pool.execute(
  'SELECT * FROM users WHERE identifier = ?',
  [identifier]
);
```

## Troubleshooting

### Common Issues

1. **MySQL Connection Error**:
   - Verify MySQL is running
   - Check database credentials
   - Ensure database exists

2. **Port Already in Use**:
   - Change PORT in environment variables
   - Kill existing process on port 5174

3. **CORS Errors**:
   - CORS is enabled by default
   - Check frontend URL configuration

### Debug Mode

Enable debug logging:
```javascript
console.log('Database connection:', dbConfig);
```

## Production Deployment

1. Set environment variables for production
2. Use PM2 or similar process manager
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure database backups

## Monitoring

- Server logs in console
- Database connection status
- API response times
- Error tracking

## License

This project is part of the UnityCure healthcare platform.
