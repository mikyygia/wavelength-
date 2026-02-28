import { useState, useEffect } from 'react';
import CampusMap from './components/Map';
import DropSignalForm from './components/DropSignalForm';
import SignalCard from './components/SignalCard';
import StaticCard from './components/static/StaticCard';
import StaticReportForm from './components/static/StaticReportForm';
import Sidebar from './components/layout/Sidebar';
import FeedPanel from './components/layout/FeedPanel';
import AIChatbox from './components/shared/AIChatbox';
import AddressSearch from './components/shared/AddressSearch';
import ThemeToggle from './components/shared/ThemeToggle';
import { useSignals } from './hooks/useSignals';
import { useMoodAtmosphere } from './hooks/useMoodAtmosphere';
import { useStaticReports } from './hooks/useStaticReports';
import { useInstability } from './hooks/useInstability';
import { useGeocoder } from './hooks/useGeocoder';
import { useTheme } from './hooks/useTheme';
import './App.css';

function App() {
  const { signals, loading, dropSignal, reactToSignal } = useSignals();
  const { dominantMood, moodPercentages, atmosphere } = useMoodAtmosphere();
  const { reports, submitReport, confirmReport, resolveReport } = useStaticReports();
  const instability = useInstability();
  const geocoder = useGeocoder();
  const { theme, toggleTheme } = useTheme();

  // UI state
  const [mode, setMode] = useState('signals'); // 'signals' | 'static' | 'summary'
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'map'
  const [feedCollapsed, setFeedCollapsed] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Modal state
  const [dropPosition, setDropPosition] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showStaticForm, setShowStaticForm] = useState(null); // null or {lat, lng}

  // Navbar tab mapping
  const [navTab, setNavTab] = useState('notes'); // 'notes' | 'security' | 'summary'

  // Sync navTab and mode
  useEffect(() => {
    if (navTab === 'notes') setMode('signals');
    else if (navTab === 'security') setMode('static');
    else setMode('summary');
  }, [navTab]);

  // Sync mode to navTab
  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'signals') setNavTab('notes');
    else if (newMode === 'static') setNavTab('security');
    else setNavTab('summary');
  };

  // View toggle
  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'map') {
      setFeedCollapsed(true);
    } else {
      setFeedCollapsed(false);
    }
    setShowPrefs(false);
  };

  // Map click — context-aware
  const handleMapClick = (latlng) => {
    if (mode === 'static') {
      setShowStaticForm(latlng);
    } else {
      setDropPosition(latlng);
    }
  };

  // Drop signal
  const handleDrop = async (signalData) => {
    const created = await dropSignal(signalData);
    // Save to localStorage for Notes tab
    try {
      const existing = JSON.parse(localStorage.getItem('wl-my-signals') || '[]');
      existing.unshift({ ...signalData, id: created.id, created_at: created.created_at });
      localStorage.setItem('wl-my-signals', JSON.stringify(existing.slice(0, 50)));
    } catch { }
  };

  // Submit static report
  const handleSubmitReport = async (reportData) => {
    await submitReport(reportData);
  };

  // Live clock
  const [clock, setClock] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const panelOpen = !feedCollapsed && activeView === 'dashboard';

  return (
    <div className="app-shell" data-theme={theme}>
      {/* Panel 1 — Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        onTogglePrefs={() => setShowPrefs(!showPrefs)}
        showPrefs={showPrefs}
      />

      {/* Preferences drawer */}
      {showPrefs && (
        <div className="prefs-panel">
          <div className="prefs-header">
            <span className="prefs-title">preferences</span>
            <button className="close-btn" onClick={() => setShowPrefs(false)}>✕</button>
          </div>
          <AddressSearch geocoder={geocoder} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      )}

      {/* Panel 2 — Feed Panel */}
      <FeedPanel
        signals={signals}
        reports={reports}
        mode={mode}
        onModeChange={handleModeChange}
        onSignalClick={(s) => setSelectedSignal(s)}
        onReportClick={(r) => setSelectedReport(r)}
        instability={instability}
        moodPercentages={moodPercentages}
        dominantMood={dominantMood}
        moodTotal={atmosphere.total}
        collapsed={feedCollapsed || activeView === 'map'}
        onCollapse={() => setFeedCollapsed(true)}
      />

      {/* Expand chevron (when collapsed) */}
      {(feedCollapsed || activeView === 'map') && (
        <button
          className="feed-expand"
          onClick={() => { setFeedCollapsed(false); setActiveView('dashboard'); }}
          title="expand feed"
        >
          ›
        </button>
      )}

      {/* Panel 3 — Map Panel */}
      <div className={`map-panel ${panelOpen ? 'with-feed' : 'full'}`}>
        {/* Map top nav */}
        <div className="map-nav">
          <div className="map-nav-tabs">
            {[
              { key: 'notes', label: '🌊 notes', },
              { key: 'security', label: '⚡ security' },
              { key: 'summary', label: 'summary' },
            ].map(t => (
              <button
                key={t.key}
                className={`map-nav-tab ${navTab === t.key ? 'active' : ''}`}
                onClick={() => setNavTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="map-nav-info">
            <span className="map-location">{geocoder.location.label}</span>
            <span className="map-clock">{clock}</span>
          </div>
        </div>

        {/* Map */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-pulse" />
            <span>scanning for signals...</span>
          </div>
        ) : (
          <CampusMap
            signals={signals}
            reports={reports}
            onMapClick={handleMapClick}
            onSignalClick={(s) => setSelectedSignal(s)}
            onReportClick={(r) => setSelectedReport(r)}
            dominantMood={dominantMood}
            mode={mode === 'summary' ? 'summary' : mode}
            center={geocoder.location}
          />
        )}

        {/* Floating buttons */}
        <div className="map-float-btns">
          <button
            className="float-btn add-btn"
            onClick={() => {
              // Drop at map center
              const pos = { lat: geocoder.location.lat, lng: geocoder.location.lng };
              if (mode === 'static') setShowStaticForm(pos);
              else setDropPosition(pos);
            }}
            title={mode === 'static' ? 'report incident' : 'drop signal'}
          >
            +
          </button>
          <button
            className="float-btn ai-btn"
            onClick={() => setShowAI(true)}
            title="wavelength ai"
          >
            ⬜
          </button>
        </div>

        {/* Tap hint */}
        <div className="tap-hint">
          <span>{mode === 'static' ? 'tap the map to report an incident' : 'tap the map to drop a signal'}</span>
        </div>
      </div>

      {/* ── Modals ── */}
      {dropPosition && (
        <DropSignalForm
          position={dropPosition}
          onDrop={handleDrop}
          onClose={() => setDropPosition(null)}
        />
      )}

      {selectedSignal && (
        <SignalCard
          signal={selectedSignal}
          onReact={reactToSignal}
          onClose={() => setSelectedSignal(null)}
        />
      )}

      {selectedReport && (
        <StaticCard
          report={selectedReport}
          onConfirm={confirmReport}
          onResolve={resolveReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      {showStaticForm && (
        <StaticReportForm
          position={showStaticForm}
          onSubmit={handleSubmitReport}
          onClose={() => setShowStaticForm(null)}
        />
      )}

      {showAI && (
        <AIChatbox onClose={() => setShowAI(false)} />
      )}
    </div>
  );
}

export default App;
