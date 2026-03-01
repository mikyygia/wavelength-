import { DashboardIcon, MapPinIcon, SettingsIcon, ThemeIcon } from '../shared/UIIcons';

export default function Sidebar({ activeView, onViewChange, onTogglePrefs, showPrefs, theme, onThemeToggle }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                <button
                    className={`sidebar-btn ${activeView === 'dashboard' ? 'active' : ''}`}
                    onClick={() => onViewChange('dashboard')}
                    title="dashboard"
                >
                    <span className="sidebar-icon"><DashboardIcon size={18} /></span>
                    <span className="sidebar-label">dashboard</span>
                </button>
                <button
                    className={`sidebar-btn ${activeView === 'map' ? 'active' : ''}`}
                    onClick={() => onViewChange('map')}
                    title="map"
                >
                    <span className="sidebar-icon"><MapPinIcon size={18} /></span>
                    <span className="sidebar-label">map</span>
                </button>
            </div>
            <div className="sidebar-bottom">
                <button
                    className="sidebar-btn"
                    onClick={onThemeToggle}
                    title="toggle theme"
                >
                    <span className="sidebar-icon"><ThemeIcon size={18} /></span>
                    <span className="sidebar-label">{theme === 'dark' ? 'light' : 'dark'}</span>
                </button>
                <button
                    className={`sidebar-btn ${showPrefs ? 'active' : ''}`}
                    onClick={onTogglePrefs}
                    title="preferences"
                >
                    <span className="sidebar-icon"><SettingsIcon size={18} /></span>
                    <span className="sidebar-label">pref.</span>
                </button>
            </div>
        </aside>
    );
}
