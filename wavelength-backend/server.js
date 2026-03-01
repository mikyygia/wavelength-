import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import signalsRouter from './routes/signals.js';
import staticRouter from './routes/static.js';
import crimesRouter from './routes/crimes.js';
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

// ─── GET /api/mood-atmosphere ───
app.get('/api/mood-atmosphere', (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        let query = `
      SELECT mood, COUNT(*) as count
      FROM signals
      WHERE expires_at > datetime('now')
    `;
        const params = [];

        query += ` GROUP BY mood`;

        const data = db.prepare(query).all(...params);
        const total = data.reduce((sum, d) => sum + d.count, 0);
        res.json({ moods: data, total });
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
