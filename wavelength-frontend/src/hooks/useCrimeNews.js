import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config/api';

const POLL_INTERVAL = 10 * 60 * 1000; // 10 minutes

export function useCrimeNews(center) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNews = useCallback(async () => {
        if (!center?.label) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                label: center.label,
                limit: 10,
            });
            const res = await fetch(`${API_BASE}/news?${params}`);
            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(payload?.error || `HTTP ${res.status}`);
            }

            setArticles(Array.isArray(payload?.articles) ? payload.articles : []);
            if (payload?.source === 'unavailable') {
                setError(payload?.error || 'news provider unavailable');
            }
        } catch (err) {
            console.warn('[useCrimeNews] failed:', err.message);
            setError(err.message);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, [center?.label]);

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchNews]);

    return { articles, loading, error };
}
