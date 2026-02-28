import { useMemo } from 'react';
import { moodColors, moodEmojis } from '../utils/moodColors';

export default function MoodAtmosphere({ moodPercentages, dominantMood, total }) {
    const moodSummary = useMemo(() => {
        if (!dominantMood || total === 0) return 'campus is quiet right now. be the first signal.';
        const pct = moodPercentages.find(m => m.mood === dominantMood);
        return `campus is ${pct?.percentage || 0}% ${dominantMood} today`;
    }, [dominantMood, moodPercentages, total]);

    return (
        <div className="mood-atmosphere">
            <div className="atmosphere-text">
                <span className="atmosphere-icon">{dominantMood ? moodEmojis[dominantMood] : '📡'}</span>
                <span className="atmosphere-label">{moodSummary}</span>
            </div>
            {total > 0 && (
                <div className="atmosphere-bar">
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
            <div className="atmosphere-count">{total} active signal{total !== 1 ? 's' : ''}</div>
        </div>
    );
}
