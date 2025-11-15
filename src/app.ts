import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import notificationRoutes from './routes/notification.routes';
import contractRoutes from './routes/contract.routes';
import nftRoutes from './routes/nft.routes';
import verifierRoutes from './routes/verifier.routes';
import vaultRoutes from './routes/vault.routes';
import healthRoutes from './routes/health.routes';

const app: Application = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/nft', nftRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/vault', vaultRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
