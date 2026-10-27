import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/online_exam_platform';
    const maskedUri = mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@');
    console.log(`Connecting to MongoDB (${maskedUri})...`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout fast instead of hanging
    });

    console.log(`✅ MongoDB Connected successfully to database: ${conn.connection.name} (host: ${conn.connection.host})`);
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message || error);
    console.error('👉 TIP: If using MongoDB Atlas, whitelist your IP in Atlas: Network Access -> Add IP Address -> 0.0.0.0/0');
  }
};
