import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import fetch from 'node-fetch';

// MongoDB imports
import dbConnection from './database/connection.js';
import { seedInitialData } from './database/seedData.js';
import { migrateSQLiteToMongoDB } from './database/migrate.js';

// Model imports
import User from './models/User.js';
import Hospital from './models/Hospital.js';
import Appointment from './models/Appointment.js';
import SosReport from './models/SosReport.js';
import Feedback from './models/Feedback.js';
import Provider from './models/Provider.js';
import ContactMessage from './models/ContactMessage.js';
import ChatbotMessage from './models/ChatbotMessage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT, 'web');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// Initialize database and migrate data
async function initializeDatabase() {
  try {
    await dbConnection.connect();
    
    // Try to migrate existing SQLite data
    await migrateSQLiteToMongoDB();
    
    // Seed initial data if needed
    await seedInitialData();
    
    console.log('🗄️  Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Initialize database
initializeDatabase();

// Helper function for error handling
const handleError = (res, error, message = 'Database error') => {
  console.error(message + ':', error);
  return res.status(500).json({ ok: false, error: message });
};

// API Routes

// User Authentication
app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ ok: false, error: 'Missing credentials' });
  }
  
  try {
    const user = await User.findOne({ 
      identifier: { $regex: new RegExp(`^${identifier}$`, 'i') },
      password: password 
    });
    
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    
    return res.json({ 
      ok: true, 
      role: user.role, 
      redirect: user.redirect,
      userId: user._id 
    });
  } catch (error) {
    return handleError(res, error, 'Login error');
  }
});

// User Registration
app.post('/api/register', async (req, res) => {
  const { identifier, password, role, redirect } = req.body || {};
  
  if (!identifier || !password || !role) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
  }

  try {
    const existingUser = await User.findOne({ 
      identifier: { $regex: new RegExp(`^${identifier}$`, 'i') }
    });

    if (existingUser) {
      return res.status(400).json({ ok: false, error: 'User already exists' });
    }

    const user = new User({
      identifier,
      password,
      role,
      redirect: redirect || '/user_dashboard.html'
    });

    await user.save();
    return res.json({ ok: true, id: user._id });
  } catch (error) {
    return handleError(res, error, 'Registration error');
  }
});

// Hospital APIs
app.get('/api/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ name: 1 });
    return res.json({ ok: true, hospitals });
  } catch (error) {
    return handleError(res, error, 'Get hospitals error');
  }
});

app.get('/api/hospitals/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const hospital = await Hospital.findById(id);
    
    if (!hospital) {
      return res.status(404).json({ ok: false, error: 'Hospital not found' });
    }
    
    return res.json({ ok: true, hospital });
  } catch (error) {
    return handleError(res, error, 'Get hospital error');
  }
});

// Nearby hospitals with geospatial query
app.get('/api/hospitals/nearby/:lat/:lng', async (req, res) => {
  const { lat, lng } = req.params;
  const maxDistance = req.query.maxDistance || 10000; // 10km default
  
  try {
    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(20);
    
    return res.json({ ok: true, hospitals });
  } catch (error) {
    return handleError(res, error, 'Get nearby hospitals error');
  }
});

// Appointment Management
app.post('/api/appointments', async (req, res) => {
  const { doctorName, hospital, type, date, time, patient } = req.body || {};
  
  if (!doctorName || !hospital || !type || !date || !time || !patient || !patient.name) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }
  
  try {
    const appointment = new Appointment({
      doctorName,
      hospital,
      type,
      date: new Date(date),
      time,
      patient: {
        name: patient.name,
        age: patient.age ? parseInt(patient.age) : undefined,
        contact: patient.contact,
        reason: patient.reason
      }
    });
    
    await appointment.save();
    return res.json({ ok: true, id: appointment._id });
  } catch (error) {
    return handleError(res, error, 'Appointment creation error');
  }
});

app.get('/api/appointments', async (req, res) => {
  const { doctorName, hospital, date, limit = 50 } = req.query;
  
  try {
    let query = {};
    if (doctorName) query.doctorName = { $regex: doctorName, $options: 'i' };
    if (hospital) query.hospital = { $regex: hospital, $options: 'i' };
    if (date) query.date = new Date(date);
    
    const appointments = await Appointment.find(query)
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit));
    
    return res.json({ ok: true, appointments });
  } catch (error) {
    return handleError(res, error, 'Get appointments error');
  }
});

// SOS Reports
app.post('/api/sos', async (req, res) => {
  const { lat, lng, symptoms, description } = req.body || {};
  
  if (typeof lat !== 'number' || typeof lng !== 'number' || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({ ok: false, error: 'Invalid payload' });
  }
  
  try {
    const sosReport = new SosReport({
      location: {
        type: 'Point',
        coordinates: [lng, lat] // MongoDB expects [longitude, latitude]
      },
      symptoms,
      description
    });
    
    await sosReport.save();
    return res.json({ ok: true, id: sosReport._id });
  } catch (error) {
    return handleError(res, error, 'SOS report error');
  }
});

app.get('/api/sos', async (req, res) => {
  const { lat, lng, maxDistance = 5000, limit = 50 } = req.query;
  
  try {
    let query = {};
    
    // If location provided, find nearby reports
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      };
    }
    
    const sosReports = await SosReport.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    return res.json({ ok: true, sosReports });
  } catch (error) {
    return handleError(res, error, 'Get SOS reports error');
  }
});

// Feedback System
app.post('/api/feedback', async (req, res) => {
  const { serviceId, serviceType, userId, rating, review } = req.body || {};
  
  if (!serviceId || !serviceType || !rating) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }
  
  try {
    const feedback = new Feedback({
      serviceId: String(serviceId),
      serviceType: String(serviceType),
      userId,
      rating: parseInt(rating),
      review
    });
    
    await feedback.save();
    
    // Update hospital rating if it's hospital feedback
    if (serviceType === 'hospital') {
      await updateHospitalRating(serviceId);
    }
    
    return res.json({ ok: true, id: feedback._id });
  } catch (error) {
    return handleError(res, error, 'Feedback error');
  }
});

