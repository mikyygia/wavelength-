import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001/api';

export function useInstability() {
    const [data, setData] = useState({ score: 0, label: 'calm', color: '#C0CEEB', breakdown: {}, activeReports: 0 });

    const fetchInstability = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/static/instability`);
            setData(res.data);
        } catch (err) {
            console.error('failed to fetch instability:', err);
        }
    }, []);

    useEffect(() => {
        fetchInstability();
        const interval = setInterval(fetchInstability, 30000);
        return () => clearInterval(interval);
    }, [fetchInstability]);

    return data;
}
