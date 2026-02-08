const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { runAllScrapers } = require('./services/scrapeService');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-scraper';

(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    await runAllScrapers();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Scrape failed', error);
    process.exit(1);
  }
})();
