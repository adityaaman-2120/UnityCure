import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import Appointment from '../models/Appointment.js';
import SosReport from '../models/SosReport.js';
import Feedback from '../models/Feedback.js';
import Provider from '../models/Provider.js';
import ContactMessage from '../models/ContactMessage.js';
import ChatbotMessage from '../models/ChatbotMessage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'unitycure.db');

export async function migrateSQLiteToMongoDB() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Starting migration from SQLite to MongoDB...');
    
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.log('⚠️  SQLite database not found, skipping migration');
        resolve();
        return;
      }
      console.log('📂 SQLite database found, starting migration...');
    });

    const migrations = [];

    // Migrate Users
    migrations.push(new Promise((resolveUsers, rejectUsers) => {
      db.all('SELECT * FROM users', async (err, rows) => {
        if (err) {
          console.log('⚠️  Users table not found, skipping...');
          resolveUsers();
          return;
        }

        try {
          for (const row of rows) {
            await User.findOneAndUpdate(
              { identifier: row.identifier },
              {
                identifier: row.identifier,
                password: row.password,
                role: row.role,
                redirect: row.redirect
              },
              { upsert: true, new: true }
            );
          }
          console.log(`✅ Migrated ${rows.length} users`);
          resolveUsers();
        } catch (error) {
          console.error('❌ Error migrating users:', error);
          rejectUsers(error);
        }
      });
    }));

    // Migrate Hospitals
    migrations.push(new Promise((resolveHospitals, rejectHospitals) => {
      db.all('SELECT * FROM hospitals', async (err, rows) => {
        if (err) {
          console.log('⚠️  Hospitals table not found, skipping...');
          resolveHospitals();
          return;
        }

        try {
          for (const row of rows) {
            let services = [];
            try {
              services = JSON.parse(row.services || '[]');
            } catch (e) {
              services = row.services ? row.services.split(',') : [];
            }

            await Hospital.findOneAndUpdate(
              { name: row.name },
              {
                name: row.name,
                address: row.address,
                location: {
                  type: 'Point',
                  coordinates: [row.lng || 0, row.lat || 0]
                },
                contact: row.contact,
                services: services,
                specialty: row.specialty,
                emergencyServices: Boolean(row.emergency_services)
              },
              { upsert: true, new: true }
            );
          }
          console.log(`✅ Migrated ${rows.length} hospitals`);
          resolveHospitals();
        } catch (error) {
          console.error('❌ Error migrating hospitals:', error);
          rejectHospitals(error);
        }
      });
    }));

    // Migrate Appointments
    migrations.push(new Promise((resolveAppointments, rejectAppointments) => {
      db.all('SELECT * FROM appointments', async (err, rows) => {
        if (err) {
          console.log('⚠️  Appointments table not found, skipping...');
          resolveAppointments();
          return;
        }

        try {
          for (const row of rows) {
            const appointment = new Appointment({
              doctorName: row.doctor_name,
              hospital: row.hospital,
              type: row.type,
              date: new Date(row.date),
              time: row.time,
              patient: {
                name: row.patient_name,
                age: row.patient_age,
                contact: row.patient_contact,
                reason: row.reason
              }
            });
            await appointment.save();
          }
          console.log(`✅ Migrated ${rows.length} appointments`);
          resolveAppointments();
        } catch (error) {
          console.error('❌ Error migrating appointments:', error);
          rejectAppointments(error);
        }
      });
    }));

    // Migrate SOS Reports
    migrations.push(new Promise((resolveSos, rejectSos) => {
      db.all('SELECT * FROM sos_reports', async (err, rows) => {
        if (err) {
          console.log('⚠️  SOS reports table not found, skipping...');
          resolveSos();
          return;
        }

        try {
          for (const row of rows) {
            let symptoms = [];
            try {
              symptoms = JSON.parse(row.symptoms || '[]');
            } catch (e) {
              symptoms = row.symptoms ? [row.symptoms] : [];
            }

            const sosReport = new SosReport({
              location: {
                type: 'Point',
                coordinates: [row.lng || 0, row.lat || 0]
              },
              symptoms: symptoms,
              description: row.description
            });
            await sosReport.save();
          }
          console.log(`✅ Migrated ${rows.length} SOS reports`);
          resolveSos();
        } catch (error) {
          console.error('❌ Error migrating SOS reports:', error);
          rejectSos(error);
        }
      });
    }));

    // Migrate Feedback
    migrations.push(new Promise((resolveFeedback, rejectFeedback) => {
      db.all('SELECT * FROM feedback', async (err, rows) => {
        if (err) {
          console.log('⚠️  Feedback table not found, skipping...');
          resolveFeedback();
          return;
        }

        try {
          for (const row of rows) {
            const feedback = new Feedback({
              serviceId: row.service_id,
              serviceType: row.service_type,
              userId: row.user_id,
              rating: row.rating,
              review: row.review
            });
            await feedback.save();
          }
          console.log(`✅ Migrated ${rows.length} feedback entries`);
          resolveFeedback();
        } catch (error) {
          console.error('❌ Error migrating feedback:', error);
          rejectFeedback(error);
        }
      });
    }));

    // Migrate Providers
    migrations.push(new Promise((resolveProviders, rejectProviders) => {
      db.all('SELECT * FROM providers', async (err, rows) => {
        if (err) {
          console.log('⚠️  Providers table not found, skipping...');
          resolveProviders();
          return;
        }

        try {
          for (const row of rows) {
            const services = row.services ? row.services.split(',') : [];
            
            const provider = new Provider({
              providerType: row.provider_type,
              name: row.name,
              address: row.address,
              location: {
                type: 'Point',
                coordinates: [row.lng || 0, row.lat || 0]
              },
              contact: row.contact,
              services: services,
              specialty: row.specialty,
              admin: {
                name: row.admin_name,
                email: row.admin_email
              }
            });
            await provider.save();
          }
          console.log(`✅ Migrated ${rows.length} providers`);
          resolveProviders();
        } catch (error) {
          console.error('❌ Error migrating providers:', error);
          rejectProviders(error);
        }
      });
    }));

    // Migrate Contact Messages
    migrations.push(new Promise((resolveContacts, rejectContacts) => {
      db.all('SELECT * FROM contact_messages', async (err, rows) => {
        if (err) {
          console.log('⚠️  Contact messages table not found, skipping...');
          resolveContacts();
          return;
        }

        try {
          for (const row of rows) {
            const contactMessage = new ContactMessage({
              firstName: row.first_name,
              lastName: row.last_name,
              email: row.email,
              phone: row.phone,
              subject: row.subject,
              message: row.message,
              newsletter: Boolean(row.newsletter)
            });
            await contactMessage.save();
          }
          console.log(`✅ Migrated ${rows.length} contact messages`);
          resolveContacts();
        } catch (error) {
          console.error('❌ Error migrating contact messages:', error);
          rejectContacts(error);
        }
      });
    }));

    // Migrate Chatbot Messages
    migrations.push(new Promise((resolveChatbot, rejectChatbot) => {
      db.all('SELECT * FROM chatbot_messages', async (err, rows) => {
        if (err) {
          console.log('⚠️  Chatbot messages table not found, skipping...');
          resolveChatbot();
          return;
        }

        try {
          for (const row of rows) {
            const chatbotMessage = new ChatbotMessage({
              userId: row.user_id,
              userMessage: row.user_message,
              botResponse: row.bot_response
            });
            await chatbotMessage.save();
          }
          console.log(`✅ Migrated ${rows.length} chatbot messages`);
          resolveChatbot();
        } catch (error) {
          console.error('❌ Error migrating chatbot messages:', error);
          rejectChatbot(error);
        }
      });
    }));

    // Execute all migrations
    Promise.all(migrations)
      .then(() => {
        console.log('🎉 Migration completed successfully!');
        db.close();
        resolve();
      })
      .catch((error) => {
        console.error('❌ Migration failed:', error);
        db.close();
        reject(error);
      });
  });
}