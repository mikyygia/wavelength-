import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';

const router = Router();

const VALID_TYPES = ['threat', 'suspicious', 'harassment', 'infrastructure', 'crowd', 'other'];
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const VALID_STATUSES = ['active', 'monitoring', 'resolved'];

// ─── GET /api/static ── with filters ───
router.get('/', (req, res) => {
    try {
        const { timeframe = '24h', type = 'all', status = 'active', lat, lng, radius } = req.query;

        const timeMap = { '1h': 1, '6h': 6, '24h': 24, '7d': 168 };
        const hours = timeMap[timeframe] ?? 24;

        let query = `SELECT * FROM static_reports WHERE 1=1`;
        const params = [];

        if (timeframe !== 'all') {
            query += ` AND created_at > datetime('now', ?)`;
            params.push(`-${hours} hours`);
        }

        if (type !== 'all') {
            query += ` AND type = ?`;
            params.push(type);
        }

        if (status !== 'all') {
            query += ` AND status = ?`;
            params.push(status);
        }

        query += ` ORDER BY created_at DESC`;

        const results = db.prepare(query).all(...params);

        // Client-side radius filter if lat/lng/radius provided
        if (lat && lng && radius) {
            const centerLat = parseFloat(lat);
            const centerLng = parseFloat(lng);
            const maxDist = parseFloat(radius);
            const filtered = results.filter(r => {
                const dist = haversine(centerLat, centerLng, r.lat, r.lng);
                return dist <= maxDist;
            });
            return res.json(filtered);
        }

        res.json(results);
    } catch (err) {
        console.error('GET /api/static error:', err);
        res.status(500).json({ error: 'failed to fetch reports' });
    }
});

// ─── POST /api/static ── submit community report ───
router.post('/', (req, res) => {
    try {
        const { type, severity, title, description, lat, lng, location_label, affected_count, news_links } = req.body;

        if (!type || !VALID_TYPES.includes(type)) return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
        if (!severity || !VALID_SEVERITIES.includes(severity)) return res.status(400).json({ error: `severity must be one of: ${VALID_SEVERITIES.join(', ')}` });
        if (!title || title.length > 80) return res.status(400).json({ error: 'title required, max 80 chars' });
        if (description && description.length > 500) return res.status(400).json({ error: 'description max 500 chars' });
        if (lat == null || lng == null) return res.status(400).json({ error: 'lat and lng required' });

        const id = uuid();
        const now = new Date().toISOString();

        db.prepare(`
      INSERT INTO static_reports (id, type, severity, title, description, lat, lng, location_label, affected_count, start_date, created_at, source, news_links)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'community', ?)
    `).run(id, type, severity, title, description || null, lat, lng, location_label || null, affected_count || 0, now, now, JSON.stringify(news_links || []));

        const report = db.prepare('SELECT * FROM static_reports WHERE id = ?').get(id);
        res.status(201).json(report);
    } catch (err) {
        console.error('POST /api/static error:', err);
        res.status(500).json({ error: 'failed to create report' });
    }
});

// ─── PATCH /api/static/:id/confirm ── "I see this too" ───
router.patch('/:id/confirm', (req, res) => {
    try {
        const { id } = req.params;
        const result = db.prepare(`
      UPDATE static_reports SET confirmations = confirmations + 1 WHERE id = ? AND status != 'resolved'
    `).run(id);

        if (result.changes === 0) return res.status(404).json({ error: 'report not found or already resolved' });

        const report = db.prepare('SELECT * FROM static_reports WHERE id = ?').get(id);
        res.json(report);
    } catch (err) {
        console.error('PATCH /confirm error:', err);
        res.status(500).json({ error: 'failed to confirm report' });
    }
});

// ─── PATCH /api/static/:id/resolve ── mark resolved ───
router.patch('/:id/resolve', (req, res) => {
    try {
        const { id } = req.params;
        const { resolution_note } = req.body;

        const result = db.prepare(`
      UPDATE static_reports SET status = 'resolved', resolved_at = ?, resolution_note = ? WHERE id = ?
    `).run(new Date().toISOString(), resolution_note || null, id);

        if (result.changes === 0) return res.status(404).json({ error: 'report not found' });

        const report = db.prepare('SELECT * FROM static_reports WHERE id = ?').get(id);
        res.json(report);
    } catch (err) {
        console.error('PATCH /resolve error:', err);
        res.status(500).json({ error: 'failed to resolve report' });
    }
});

// ─── GET /api/static/instability ── instability index ───
router.get('/instability', (req, res) => {
    try {
        let reports = db.prepare(`
      SELECT * FROM static_reports WHERE status != 'resolved'
    `).all();

        const { lat, lng, radius } = req.query;
        if (lat != null && lng != null && radius != null) {
            const centerLat = parseFloat(lat);
            const centerLng = parseFloat(lng);
            const maxDist = parseFloat(radius);
            reports = reports.filter(r => haversine(centerLat, centerLng, r.lat, r.lng) <= maxDist);
        }

        let score = 0;
        const now = Date.now();
        const breakdown = { low: 0, medium: 0, high: 0, critical: 0 };

        reports.forEach(r => {
            const base = { low: 3, medium: 8, high: 15, critical: 25 }[r.severity] || 3;
            const ageHrs = (now - new Date(r.created_at).getTime()) / 3600000;
            const recency = ageHrs < 1 ? 5 : 0;
            score += base + recency;
            breakdown[r.severity] = (breakdown[r.severity] || 0) + 1;
        });

        score = Math.min(100, score);

        let label, color;
        if (score <= 20) { label = 'calm'; color = '#C0CEEB'; }
        else if (score <= 40) { label = 'watch'; color = '#F9BD33'; }
        else if (score <= 60) { label = 'elevated'; color = '#F97316'; }
        else if (score <= 80) { label = 'high'; color = '#FF4444'; }
        else { label = 'critical'; color = '#FF4444'; }

        res.json({ score, label, color, breakdown, activeReports: reports.length });
    } catch (err) {
        console.error('GET /instability error:', err);
        res.status(500).json({ error: 'failed to compute instability' });
    }
});

// Haversine distance in meters
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default router;
