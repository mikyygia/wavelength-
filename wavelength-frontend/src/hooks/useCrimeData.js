import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config/api';

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useCrimeData(center) {
    const [officialCrimes, setOfficialCrimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCrimes = useCallback(async () => {
        if (center?.lat == null || center?.lng == null) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                lat: center.lat,
                lng: center.lng,
                radius: center.radius ?? 2000,
                limit: 60,
            });
            const res = await fetch(`${API_BASE}/crimes?${params}`);
            if (!res.ok) {
                let message = `HTTP ${res.status}`;
                try {
                    const payload = await res.json();
                    if (payload?.error) message = payload.error;
                } catch {
                    // ignore JSON parse errors and keep HTTP message
                }
                throw new Error(message);
            }
            const data = await res.json();
            setOfficialCrimes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('[useCrimeData] failed:', err.message);
            setError(err.message);
            setOfficialCrimes([]); // never block UI
        } finally {
            setLoading(false);
        }
    }, [center?.lat, center?.lng, center?.radius]);

    useEffect(() => {
        fetchCrimes();
        const interval = setInterval(fetchCrimes, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchCrimes]);

    return { officialCrimes, loading, error };
}
