import { useState, useRef, useCallback, useEffect } from 'react';
import { moodColors, moodEmojis } from '../../utils/moodColors';
import { staticTypes, severityColors, getTimeAgo, distanceMiles, formatDistance } from '../../utils/staticUtils';
import CampusPulse from '../static/CampusPulse';
import ModeToggle from './ModeToggle';
import SecurityTab from '../static/SecurityTab';
import AddressSearch from '../shared/AddressSearch';
import ThemeToggle from '../shared/ThemeToggle';

const MOOD_CONTEXT = {
    0: 'no reported activity nearby',
    low: 'minimal activity in your area',
    watch: 'some activity - stay aware',
    elevated: '↑ higher than usual activity',
    high: '⚠ significant activity reported',
    critical: '🚨 high activity - exercise caution',
};

export default function FeedPanel({
    signals,
    reports,
    officialCrimes = [],
    mode,
    onModeChange,
    onSignalClick,
    onReportClick,
    onFeedItemClick,
    instability,
    moodPercentages,
    dominantMood,
    moodTotal,
    collapsed,
    onCollapse,
    geocoder,
    theme,
    onThemeToggle,
    myDrops,
    onEditDrop,
    onDeleteDrop,
    onOpenStaticForm,
    feedTab: controlledTab,
    onFeedTabChange,
}) {
    const [internalTab, setInternalTab] = useState('summary');
    const tab = controlledTab !== undefined ? controlledTab : internalTab;
    const setTab = (t) => {
        if (onFeedTabChange) onFeedTabChange(t);
        else setInternalTab(t);
    };

    const panelRef = useRef(null);
    const isResizing = useRef(false);
    const startX = useRef(0);
    const startW = useRef(0);

    const onResizeMouseDown = useCallback((e) => {
        isResizing.current = true;
        startX.current = e.clientX;
        startW.current = panelRef.current?.offsetWidth ?? 280;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    }, []);

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isResizing.current) return;
            const delta = e.clientX - startX.current;
            const newW = Math.min(Math.max(startW.current + delta, 240), window.innerWidth * 0.5);
            if (panelRef.current) {
                panelRef.current.style.width = `${newW}px`;
                panelRef.current.style.minWidth = `${newW}px`;
            }
        };
        const onMouseUp = () => {
            if (!isResizing.current) return;
            isResizing.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    if (collapsed) return null;

    const tabs = [
        { key: 'summary', label: 'Summary' },
        { key: 'activity', label: 'Activity' },
        { key: 'mydrops', label: 'History' },
        { key: 'security', label: 'Security' },
        { key: 'preferences', label: 'Preferences' },
    ];

    return (
        <div className="feed-panel" ref={panelRef}>
            <div className="feed-header">
                <div className="feed-tabs">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            className={`feed-tab ${tab === t.key ? 'active' : ''}`}
                            onClick={() => setTab(t.key)}
                        >
                            {t.label}
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
                        reports={reports}
                        officialCrimes={officialCrimes}
                        center={geocoder?.location}
                        onFeedItemClick={onFeedItemClick}
                    />
                )}
                {tab === 'activity' && (
                    <>
                        <ModeToggle mode={mode} onModeChange={onModeChange} />
                        <ActivityTab
                            signals={signals}
                            reports={reports}
                            mode={mode}
                            center={geocoder?.location}
                            onSignalClick={onSignalClick}
                            onReportClick={onReportClick}
                            onFeedItemClick={onFeedItemClick}
                        />
                    </>
                )}
                {tab === 'mydrops' && (
                    <MyDropsTab
                        drops={myDrops}
                        onEditDrop={onEditDrop}
                        onDeleteDrop={onDeleteDrop}
                        onSignalClick={onSignalClick}
                        onReportClick={onReportClick}
                        onFeedItemClick={onFeedItemClick}
                    />
                )}
                {tab === 'security' && (
                    <SecurityTab
                        instability={instability}
                        reports={reports}
                        officialCrimes={officialCrimes}
                        onReportClick={onReportClick}
                        onOpenStaticForm={onOpenStaticForm}
                    />
                )}
                {tab === 'preferences' && (
                    <div className="preferences-tab">
                        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
                        {geocoder && (
                            <AddressSearch
                                geocoder={geocoder}
                                className="prefs-address-search"
                            />
                        )}
                    </div>
                )}
            </div>

            <div className="feed-resize-handle" onMouseDown={onResizeMouseDown} title="drag to resize" />
        </div>
    );
}

