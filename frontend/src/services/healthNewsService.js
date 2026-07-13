/**
 * healthNewsService.js
 * Fetches real healthcare news from public RSS feeds:
 *  - WHO News (Global)
 *  - NIH News Releases
 *  - CDC Newsroom
 *  - Times of India Health (India-specific)
 *
 * Uses rss2json.com (free public RSS→JSON proxy, no API key) to handle CORS.
 * Falls back gracefully with a proper "unavailable" state — never generates fake content.
 */

const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json';

/** Trusted feed definitions */
const HEALTH_FEEDS = [
  {
    name: 'WHO',
    label: 'World Health Organization',
    url: 'https://www.who.int/rss-feeds/news-english.xml',
    category: 'Global Health',
    color: '#1565C0',
  },
  {
    name: 'NIH',
    label: 'National Institutes of Health',
    url: 'https://www.nih.gov/news-events/news-releases/rss',
    category: 'Medical Research',
    color: '#2E7D32',
  },
  {
    name: 'CDC',
    label: 'Centers for Disease Control',
    url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss',
    category: 'Public Health',
    color: '#1565C0',
  },
  {
    name: 'NHS',
    label: 'National Health Service UK',
    url: 'https://www.nhs.uk/feeds/news.aspx',
    category: 'Healthcare News',
    color: '#0056A2',
  },
];

/**
 * Fetch a single RSS feed via rss2json proxy.
 * Returns normalised articles or [] on failure.
 */
async function fetchFeed(feed, count = 5) {
  const params = new URLSearchParams({
    rss_url: feed.url,
    count,
    order_by: 'pubDate',
    order_dir: 'desc',
  });

  const response = await fetch(`${RSS2JSON_BASE}?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const json = await response.json();

  if (json.status !== 'ok' || !Array.isArray(json.items)) {
    throw new Error('Feed returned unexpected data');
  }

  return json.items.map((item) => ({
    id:          `${feed.name}-${item.guid || item.link}`,
    title:       item.title?.trim() || 'Untitled Article',
    description: stripHtml(item.description || item.content || '').slice(0, 220),
    url:         item.link,
    thumbnail:   item.thumbnail || item.enclosure?.link || null,
    publishedAt: item.pubDate ? new Date(item.pubDate) : null,
    source:      feed.label,
    sourceName:  feed.name,
    category:    feed.category,
    color:       feed.color,
  }));
}

/** Strip HTML tags from a string */
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Format a date for display: "2 hours ago" or "Jul 9, 2026" */
export function formatNewsDate(date) {
  if (!date) return 'Date unknown';
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60)  return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMs / 3_600_000);
  if (diffHrs < 24)   return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays < 7)   return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Main export: fetch news from all feeds, merge, sort by date.
 *
 * @param {number} total  Maximum articles to return (default 12)
 * @returns {{ articles: Array, unavailable: boolean, error: string|null }}
 */
export async function fetchHealthNews(total = 12) {
  const results = await Promise.allSettled(
    HEALTH_FEEDS.map((feed) => fetchFeed(feed, Math.ceil(total / HEALTH_FEEDS.length) + 2))
  );

  const articles = [];
  let successCount = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
      successCount++;
    }
  }

  if (articles.length === 0) {
    return {
      articles: [],
      unavailable: true,
      error: 'All news feeds are currently unavailable. Please check your internet connection.',
    };
  }

  // Sort newest first, deduplicate by title similarity
  const seen = new Set();
  const deduped = [];
  for (const a of articles.sort((x, y) => (y.publishedAt || 0) - (x.publishedAt || 0))) {
    const key = a.title.toLowerCase().slice(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(a);
    }
  }

  return {
    articles: deduped.slice(0, total),
    unavailable: successCount === 0,
    error: null,
  };
}
