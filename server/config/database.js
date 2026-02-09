const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Local development ke liye
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gpbarh_hostel', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Seed data check karo
        await checkAndSeedData();
        
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Basic data seed karna
async function checkAndSeedData() {
    const Room = require('../models/Room');
    const roomCount = await Room.countDocuments();
    
    if (roomCount === 0) {
        console.log('📦 Seeding initial room data...');
        
        const sampleRooms = [
            {
                roomNumber: 'A-101',
                hostelBlock: 'A',
                floorNumber: 1,
                roomType: 'Triple',
                totalBeds: 3,
                bedsAvailable: 3,
                amenities: ['FAN', 'ALMIRAH', 'TABLE', 'CHAIR'],
                rentPerMonth: 3000,
                photos: [
                    { url: '/assets/rooms/A-101-1.jpg', caption: 'Room View', isPrimary: true }
                ]
            },
            {
                roomNumber: 'B-201',
                hostelBlock: 'B',
                floorNumber: 2,
                roomType: 'Double',
                totalBeds: 2,
                bedsAvailable: 2,
                amenities: ['FAN', 'ALMIRAH', 'TABLE', 'CHAIR', 'BALCONY'],
                rentPerMonth: 4000
            }
        ];
        
        await Room.insertMany(sampleRooms);
        console.log('✅ Sample rooms added');
    }
}

module.exports = connectDB;