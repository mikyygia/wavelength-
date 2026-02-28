import { useState } from 'react';
import { moodColors, moodEmojis } from '../../utils/moodColors';
import { staticTypes, severityColors, getTimeAgo } from '../../utils/staticUtils';
import InstabilityIndex from '../static/InstabilityIndex';

export default function FeedPanel({
    signals,
    reports,
    mode,
    onModeChange,
    onSignalClick,
    onReportClick,
    instability,
    moodPercentages,
    dominantMood,
    moodTotal,
    collapsed,
    onCollapse,
}) {
    const [tab, setTab] = useState('summary');

    if (collapsed) return null;

    return (
        <div className="feed-panel">
            <div className="feed-header">
                <div className="feed-tabs">
                    {['summary', 'activity', 'notes'].map(t => (
                        <button
                            key={t}
                            className={`feed-tab ${tab === t ? 'active' : ''}`}
                            onClick={() => setTab(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <button className="feed-collapse" onClick={onCollapse} title="collapse">‹</button>
            </div>

            <div className="feed-body">
                {tab === 'summary' && (
                    <SummaryTab
                        instability={instability}
                        moodPercentages={moodPercentages}
                        dominantMood={dominantMood}
                        moodTotal={moodTotal}
                        reportCount={reports.filter(r => r.status !== 'resolved').length}
                    />
                )}
                {tab === 'activity' && (
                    <ActivityTab
                        signals={signals}
                        reports={reports}
                        mode={mode}
                        onSignalClick={onSignalClick}
                        onReportClick={onReportClick}
                    />
                )}
                {tab === 'notes' && (
                    <NotesTab />
                )}
            </div>

            <div className="feed-mode-toggle">
                <button
                    className={`mode-btn ${mode === 'signals' ? 'active' : ''}`}
                    onClick={() => onModeChange('signals')}
                >
                    🌊 signals
                </button>
                <button
                    className={`mode-btn ${mode === 'static' ? 'active' : ''}`}
                    onClick={() => onModeChange('static')}
                >
                    ⚡ static
                </button>
            </div>
        </div>
    );
}

function SummaryTab({ instability, moodPercentages, dominantMood, moodTotal, reportCount }) {
    const moodEmoji = dominantMood ? moodEmojis[dominantMood] : '📡';
    const moodLabel = dominantMood
        ? `campus is ${moodPercentages.find(m => m.mood === dominantMood)?.percentage || 0}% ${dominantMood} today`
        : 'campus is quiet right now';

    return (
        <div className="summary-tab">
            <div className="summary-section">
                <div className="summary-section-label">⚡ instability index</div>
                <InstabilityIndex data={instability} />
            </div>

            <div className="summary-section">
                <div className="summary-section-label">🌊 campus mood</div>
                <div className="summary-mood">
                    <span className="summary-mood-icon">{moodEmoji}</span>
                    <span className="summary-mood-text">{moodLabel}</span>
                </div>
                {moodTotal > 0 && (
                    <div className="atmosphere-bar" style={{ marginTop: '8px' }}>
                        {moodPercentages.map(m => (
                            <div
                                key={m.mood}
                                className="bar-segment"
                                style={{
                                    width: `${m.percentage}%`,
                                    backgroundColor: moodColors[m.mood],
                                }}
                                title={`${m.mood}: ${m.percentage}%`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="summary-stats">
                <div className="stat-item">
                    <span className="stat-value">{moodTotal}</span>
                    <span className="stat-label">active signals</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{reportCount}</span>
                    <span className="stat-label">active reports</span>
                </div>
            </div>
        </div>
    );
}

function ActivityTab({ signals, reports, mode, onSignalClick, onReportClick }) {
    const items = mode === 'signals'
        ? signals.map(s => ({
            id: s.id,
            type: 'signal',
            icon: moodEmojis[s.mood] || '📍',
            label: s.mood,
            text: s.note,
            time: s.created_at,
            color: moodColors[s.mood],
            data: s,
        }))
        : reports.map(r => ({
            id: r.id,
            type: 'report',
            icon: staticTypes[r.type]?.icon || '📋',
            label: r.type,
            text: r.title,
            time: r.created_at,
            color: severityColors[r.severity],
            data: r,
        }));

    return (
        <div className="activity-tab">
            {items.length === 0 && (
                <div className="activity-empty">
                    <span>{mode === 'signals' ? '📡' : '⚡'}</span>
                    <p>no {mode === 'signals' ? 'signals' : 'reports'} yet.</p>
                    <p className="muted">be the first.</p>
                </div>
            )}
            {items.map(item => (
                <button
                    key={item.id}
                    className="activity-item"
                    onClick={() => item.type === 'signal' ? onSignalClick(item.data) : onReportClick(item.data)}
                >
                    <span className="activity-icon" style={{ color: item.color }}>{item.icon}</span>
                    <div className="activity-content">
                        <span className="activity-label" style={{ color: item.color }}>{item.label}</span>
                        <span className="activity-text">{item.text.length > 60 ? item.text.slice(0, 60) + '...' : item.text}</span>
                    </div>
                    <span className="activity-time">{getTimeAgo(item.time)}</span>
                </button>
            ))}
        </div>
    );
}

function NotesTab() {
    const [notes] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('wl-my-signals') || '[]');
        } catch {
            return [];
        }
    });

    return (
        <div className="notes-tab">
            {notes.length === 0 && (
                <div className="activity-empty">
                    <span>📝</span>
                    <p>your dropped signals appear here.</p>
                    <p className="muted">they're saved locally in your browser.</p>
                </div>
            )}
            {notes.map((n, i) => (
                <div key={i} className="note-item">
                    <span className="note-mood">{moodEmojis[n.mood] || '📍'} {n.mood}</span>
                    <span className="note-text">{n.note}</span>
                    <span className="note-time">{getTimeAgo(n.created_at)}</span>
                </div>
            ))}
        </div>
    );
}