// ─── Summary: two-row pulse + mood, snapshot grid, nearby feed ───
function SummaryTab({ instability, moodPercentages, dominantMood, moodTotal, reports, officialCrimes = [], center, onFeedItemClick }) {
    const moodEmoji = dominantMood ? moodEmojis[dominantMood] : '🌊';
    const moodPct = moodPercentages?.find(m => m.mood === dominantMood)?.percentage ?? 0;
    const moodLabel = dominantMood ? `${moodPct}% ${dominantMood} today` : 'quiet right now';

    // Recent 24h incidents by type (numbers only)
    const last24h = reports.filter(r => Date.now() - new Date(r.created_at).getTime() < 86400000);
    const byType = last24h.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
    }, {});
    const typeOrder = ['threat', 'suspicious', 'harassment', 'crowd', 'infrastructure', 'other'];
    const snapshotRows = typeOrder.filter(t => byType[t] > 0).map(t => ({ type: t, count: byType[t] }));
    const totalIncidents = last24h.length;

    // Official crimes in last 24h
    const officialLast24h = officialCrimes.filter(c => Date.now() - new Date(c.created_at).getTime() < 86400000);

    // Nearby — merge community reports + official crimes, sort by distance
    const communityNearby = (center ? reports
        .map(r => ({ ...r, _source: 'community', _distance: distanceMiles(center.lat, center.lng, r.lat, r.lng) }))
        : reports.map(r => ({ ...r, _source: 'community', _distance: null })));

    const officialNearby = (center ? officialCrimes
        .map(c => ({ ...c, _source: 'official', _distance: distanceMiles(center.lat, center.lng, c.lat, c.lng) }))
        : officialCrimes.map(c => ({ ...c, _source: 'official', _distance: null })));

    const nearby = [...communityNearby, ...officialNearby]
        .sort((a, b) => (a._distance ?? 999) - (b._distance ?? 999))
        .slice(0, 20);

    return (
        <div className="summary-tab summary-tab-v2">
            <div className="summary-two-row">
                <div className="summary-box">
                    <div className="summary-box-label">⚡ campus pulse</div>
                    <CampusPulse data={instability} />
                </div>
                <div className="summary-box">
                    <div className="summary-box-label">🌊 campus mood</div>
                    <div className="summary-mood-compact">
                        <span className="summary-mood-icon">{moodEmoji}</span>
                        <span className="summary-mood-text">{moodLabel}</span>
                    </div>
                    {moodTotal > 0 && (
                        <div className="atmosphere-bar" style={{ marginTop: 6 }}>
                            {moodPercentages?.map(m => (
                                <div
                                    key={m.mood}
                                    className="bar-segment"
                                    style={{ width: `${m.percentage}%`, backgroundColor: moodColors[m.mood] }}
                                    title={`${m.mood}: ${m.percentage}%`}
                                />
                            ))}
                        </div>
                    )}
                    <div className="summary-mood-sub">{instability?.activeReports ?? 0} active incidents</div>
                </div>
            </div>

            <div className="summary-snapshot">
                <div className="summary-snapshot-title">
                    {totalIncidents} community · {officialLast24h.length} official (last 24h)
                </div>
                <div className="summary-snapshot-grid">
                    {snapshotRows.length === 0 && <div className="summary-snapshot-empty">none</div>}
                    {snapshotRows.map(({ type, count }) => (
                        <div key={type} className="summary-snapshot-row">
                            <span className="snapshot-type">{staticTypes[type]?.icon} {staticTypes[type]?.label ?? type}</span>
                            <span className="snapshot-dots" style={{ flex: 1 }}>.</span>
                            <span className="snapshot-count">{count}</span>
                        </div>
                    ))}
                    {officialLast24h.length > 0 && (
                        <div className="summary-snapshot-row official-row">
                            <span className="snapshot-type">🚔 police reports</span>
                            <span className="snapshot-dots" style={{ flex: 1 }}>.</span>
                            <span className="snapshot-count official-count">{officialLast24h.length}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="summary-nearby">
                <div className="summary-nearby-title">Nearby — community + official</div>
                <div className="summary-nearby-list">
                    {nearby.map(item => {
                        const isOfficial = item._source === 'official';
                        const typeInfo = staticTypes[item.type] || staticTypes.other;
                        const sevColor = severityColors[item.severity];
                        const distStr = item._distance != null
                            ? (item._distance < 0.1 ? `${Math.round(item._distance * 5280)} ft` : `${item._distance.toFixed(1)} mi`)
                            : '';

                        if (isOfficial) {
                            return (
                                <div key={item.id} className="summary-nearby-item official-nearby-item">
                                    <span className="nearby-dot" style={{ background: 'var(--mist)' }} />
                                    <span className="nearby-type">🚔 {item.title?.slice(0, 28)}{item.title?.length > 28 ? '…' : ''}</span>
                                    <span className="nearby-meta">{distStr} · {getTimeAgo(item.created_at)}</span>
                                </div>
                            );
                        }

                        return (
                            <button
                                key={item.id}
                                type="button"
                                className="summary-nearby-item"
                                onClick={() => onFeedItemClick?.({ _kind: 'static', ...item })}
                            >
                                <span className="nearby-dot" style={{ background: sevColor }} />
                                <span className="nearby-type">{typeInfo.icon} {typeInfo.label}</span>
                                <span className="nearby-meta">{distStr} · {getTimeAgo(item.created_at)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


// ─── Activity: all drops in radius, mode filter, cards with location + distance, flyTo on click ───
function ActivityTab({ signals, reports, mode, center, onSignalClick, onReportClick, onFeedItemClick }) {
    const centerLat = center?.lat;
    const centerLng = center?.lng;

    const signalItems = (signals || []).map(s => ({
        _kind: 'signal',
        id: s.id,
        lat: s.lat,
        lng: s.lng,
        mood: s.mood,
        note: s.note,
        created_at: s.created_at,
        location_label: s.location_label,
        data: s,
    }));
    const reportItems = (reports || []).map(r => ({
        _kind: 'static',
        id: r.id,
        lat: r.lat,
        lng: r.lng,
        type: r.type,
        severity: r.severity,
        title: r.title,
        description: r.description,
        created_at: r.created_at,
        location_label: r.location_label,
        data: r,
    }));

    let merged = [...signalItems, ...reportItems]
        .map(item => ({
            ...item,
            _distance: centerLat != null && centerLng != null
                ? distanceMiles(centerLat, centerLng, item.lat, item.lng)
                : 0,
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (mode === 'signals') merged = merged.filter(i => i._kind === 'signal');
    else if (mode === 'static') merged = merged.filter(i => i._kind === 'static');

    const campusLabel = center?.label ?? 'Campus';

    return (
        <div className="activity-tab">
            {merged.length === 0 && (
                <div className="activity-empty">
                    <span>{mode === 'all' ? '📡' : mode === 'signals' ? '🌊' : '⚡'}</span>
                    <p>no {mode === 'all' ? 'activity' : mode === 'signals' ? 'signals' : 'reports'} yet.</p>
                    <p className="muted">be the first.</p>
                </div>
            )}
            {merged.map(item => (
                <ActivityCard
                    key={`${item._kind}-${item.id}`}
                    item={item}
                    campusLabel={campusLabel}
                    onFeedItemClick={onFeedItemClick}
                    onSignalClick={onSignalClick}
                    onReportClick={onReportClick}
                />
            ))}
        </div>
    );
}

function ActivityCard({ item, campusLabel, onFeedItemClick, onSignalClick, onReportClick }) {
    const handleClick = () => {
        onFeedItemClick?.(item);
        if (item._kind === 'signal') onSignalClick?.(item.data);
        else onReportClick?.(item.data);
    };

    if (item._kind === 'signal') {
        const color = moodColors[item.mood];
        const emoji = moodEmojis[item.mood];
        const text = (item.note || '').length > 60 ? (item.note || '').slice(0, 60) + '…' : (item.note || '');
        const loc = item.location_label ? ` · ${item.location_label}` : '';
        return (
            <button type="button" className="activity-card-item" onClick={handleClick}>
                <span className="activity-card-icon" style={{ color }}>🌊</span>
                <div className="activity-card-body">
                    <span className="activity-card-label" style={{ color }}>{emoji} {item.mood}</span>
                    <p className="activity-card-text">"{text}"</p>
                    <span className="activity-card-loc">📍 {campusLabel}{loc}</span>
                    <span className="activity-card-meta">{formatDistance(item._distance)} · {getTimeAgo(item.created_at)}</span>
                </div>
            </button>
        );
    }

    const typeInfo = staticTypes[item.type] || staticTypes.other;
    const sevColor = severityColors[item.severity];
    const text = (item.title || '').length > 60 ? (item.title || '').slice(0, 60) + '…' : (item.title || '');
    const loc = item.location_label ? ` · ${item.location_label}` : '';
    return (
        <button type="button" className="activity-card-item static" onClick={handleClick}>
            <span className="activity-card-icon" style={{ color: sevColor }}>⚡</span>
            <div className="activity-card-body">
                <span className="activity-card-label" style={{ color: sevColor }}>{typeInfo.icon} {item.type} {item.severity ? `[${item.severity}]` : ''}</span>
                <p className="activity-card-text">"{text}"</p>
                <span className="activity-card-loc">📍 {campusLabel}{loc}</span>
                <span className="activity-card-meta">{formatDistance(item._distance)} · {getTimeAgo(item.created_at)}</span>
            </div>
        </button>
    );
}

// ─── My Drops: localStorage, both kinds, status badge, edit note, delete ───
function MyDropsTab({ drops, onEditDrop, onDeleteDrop, onSignalClick, onReportClick, onFeedItemClick }) {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleStartEdit = (drop) => {
        const field = drop.kind === 'signal' ? 'note' : 'description';
        const val = drop.data?.[field] ?? '';
        setEditingId(drop.id);
        setEditValue(val);
    };

    const handleSaveEdit = (drop) => {
        const field = drop.kind === 'signal' ? 'note' : 'description';
        onEditDrop?.(drop.id, field, editValue);
        setEditingId(null);
        setEditValue('');
    };

    const getStatusBadge = (drop) => {
        if (drop.edited) return 'edited';
        if (drop.kind === 'static' && drop.data?.status === 'resolved') return 'resolved';
        if (drop.kind === 'signal') {
            const exp = drop.data?.expires_at ? new Date(drop.data.expires_at).getTime() : 0;
            if (exp && Date.now() > exp) return 'fading';
        }
        return 'active';
    };

    if (!drops?.length) {
        return (
            <div className="mydrops-tab">
                <div className="activity-empty">
                    <span>📝</span>
                    <p>your dropped signals and reports appear here.</p>
                    <p className="muted">saved locally in your browser.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mydrops-tab">
            {drops.map(drop => (
                <div key={drop.id} className="mydrop-card">
                    <div className="mydrop-header">
                        <span className={`mydrop-status status-${getStatusBadge(drop)}`}>{getStatusBadge(drop)}</span>
                        <span className="mydrop-time">{getTimeAgo(drop.createdLocally || drop.data?.created_at)}</span>
                    </div>
                    {editingId === drop.id ? (
                        <div className="mydrop-edit">
                            <textarea
                                className="signal-input"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                rows={2}
                            />
                            <div className="mydrop-edit-actions">
                                <button type="button" className="mydrop-btn save" onClick={() => handleSaveEdit(drop)}>save</button>
                                <button type="button" className="mydrop-btn" onClick={() => { setEditingId(null); setEditValue(''); }}>cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="mydrop-content"
                                onClick={() => {
                                    onFeedItemClick?.(drop.kind === 'signal' ? { _kind: 'signal', ...drop.data } : { _kind: 'static', ...drop.data });
                                    if (drop.kind === 'signal') onSignalClick?.(drop.data);
                                    else onReportClick?.(drop.data);
                                }}
                            >
                                {drop.kind === 'signal' ? (
                                    <><span className="mydrop-emoji">{moodEmojis[drop.data?.mood] || '🌊'}</span> {drop.data?.mood}: {(drop.data?.note || '').slice(0, 80)}{(drop.data?.note?.length > 80 ? '…' : '')}</>
                                ) : (
                                    <><span className="mydrop-emoji">{staticTypes[drop.data?.type]?.icon || '⚡'}</span> {drop.data?.title}</>
                                )}
                            </button>
                            <div className="mydrop-actions">
                                <button type="button" className="mydrop-btn small" onClick={() => handleStartEdit(drop)}>edit note</button>
                                <button type="button" className="mydrop-btn small delete" onClick={() => onDeleteDrop?.(drop.id)}>delete</button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

