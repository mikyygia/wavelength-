import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001/api';

export function useSignals(center, radiusMeters) {
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSignals = useCallback(async () => {
        if (!center) return;
        try {
            const params = new URLSearchParams({
                lat: center.lat,
                lng: center.lng,
                radius: radiusMeters ?? 2000,
            });
            const res = await axios.get(`${API}/signals?${params}`);
            setSignals(res.data);
        } catch (err) {
            console.error('failed to fetch signals:', err);
        } finally {
            setLoading(false);
        }
    }, [center?.lat, center?.lng, radiusMeters]);

    useEffect(() => {
        fetchSignals();
        const interval = setInterval(fetchSignals, 30000);
        return () => clearInterval(interval);
    }, [fetchSignals]);

    const dropSignal = async (signalData) => {
        try {
            const res = await axios.post(`${API}/signals`, signalData);
            setSignals(prev => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            console.error('failed to drop signal:', err);
            throw err;
        }
    };

    const reactToSignal = async (signalId, reaction) => {
        try {
            const res = await axios.patch(`${API}/signals/${signalId}/react`, { reaction });
            setSignals(prev => prev.map(s => s.id === signalId ? res.data : s));
            return res.data;
        } catch (err) {
            console.error('failed to react:', err);
            throw err;
        }
    };

    return { signals, loading, fetchSignals, dropSignal, reactToSignal };
}
