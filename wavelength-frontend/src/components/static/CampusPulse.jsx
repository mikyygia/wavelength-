// Spec: 0–20 calm --mist, 21–40 watch --yellow, 41–60 elevated #F97316, 61–80 high --red, 81–100 critical --red + pulse
const SCORE_STYLES = {
    calm: { color: 'var(--mist)' },
    watch: { color: 'var(--yellow)' },
    elevated: { color: '#F97316' },
    high: { color: 'var(--red)' },
    critical: { color: 'var(--red)' },
};

export default function CampusPulse({ data }) {
    const { score, label, activeReports } = data;
    const style = SCORE_STYLES[label] || SCORE_STYLES.calm;
    const isCritical = (score || 0) > 80;

    const getContext = (s) => {
        if (s === 0) return 'no reported activity nearby';
        if (s <= 20) return 'minimal activity in your area';
        if (s <= 40) return 'some activity - stay aware';
        if (s <= 60) return '↑ higher than usual activity';
        if (s <= 80) return '⚠ significant activity reported';
        return '🚨 high activity - exercise caution';
    };

    return (
        <div className={`instability-index campus-pulse-compact ${isCritical ? 'critical-pulse' : ''}`}>
            <div className="instability-header">
                <span className="instability-score" style={style}>{score}</span>
                <span className="instability-max">/ 100</span>
            </div>
            <div className="instability-footer">
                <span className="instability-label" style={style}>{label?.toUpperCase?.() ?? label}</span>
                <span className="instability-reports">{activeReports} active</span>
            </div>
            <div className="pulse-context-line">{getContext(score)}</div>
        </div>
    );
}
