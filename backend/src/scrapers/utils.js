const cheerio = require('cheerio');
const dayjs = require('dayjs');

const normalizeText = (value) => (value ? value.replace(/\s+/g, ' ').trim() : '');

const normalizeDate = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.toDate() : null;
};

const extractJsonLdEvents = (html) => {
  const $ = cheerio.load(html);
  const blocks = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      blocks.push(parsed);
    } catch (error) {
      return;
    }
  });

  const collect = (node, acc = []) => {
    if (!node) return acc;
    if (Array.isArray(node)) {
      node.forEach((item) => collect(item, acc));
      return acc;
    }
    if (node['@graph']) {
      collect(node['@graph'], acc);
      return acc;
    }
    if (node['@type'] === 'Event') {
      acc.push(node);
      return acc;
    }
    if (node['@type'] && Array.isArray(node['@type']) && node['@type'].includes('Event')) {
      acc.push(node);
    }
    return acc;
  };

  const events = [];
  blocks.forEach((block) => collect(block, events));
  return events;
};

const mapJsonLdEvent = (event) => {
  const location = event.location || {};
  const address = location.address || {};
  const image = Array.isArray(event.image) ? event.image[0] : event.image;
  const addressText = [
    address.streetAddress,
    address.addressLocality,
    address.addressRegion,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    title: normalizeText(event.name),
    dateText: event.startDate ? normalizeText(event.startDate) : normalizeText(event.eventSchedule),
    startDate: normalizeDate(event.startDate),
    venueName: normalizeText(location.name),
    address: normalizeText(addressText),
    city: normalizeText(address.addressLocality) || 'Sydney',
    description: normalizeText(event.description),
    categoryTags: event.eventAttendanceMode ? [event.eventAttendanceMode] : [],
    imageUrl: image || '',
    sourceUrl: event.url || event['@id'],
    sourceId: event['@id'] || event.url,
  };
};

module.exports = {
  extractJsonLdEvents,
  mapJsonLdEvent,
  normalizeDate,
  normalizeText,
};
