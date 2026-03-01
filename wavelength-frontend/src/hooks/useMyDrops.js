import { useState, useCallback } from 'react';

const STORAGE_KEY = 'wl-my-drops';
const HIDDEN_KEY = 'wl-hidden-items';

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
    } catch {
        // ignore localStorage write failures
    }
}

function loadHidden() {
    try {
        const parsed = JSON.parse(localStorage.getItem(HIDDEN_KEY) || '{}');
        return {
            signal: Array.isArray(parsed.signal) ? parsed.signal : [],
            static: Array.isArray(parsed.static) ? parsed.static : [],
        };
    } catch {
        return { signal: [], static: [] };
    }
}

function saveHidden(hidden) {
    try {
        localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden));
    } catch {
        // ignore localStorage write failures
    }
}

export function useMyDrops() {
    const [drops, setDrops] = useState(loadDrops);
    const [hiddenIds, setHiddenIds] = useState(loadHidden);

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
        setDrops(prevDrops => {
            const target = prevDrops.find(d => d.id === dropId);
            const updatedDrops = prevDrops.filter(d => d.id !== dropId);
            saveDrops(updatedDrops);

            if (target?.kind && target?.data?.id) {
                setHiddenIds(prevHidden => {
                    const bucket = target.kind === 'signal' ? 'signal' : 'static';
                    const hiddenId = String(target.data.id);
                    const nextBucket = prevHidden[bucket].includes(hiddenId)
                        ? prevHidden[bucket]
                        : [...prevHidden[bucket], hiddenId];
                    const nextHidden = { ...prevHidden, [bucket]: nextBucket };
                    saveHidden(nextHidden);
                    return nextHidden;
                });
            }

            return updatedDrops;
        });
    }, []);

    return { drops, hiddenIds, addDrop, editDrop, deleteDrop };
}
