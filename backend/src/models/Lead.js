const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    consent: { type: Boolean, required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', LeadSchema);
