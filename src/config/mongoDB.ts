// [Skill: infrastructure]
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI as string;
  await mongoose.connect(uri);
  mongoose.connection.on('error', (error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[MongoDB] connection error:', message.replace(/\r|\n/g, ' '));
  });
  mongoose.connection.on('disconnected', () => {
    console.error('[MongoDB] disconnected');
  });
  console.log('MongoDB conectado' );
};
