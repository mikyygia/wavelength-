export default function AddressSearch({ geocoder }) {
    const { query, results, searching, error, search, selectLocation, setRadius, location, resetToDefault } = geocoder;

    const radiusOptions = [500, 1000, 2000, 5000];

    return (
        <div className="address-search">
            <div className="search-label">campus / location</div>
            <div className="search-current">
                <span className="search-current-label">📍 {location.label}</span>
                <button className="search-reset" onClick={resetToDefault}>reset</button>
            </div>

            <div className="search-input-wrap">
                <input
                    className="signal-input search-input"
                    placeholder="search campus or address..."
                    value={query}
                    onChange={e => search(e.target.value)}
                />
                {searching && <span className="search-spinner">⟳</span>}
            </div>

            {error && <div className="search-error">{error}</div>}

            {results.length > 0 && (
                <div className="search-results">
                    {results.map((r, i) => (
                        <button
                            key={i}
                            className="search-result-item"
                            onClick={() => selectLocation(r)}
                        >
                            <span className="result-label">{r.label}</span>
                            <span className="result-coords">{r.lat.toFixed(4)}, {r.lng.toFixed(4)}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="radius-selector">
                <span className="radius-label">radius:</span>
                <div className="radius-options">
                    {radiusOptions.map(r => (
                        <button
                            key={r}
                            className={`radius-btn ${location.radius === r ? 'active' : ''}`}
                            onClick={() => setRadius(r)}
                        >
                            {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
