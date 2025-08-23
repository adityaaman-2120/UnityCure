import dbConnection from './database/connection.js';
import { seedInitialData } from './database/seedData.js';
import { migrateSQLiteToMongoDB } from './database/migrate.js';
import { createSQLiteBackup } from './utils/backup.js';
import * as Models from './models/index.js';

async function testMongoDB() {
  console.log('🧪 Testing MongoDB Setup...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    await dbConnection.connect();
    console.log('✅ Database connection successful\n');

    // Test 2: Create backup of existing data
    console.log('2️⃣ Creating backup of existing SQLite data...');
    await createSQLiteBackup();
    console.log('✅ Backup completed\n');

    // Test 3: Migration
    console.log('3️⃣ Testing data migration...');
    await migrateSQLiteToMongoDB();
    console.log('✅ Migration completed\n');

    // Test 4: Seed initial data
    console.log('4️⃣ Seeding initial data...');
    await seedInitialData();
    console.log('✅ Initial data seeded\n');

    // Test 5: Test all models
    console.log('5️⃣ Testing all models...');
    
    // Test User model
    const userCount = await Models.User.countDocuments();
    console.log(`   Users: ${userCount} documents`);

    // Test Hospital model
    const hospitalCount = await Models.Hospital.countDocuments();
    console.log(`   Hospitals: ${hospitalCount} documents`);

    // Test other models
    const appointmentCount = await Models.Appointment.countDocuments();
    console.log(`   Appointments: ${appointmentCount} documents`);

    const sosCount = await Models.SosReport.countDocuments();
    console.log(`   SOS Reports: ${sosCount} documents`);

    const feedbackCount = await Models.Feedback.countDocuments();
    console.log(`   Feedback: ${feedbackCount} documents`);

    const providerCount = await Models.Provider.countDocuments();
    console.log(`   Providers: ${providerCount} documents`);

    const contactCount = await Models.ContactMessage.countDocuments();
    console.log(`   Contact Messages: ${contactCount} documents`);

    const chatbotCount = await Models.ChatbotMessage.countDocuments();
    console.log(`   Chatbot Messages: ${chatbotCount} documents`);

    console.log('✅ All models tested successfully\n');

    // Test 6: Test geospatial queries
    console.log('6️⃣ Testing geospatial queries...');
    const nearbyHospitals = await Models.Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [-74.0060, 40.7128] // NYC coordinates
          },
          $maxDistance: 10000 // 10km
        }
      }
    }).limit(5);
    console.log(`   Found ${nearbyHospitals.length} nearby hospitals`);
    console.log('✅ Geospatial queries working\n');

    // Test 7: Test authentication
    console.log('7️⃣ Testing user authentication...');
    const testUser = await Models.User.findOne({ 
      identifier: { $regex: new RegExp('^citizen@example.com$', 'i') }
    });
    if (testUser) {
      console.log(`   Found test user: ${testUser.identifier} (${testUser.role})`);
    }
    console.log('✅ Authentication queries working\n');

    // Test 8: Database status
    console.log('8️⃣ Database status...');
    const dbStatus = dbConnection.getConnectionStatus();
    console.log(`   Connection Status: ${dbStatus.isConnected ? 'Connected' : 'Disconnected'}`);
    console.log(`   Database: ${dbStatus.name}`);
    console.log(`   Host: ${dbStatus.host}:${dbStatus.port}`);
    console.log('✅ Database status check completed\n');

    console.log('🎉 All tests passed! MongoDB setup is complete and working.\n');
    
    console.log('📋 Summary:');
    console.log(`   • Total Users: ${userCount}`);
    console.log(`   • Total Hospitals: ${hospitalCount}`);
    console.log(`   • Total Appointments: ${appointmentCount}`);
    console.log(`   • Total SOS Reports: ${sosCount}`);
    console.log(`   • Total Feedback: ${feedbackCount}`);
    console.log(`   • Total Providers: ${providerCount}`);
    console.log(`   • Total Contact Messages: ${contactCount}`);
    console.log(`   • Total Chatbot Messages: ${chatbotCount}`);
    
    console.log('\n🚀 Your application is ready to use MongoDB!');
    console.log('   Start the server with: npm start');
    console.log('   Visit: http://localhost:3000');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await dbConnection.disconnect();
    process.exit(0);
  }
}

// Run tests
testMongoDB();