const axios = require('axios');
const cheerio = require('cheerio');
const { extractJsonLdEvents, mapJsonLdEvent, normalizeText } = require('./utils');

const LISTING_URL = 'https://www.eventfinda.com.au/whatson/events/sydney';
const SOURCE_NAME = 'Eventfinda';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

const extractEventLinks = (html) => {
  const $ = cheerio.load(html);
  const links = new Set();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    if (href.includes('/event/')) {
      const absolute = href.startsWith('http') ? href : `https://www.eventfinda.com.au${href}`;
      links.add(absolute.split('#')[0]);
    }
  });

  return Array.from(links).slice(0, 20);
};

const scrapeEventPage = async (url) => {
  const { data } = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
  const jsonLd = extractJsonLdEvents(data);
  if (jsonLd.length) {
    return jsonLd.map((event) => ({
      ...mapJsonLdEvent(event),
      sourceUrl: url,
    }));
  }

  const $ = cheerio.load(data);
  const title = normalizeText($('h1').first().text());
  const dateText = normalizeText($('[itemprop="startDate"]').first().text());
  const venueName = normalizeText($('[itemprop="location"]').first().text());
  const description = normalizeText($('meta[name="description"]').attr('content'));

  if (!title) return [];

  return [
    {
      title,
      dateText,
      venueName,
      description,
      sourceUrl: url,
      sourceId: url,
      city: 'Sydney',
      imageUrl: '',
      categoryTags: [],
      address: '',
    },
  ];
};

const scrapeEventfinda = async () => {
  const { data } = await axios.get(LISTING_URL, { headers: { 'User-Agent': USER_AGENT } });
  const jsonLdEvents = extractJsonLdEvents(data).map(mapJsonLdEvent);

  if (jsonLdEvents.length) {
    return {
      sourceName: SOURCE_NAME,
      events: jsonLdEvents.filter((event) => event.title && event.sourceUrl),
    };
  }

  const links = extractEventLinks(data);
  const eventLists = await Promise.all(
    links.map((url) => scrapeEventPage(url).catch(() => []))
  );

  return {
    sourceName: SOURCE_NAME,
    events: eventLists.flat().filter((event) => event.title && event.sourceUrl),
  };
};

module.exports = { scrapeEventfinda };
