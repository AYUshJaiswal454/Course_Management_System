import mongoose from 'mongoose';

export async function connectDB() {
  const databaseUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ps0_course_management';
  await mongoose.connect(databaseUrl);
  console.log('MongoDB connected');
}
