import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import { productsRouter } from './routes/products.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

export function createServer() {
  const app = express();

  app.use(express.json());

  app.options('*', (req, res) => {
    res.sendStatus(204);
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const publicDir = path.resolve(__dirname, '../public');
  app.use(express.static(publicDir));

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/products', productsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  async function start(port) {
    console.log('=== DEBUG server.js start() ===');
    console.log('process.env.MONGODB_URI:', process.env.MONGODB_URI);
    console.log('===============================');

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(mongoUri);

    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        resolve(server);
      });
    });
  }

  return { app, start };
}
