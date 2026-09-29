const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { env } = require('./config/env');
const { rejectOperators } = require('./middleware/rejectOperators');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');

function createApp() {
  const app = express();
  app.set('trust proxy', env.trustProxy);

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(rejectOperators);

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  // Feature routers are mounted below this line.
  app.use('/api/auth', authRoutes);

  app.use('/api', notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
