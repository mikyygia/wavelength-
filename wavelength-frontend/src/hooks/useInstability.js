import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';

export function useInstability(center, radiusMeters) {
    const [data, setData] = useState({ score: 0, label: 'calm', color: '#C0CEEB', breakdown: {}, activeReports: 0 });

    const fetchInstability = useCallback(async () => {
        if (!center) return;
        try {
            const params = new URLSearchParams({
                lat: center.lat,
                lng: center.lng,
                radius: radiusMeters ?? 2000,
            });
            const res = await axios.get(`${API_BASE}/static/instability?${params}`);
            setData(res.data);
        } catch (err) {
            console.error('failed to fetch instability:', err);
        }
    }, [center?.lat, center?.lng, radiusMeters]);

    useEffect(() => {
        fetchInstability();
        const interval = setInterval(fetchInstability, 30000);
        return () => clearInterval(interval);
    }, [fetchInstability]);

    return data;
}
