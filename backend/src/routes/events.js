const express = require('express');
const Event = require('../models/Event');

const router = express.Router();

router.get('/', async (req, res) => {
  const { city, q, start, end, status } = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  } else {
    filter.status = { $ne: 'inactive' };
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

  const events = await Event.find(filter).sort({ startDate: 1, createdAt: -1 });
  return res.json(events);
});

router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  return res.json(event);
});

module.exports = router;
