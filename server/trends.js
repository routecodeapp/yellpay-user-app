import fs from 'fs';
import googleTrends from 'google-trends-api';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'trends.json');

// ISO 3166-1 alpha-2 region codes to track (can be expanded)
const REGION_CODES = [
  'US', 'GB', 'CA', 'AU', 'NZ', 'JP', 'KR', 'DE', 'FR', 'ES', 'IT', 'BR', 'MX', 'IN', 'ID', 'TR', 'SA', 'AE', 'ZA'
];

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJsonSafe(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function ensureDataInitialized() {
  if (!readJsonSafe(dataFile)) {
    writeJsonSafe(dataFile, { regions: {}, lastGlobalBuildAt: null });
    await updateAllRegions();
  }
}

export function getRegions() {
  return REGION_CODES.slice();
}

export function getRegionData(region) {
  const db = readJsonSafe(dataFile);
  if (!db) return null;
  return db.regions[region] || null;
}

export function getGlobalSummary() {
  const db = readJsonSafe(dataFile) || { regions: {} };
  const aggregate = new Map();
  for (const region of Object.keys(db.regions)) {
    const list = db.regions[region]?.top || [];
    for (const item of list) {
      const key = (item.title || item.query || '').toLowerCase();
      if (!key) continue;
      aggregate.set(key, (aggregate.get(key) || 0) + (item.formattedTrafficValue || 0));
    }
  }
  const top = Array.from(aggregate.entries())
    .map(([key, score]) => ({ title: key, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
  return { updatedAt: db.lastGlobalBuildAt, top };
}

function parseTrafficToNumber(formattedTraffic) {
  if (!formattedTraffic) return 0;
  // e.g., "200K+" or "5M+"
  const match = /([0-9,.]+)\s*([kKmMbB]?)/.exec(formattedTraffic.replace('+', ''));
  if (!match) return 0;
  const num = parseFloat(match[1].replace(/,/g, ''));
  const unit = match[2].toLowerCase();
  const multiplier = unit === 'k' ? 1e3 : unit === 'm' ? 1e6 : unit === 'b' ? 1e9 : 1;
  return Math.round(num * multiplier);
}

async function fetchTopForRegion(region) {
  // Top charts (daily) aren't officially exposed for all regions; using trending searches as proxy
  const results = await googleTrends.trendingSearches({ geo: region });
  const json = JSON.parse(results);
  const days = json?.default?.trendingSearchesDays || [];
  const entries = [];
  for (const day of days) {
    for (const item of day.trendingSearches || []) {
      entries.push({
        title: item.title?.query || '',
        query: item.title?.query || '',
        formattedTraffic: item.formattedTraffic || '',
        formattedTrafficValue: parseTrafficToNumber(item.formattedTraffic || ''),
        articles: (item.articles || []).slice(0, 3).map(a => ({ title: a.title, source: a.source, url: a.url })),
        relatedQueries: (item.relatedQueries || []).slice(0, 5).map(r => r.query),
      });
    }
  }
  // Deduplicate by query
  const unique = new Map();
  for (const e of entries) {
    const key = e.query.toLowerCase();
    if (!key) continue;
    const prev = unique.get(key);
    if (!prev || e.formattedTrafficValue > prev.formattedTrafficValue) {
      unique.set(key, e);
    }
  }
  return Array.from(unique.values())
    .sort((a, b) => b.formattedTrafficValue - a.formattedTrafficValue)
    .slice(0, 100);
}

export async function updateAllRegions() {
  const now = new Date().toISOString();
  const db = readJsonSafe(dataFile) || { regions: {} };
  for (const region of REGION_CODES) {
    try {
      const top = await fetchTopForRegion(region);
      db.regions[region] = { updatedAt: now, top };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Failed to update region ${region}:`, e?.message || e);
    }
  }
  db.lastGlobalBuildAt = now;
  writeJsonSafe(dataFile, db);
}

export function scheduleTrendUpdates() {
  // Update hourly at minute 5
  cron.schedule('5 * * * *', async () => {
    // eslint-disable-next-line no-console
    console.log('Running scheduled trends update...');
    await updateAllRegions();
    // eslint-disable-next-line no-console
    console.log('Scheduled trends update complete');
  });
}


