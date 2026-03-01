export default function InstabilityIndex({ data }) {
    const { score, label, color, activeReports } = data;

    return (
        <div className="instability-index">
            <div className="instability-header">
                <span className="instability-score" style={{ color }}>{score}</span>
                <span className="instability-max">/ 100</span>
            </div>
            {/* <div className="instability-bar-bg">
                <div
                    className={`instability-bar-fill ${score > 80 ? 'critical-pulse' : ''}`}
                    style={{
                        width: `${score}%`,
                        background: color,
                        boxShadow: `0 0 12px ${color}88`,
                    }}
                />
            </div> */}
            <div className="instability-footer">
                <span className="instability-label" style={{ color }}>{label}</span>
                <span className="instability-reports">{activeReports} active</span>
            </div>
        </div>
    );
}