// Helper function to update hospital ratings
async function updateHospitalRating(hospitalId) {
  try {
    const feedbacks = await Feedback.find({ 
      serviceId: hospitalId, 
      serviceType: 'hospital' 
    });
    
    if (feedbacks.length > 0) {
      const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
      const averageRating = totalRating / feedbacks.length;
      
      await Hospital.findByIdAndUpdate(hospitalId, {
        'rating.average': Math.round(averageRating * 10) / 10,
        'rating.count': feedbacks.length
      });
    }
  } catch (error) {
    console.error('Error updating hospital rating:', error);
  }
}

app.get('/api/feedback/:serviceId/:serviceType', async (req, res) => {
  const { serviceId, serviceType } = req.params;
  const { limit = 20 } = req.query;
  
  try {
    const feedbacks = await Feedback.find({ serviceId, serviceType })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    return res.json({ ok: true, feedbacks });
  } catch (error) {
    return handleError(res, error, 'Get feedback error');
  }
});

// Provider Registration
app.post('/api/providers', async (req, res) => {
  const { providerType, name, address, location, contact, services, specialty, admin } = req.body || {};
  
  if (!providerType || !name || !address || !location || 
      typeof location.lat !== 'number' || typeof location.lng !== 'number' || 
      !contact || !admin || !admin.fullName || !admin.email) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }
  
  try {
    const provider = new Provider({
      providerType,
      name,
      address,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      contact,
      services: Array.isArray(services) ? services : (services ? [services] : []),
      specialty,
      admin: {
        name: admin.fullName,
        email: admin.email
      }
    });
    
    await provider.save();
    return res.json({ ok: true, id: provider._id });
  } catch (error) {
    return handleError(res, error, 'Provider creation error');
  }
});

app.get('/api/providers', async (req, res) => {
  const { type, lat, lng, maxDistance = 10000, limit = 50 } = req.query;
  
  try {
    let query = {};
    if (type) query.providerType = { $regex: type, $options: 'i' };
    
    let providers;
    if (lat && lng) {
      providers = await Provider.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(maxDistance)
          }
        }
      }).limit(parseInt(limit));
    } else {
      providers = await Provider.find(query)
        .sort({ name: 1 })
        .limit(parseInt(limit));
    }
    
    return res.json({ ok: true, providers });
  } catch (error) {
    return handleError(res, error, 'Get providers error');
  }
});

// Enhanced Chatbot API with MongoDB storage
app.post('/api/chatbot', async (req, res) => {
  const { message, userId, sessionId } = req.body || {};
  
  if (!message) {
    return res.status(400).json({ ok: false, error: 'Message is required' });
  }

  try {
    const API_KEY = process.env.AI_API_KEY || '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';
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are UnityCure's AI healthcare assistant. You help users with:
            - Healthcare appointment booking
            - Medical information and guidance
            - UnityCure platform features
            - Emergency services information
            - General health queries
            
            Always be helpful, professional, and prioritize user safety. For medical emergencies, always recommend calling 911 or visiting the nearest emergency room.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const botResponse = data.choices[0].message.content;
      
      // Store the conversation in MongoDB
      try {
        const chatbotMessage = new ChatbotMessage({
          userId,
          userMessage: message,
          botResponse,
          sessionId
        });
        await chatbotMessage.save();
      } catch (dbError) {
        console.error('Failed to store chatbot message:', dbError);
      }
      
      return res.json({ 
        ok: true, 
        response: botResponse 
      });
    } else {
      return res.json({ 
        ok: false, 
        error: 'Failed to get response from AI service' 
      });
    }
  } catch (error) {
    return handleError(res, error, 'Chatbot error');
  }
});

// Get Chatbot Message History
app.get('/api/chatbot/history/:userId', async (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;
  
  try {
    const messages = await ChatbotMessage.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    return res.json({ ok: true, messages });
  } catch (error) {
    return handleError(res, error, 'Get chatbot history error');
  }
});

// Contact Form
app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, phone, subject, message, newsletter } = req.body || {};
  
  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email format' });
  }

  try {
    const contactMessage = new ContactMessage({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      newsletter: Boolean(newsletter)
    });
    
    await contactMessage.save();
    return res.json({ ok: true, id: contactMessage._id });
  } catch (error) {
    return handleError(res, error, 'Contact form error');
  }
});

// Get contact messages (for admin)
app.get('/api/contact', async (req, res) => {
  const { status, limit = 50 } = req.query;
  
  try {
    let query = {};
    if (status) query.status = status;
    
    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    return res.json({ ok: true, messages });
  } catch (error) {
    return handleError(res, error, 'Get contact messages error');
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = dbConnection.getConnectionStatus();
    return res.json({
      ok: true,
      status: 'healthy',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Static site
app.use('/', express.static(WEB_DIR, { extensions: ['html'] }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 UnityCure server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from ${WEB_DIR}`);
  console.log(`🗄️  Database: MongoDB`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`\n📋 Demo Credentials:`);
  console.log(`   Citizen: citizen@example.com / Test@123`);
  console.log(`   Hospital Staff: hospitaladmin@uc.com / Admin@123`);
  console.log(`   Doctor: doctor@uc.com / Doc@123`);
  console.log(`   Dispatcher: dispatcher@uc.com / Disp@123`);
  console.log(`   Platform Admin: platformadmin@uc.com / Root@123`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await dbConnection.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await dbConnection.disconnect();
  process.exit(0);
});