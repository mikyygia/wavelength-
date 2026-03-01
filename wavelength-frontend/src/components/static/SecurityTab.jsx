import { useState } from 'react';
import { staticTypes, severityColors, getTimeAgo } from '../../utils/staticUtils';

function getPulseLevel(score) {
    if (score === 0) return { label: 'calm', context: 'no reported activity nearby', color: 'var(--mist)' };
    if (score <= 20) return { label: 'calm', context: 'minimal activity in your area', color: 'var(--mist)' };
    if (score <= 40) return { label: 'watch', context: 'some activity - stay aware', color: 'var(--yellow)' };
    if (score <= 60) return { label: 'elevated', context: '↑ higher than usual activity', color: '#F97316' };
    if (score <= 80) return { label: 'high', context: '⚠ significant activity reported', color: 'var(--red)' };
    return { label: 'critical', context: '🚨 high activity - exercise caution', color: 'var(--red)' };
}

const TIME_RANGES = {
    '1h': 1,
    '6h': 6,
    '24h': 24,
    '7d': 168,
    'all': Infinity,
};

const TYPE_LABELS = {
    all: 'all',
    threat: 'threat',
    harassment: 'harassment',
    suspicious: 'suspicious',
    crowd: 'crowd',
    other: 'other',
};

export default function SecurityTab({
    instability,
    reports,
    officialCrimes = [],
    onReportClick,
    onOpenStaticForm,
}) {
    const [timeFilter, setTimeFilter] = useState('24h');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showOfficial, setShowOfficial] = useState(true);

    const { score, activeReports } = instability;
    const pulse = getPulseLevel(score);

    const timeHours = TIME_RANGES[timeFilter] ?? 24;
    const now = Date.now();

    const withinTime = (dateStr) => {
        if (timeHours === Infinity) return true;
        return now - new Date(dateStr).getTime() < timeHours * 3600000;
    };

    const matchesType = (type) => typeFilter === 'all' || type === typeFilter;

    // Community reports
    const activeReportsList = reports.filter(r => r.status !== 'resolved');
    const filteredCommunity = activeReportsList.filter(r =>
        withinTime(r.created_at) && matchesType(r.type)
    );

    const resolvedToday = reports.filter(r => {
        if (r.status !== 'resolved') return false;
        const resolvedAt = r.resolved_at || r.created_at;
        return now - new Date(resolvedAt).getTime() < 86400000;
    });

    // Official crimes
    const filteredOfficial = officialCrimes.filter(c =>
        withinTime(c.created_at) && matchesType(c.type)
    );

    const officialCount7d = officialCrimes.filter(c =>
        now - new Date(c.created_at).getTime() < 7 * 24 * 3600000
    ).length;

    return (
        <div className="security-tab">
            {/* Pulse Header */}
            <div className="security-pulse">
                <div className="pulse-header-label">⚡ current tension</div>
                <div className="pulse-score-row">
                    <span className="pulse-score" style={{ color: pulse.color }}>{score}</span>
                    <span className="pulse-max">/ 100</span>
                </div>
                <div className="pulse-label" style={{ color: pulse.color }}>{pulse.label.toUpperCase()}</div>
                <div className="pulse-context">{pulse.context}</div>
                <div className="pulse-stats-row">
                    <span className="pulse-stat">
                        <span className="pulse-stat-val">{activeReports}</span>
                        <span className="pulse-stat-label">community</span>
                    </span>
                    <span className="pulse-stat-divider">·</span>
                    <span className="pulse-stat official">
                        <span className="pulse-stat-val">{officialCount7d}</span>
                        <span className="pulse-stat-label">official (7d)</span>
                    </span>
                </div>
            </div>

            <div className="security-divider" />

            {/* Filters */}
            <div className="security-filters">
                <div className="filter-row">
                    <span className="filter-label">time:</span>
                    <div className="filter-options">
                        {['1h', '6h', '24h', '7d', 'all'].map(t => (
                            <button
                                key={t}
                                className={`filter-btn ${timeFilter === t ? 'active' : ''}`}
                                onClick={() => setTimeFilter(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="filter-row">
                    <span className="filter-label">type:</span>
                    <div className="filter-options filter-options-wrap">
                        {['all', 'threat', 'harassment', 'suspicious', 'crowd', 'other'].map(t => (
                            <button
                                key={t}
                                className={`filter-btn ${typeFilter === t ? 'active' : ''}`}
                                onClick={() => setTypeFilter(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="filter-row">
                    <span className="filter-label">show:</span>
                    <button
                        className={`filter-btn ${showOfficial ? 'active' : ''}`}
                        onClick={() => setShowOfficial(v => !v)}
                    >
                        🚔 official
                    </button>
                </div>
            </div>

            {/* Community Reports */}
            <div className="security-section">
                <div className="security-section-header">
                    ── community reports ({filteredCommunity.length}) ──
                </div>
                {filteredCommunity.length === 0 && (
                    <div className="security-empty">no community reports in this timeframe.</div>
                )}
                {filteredCommunity.map(r => {
                    const typeInfo = staticTypes[r.type] || staticTypes.other;
                    const sevColor = severityColors[r.severity];
                    return (
                        <button
                            key={r.id}
                            className="security-report-item"
                            onClick={() => onReportClick(r)}
                        >
                            <span className="security-severity-dot" style={{ background: sevColor }} />
                            <div className="security-report-content">
                                <div className="security-report-title-row">
                                    <span className="security-report-title">{typeInfo.icon} {r.title}</span>
                                    <span className="source-tag community">community</span>
                                </div>
                                <span className="security-report-meta">
                                    {r.location_label || 'unknown location'} · {getTimeAgo(r.created_at)}
                                </span>
                                <div className="security-report-badges">
                                    <span className="security-badge" style={{ borderColor: sevColor, color: sevColor }}>{r.severity}</span>
                                    <span className="security-badge">{r.confirmations} confirmations</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Official Crime Records */}
            {showOfficial && (
                <div className="security-section">
                    <div className="security-section-header official-header">
                        ── official records ({filteredOfficial.length}) ──
                        <span className="official-header-sub">🚔 police data</span>
                    </div>
                    {filteredOfficial.length === 0 && (
                        <div className="security-empty">
                            {officialCrimes.length === 0
                                ? 'fetching official crime data...'
                                : 'no official records match this filter.'}
                        </div>
                    )}
                    {filteredOfficial.slice(0, 15).map(c => (
                        <OfficialCrimeCard key={c.id} crime={c} />
                    ))}
                    {filteredOfficial.length > 15 && (
                        <div className="security-more">+{filteredOfficial.length - 15} more records</div>
                    )}
                </div>
            )}

            {/* Related News — only if any report has news_links */}
            {filteredCommunity.some(r => {
                try {
                    const links = JSON.parse(r.news_links || '[]');
                    return Array.isArray(links) && links.length > 0;
                } catch { return false; }
            }) && (
                    <div className="security-section">
                        <div className="security-section-header">── related news ──</div>
                        <div className="security-news-placeholder">📰</div>
                    </div>
                )}

            {/* Resolved Today */}
            {resolvedToday.length > 0 && (
                <div className="security-section">
                    <div className="security-section-header">── resolved today ({resolvedToday.length}) ──</div>
                    {resolvedToday.map(r => (
                        <button
                            key={r.id}
                            className="security-report-item resolved"
                            onClick={() => onReportClick(r)}
                        >
                            <span className="security-resolved-check">✓</span>
                            <div className="security-report-content">
                                <div className="security-report-title-row">
                                    <span className="security-report-title">{r.title}</span>
                                    <span className="source-tag community">community</span>
                                </div>
                                <span className="security-report-meta">
                                    {r.location_label || 'unknown location'} · resolved
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Report button */}
            <div className="security-action">
                <button className="security-report-btn" onClick={onOpenStaticForm}>
                    + report something
                </button>
            </div>
        </div>
    );
}

function OfficialCrimeCard({ crime }) {
    const sevColor = severityColors[crime.severity] || 'var(--mist)';
    return (
        <div className="official-crime-item">
            <span className="security-severity-dot" style={{ background: sevColor }} />
            <div className="security-report-content">
                <div className="security-report-title-row">
                    <span className="security-report-title">{crime.title}</span>
                    <span className="source-tag official">official</span>
                </div>
                <span className="security-report-meta">
                    {crime.location_label || crime.area || 'unknown area'} · {getTimeAgo(crime.created_at)}
                </span>
                <div className="security-report-badges">
                    <span className="security-badge official-badge" style={{ borderColor: 'var(--mist)', color: 'var(--mist)' }}>{crime.severity}</span>
                    <span className="security-badge official-badge">{crime.type}</span>
                </div>
            </div>
        </div>
    );
}
