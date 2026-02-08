const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    dateText: { type: String },
    startDate: { type: Date },
    venueName: { type: String },
    address: { type: String },
    city: { type: String, default: 'Sydney' },
    description: { type: String },
    categoryTags: [{ type: String }],
    imageUrl: { type: String },
    sourceName: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    sourceId: { type: String },
    status: {
      type: String,
      enum: ['new', 'updated', 'inactive', 'imported'],
      default: 'new',
    },
    lastScrapedAt: { type: Date },
    importedAt: { type: Date },
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    importNotes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EventSchema.index({ sourceUrl: 1 }, { unique: true });
EventSchema.index({ city: 1, startDate: 1 });
EventSchema.index({ title: 'text', description: 'text', venueName: 'text' });

module.exports = mongoose.model('Event', EventSchema);
