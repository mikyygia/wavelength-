export default function ModeToggle({ mode, onModeChange }) {
    return (
        <div className="activity-mode-toggle">
            {[
                { key: 'all', label: 'all' },
                { key: 'signals', label: '🌊 signals' },
                { key: 'static', label: '⚡ static' },
            ].map(m => (
                <button
                    key={m.key}
                    className={`mode-toggle-btn ${mode === m.key ? 'active' : ''}`}
                    onClick={() => onModeChange(m.key)}
                >
                    {m.label}
                </button>
            ))}
        </div>
    );
}
