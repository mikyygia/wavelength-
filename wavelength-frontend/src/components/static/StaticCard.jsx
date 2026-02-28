import { useState, useEffect } from 'react';
import { severityColors, staticTypes, getTimeAgo } from '../../utils/staticUtils';

export default function StaticCard({ report, onConfirm, onResolve, onClose }) {
    const [confirmed, setConfirmed] = useState(false);
    const [showResolve, setShowResolve] = useState(false);
    const [resolveNote, setResolveNote] = useState('');

    const typeInfo = staticTypes[report.type] || staticTypes.other;
    const sevColor = severityColors[report.severity];
    const isResolved = report.status === 'resolved';

    const handleConfirm = async () => {
        if (confirmed) return;
        await onConfirm(report.id);
        setConfirmed(true);
    };

    const handleResolve = async () => {
        await onResolve(report.id, resolveNote);
        onClose();
    };

    let newsLinks = [];
    try {
        newsLinks = JSON.parse(report.news_links || '[]');
    } catch { }

    return (
        <div className="signal-card-overlay" onClick={onClose}>
            <div
                className="static-card"
                onClick={e => e.stopPropagation()}
                style={{ '--card-color': sevColor }}
            >
                <div className="card-header">
                    <div className="card-mood">
                        <span className="card-emoji">{typeInfo.icon}</span>
                        <span className="card-mood-label" style={{ color: sevColor }}>{report.type}</span>
                        <span
                            className="severity-badge"
                            style={{ borderColor: sevColor, color: sevColor }}
                        >
                            {report.severity}
                        </span>
                    </div>
                    <div className="card-meta">
                        <span className={`status-badge status-${report.status}`}>{report.status}</span>
                        <span className="card-time">{getTimeAgo(report.created_at)}</span>
                        <button className="close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                <div className="static-card-title">{report.title}</div>

                {report.description && (
                    <div className="card-note">{report.description}</div>
                )}

                {report.location_label && (
                    <div className="static-location">
                        <span className="location-icon">📍</span>
                        <span>{report.location_label}</span>
                    </div>
                )}

                <div className="static-stats">
                    <div className="static-stat">
                        <span className="stat-number">{report.confirmations}</span>
                        <span className="stat-desc">confirmations</span>
                    </div>
                    {report.affected_count > 0 && (
                        <div className="static-stat">
                            <span className="stat-number">{report.affected_count}</span>
                            <span className="stat-desc">affected</span>
                        </div>
                    )}
                </div>

                {isResolved && report.resolution_note && (
                    <div className="resolution-note">
                        <span className="resolution-icon">✓</span>
                        <span>{report.resolution_note}</span>
                    </div>
                )}

                {newsLinks.length > 0 && (
                    <div className="news-links">
                        <span className="news-label">related links:</span>
                        {newsLinks.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="news-link">
                                {url.length > 50 ? url.slice(0, 50) + '...' : url}
                            </a>
                        ))}
                    </div>
                )}

                {!isResolved && (
                    <div className="static-actions">
                        <button
                            className={`confirm-btn ${confirmed ? 'confirmed' : ''}`}
                            onClick={handleConfirm}
                            disabled={confirmed}
                        >
                            {confirmed ? '✓ confirmed' : '👁️ I see this too'}
                        </button>
                        <button
                            className="resolve-btn"
                            onClick={() => setShowResolve(!showResolve)}
                        >
                            ✓ mark resolved
                        </button>
                    </div>
                )}

                {showResolve && (
                    <div className="resolve-form">
                        <input
                            className="signal-input"
                            placeholder="resolution note (optional)..."
                            value={resolveNote}
                            onChange={e => setResolveNote(e.target.value)}
                        />
                        <button className="submit-btn" onClick={handleResolve} style={{ '--mood-color': '#B8D4B8' }}>
                            confirm resolution
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
