// [Skill: infrastructure]
import 'dotenv/config';
import mongoose from 'mongoose';
import type { Server } from 'http';
import app from './app';
import { connectDB } from './config/mongoDB';

const PORT = process.env.PORT || 3000;
let server: Server | null = null;
let isShuttingDown = false;

const logSignalError = (label: string, error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(label, message.replace(/\r|\n/g, ' '));
};

process.on('unhandledRejection', (reason) => {
  logSignalError('[Unhandled Rejection]:', reason);
});

process.on('uncaughtException', (error) => {
  logSignalError('[Uncaught Exception]:', error);
});

const shutdown = async (signal: NodeJS.Signals) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`[Shutdown] Recebido ${signal}`);

  try {
    const activeServer = server;
    if (activeServer) {
      await new Promise<void>((resolve, reject) => {
        activeServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logSignalError('[Shutdown Error]:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

connectDB()
  .then(() => {
    server = app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('Erro ao conectar no MongoDB:', err);
    process.exit(1);
  });
