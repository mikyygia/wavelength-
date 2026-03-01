import { Router } from 'express';

const router = Router();

const CACHE = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

const NEWSAPI_KEY = process.env.NEW_API_KEY || process.env.NEWSAPI_KEY || '';
const NEWSAPI_BASE = 'https://newsapi.org/v2/everything';

const CRIME_KEYWORDS = [
    'crime', 'shooting', 'assault', 'robbery', 'theft',
    'burglary', 'homicide', 'stabbing', 'arrest',
    'police', 'investigation', 'suspect',
].join(' OR ');

const SPORTS_TERMS_RE = /\b(football|soccer|basketball|baseball|hockey|tennis|golf|nfl|nba|mlb|nhl|ncaa|premier league|champions league|game|match|playoff)\b/i;
const CRIME_TERMS_RE = /\b(crime|shooting|assault|robbery|theft|burglary|homicide|stabbing|arrest|police|investigation|suspect|charged|weapon)\b/i;

function extractLocationTerm(label = '') {
    const parts = String(label).split(',').map((p) => p.trim()).filter(Boolean);
    return parts[1] || parts[0] || 'campus';
}

function normalizeArticle(article) {
    return {
        id: `news-${Buffer.from(article.url).toString('base64').slice(0, 16)}`,
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source?.name || 'Unknown Source',
        publishedAt: article.publishedAt,
        imageUrl: article.urlToImage || null,
    };
}

router.get('/', async (req, res) => {
    try {
        const { label = 'Irvine', limit = 8 } = req.query;

        if (!NEWSAPI_KEY) {
            console.warn('[news] NEW_API_KEY/NEWSAPI_KEY not set');
            return res.json({ articles: [], source: 'unavailable', error: 'news api key not configured' });
        }

        const n = Number.parseInt(limit, 10);
        const pageSize = Number.isFinite(n) ? Math.min(Math.max(n, 1), 20) : 8;

        const locationTerm = extractLocationTerm(label);
        const cacheKey = `${locationTerm.toLowerCase()}-${pageSize}`;
        const cached = CACHE.get(cacheKey);
        if (cached && Date.now() < cached.expiresAt) {
            return res.json(cached.data);
        }

        const q = `("${locationTerm}") AND (${CRIME_KEYWORDS}) NOT (football OR soccer OR basketball OR baseball OR hockey OR nfl OR nba OR mlb OR nhl OR ncaa OR playoff OR game OR match)`;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];

        const params = new URLSearchParams({
            q,
            from: sevenDaysAgo,
            sortBy: 'publishedAt',
            language: 'en',
            searchIn: 'title,description',
            pageSize: String(pageSize),
        });

        const response = await fetch(`${NEWSAPI_BASE}?${params}`, {
            headers: {
                Accept: 'application/json',
                'X-Api-Key': NEWSAPI_KEY,
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.warn(`[news] NewsAPI returned ${response.status}: ${err.message || 'unknown error'}`);
            return res.status(502).json({
                articles: [],
                source: 'error',
                error: err.message || `upstream status ${response.status}`,
            });
        }

        const data = await response.json();
        const seen = new Set();
        const articles = (data.articles || [])
            .filter((a) => a.title && !a.title.includes('[Removed]') && a.url)
            .map(normalizeArticle)
            .filter((a) => {
                const text = `${a.title || ''} ${a.description || ''}`;
                if (!CRIME_TERMS_RE.test(text)) return false;
                if (SPORTS_TERMS_RE.test(text)) return false;
                return true;
            })
            .filter((a) => {
                if (seen.has(a.url)) return false;
                seen.add(a.url);
                return true;
            });

        const result = {
            articles,
            total: data.totalResults || 0,
            locationTerm,
            source: 'newsapi',
        };

        CACHE.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
        if (CACHE.size > 50) {
            CACHE.delete(CACHE.keys().next().value);
        }

        res.json(result);
    } catch (err) {
        const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';
        console.error('[news] fetch error:', err.message);
        res.status(isTimeout ? 504 : 502).json({
            articles: [],
            source: 'error',
            error: isTimeout ? 'news provider timeout' : 'failed to fetch local crime news',
        });
    }
});

export default router;
