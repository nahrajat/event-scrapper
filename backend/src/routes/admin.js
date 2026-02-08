const express = require('express');
const Event = require('../models/Event');
const { requireAuth } = require('../middleware/auth');
const { runAllScrapers } = require('../services/scrapeService');

const router = express.Router();

router.use(requireAuth);

router.get('/events', async (req, res) => {
  const { city, q, start, end, status } = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (city) {
    filter.city = new RegExp(`^${city}$`, 'i');
  }

  if (q) {
    filter.$or = [
      { title: new RegExp(q, 'i') },
      { venueName: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
    ];
  }

  if (start || end) {
    filter.startDate = {};
    if (start) filter.startDate.$gte = new Date(start);
    if (end) filter.startDate.$lte = new Date(end);
  }

  const events = await Event.find(filter).sort({ updatedAt: -1, startDate: 1 });
  return res.json(events);
});

router.patch('/events/:id/import', async (req, res) => {
  const { importNotes } = req.body;

  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  event.status = 'imported';
  event.importedAt = new Date();
  event.importedBy = req.user.userId;
  event.importNotes = importNotes || '';

  await event.save();

  return res.json(event);
});

router.post('/scrape', async (req, res) => {
  await runAllScrapers();
  return res.json({ status: 'ok', message: 'Scrape started' });
});

module.exports = router;
