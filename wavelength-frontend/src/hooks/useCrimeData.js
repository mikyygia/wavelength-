import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:3001/api';
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useCrimeData(center) {
    const [officialCrimes, setOfficialCrimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCrimes = useCallback(async () => {
        if (!center?.lat || !center?.lng) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                lat: center.lat,
                lng: center.lng,
                limit: 60,
            });
            const res = await fetch(`${API}/crimes?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setOfficialCrimes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('[useCrimeData] failed:', err.message);
            setError(err.message);
            setOfficialCrimes([]); // never block UI
        } finally {
            setLoading(false);
        }
    }, [center?.lat, center?.lng]);

    useEffect(() => {
        fetchCrimes();
        const interval = setInterval(fetchCrimes, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchCrimes]);

    return { officialCrimes, loading, error };
}
