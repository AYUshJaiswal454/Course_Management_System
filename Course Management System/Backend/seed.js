import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Course from './models/Course.js';
import Batch from './models/Batch.js';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ps0_course_management');
try {
    let admin = await User.findOne({ email: 'admin@ps0.local' });
    if (!admin) admin = await User.create({ name: 'PS0 Admin', email: 'admin@ps0.local', password: await bcrypt.hash('Admin123!', 12), role: 'admin' });
    let instructor = await User.findOne({ email: 'instructor@ps0.local' });
    if (!instructor) instructor = await User.create({ name: 'Demo Instructor', email: 'instructor@ps0.local', password: await bcrypt.hash('Instructor123!', 12), role: 'instructor' });
    if (await Course.countDocuments() === 0) {
        const courses = await Course.insertMany([
            { title: 'Full Stack Web Development', code: 'WEB-101', description: 'Learn the foundations of frontend and backend web development.', category: 'Development', durationWeeks: 12, instructor: instructor._id },
            { title: 'Database Fundamentals', code: 'DB-102', description: 'Learn data modeling, queries, and database design.', category: 'Data', durationWeeks: 6, instructor: instructor._id },
            { title: 'JavaScript Essentials', code: 'JS-103', description: 'Build confidence with modern JavaScript.', category: 'Development', durationWeeks: 4, instructor: instructor._id }
        ]);
        const now = new Date();
        const start = new Date(now); start.setDate(start.getDate() + 7);
        const end = new Date(start); end.setDate(end.getDate() + 84);
        await Batch.insertMany([
            { name: 'Weekend Cohort A', course: courses[0]._id, instructor: instructor._id, startDate: start, endDate: end, schedule: 'Sat & Sun · 10:00 AM – 12:00 PM', capacity: 25, status: 'open' },
            { name: 'Evening Cohort B', course: courses[1]._id, instructor: instructor._id, startDate: start, endDate: new Date(start.getTime() + 42 * 86400000), schedule: 'Mon & Wed · 6:00 PM – 7:30 PM', capacity: 18, status: 'open' }
        ]);
    }
    console.log('Seed complete. Admin: admin@ps0.local / Admin123!');
} finally { await mongoose.disconnect(); }
