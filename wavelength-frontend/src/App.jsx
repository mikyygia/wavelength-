import { useState, useEffect, useCallback } from 'react';
import CampusMap from './components/Map';
import DropSignalForm from './components/DropSignalForm';
import SignalCard from './components/SignalCard';
import StaticCard from './components/static/StaticCard';
import StaticReportForm from './components/static/StaticReportForm';
import Sidebar from './components/layout/Sidebar';
import FeedPanel from './components/layout/FeedPanel';
import AIChatbox from './components/shared/AIChatbox';
import RadiusPreview from './components/shared/RadiusPreview';
import { useSignals } from './hooks/useSignals';
import { useMoodAtmosphere } from './hooks/useMoodAtmosphere';
import { useStaticReports } from './hooks/useStaticReports';
import { useInstability } from './hooks/useInstability';
import { useGeocoder } from './hooks/useGeocoder';
import { useTheme } from './hooks/useTheme';
import { useMyDrops } from './hooks/useMyDrops';
import { useMapRef } from './hooks/useMapRef';
import { useCrimeNews } from './hooks/useCrimeNews';
import './App.css';

function App() {
  const geocoder = useGeocoder();
  const center = geocoder.location;
  const radiusMeters = center?.radius ?? 2000;

  const { signals, loading, dropSignal, reactToSignal } = useSignals(center, radiusMeters);
  const { dominantMood, moodPercentages, atmosphere } = useMoodAtmosphere(center, radiusMeters);
  const { reports, submitReport, confirmReport, resolveReport } = useStaticReports(center, radiusMeters);
  const instability = useInstability(center, radiusMeters);
  const { theme, toggleTheme } = useTheme();
  const { drops: myDrops, addDrop, editDrop, deleteDrop } = useMyDrops();
  const { setMap, flyTo, zoomIn, zoomOut } = useMapRef();
  const { articles: crimeNews, loading: crimeNewsLoading, error: crimeNewsError } = useCrimeNews(center);

  const [mode, setMode] = useState('all'); // 'all' | 'signals' | 'static' for Activity tab
  const [activeView, setActiveView] = useState('dashboard');
  const [feedCollapsed, setFeedCollapsed] = useState(false);
  const [feedTab, setFeedTab] = useState('summary');
  const [showPrefs, setShowPrefs] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const [dropPosition, setDropPosition] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showStaticForm, setShowStaticForm] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const handleMapReady = useCallback((map) => {
    setMapInstance(map);
    setMap(map);
  }, [setMap]);

  const [navTab, setNavTab] = useState('notes');

  useEffect(() => {
    if (navTab === 'notes') setMode('signals');
    else if (navTab === 'security') setMode('static');
    else setMode('all');
  }, [navTab]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'signals') setNavTab('notes');
    else if (newMode === 'static') setNavTab('security');
    else setNavTab('summary');
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'map') {
      setFeedCollapsed(true);
    } else {
      setFeedCollapsed(false);
    }
    setShowPrefs(false);
  };

  const handleTogglePrefs = () => {
    setShowPrefs((prev) => !prev);
    if (!showPrefs) {
      setFeedCollapsed(false);
      setActiveView('dashboard');
      setFeedTab('preferences');
    }
  };

  const handleMapClick = (latlng) => {
    if (navTab === 'security' || mode === 'static') {
      setShowStaticForm(latlng);
    } else {
      setDropPosition(latlng);
    }
  };

  const handleFeedItemClick = useCallback((item) => {
    const lat = item.lat ?? item.data?.lat;
    const lng = item.lng ?? item.data?.lng;
    if (lat != null && lng != null) {
      flyTo(lat, lng, 17, 1.2);
      setTimeout(() => {
        if (item._kind === 'signal' || item.kind === 'signal') setSelectedSignal(item.data ?? item);
        else setSelectedReport(item.data ?? item);
      }, 400);
    }
  }, [flyTo]);

  const handleDrop = async (signalData) => {
    const created = await dropSignal(signalData);
    addDrop('signal', { ...created, ...signalData });
  };

  const handleSubmitReport = async (reportData) => {
    const created = await submitReport(reportData);
    addDrop('static', created);
  };

  const handlePositionChange = useCallback((pos) => {
    if (pos?.lat != null && pos?.lng != null) {
      setDropPosition({ lat: pos.lat, lng: pos.lng });
      flyTo(pos.lat, pos.lng, 17);
    }
  }, [flyTo]);

  const handleStaticFormPositionChange = useCallback((pos) => {
    if (pos?.lat != null && pos?.lng != null) {
      setShowStaticForm({ lat: pos.lat, lng: pos.lng });
      flyTo(pos.lat, pos.lng, 17);
    }
  }, [flyTo]);

  const [clock, setClock] = useState('');
  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const panelOpen = !feedCollapsed && activeView === 'dashboard';
  const prefsTabActive = feedTab === 'preferences';

  return (
    <div className="app-shell" data-theme={theme}>
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        onTogglePrefs={handleTogglePrefs}
        showPrefs={showPrefs}
      />

      <FeedPanel
        signals={signals}
        reports={reports}
        crimeNews={crimeNews}
        crimeNewsLoading={crimeNewsLoading}
        crimeNewsError={crimeNewsError}
        mode={mode}
        onModeChange={handleModeChange}
        onSignalClick={(s) => setSelectedSignal(s)}
        onReportClick={(r) => setSelectedReport(r)}
        onFeedItemClick={handleFeedItemClick}
        instability={instability}
        moodPercentages={moodPercentages}
        dominantMood={dominantMood}
        moodTotal={atmosphere?.total ?? 0}
        collapsed={feedCollapsed || activeView === 'map'}
        onCollapse={() => setFeedCollapsed(true)}
        geocoder={geocoder}
        theme={theme}
        onThemeToggle={toggleTheme}
        myDrops={myDrops}
        onEditDrop={editDrop}
        onDeleteDrop={deleteDrop}
        onOpenStaticForm={() => setShowStaticForm({ lat: center.lat, lng: center.lng })}
        feedTab={feedTab}
        onFeedTabChange={setFeedTab}
      />

      {(feedCollapsed || activeView === 'map') && (
        <button
          className="feed-expand"
          onClick={() => { setFeedCollapsed(false); setActiveView('dashboard'); }}
          title="expand feed"
        >
          ›
        </button>
      )}

      <div className={`map-panel ${panelOpen ? 'with-feed' : 'full'}`}>
        <div className="map-nav">
          <div className="map-nav-tabs">
            {[
              { key: 'notes', label: 'Notes' },
              { key: 'security', label: 'Security' },
              { key: 'summary', label: 'Summary' },
            ].map((t) => (
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
            <span className="map-location">{center?.label ?? 'Area'}</span>
            <span className="map-clock">{clock}</span>
          </div>
        </div>

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
            mode={navTab === 'summary' ? 'summary' : navTab === 'notes' ? 'signals' : 'static'}
            center={center}
            theme={theme}
            onMapReady={handleMapReady}
          />
        )}

        {mapInstance && prefsTabActive && (
          <RadiusPreview
            map={mapInstance}
            center={center}
            radius={radiusMeters}
            visible={prefsTabActive}
          />
        )}

        <div className="map-float-btns map-float-top-right">
          <button
            className="float-btn add-btn"
            onClick={() => {
              const pos = { lat: center.lat, lng: center.lng };
              if (navTab === 'security') setShowStaticForm(pos);
              else setDropPosition(pos);
            }}
            title={navTab === 'security' ? 'report incident' : 'drop signal'}
          >
            +
          </button>
        </div>

        <div className="map-float-btns map-float-bottom-right">
          <button className="float-btn zoom-btn" onClick={zoomIn} title="zoom in">+</button>
          <button className="float-btn zoom-btn" onClick={zoomOut} title="zoom out">−</button>
          <button className="float-btn ai-btn" onClick={() => setShowAI(true)} title="wavelength ai">🤖</button>
        </div>

        <div className="tap-hint">
          <span>{navTab === 'security' ? 'tap the map to report an incident' : 'tap the map to drop a signal'}</span>
        </div>
      </div>

      {dropPosition && (
        <DropSignalForm
          position={dropPosition}
          onPositionChange={handlePositionChange}
          onDrop={handleDrop}
          onClose={() => setDropPosition(null)}
          mapFlyTo={flyTo}
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
          onPositionChange={handleStaticFormPositionChange}
          onSubmit={handleSubmitReport}
          onClose={() => setShowStaticForm(null)}
          mapFlyTo={flyTo}
        />
      )}

      {showAI && <AIChatbox onClose={() => setShowAI(false)} />}
    </div>
  );
}

export default App;
