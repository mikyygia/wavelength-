import { useState } from 'react';
import { typeList, staticTypes, severityList, severityColors } from '../../utils/staticUtils';

export default function StaticReportForm({ position, onSubmit, onClose }) {
    const [type, setType] = useState('');
    const [severity, setSeverity] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [locationLabel, setLocationLabel] = useState('');
    const [affectedCount, setAffectedCount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!type || !severity || !title.trim()) return;
        setSubmitting(true);
        try {
            await onSubmit({
                lat: position.lat,
                lng: position.lng,
                type,
                severity,
                title: title.trim(),
                description: description.trim() || null,
                location_label: locationLabel.trim() || null,
                affected_count: parseInt(affectedCount) || 0,
            });
            onClose();
        } catch (err) {
            console.error(err);
            setSubmitting(false);
        }
    };

    return (
        <div className="drop-signal-overlay" onClick={onClose}>
            <div className="drop-signal-form static-report-form" onClick={e => e.stopPropagation()}>
                <div className="form-header">
                    <span className="form-title" style={{ color: '#FF4444' }}>⚡ report incident</span>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="form-location">
                    <span className="label">location</span>
                    <span className="coords">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">type of incident</label>
                        <div className="mood-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            {typeList.map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`mood-btn ${type === t ? 'active' : ''}`}
                                    style={{
                                        '--mood-color': staticTypes[t].color,
                                        borderColor: type === t ? staticTypes[t].color : 'var(--border)',
                                        background: type === t ? `${staticTypes[t].color}22` : 'transparent',
                                    }}
                                    onClick={() => setType(t)}
                                >
                                    <span className="mood-emoji">{staticTypes[t].icon}</span>
                                    <span className="mood-label">{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">severity level</label>
                        <div className="severity-grid">
                            {severityList.map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    className={`severity-option ${severity === s ? 'active' : ''}`}
                                    style={{
                                        '--sev-color': severityColors[s],
                                        borderColor: severity === s ? severityColors[s] : 'var(--border)',
                                        color: severity === s ? severityColors[s] : 'var(--text-muted)',
                                    }}
                                    onClick={() => setSeverity(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">title <span className="char-count">{title.length}/80</span></label>
                        <input
                            className="signal-input"
                            placeholder="brief description of the incident..."
                            value={title}
                            onChange={e => setTitle(e.target.value.slice(0, 80))}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">details <span className="optional">(optional, max 500)</span></label>
                        <textarea
                            className="signal-input"
                            placeholder="what happened? what did you see?"
                            value={description}
                            onChange={e => setDescription(e.target.value.slice(0, 500))}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">location name <span className="optional">(optional)</span></label>
                        <input
                            className="signal-input"
                            placeholder='e.g. "near the library"'
                            value={locationLabel}
                            onChange={e => setLocationLabel(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">people affected <span className="optional">(optional)</span></label>
                        <input
                            className="signal-input"
                            type="number"
                            min="0"
                            placeholder="estimated number..."
                            value={affectedCount}
                            onChange={e => setAffectedCount(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={!type || !severity || !title.trim() || submitting}
                        style={{ '--mood-color': severity ? severityColors[severity] : '#FF4444' }}
                    >
                        {submitting ? 'submitting...' : 'submit report ⚡'}
                    </button>
                </form>
            </div>
        </div>
    );
}
