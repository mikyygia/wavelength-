import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';

const router = Router();

// Valid moods
const VALID_MOODS = ['anxious', 'calm', 'happy', 'sad', 'overwhelmed', 'energized', 'lonely', 'grateful'];
const VALID_REACTIONS = ['felt', 'hug', 'heart'];

// Haversine distance in meters
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── GET /api/signals ── active (non-expired) signals, optional lat/lng/radius (meters) ───
router.get('/', (req, res) => {
    try {
        let signals = db.prepare(`
      SELECT * FROM signals
      WHERE expires_at > datetime('now')
      ORDER BY created_at DESC
    `).all();

        const { lat, lng, radius } = req.query;
        if (lat != null && lng != null && radius != null) {
            const centerLat = parseFloat(lat);
            const centerLng = parseFloat(lng);
            const maxDist = parseFloat(radius);
            signals = signals.filter(s => haversine(centerLat, centerLng, s.lat, s.lng) <= maxDist);
        }
        res.json(signals);
    } catch (err) {
        console.error('GET /api/signals error:', err);
        res.status(500).json({ error: 'failed to fetch signals' });
    }
});

// ─── POST /api/signals ── drop a new signal ───
router.post('/', (req, res) => {
    try {
        const { lat, lng, mood, note, song_url } = req.body;

        // Validate
        if (lat == null || lng == null) return res.status(400).json({ error: 'lat and lng required' });
        if (!mood || !VALID_MOODS.includes(mood)) return res.status(400).json({ error: `mood must be one of: ${VALID_MOODS.join(', ')}` });
        if (!note || note.length === 0) return res.status(400).json({ error: 'note is required' });
        if (note.length > 280) return res.status(400).json({ error: 'note max 280 chars' });

        const id = uuid();
        const now = new Date();
        const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        db.prepare(`
      INSERT INTO signals (id, lat, lng, mood, note, song_url, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, lat, lng, mood, note, song_url || null, now.toISOString(), expires.toISOString());

        const signal = db.prepare('SELECT * FROM signals WHERE id = ?').get(id);
        res.status(201).json(signal);
    } catch (err) {
        console.error('POST /api/signals error:', err);
        res.status(500).json({ error: 'failed to create signal' });
    }
});

// ─── PATCH /api/signals/:id/react ── increment a reaction ───
router.patch('/:id/react', (req, res) => {
    try {
        const { id } = req.params;
        const { reaction } = req.body;

        if (!reaction || !VALID_REACTIONS.includes(reaction)) {
            return res.status(400).json({ error: `reaction must be one of: ${VALID_REACTIONS.join(', ')}` });
        }

        const column = `reaction_${reaction}`;
        const result = db.prepare(`
      UPDATE signals SET ${column} = ${column} + 1
      WHERE id = ? AND expires_at > datetime('now')
    `).run(id);

        if (result.changes === 0) return res.status(404).json({ error: 'signal not found or expired' });

        const signal = db.prepare('SELECT * FROM signals WHERE id = ?').get(id);
        res.json(signal);
    } catch (err) {
        console.error('PATCH /react error:', err);
        res.status(500).json({ error: 'failed to react' });
    }
});

// ─── GET /api/signals/:id/replies ───
router.get('/:id/replies', (req, res) => {
    try {
        const { id } = req.params;
        const replies = db.prepare(`
      SELECT * FROM replies WHERE signal_id = ? ORDER BY created_at ASC
    `).all(id);
        res.json(replies);
    } catch (err) {
        console.error('GET /replies error:', err);
        res.status(500).json({ error: 'failed to fetch replies' });
    }
});

// ─── POST /api/signals/:id/replies ───
router.post('/:id/replies', (req, res) => {
    try {
        const { id: signal_id } = req.params;
        const { text } = req.body;

        if (!text || text.length === 0) return res.status(400).json({ error: 'text is required' });
        if (text.length > 140) return res.status(400).json({ error: 'reply max 140 chars' });

        // check signal exists
        const signal = db.prepare('SELECT id FROM signals WHERE id = ? AND expires_at > datetime(\'now\')').get(signal_id);
        if (!signal) return res.status(404).json({ error: 'signal not found or expired' });

        const id = uuid();
        const now = new Date().toISOString();

        db.prepare(`
      INSERT INTO replies (id, signal_id, text, created_at) VALUES (?, ?, ?, ?)
    `).run(id, signal_id, text, now);

        const reply = db.prepare('SELECT * FROM replies WHERE id = ?').get(id);
        res.status(201).json(reply);
    } catch (err) {
        console.error('POST /replies error:', err);
        res.status(500).json({ error: 'failed to create reply' });
    }
});

// ─── GET /api/mood-atmosphere ───
router.get('/mood-atmosphere', (req, res) => {
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
        console.error('GET /mood-atmosphere error:', err);
        res.status(500).json({ error: 'failed to get mood data' });
    }
});

export default router;
