const Event = require('../models/Event');
const { scrapeSydney } = require('../scrapers/sydney');
const { scrapeEventfinda } = require('../scrapers/eventfinda');

const computeChanges = (existing, incoming) => {
  const fields = [
    'title',
    'dateText',
    'startDate',
    'venueName',
    'address',
    'city',
    'description',
    'imageUrl',
    'sourceUrl',
  ];

  return fields.some((field) => {
    const previous = existing[field] || '';
    const next = incoming[field] || '';
    if (previous instanceof Date || next instanceof Date) {
      return String(previous) !== String(next);
    }
    return String(previous) !== String(next);
  });
};

const syncEvents = async ({ sourceName, events }) => {
  if (!events.length) return;

  const now = new Date();
  const seenUrls = new Set();

  for (const event of events) {
    if (!event.sourceUrl || !event.title) continue;
    const payload = {
      ...event,
      sourceName,
      lastScrapedAt: now,
      city: event.city || 'Sydney',
      isActive: true,
    };

    seenUrls.add(payload.sourceUrl);
    const existing = await Event.findOne({ sourceUrl: payload.sourceUrl });

    if (!existing) {
      await Event.create({ ...payload, status: 'new' });
      continue;
    }

    const hasChanges = computeChanges(existing.toObject(), payload);
    const nextStatus = existing.status === 'imported' ? 'imported' : hasChanges ? 'updated' : existing.status;

    await Event.updateOne(
      { _id: existing._id },
      {
        $set: {
          ...payload,
          status: nextStatus,
        },
      }
    );
  }

  if (seenUrls.size) {
    await Event.updateMany(
      {
        sourceName,
        sourceUrl: { $nin: Array.from(seenUrls) },
        status: { $ne: 'imported' },
      },
      {
        $set: {
          status: 'inactive',
          isActive: false,
          lastScrapedAt: now,
        },
      }
    );
  }
};

const runAllScrapers = async () => {
  const sources = await Promise.allSettled([scrapeSydney(), scrapeEventfinda()]);

  for (const result of sources) {
    if (result.status === 'fulfilled') {
      await syncEvents(result.value);
    } else {
      console.error('Scraper failed', result.reason);
    }
  }
};

module.exports = { runAllScrapers };
