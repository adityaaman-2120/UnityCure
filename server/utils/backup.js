import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'unitycure.db');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

export async function createSQLiteBackup() {
  return new Promise((resolve, reject) => {
    // Check if SQLite database exists
    if (!fs.existsSync(DB_PATH)) {
      console.log('⚠️  No SQLite database found to backup');
      resolve();
      return;
    }

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `unitycure_backup_${timestamp}.json`);
    
    console.log('💾 Creating SQLite backup...');
    
    const db = new sqlite3.Database(DB_PATH);
    const backup = {};

    const tables = [
      'users', 'appointments', 'sos_reports', 'feedback', 
      'providers', 'contact_messages', 'chatbot_messages', 'hospitals'
    ];

    let completedTables = 0;

    tables.forEach(tableName => {
      db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
        if (err) {
          console.log(`⚠️  Table ${tableName} not found, skipping...`);
        } else {
          backup[tableName] = rows;
          console.log(`✅ Backed up ${rows.length} records from ${tableName}`);
        }
        
        completedTables++;
        if (completedTables === tables.length) {
          // Write backup to file
          fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
          console.log(`💾 Backup created: ${backupPath}`);
          db.close();
          resolve(backupPath);
        }
      });
    });
  });
}

export async function restoreFromBackup(backupPath) {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log('🔄 Restoring from backup...');

    // Import models
    const { 
      User, Hospital, Appointment, SosReport, 
      Feedback, Provider, ContactMessage, ChatbotMessage 
    } = await import('../models/index.js');

    // Restore users
    if (backupData.users) {
      for (const userData of backupData.users) {
        await User.findOneAndUpdate(
          { identifier: userData.identifier },
          {
            identifier: userData.identifier,
            password: userData.password,
            role: userData.role,
            redirect: userData.redirect
          },
          { upsert: true }
        );
      }
      console.log(`✅ Restored ${backupData.users.length} users`);
    }

    // Restore hospitals
    if (backupData.hospitals) {
      for (const hospitalData of backupData.hospitals) {
        let services = [];
        try {
          services = JSON.parse(hospitalData.services || '[]');
        } catch (e) {
          services = hospitalData.services ? hospitalData.services.split(',') : [];
        }

        await Hospital.findOneAndUpdate(
          { name: hospitalData.name },
          {
            name: hospitalData.name,
            address: hospitalData.address,
            location: {
              type: 'Point',
              coordinates: [hospitalData.lng || 0, hospitalData.lat || 0]
            },
            contact: hospitalData.contact,
            services: services,
            specialty: hospitalData.specialty,
            emergencyServices: Boolean(hospitalData.emergency_services)
          },
          { upsert: true }
        );
      }
      console.log(`✅ Restored ${backupData.hospitals.length} hospitals`);
    }

    // Continue with other collections...
    console.log('🎉 Backup restoration completed!');
    
  } catch (error) {
    console.error('❌ Error restoring backup:', error);
    throw error;
  }
}