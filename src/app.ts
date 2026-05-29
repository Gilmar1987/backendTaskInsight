import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { env } from './config/env';
import { userRouter } from './routers/User.Router';
import { taskRouter } from './routers/Task.Router';
import { globalErrorHandler } from './midllewares/Erro.handler';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('port', env.PORT);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/users', userRouter);
app.use('/api/tasks', taskRouter);

app.use(globalErrorHandler);

export default app;
