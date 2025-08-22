import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import fetch from 'node-fetch';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT, 'web');
const DB_PATH = path.join(__dirname, 'unitycure.db');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// Database configuration and initialization
let db = null;
let dbType = 'sqlite'; // Default to SQLite

async function initializeDatabase() {
  try {
    // Try MySQL first
    const mysql = await import('mysql2/promise');
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'unitycure',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    const pool = mysql.createPool(dbConfig);
    
    // Test MySQL connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection successful! Using MySQL database.');
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.execute(`USE ${dbConfig.database}`);
    
    // Create tables
    await createMySQLTables(connection);
    
    // Seed demo data
    await seedMySQLData(connection);
    
    connection.release();
    db = pool;
    dbType = 'mysql';
    
  } catch (error) {
    console.log('⚠️  MySQL connection failed, falling back to SQLite...');
    console.log('Error:', error.message);
    
    // Fallback to SQLite
sqlite3.verbose();
    db = new sqlite3.Database(DB_PATH);
    
    await createSQLiteTables();
    await seedSQLiteData();
    
    console.log('✅ SQLite database initialized successfully!');
  }
}

async function createMySQLTables(connection) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      identifier VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      redirect VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      doctor_name VARCHAR(255),
      hospital VARCHAR(255),
      type VARCHAR(100),
      date DATE,
      time TIME,
      patient_name VARCHAR(255),
      patient_age INT,
      patient_contact VARCHAR(50),
      reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS sos_reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lat DECIMAL(10, 8),
      lng DECIMAL(11, 8),
      symptoms JSON,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_id VARCHAR(255),
      service_type VARCHAR(100),
      user_id VARCHAR(255),
      rating INT,
      review TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS providers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      provider_type VARCHAR(100),
      name VARCHAR(255),
      address TEXT,
      lat DECIMAL(10, 8),
      lng DECIMAL(11, 8),
      contact VARCHAR(255),
      services TEXT,
      specialty VARCHAR(255),
      admin_name VARCHAR(255),
      admin_email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      newsletter BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS chatbot_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255),
      user_message TEXT NOT NULL,
      bot_response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS hospitals (
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
    )`
  ];

  for (const table of tables) {
    await connection.execute(table);
  }
}

async function createSQLiteTables() {
  return new Promise((resolve, reject) => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
        redirect TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_name TEXT,
      hospital TEXT,
      type TEXT,
      date TEXT,
      time TEXT,
      patient_name TEXT,
      patient_age INTEGER,
      patient_contact TEXT,
      reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sos_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lat REAL,
      lng REAL,
      symptoms TEXT,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT,
      service_type TEXT,
      user_id TEXT,
      rating INTEGER,
      review TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_type TEXT,
      name TEXT,
      address TEXT,
      lat REAL,
      lng REAL,
      contact TEXT,
      services TEXT,
      specialty TEXT,
      admin_name TEXT,
      admin_email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

      db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        newsletter BOOLEAN DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS chatbot_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        lat REAL,
        lng REAL,
        contact TEXT,
        services TEXT,
        specialty TEXT,
        emergency_services BOOLEAN DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

async function seedMySQLData(connection) {
  const seedUsers = [
    ['citizen@example.com', 'Test@123', 'Citizen', '/user_dashboard.html'],
    ['9876543210', 'Test@123', 'Citizen', '/user_dashboard.html'],
    ['hospitaladmin@uc.com', 'Admin@123', 'Hospital Staff', '/resource_management.html'],
    ['doctor@uc.com', 'Doc@123', 'Doctor', '/doctor_schedule.html'],
    ['dispatcher@uc.com', 'Disp@123', 'Dispatcher', '/dispatcher_dashboard.html'],
    ['platformadmin@uc.com', 'Root@123', 'Platform Admin', '/platform_admin_dashboard.html']
  ];

  for (const [identifier, password, role, redirect] of seedUsers) {
    await connection.execute(
      'INSERT IGNORE INTO users(identifier, password, role, redirect) VALUES (?, ?, ?, ?)',
      [identifier, password, role, redirect]
    );
  }

  const seedHospitals = [
    ['Unity General Hospital', '123 Healthcare Ave, Medical District', 40.7128, -74.0060, '+1-555-0101', JSON.stringify(['Emergency', 'Cardiology', 'Pediatrics']), 'General', true],
    ['City Medical Center', '456 Wellness Blvd, Downtown', 40.7589, -73.9851, '+1-555-0102', JSON.stringify(['Surgery', 'Oncology', 'Neurology']), 'Specialized', true],
    ['Community Health Clinic', '789 Care Street, Suburbia', 40.7505, -73.9934, '+1-555-0103', JSON.stringify(['Primary Care', 'Vaccination', 'Mental Health']), 'Community', false]
  ];

  for (const [name, address, lat, lng, contact, services, specialty, emergency] of seedHospitals) {
    await connection.execute(
      'INSERT IGNORE INTO hospitals(name, address, lat, lng, contact, services, specialty, emergency_services) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, address, lat, lng, contact, services, specialty, emergency]
    );
  }
}

async function seedSQLiteData() {
  return new Promise((resolve, reject) => {
    const seedUsers = [
      ['citizen@example.com', 'Test@123', 'Citizen', '/user_dashboard.html'],
      ['9876543210', 'Test@123', 'Citizen', '/user_dashboard.html'],
      ['hospitaladmin@uc.com', 'Admin@123', 'Hospital Staff', '/resource_management.html'],
      ['doctor@uc.com', 'Doc@123', 'Doctor', '/doctor_schedule.html'],
      ['dispatcher@uc.com', 'Disp@123', 'Dispatcher', '/dispatcher_dashboard.html'],
      ['platformadmin@uc.com', 'Root@123', 'Platform Admin', '/platform_admin_dashboard.html']
    ];

    seedUsers.forEach(([identifier, password, role, redirect]) => {
      db.run(
        'INSERT OR IGNORE INTO users(identifier, password, role, redirect) VALUES (?, ?, ?, ?)',
        [identifier, password, role, redirect]
      );
    });

    const seedHospitals = [
      ['Unity General Hospital', '123 Healthcare Ave, Medical District', 40.7128, -74.0060, '+1-555-0101', JSON.stringify(['Emergency', 'Cardiology', 'Pediatrics']), 'General', 1],
      ['City Medical Center', '456 Wellness Blvd, Downtown', 40.7589, -73.9851, '+1-555-0102', JSON.stringify(['Surgery', 'Oncology', 'Neurology']), 'Specialized', 1],
      ['Community Health Clinic', '789 Care Street, Suburbia', 40.7505, -73.9934, '+1-555-0103', JSON.stringify(['Primary Care', 'Vaccination', 'Mental Health']), 'Community', 0]
    ];

    seedHospitals.forEach(([name, address, lat, lng, contact, services, specialty, emergency]) => {
      db.run(
        'INSERT OR IGNORE INTO hospitals(name, address, lat, lng, contact, services, specialty, emergency_services) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, address, lat, lng, contact, services, specialty, emergency]
      );
    });

    db.run('SELECT COUNT(*) FROM users', (err, row) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Initialize database
initializeDatabase();

// Helper function to execute database queries
async function executeQuery(query, params = []) {
  if (dbType === 'mysql') {
    const [rows] = await db.execute(query, params);
    return rows;
  } else {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

async function executeInsert(query, params = []) {
  if (dbType === 'mysql') {
    const [result] = await db.execute(query, params);
    return result;
  } else {
    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ insertId: this.lastID });
      });
    });
  }
}

// API routes
app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ ok: false, error: 'Missing credentials' });
  }
  
  try {
    const query = dbType === 'mysql' 
      ? 'SELECT role, redirect FROM users WHERE LOWER(identifier) = LOWER(?) AND password = ? LIMIT 1'
      : 'SELECT role, redirect FROM users WHERE lower(identifier) = lower(?) AND password = ? LIMIT 1';
    
    const rows = await executeQuery(query, [identifier, password]);
    
    if (rows.length === 0) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    
    return res.json({ ok: true, role: rows[0].role, redirect: rows[0].redirect });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

// New API: User Registration
app.post('/api/register', async (req, res) => {
  const { identifier, password, role, redirect } = req.body || {};
  
  if (!identifier || !password || !role) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  // Basic validation
  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
  }

  try {
    const existingQuery = dbType === 'mysql'
      ? 'SELECT id FROM users WHERE LOWER(identifier) = LOWER(?)'
      : 'SELECT id FROM users WHERE lower(identifier) = lower(?)';
    
    const existing = await executeQuery(existingQuery, [identifier]);

    if (existing.length > 0) {
      return res.status(400).json({ ok: false, error: 'User already exists' });
    }

    const insertQuery = 'INSERT INTO users(identifier, password, role, redirect) VALUES (?, ?, ?, ?)';
    const result = await executeInsert(insertQuery, [identifier, password, role, redirect || '/user_dashboard.html']);

    return res.json({ ok: true, id: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

// New API: Get Hospital Details
app.get('/api/hospitals', async (req, res) => {
  try {
    const rows = await executeQuery('SELECT * FROM hospitals ORDER BY name');
    return res.json({ ok: true, hospitals: rows });
  } catch (error) {
    console.error('Get hospitals error:', error);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

app.get('/api/hospitals/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const rows = await executeQuery('SELECT * FROM hospitals WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Hospital not found' });
    }
    
    return res.json({ ok: true, hospital: rows[0] });
  } catch (error) {
    console.error('Get hospital error:', error);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const {
    doctorName,
    hospital,
    type,
    date,
    time,
    patient
  } = req.body || {};
  
  if (!doctorName || !hospital || !type || !date || !time || !patient || !patient.name) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }
  
  try {
    const query = `INSERT INTO appointments(doctor_name, hospital, type, date, time, patient_name, patient_age, patient_contact, reason)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await executeInsert(query, [
      doctorName,
      hospital,
      type,
      date,
      time,
      patient.name,
      Number(patient.age) || null,
      patient.contact || null,
      patient.reason || null
    ]);
    
    return res.json({ ok: true, id: result.insertId });
  } catch (error) {
    console.error('Appointment creation error:', error);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

app.post('/api/sos', async (req, res) => {
  const { lat, lng, symptoms, description } = req.body || {};
  
  if (typeof lat !== 'number' || typeof lng !== 'number' || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({ ok: false, error: 'Invalid payload' });
  }
  
  try {
    const query = 'INSERT INTO sos_reports(lat, lng, symptoms, description) VALUES (?, ?, ?, ?)';
    const result = await executeInsert(query, [lat, lng, JSON.stringify(symptoms), description || null]);
    
    return res.json({ ok: true, id: result.insertId });
  } catch (error) {
    console.error('SOS report error:', error);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

app.post('/api/feedback', async (req, res) => {
  const { serviceId, serviceType, userId, rating, review } = req.body || {};
  
  if (!serviceId || !serviceType || !rating) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }
  
  try {
    const query = 'INSERT INTO feedback(service_id, service_type, user_id, rating, review) VALUES (?, ?, ?, ?, ?)';
    const result = await executeInsert(query, [String(serviceId), String(serviceType), userId || null, Number(rating), review || null]);
    
    return res.json({ ok: true, id: result.insertId });
  } catch (error) {
    console.error('Feedback error:', error);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

app.post('/api/providers', async (req, res) => {
  const { providerType, name, address, location, contact, services, specialty, admin } = req.body || {};
  
  if (!providerType || !name || !address || !location || typeof location.lat !== 'number' || typeof location.lng !== 'number' || !contact || !admin || !admin.fullName || !admin.email) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }
  
  try {
    const query = `INSERT INTO providers(provider_type, name, address, lat, lng, contact, services, specialty, admin_name, admin_email)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await executeInsert(query, [
      providerType,
      name,
      address,
      Number(location.lat),
      Number(location.lng),
      contact,
      Array.isArray(services) ? services.join(',') : services || null,
      specialty || null,
      admin.fullName,
      admin.email
    ]);
    
    return res.json({ ok: true, id: result.insertId });
  } catch (error) {
    console.error('Provider creation error:', error);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

// Enhanced Chatbot API endpoint with message storage
app.post('/api/chatbot', async (req, res) => {
  const { message, userId } = req.body || {};
  
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
      
      // Store the conversation in database
      try {
        const query = 'INSERT INTO chatbot_messages(user_id, user_message, bot_response) VALUES (?, ?, ?)';
        await executeInsert(query, [userId || null, message, botResponse]);
      } catch (dbError) {
        console.error('Failed to store chatbot message:', dbError);
        // Continue even if storage fails
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
    console.error('Chatbot error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Internal server error' 
    });
  }
});

// New API: Get Chatbot Message History
app.get('/api/chatbot/history/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const query = dbType === 'mysql'
      ? 'SELECT * FROM chatbot_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
      : 'SELECT * FROM chatbot_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
    
    const rows = await executeQuery(query, [userId]);
    
    return res.json({ ok: true, messages: rows });
  } catch (error) {
    console.error('Get chatbot history error:', error);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

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
    const query = `INSERT INTO contact_messages(first_name, last_name, email, phone, subject, message, newsletter)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await executeInsert(query, [
      firstName,
      lastName,
      email,
      phone || null,
      subject,
      message,
      newsletter ? (dbType === 'mysql' ? 1 : 1) : (dbType === 'mysql' ? 0 : 0)
    ]);
    
    return res.json({ ok: true, id: result.insertId });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to save message' });
  }
});

// Static site
app.use('/', express.static(WEB_DIR, { extensions: ['html'] }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 UnityCure server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from ${WEB_DIR}`);
  console.log(`🗄️  Database type: ${dbType.toUpperCase()}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`\n📋 Demo Credentials:`);
  console.log(`   Citizen: citizen@example.com / Test@123`);
  console.log(`   Hospital Staff: hospitaladmin@uc.com / Admin@123`);
  console.log(`   Doctor: doctor@uc.com / Doc@123`);
  console.log(`   Dispatcher: dispatcher@uc.com / Disp@123`);
  console.log(`   Platform Admin: platformadmin@uc.com / Root@123`);
});


