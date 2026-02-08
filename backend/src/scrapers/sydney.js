const axios = require('axios');
const cheerio = require('cheerio');
const { extractJsonLdEvents, mapJsonLdEvent, normalizeText } = require('./utils');

const LISTING_URL = 'https://www.sydney.com/events';
const SOURCE_NAME = 'Sydney.com';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

const extractEventLinks = (html) => {
  const $ = cheerio.load(html);
  const links = new Set();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    if (href.includes('/events/') && !href.endsWith('/events')) {
      const absolute = href.startsWith('http') ? href : `https://www.sydney.com${href}`;
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
      city: 'Sydney',
    }));
  }

  const $ = cheerio.load(data);
  const title = normalizeText($('h1').first().text());
  const description = normalizeText($('meta[name="description"]').attr('content'));
  const dateText = normalizeText($('[data-testid="event-date"]').first().text());
  const venueName = normalizeText($('[data-testid="event-venue"]').first().text());
  const imageUrl = $('img').first().attr('src');

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
      imageUrl: imageUrl || '',
      categoryTags: [],
      address: '',
    },
  ];
};

const scrapeSydney = async () => {
  const { data } = await axios.get(LISTING_URL, { headers: { 'User-Agent': USER_AGENT } });
  const links = extractEventLinks(data);

  const eventLists = await Promise.all(
    links.map((url) => scrapeEventPage(url).catch(() => []))
  );

  return {
    sourceName: SOURCE_NAME,
    events: eventLists.flat().filter((event) => event.title && event.sourceUrl),
  };
};

module.exports = { scrapeSydney };
