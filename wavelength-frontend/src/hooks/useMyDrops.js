import { useState, useCallback } from 'react';

const STORAGE_KEY = 'wl-my-drops';

function loadDrops() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveDrops(drops) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drops));
    } catch { }
}

export function useMyDrops() {
    const [drops, setDrops] = useState(loadDrops);

    const addDrop = useCallback((kind, data) => {
        setDrops(prev => {
            const newDrop = {
                id: data.id || crypto.randomUUID(),
                kind, // 'signal' | 'static'
                data,
                edited: false,
                editedAt: null,
                createdLocally: new Date().toISOString(),
            };
            const updated = [newDrop, ...prev].slice(0, 100);
            saveDrops(updated);
            return updated;
        });
    }, []);

    const editDrop = useCallback((dropId, field, value) => {
        setDrops(prev => {
            const updated = prev.map(d => {
                if (d.id !== dropId) return d;
                return {
                    ...d,
                    data: { ...d.data, [field]: value },
                    edited: true,
                    editedAt: new Date().toISOString(),
                };
            });
            saveDrops(updated);
            return updated;
        });
    }, []);

    const deleteDrop = useCallback((dropId) => {
        setDrops(prev => {
            const updated = prev.filter(d => d.id !== dropId);
            saveDrops(updated);
            return updated;
        });
    }, []);

    return { drops, addDrop, editDrop, deleteDrop };
}
