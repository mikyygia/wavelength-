import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import signalsRouter from './routes/signals.js';
import staticRouter from './routes/static.js';
import crimesRouter from './routes/crimes.js';
import newsRouter from './routes/news.js';
import db from './db/database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/signals', signalsRouter);
app.use('/api/static', staticRouter);
app.use('/api/crimes', crimesRouter);
app.use('/api/news', newsRouter);

// ─── GET /api/mood-atmosphere ───
app.get('/api/mood-atmosphere', (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        let activeSignals = db.prepare(`
            SELECT mood, lat, lng
            FROM signals
            WHERE expires_at > datetime('now')
        `).all();

        if (lat != null && lng != null && radius != null) {
            const centerLat = parseFloat(lat);
            const centerLng = parseFloat(lng);
            const maxDist = parseFloat(radius);

            if (!Number.isNaN(centerLat) && !Number.isNaN(centerLng) && !Number.isNaN(maxDist)) {
                activeSignals = activeSignals.filter((s) => haversine(centerLat, centerLng, s.lat, s.lng) <= maxDist);
            }
        }

        const counts = activeSignals.reduce((acc, s) => {
            if (!s.mood) return acc;
            acc[s.mood] = (acc[s.mood] || 0) + 1;
            return acc;
        }, {});

        const moods = Object.entries(counts).map(([mood, count]) => ({ mood, count }));
        const total = moods.reduce((sum, d) => sum + d.count, 0);
        res.json({ moods, total });
    } catch (err) {
        console.error('GET /api/mood-atmosphere error:', err);
        res.status(500).json({ error: 'failed to get mood data' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`\n⚡ wavelength backend live on http://localhost:${PORT}\n`);
});

function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
