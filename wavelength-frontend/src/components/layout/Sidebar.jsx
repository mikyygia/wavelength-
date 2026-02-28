export default function Sidebar({ activeView, onViewChange, onTogglePrefs, showPrefs }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                <button
                    className={`sidebar-btn ${activeView === 'dashboard' ? 'active' : ''}`}
                    onClick={() => onViewChange('dashboard')}
                    title="dashboard"
                >
                    <span className="sidebar-icon">⊞</span>
                    <span className="sidebar-label">feed</span>
                </button>
                <button
                    className={`sidebar-btn ${activeView === 'map' ? 'active' : ''}`}
                    onClick={() => onViewChange('map')}
                    title="map"
                >
                    <span className="sidebar-icon">⌖</span>
                    <span className="sidebar-label">map</span>
                </button>
            </div>
            <div className="sidebar-bottom">
                <button
                    className={`sidebar-btn ${showPrefs ? 'active' : ''}`}
                    onClick={onTogglePrefs}
                    title="preferences"
                >
                    <span className="sidebar-icon">⚙</span>
                    <span className="sidebar-label">prefs</span>
                </button>
            </div>
        </aside>
    );
}
