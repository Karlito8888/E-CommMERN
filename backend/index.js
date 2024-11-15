// backend/index.js
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import config from './config/index.js';
import connectDB from './config/db.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { formatResponse } from './middlewares/responseMiddleware.js';
import logger from './utils/logger.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors(config.cors));
app.use(rateLimit(config.rateLimit));

// Basic Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Response Formatting
app.use(formatResponse());

// API Routes
app.use(`${config.server.apiPrefix}/users`, userRoutes);
app.use(`${config.server.apiPrefix}/categories`, categoryRoutes);
app.use(`${config.server.apiPrefix}/products`, productRoutes);
app.use(`${config.server.apiPrefix}/upload`, uploadRoutes);
app.use(`${config.server.apiPrefix}/orders`, orderRoutes);
app.use(`${config.server.apiPrefix}/payments`, paymentRoutes);
app.use(`${config.server.apiPrefix}/cart`, cartRoutes);
app.use(`${config.server.apiPrefix}/sessions`, sessionRoutes);

// Error Handling
app.use(errorHandler);

// Initialize Server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Server
    app.listen(config.server.port, () => {
      logger.info(`Server running in ${config.server.env} mode on port ${config.server.port}`);
    });
  } catch (error) {
    logger.error('Server initialization failed:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;
