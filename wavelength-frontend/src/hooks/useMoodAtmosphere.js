import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';

export function useMoodAtmosphere(center, radiusMeters) {
    const [atmosphere, setAtmosphere] = useState({ moods: [], total: 0 });

    useEffect(() => {
        const fetch = async () => {
            try {
                const params = new URLSearchParams({
                    lat: center?.lat ?? '',
                    lng: center?.lng ?? '',
                    radius: radiusMeters ?? 2000,
                });
                const res = await axios.get(`${API_BASE}/mood-atmosphere?${params}`);
                setAtmosphere(res.data);
            } catch (err) {
                console.error('failed to fetch atmosphere:', err);
            }
        };
        fetch();
        const interval = setInterval(fetch, 30000);
        return () => clearInterval(interval);
    }, [center?.lat, center?.lng, radiusMeters]);

    // Compute dominant mood
    const dominantMood = atmosphere.moods.length > 0
        ? atmosphere.moods.reduce((a, b) => a.count > b.count ? a : b).mood
        : null;

    // Compute percentage
    const moodPercentages = atmosphere.moods.map(m => ({
        ...m,
        percentage: atmosphere.total > 0 ? Math.round((m.count / atmosphere.total) * 100) : 0,
    }));

    return { atmosphere, dominantMood, moodPercentages };
}
