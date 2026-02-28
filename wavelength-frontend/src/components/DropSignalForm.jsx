import { useState } from 'react';
import { moodList, moodEmojis, moodColors } from '../utils/moodColors';

export default function DropSignalForm({ onDrop, position, onClose }) {
    const [mood, setMood] = useState('');
    const [note, setNote] = useState('');
    const [songUrl, setSongUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mood || !note.trim()) return;
        setSubmitting(true);
        try {
            await onDrop({
                lat: position.lat,
                lng: position.lng,
                mood,
                note: note.trim(),
                song_url: songUrl.trim() || null,
            });
            onClose();
        } catch (err) {
            console.error(err);
            setSubmitting(false);
        }
    };

    return (
        <div className="drop-signal-overlay" onClick={onClose}>
            <div className="drop-signal-form" onClick={e => e.stopPropagation()}>
                <div className="form-header">
                    <span className="form-title">drop a signal</span>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="form-location">
                    <span className="label">location</span>
                    <span className="coords">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">how are you feeling?</label>
                        <div className="mood-grid">
                            {moodList.map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    className={`mood-btn ${mood === m ? 'active' : ''}`}
                                    style={{
                                        '--mood-color': moodColors[m],
                                        borderColor: mood === m ? moodColors[m] : 'var(--border)',
                                        background: mood === m ? `${moodColors[m]}22` : 'transparent',
                                    }}
                                    onClick={() => setMood(m)}
                                >
                                    <span className="mood-emoji">{moodEmojis[m]}</span>
                                    <span className="mood-label">{m}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">your signal <span className="char-count">{note.length}/280</span></label>
                        <textarea
                            className="signal-input"
                            placeholder="what's on your mind right now..."
                            value={note}
                            onChange={e => setNote(e.target.value.slice(0, 280))}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">attach a song <span className="optional">(optional)</span></label>
                        <input
                            className="signal-input"
                            type="url"
                            placeholder="spotify or youtube link..."
                            value={songUrl}
                            onChange={e => setSongUrl(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={!mood || !note.trim() || submitting}
                        style={{ '--mood-color': mood ? moodColors[mood] : 'var(--yellow)' }}
                    >
                        {submitting ? 'dropping...' : 'drop signal ⚡'}
                    </button>
                </form>
            </div>
        </div>
    );
}
