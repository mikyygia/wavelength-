import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'wl-location';
const DEFAULT_LOCATION = {
    lat: 33.6461,
    lng: -117.8427,
    label: 'UC Irvine',
    radius: 2000,
};

export function useGeocoder() {
    const [location, setLocation] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
        } catch {
            return DEFAULT_LOCATION;
        }
    });

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);

    const debounceTimer = useRef(null);
    const lastRequestTime = useRef(0);
    const MIN_REQUEST_INTERVAL = 1100;

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
        } catch {
            // storage unavailable
        }
    }, [location]);

    const geocode = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setResults([]);
            return;
        }

        const now = Date.now();
        const timeSinceLast = now - lastRequestTime.current;
        if (timeSinceLast < MIN_REQUEST_INTERVAL) {
            await new Promise(resolve =>
                setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLast)
            );
        }

        setSearching(true);
        setError(null);

        try {
            lastRequestTime.current = Date.now();
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery.trim())}&format=json&limit=5&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'Wavelength/1.0 (campus-safety-app)',
                        'Accept-Language': 'en',
                    },
                }
            );

            if (!res.ok) throw new Error(`Geocoder error: ${res.status}`);

            const data = await res.json();

            if (!data.length) {
                setResults([]);
                setError('no results found. try a different search.');
                return;
            }

            const mapped = data.map(item => ({
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                label: item.display_name.split(',').slice(0, 2).join(', '),
                fullLabel: item.display_name,
            }));

            setResults(mapped);
        } catch (err) {
            console.error('Geocoder error:', err);
            setError('search failed. check your connection.');
            setResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    const search = useCallback((value) => {
        setQuery(value);
        setError(null);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!value.trim()) {
            setResults([]);
            return;
        }

        debounceTimer.current = setTimeout(() => {
            geocode(value);
        }, 600);
    }, [geocode]);

    const selectLocation = useCallback((result) => {
        setLocation(prev => ({
            ...prev,
            lat: result.lat,
            lng: result.lng,
            label: result.label,
        }));
        setResults([]);
        setQuery('');
        setError(null);
    }, []);

    const setRadius = useCallback((radius) => {
        setLocation(prev => ({ ...prev, radius }));
    }, []);

    const resetToDefault = useCallback(() => {
        setLocation(DEFAULT_LOCATION);
        setQuery('');
        setResults([]);
        setError(null);
    }, []);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    return {
        location,
        query,
        results,
        searching,
        error,
        search,
        selectLocation,
        setRadius,
        resetToDefault,
    };
}
