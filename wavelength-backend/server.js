import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import signalsRouter from './routes/signals.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/signals', signalsRouter);

// The mood-atmosphere endpoint is nested oddly — let's add a top-level alias
app.get('/api/mood-atmosphere', (req, res) => {
    // Forward to the signals router handler
    // We'll import db directly here for simplicity
    import('./db/database.js').then(({ default: db }) => {
        try {
            const data = db.prepare(`
        SELECT mood, COUNT(*) as count
        FROM signals
        WHERE expires_at > datetime('now')
        GROUP BY mood
      `).all();
            const total = data.reduce((sum, d) => sum + d.count, 0);
            res.json({ moods: data, total });
        } catch (err) {
            console.error('GET /api/mood-atmosphere error:', err);
            res.status(500).json({ error: 'failed to get mood data' });
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`\n⚡ wavelength backend live on http://localhost:${PORT}\n`);
});
