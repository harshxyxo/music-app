import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { prisma } from '@groovra/database';

// Routes
import authRoutes from './routes/auth.routes';
import trackRoutes from './routes/track.routes';
import likesRoutes from './routes/likes.routes';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/likes', likesRoutes);

app.get('/api/ping', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ message: 'pong', database: 'connected' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ message: 'pong', database: 'disconnected' });
  }
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(ENV.PORT, () => {
  console.log(`Groovra API running on port ${ENV.PORT}`);
});
