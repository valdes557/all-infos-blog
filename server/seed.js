import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import User from './Schema/User.js';

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    autoIndex: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

const seedUsers = async () => {
    try {
        // Clear existing users (optional)
        await User.deleteMany({});
        console.log('🗑️ Cleared existing users');

        // Create Admin User
        const adminPassword = await bcrypt.hash('admin123', 10);
        const adminUser = new User({
            personal_info: {
                fullname: 'administrateur',
                email: 'admin@allinfo.com',
                password: adminPassword,
                username: 'admin',
                bio: 'Administrateur du site AllInfo'
            },
            admin: true
        });
        await adminUser.save();
        console.log('✅ Admin user created');

        // Create Regular User
        const userPassword = await bcrypt.hash('user123', 10);
        const regularUser = new User({
            personal_info: {
                fullname: 'utilisateur test',
                email: 'user@allinfo.com',
                password: userPassword,
                username: 'testuser',
                bio: 'Utilisateur de test'
            },
            admin: false
        });
        await regularUser.save();
        console.log('✅ Regular user created');

        console.log('\n========================================');
        console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
        console.log('========================================\n');
        console.log('📧 ADMIN CREDENTIALS:');
        console.log('   Email: admin@allinfo.com');
        console.log('   Password: admin123');
        console.log('\n📧 USER CREDENTIALS:');
        console.log('   Email: user@allinfo.com');
        console.log('   Password: user123');
        console.log('========================================\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
};

seedUsers();
