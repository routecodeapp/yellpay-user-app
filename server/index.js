import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDataInitialized, getGlobalSummary, getRegionData, getRegions, scheduleTrendUpdates } from './trends.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static admin assets
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Regions list
app.get('/api/trends/regions', (_req, res) => {
  res.json({ regions: getRegions() });
});

// Top topics/keywords for a region
app.get('/api/trends/top', (req, res) => {
  const region = String(req.query.region || 'US').toUpperCase();
  const data = getRegionData(region);
  if (!data) {
    res.status(404).json({ error: `Region ${region} not found` });
    return;
  }
  res.json({ region, updatedAt: data.updatedAt, top: data.top });
});

// Global summary across regions
app.get('/api/trends/summary', (_req, res) => {
  res.json(getGlobalSummary());
});

// Simple admin page
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Startup
await ensureDataInitialized();
scheduleTrendUpdates();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Trends server listening on http://localhost:${PORT}`);
});


