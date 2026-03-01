export default function ThemeToggle({ theme, onToggle }) {
    return (
        <div className="theme-toggle">
            <span className="theme-label">theme</span>
            <button className="theme-pill" onClick={onToggle}>
                <span className={`theme-option ${theme === 'dark' ? 'active' : ''}`}>dark</span>
                <span className={`theme-option ${theme === 'light' ? 'active' : ''}`}>light</span>
            </button>
        </div>
    );
}