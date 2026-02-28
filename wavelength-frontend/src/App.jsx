import { useState } from 'react';
import CampusMap from './components/Map';
import DropSignalForm from './components/DropSignalForm';
import SignalCard from './components/SignalCard';
import MoodAtmosphere from './components/MoodAtmosphere';
import { useSignals } from './hooks/useSignals';
import { useMoodAtmosphere } from './hooks/useMoodAtmosphere';
import './App.css';

function App() {
  const { signals, loading, dropSignal, reactToSignal } = useSignals();
  const { dominantMood, moodPercentages, atmosphere } = useMoodAtmosphere();

  const [dropPosition, setDropPosition] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);

  const handleMapClick = (latlng) => {
    setDropPosition(latlng);
  };

  const handleDrop = async (signalData) => {
    await dropSignal(signalData);
  };

  const handleSignalClick = (signal) => {
    setSelectedSignal(signal);
  };

  return (
    <div className="app" data-mood={dominantMood || 'neutral'}>
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="logo">
            <span className="logo-icon">⚡</span>
            wavelength
          </h1>
        </div>
        <div className="header-right">
          <MoodAtmosphere
            moodPercentages={moodPercentages}
            dominantMood={dominantMood}
            total={atmosphere.total}
          />
        </div>
      </header>

      {/* Map */}
      <main className="app-main">
        {loading ? (
          <div className="loading-state">
            <div className="loading-pulse" />
            <span>scanning for signals...</span>
          </div>
        ) : (
          <CampusMap
            signals={signals}
            onMapClick={handleMapClick}
            onSignalClick={handleSignalClick}
            dominantMood={dominantMood}
          />
        )}
      </main>

      {/* Floating instruction */}
      <div className="tap-hint">
        <span>tap the map to drop a signal</span>
      </div>

      {/* Drop Signal Form Modal */}
      {dropPosition && (
        <DropSignalForm
          position={dropPosition}
          onDrop={handleDrop}
          onClose={() => setDropPosition(null)}
        />
      )}

      {/* Signal Card Modal */}
      {selectedSignal && (
        <SignalCard
          signal={selectedSignal}
          onReact={reactToSignal}
          onClose={() => setSelectedSignal(null)}
        />
      )}
    </div>
  );
}

export default App;
