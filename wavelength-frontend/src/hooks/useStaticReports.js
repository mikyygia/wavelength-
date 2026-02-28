import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001/api';

export function useStaticReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        timeframe: '24h',
        type: 'all',
        status: 'all',
    });

    const fetchReports = useCallback(async () => {
        try {
            const params = new URLSearchParams(filters);
            const res = await axios.get(`${API}/static?${params}`);
            setReports(res.data);
        } catch (err) {
            console.error('failed to fetch static reports:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 30000);
        return () => clearInterval(interval);
    }, [fetchReports]);

    const submitReport = async (reportData) => {
        try {
            const res = await axios.post(`${API}/static`, reportData);
            setReports(prev => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            console.error('failed to submit report:', err);
            throw err;
        }
    };

    const confirmReport = async (reportId) => {
        try {
            const res = await axios.patch(`${API}/static/${reportId}/confirm`);
            setReports(prev => prev.map(r => r.id === reportId ? res.data : r));
            return res.data;
        } catch (err) {
            console.error('failed to confirm report:', err);
            throw err;
        }
    };

    const resolveReport = async (reportId, resolutionNote) => {
        try {
            const res = await axios.patch(`${API}/static/${reportId}/resolve`, { resolution_note: resolutionNote });
            setReports(prev => prev.map(r => r.id === reportId ? res.data : r));
            return res.data;
        } catch (err) {
            console.error('failed to resolve report:', err);
            throw err;
        }
    };

    return { reports, loading, filters, setFilters, fetchReports, submitReport, confirmReport, resolveReport };
}
