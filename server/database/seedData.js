import User from '../models/User.js';
import Hospital from '../models/Hospital.js';

export async function seedInitialData() {
  try {
    console.log('🌱 Seeding initial data...');

    // Seed Users
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      const seedUsers = [
        {
          identifier: 'citizen@example.com',
          password: 'Test@123',
          role: 'Citizen',
          redirect: '/user_dashboard.html'
        },
        {
          identifier: '9876543210',
          password: 'Test@123',
          role: 'Citizen',
          redirect: '/user_dashboard.html'
        },
        {
          identifier: 'hospitaladmin@uc.com',
          password: 'Admin@123',
          role: 'Hospital Staff',
          redirect: '/resource_management.html'
        },
        {
          identifier: 'doctor@uc.com',
          password: 'Doc@123',
          role: 'Doctor',
          redirect: '/doctor_schedule.html'
        },
        {
          identifier: 'dispatcher@uc.com',
          password: 'Disp@123',
          role: 'Dispatcher',
          redirect: '/dispatcher_dashboard.html'
        },
        {
          identifier: 'platformadmin@uc.com',
          password: 'Root@123',
          role: 'Platform Admin',
          redirect: '/platform_admin_dashboard.html'
        }
      ];

      await User.insertMany(seedUsers);
      console.log('✅ Users seeded successfully');
    }

    // Seed Hospitals
    const existingHospitals = await Hospital.countDocuments();
    if (existingHospitals === 0) {
      const seedHospitals = [
        {
          name: 'Unity General Hospital',
          address: '123 Healthcare Ave, Medical District',
          location: {
            type: 'Point',
            coordinates: [-74.0060, 40.7128] // [longitude, latitude]
          },
          contact: '+1-555-0101',
          services: ['Emergency', 'Cardiology', 'Pediatrics'],
          specialty: 'General',
          emergencyServices: true
        },
        {
          name: 'City Medical Center',
          address: '456 Wellness Blvd, Downtown',
          location: {
            type: 'Point',
            coordinates: [-73.9851, 40.7589]
          },
          contact: '+1-555-0102',
          services: ['Surgery', 'Oncology', 'Neurology'],
          specialty: 'Specialized',
          emergencyServices: true
        },
        {
          name: 'Community Health Clinic',
          address: '789 Care Street, Suburbia',
          location: {
            type: 'Point',
            coordinates: [-73.9934, 40.7505]
          },
          contact: '+1-555-0103',
          services: ['Primary Care', 'Vaccination', 'Mental Health'],
          specialty: 'Community',
          emergencyServices: false
        }
      ];

      await Hospital.insertMany(seedHospitals);
      console.log('✅ Hospitals seeded successfully');
    }

    console.log('🌱 Initial data seeding completed');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}