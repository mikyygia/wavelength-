import { Router } from 'express';

const router = Router();

// Simple in-memory cache: key = "lat,lng,radius" → { data, expiresAt }
const CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// LA City Crime Data (LAPD incidents) – Socrata open data, no auth required
// Dataset: Crime Data from 2020 to Present
// https://data.lacity.org/resource/2nrs-mtv8.json
const SOCRATA_BASE = 'https://data.lacity.org/resource/2nrs-mtv8.json';

// Bounding box delta in degrees (~0.018° ≈ 2km at this latitude)
const LAT_DELTA = 0.018;
const LNG_DELTA = 0.022;

// Category mapping from LAPD crime codes to our internal types
function mapCrimeType(desc = '') {
    const d = desc.toUpperCase();
    if (d.includes('ASSAULT') || d.includes('BATTERY') || d.includes('ROBBERY') || d.includes('HOMICIDE') || d.includes('SHOOT') || d.includes('WEAPON') || d.includes('RAPE') || d.includes('SEX') || d.includes('KIDNAP')) return 'threat';
    if (d.includes('BURGLARY') || d.includes('THEFT') || d.includes('STOLEN') || d.includes('VANDAL') || d.includes('ARSON')) return 'suspicious';
    if (d.includes('DISTURB') || d.includes('HARASS') || d.includes('STALKING') || d.includes('THREATS')) return 'harassment';
    if (d.includes('CROWD') || d.includes('RIOT') || d.includes('UNLAWFUL ASSEMBLY')) return 'crowd';
    return 'other';
}

function mapSeverity(type, desc = '') {
    const d = desc.toUpperCase();
    if (d.includes('HOMICIDE') || d.includes('RAPE') || d.includes('SHOOT') || d.includes('ROBBERY')) return 'critical';
    if (type === 'threat') return 'high';
    if (type === 'suspicious' || type === 'harassment') return 'medium';
    return 'low';
}

function normalizeCrime(raw) {
    const desc = raw.crm_cd_desc || raw.crime_description || 'Unknown incident';
    const lat = parseFloat(raw.lat);
    const lng = parseFloat(raw.lon);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

    const type = mapCrimeType(desc);
    const severity = mapSeverity(type, desc);

    return {
        id: `official-${raw.dr_no || raw.report_no || Math.random().toString(36).slice(2)}`,
        source: 'official',
        type,
        severity,
        title: desc.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
        description: `${raw.area_name || 'Unknown area'} — LAPD Case #${raw.dr_no || 'N/A'}`,
        lat,
        lng,
        location_label: raw.location || raw.area_name || null,
        area: raw.area_name || null,
        created_at: raw.date_occ ? new Date(raw.date_occ).toISOString() : new Date().toISOString(),
        status: raw.status_desc?.toLowerCase().includes('invest') ? 'active' : 'active',
        confirmations: 0,
    };
}

// GET /api/crimes?lat=&lng=&radius=&limit=
router.get('/', async (req, res) => {
    try {
        const { lat, lng, limit = 40 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'lat and lng required' });
        }

        const centerLat = parseFloat(lat);
        const centerLng = parseFloat(lng);
        const cacheKey = `${centerLat.toFixed(3)},${centerLng.toFixed(3)}`;

        // Check cache
        const cached = CACHE.get(cacheKey);
        if (cached && Date.now() < cached.expiresAt) {
            return res.json(cached.data);
        }

        // Build Socrata SoQL bounding box query
        const minLat = centerLat - LAT_DELTA;
        const maxLat = centerLat + LAT_DELTA;
        const minLng = centerLng - LNG_DELTA;
        const maxLng = centerLng + LNG_DELTA;

        // Get last 90 days
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00';

        const params = new URLSearchParams({
            $limit: parseInt(limit),
            $order: 'date_occ DESC',
            $where: `lat >= ${minLat} AND lat <= ${maxLat} AND lon >= ${minLng} AND lon <= ${maxLng} AND date_occ >= '${ninetyDaysAgo}'`,
        });

        const url = `${SOCRATA_BASE}?${params}`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'X-App-Token': '', // optional Socrata token — empty = unauthenticated (1000/hr)
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            console.warn(`[crimes] Socrata returned ${response.status}`);
            return res.json([]);
        }

        const raw = await response.json();
        const normalized = raw.map(normalizeCrime).filter(Boolean);

        // Cache result
        CACHE.set(cacheKey, { data: normalized, expiresAt: Date.now() + CACHE_TTL_MS });

        // Prune cache if too large
        if (CACHE.size > 100) {
            const oldest = CACHE.keys().next().value;
            CACHE.delete(oldest);
        }

        res.json(normalized);
    } catch (err) {
        console.error('[crimes] fetch error:', err.message);
        // Never crash the app — just return empty
        res.json([]);
    }
});

export default router;
