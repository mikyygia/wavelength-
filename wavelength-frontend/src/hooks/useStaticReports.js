import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';

export function useStaticReports(center, radiusMeters, filtersOverride) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        timeframe: '24h',
        type: 'all',
        status: 'all', // include resolved for feed + map
    });

    const fetchReports = useCallback(async () => {
        if (!center) return;
        try {
            const params = {
                ...filters,
                ...(filtersOverride || {}),
                lat: center.lat,
                lng: center.lng,
                radius: radiusMeters ?? 2000,
            };
            const res = await axios.get(`${API_BASE}/static?${new URLSearchParams(params)}`);
            setReports(res.data);
        } catch (err) {
            console.error('failed to fetch static reports:', err);
        } finally {
            setLoading(false);
        }
    }, [center?.lat, center?.lng, radiusMeters, filters, filtersOverride]);

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 30000);
        return () => clearInterval(interval);
    }, [fetchReports]);

    const submitReport = async (reportData) => {
        try {
            const res = await axios.post(`${API_BASE}/static`, reportData);
            setReports(prev => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            console.error('failed to submit report:', err);
            throw err;
        }
    };

    const confirmReport = async (reportId) => {
        try {
            const res = await axios.patch(`${API_BASE}/static/${reportId}/confirm`);
            setReports(prev => prev.map(r => r.id === reportId ? res.data : r));
            return res.data;
        } catch (err) {
            console.error('failed to confirm report:', err);
            throw err;
        }
    };

    const resolveReport = async (reportId, resolutionNote) => {
        try {
            const res = await axios.patch(`${API_BASE}/static/${reportId}/resolve`, { resolution_note: resolutionNote });
            setReports(prev => prev.map(r => r.id === reportId ? res.data : r));
            return res.data;
        } catch (err) {
            console.error('failed to resolve report:', err);
            throw err;
        }
    };

    return { reports, loading, filters, setFilters, fetchReports, submitReport, confirmReport, resolveReport };
}
