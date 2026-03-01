import { useState, useRef, useEffect, useCallback } from 'react';
import { geocodeSearch } from '../../hooks/useGeocoder';

export default function FormAddressSearch({ onSelect, placeholder = 'search address...' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const debounceRef = useRef(null);

    const runSearch = useCallback(async (q) => {
        if (!q || q.trim().length < 2) {
            setResults([]);
            return;
        }
        setSearching(true);
        setError(null);
        try {
            const list = await geocodeSearch(q);
            setResults(list);
        } catch (err) {
            setError('search failed');
            setResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!query.trim()) {
            setResults([]);
            setError(null);
            return;
        }
        debounceRef.current = setTimeout(() => runSearch(query), 500);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query, runSearch]);

    const handleSelect = (r) => {
        onSelect(r);
        setQuery('');
        setResults([]);
        setError(null);
    };

    return (
        <div className="form-address-search">
            <div className="form-address-label">— or type an address —</div>
            <div className="search-input-wrap">
                <input
                    className="signal-input search-input"
                    placeholder={placeholder}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                {searching && <span className="search-spinner">⟳</span>}
            </div>
            {error && <div className="search-error">{error}</div>}
            {results.length > 0 && (
                <div className="search-results">
                    {results.map((r, i) => (
                        <button
                            key={i}
                            type="button"
                            className="search-result-item"
                            onClick={() => handleSelect(r)}
                        >
                            <span className="result-label">{r.label}</span>
                            <span className="result-coords">{r.lat.toFixed(4)}, {r.lng.toFixed(4)}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
