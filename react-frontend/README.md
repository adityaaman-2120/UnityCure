# UnityCure React Frontend

This is a React frontend that demonstrates integration with the UnityCure MySQL backend API.

## Features

- **User Authentication**: Login and registration with MySQL backend
- **Hospital Management**: View hospital details and services
- **AI Chatbot**: Interactive chatbot with message history storage
- **Responsive Design**: Mobile-friendly interface

## Prerequisites

- Node.js (v14 or higher)
- MySQL database running
- UnityCure backend server running on port 5174

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## API Integration

The frontend uses Axios to communicate with the backend APIs:

### Base Configuration
- **API Base URL**: `http://localhost:5174/api`
- **Content-Type**: `application/json`

### Available APIs

#### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration

#### Hospital Management
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get hospital by ID

#### Chatbot
- `POST /api/chatbot` - Send message to AI chatbot
- `GET /api/chatbot/history/:userId` - Get chat history

#### Other APIs
- `POST /api/appointments` - Create appointment
- `POST /api/sos` - Create SOS report
- `POST /api/feedback` - Submit feedback
- `POST /api/providers` - Register provider
- `POST /api/contact` - Submit contact form

## Components

### Login Component
- Handles user authentication and registration
- Form validation and error handling
- Demo credentials display

### HospitalList Component
- Displays all available hospitals
- Hospital details modal
- Service information display

### Chatbot Component
- Real-time chat interface
- Message history loading
- Typing indicators
- Message storage in MySQL

## Database Schema

The frontend integrates with the following MySQL tables:

- `users` - User authentication and roles
- `hospitals` - Hospital information and services
- `chatbot_messages` - Chat conversation history
- `appointments` - Appointment bookings
- `sos_reports` - Emergency reports
- `feedback` - User feedback
- `providers` - Healthcare providers
- `contact_messages` - Contact form submissions

## Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:5174/api
```

## Demo Credentials

Use these credentials to test the login functionality:

- **Citizen**: `citizen@example.com` / `Test@123`
- **Hospital Staff**: `hospitaladmin@uc.com` / `Admin@123`
- **Doctor**: `doctor@uc.com` / `Doc@123`
- **Dispatcher**: `dispatcher@uc.com` / `Disp@123`
- **Platform Admin**: `platformadmin@uc.com` / `Root@123`

## Development

### Project Structure
```
src/
├── components/
│   ├── Login.js          # Authentication component
│   ├── Login.css
│   ├── HospitalList.js   # Hospital management
│   ├── HospitalList.css
│   ├── Chatbot.js        # AI chatbot interface
│   └── Chatbot.css
├── services/
│   └── api.js           # API service functions
├── App.js               # Main application
└── App.css             # Global styles
```

### Adding New Components

1. Create component file in `src/components/`
2. Create corresponding CSS file
3. Import and add to `App.js` navigation
4. Add API functions to `src/services/api.js`

## Troubleshooting

### Common Issues

1. **API Connection Error**: Ensure the backend server is running on port 5174
2. **CORS Error**: Check that CORS is properly configured in the backend
3. **Database Connection**: Verify MySQL is running and accessible

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

## Production Build

To create a production build:

```bash
npm run build
```

The build files will be created in the `build/` directory.

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include responsive design
4. Test API integration thoroughly

## License

This project is part of the UnityCure healthcare platform.
