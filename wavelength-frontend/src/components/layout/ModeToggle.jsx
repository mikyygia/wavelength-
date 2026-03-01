import { AlertIcon, WaveIcon } from '../shared/UIIcons';

export default function ModeToggle({ mode, onModeChange }) {
    return (
        <div className="activity-mode-toggle">
            {[
                { key: 'all', label: 'all' },
                { key: 'signals', label: 'signals', icon: <WaveIcon size={13} /> },
                { key: 'static', label: 'alerts', icon: <AlertIcon size={13} /> },
            ].map(m => (
                <button
                    key={m.key}
                    className={`mode-toggle-btn ${mode === m.key ? 'active' : ''}`}
                    onClick={() => onModeChange(m.key)}
                >
                    {m.icon ? <span className="mode-toggle-icon">{m.icon}</span> : null}
                    {m.label}
                </button>
            ))}
        </div>
    );
}
