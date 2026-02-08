const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const { runAllScrapers } = require('./services/scrapeService');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const leadRoutes = require('./routes/leads');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-scraper';

const mongoState = {
  promise: null,
};

const connectMongo = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!mongoState.promise) {
    mongoState.promise = mongoose.connect(mongoUri);
  }
  return mongoState.promise;
};

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use(async (req, res, next) => {
  try {
    await connectMongo();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/cron/scrape', async (req, res) => {
  const token = req.headers['x-cron-secret'] || req.query.token;
  if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectMongo();
    await runAllScrapers();
    return res.json({ status: 'ok' });
  } catch (error) {
    console.error('Scheduled scrape failed', error);
    return res.status(500).json({ message: 'Scrape failed' });
  }
});

if (!process.env.VERCEL) {
  connectMongo()
    .then(() => {
      console.log('MongoDB connected');
      app.listen(port, () => {
        console.log(`API running on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error('MongoDB connection error', error);
    });
}

module.exports = app;