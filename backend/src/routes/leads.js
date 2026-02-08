const express = require('express');
const Lead = require('../models/Lead');
const Event = require('../models/Event');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, consent, eventId } = req.body;

  if (!email || !eventId) {
    return res.status(400).json({ message: 'Missing email or event' });
  }

  if (!consent) {
    return res.status(400).json({ message: 'Consent is required' });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const lead = await Lead.create({ email, consent, event: event._id });
  return res.status(201).json({ id: lead._id });
});

module.exports = router;
