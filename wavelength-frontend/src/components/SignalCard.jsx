import { useState, useEffect } from 'react';
import axios from 'axios';
import { moodColors, moodEmojis, isFadingSoon } from '../utils/moodColors';
import { getSongEmbed } from '../utils/songEmbed';
import { API_BASE } from '../config/api';

export default function SignalCard({ signal, onReact, onClose }) {
    const [replies, setReplies] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(false);
    const [reacted, setReacted] = useState({});
    const REACTED_KEY = 'wl-reacted-signals';

    const songEmbed = getSongEmbed(signal.song_url);
    const fading = isFadingSoon(signal.created_at, signal.expires_at);
    const color = moodColors[signal.mood] || '#C0CEEB';

    useEffect(() => {
        try {
            const all = JSON.parse(localStorage.getItem(REACTED_KEY) || '{}');
            const reactedForSignal = all[signal.id] || {};
            setReacted(reactedForSignal);
        } catch {
            setReacted({});
        }
    }, [signal.id]);

    useEffect(() => {
        if (showReplies) {
            axios.get(`${API_BASE}/signals/${signal.id}/replies`)
                .then(res => setReplies(res.data))
                .catch(err => console.error(err));
        }
    }, [showReplies, signal.id]);

    const handleReact = async (type) => {
        const action = reacted[type] ? 'remove' : 'add';
        await onReact(signal.id, type, action);
        setReacted(prev => {
            const next = { ...prev, [type]: action === 'add' };
            try {
                const all = JSON.parse(localStorage.getItem(REACTED_KEY) || '{}');
                all[signal.id] = next;
                localStorage.setItem(REACTED_KEY, JSON.stringify(all));
            } catch {
                // ignore localStorage failures
            }
            return next;
        });
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        try {
            const res = await axios.post(`${API_BASE}/signals/${signal.id}/replies`, { text: replyText.trim() });
            setReplies(prev => [...prev, res.data]);
            setReplyText('');
        } catch (err) {
            console.error(err);
        }
    };

    const timeAgo = () => {
        const diff = Date.now() - new Date(signal.created_at).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        return `${hrs}h ago`;
    };

    return (
        <div className="signal-card-overlay" onClick={onClose}>
            <div
                className="signal-card"
                onClick={e => e.stopPropagation()}
                style={{ '--card-color': color }}
            >
                <div className="card-header">
                    <div className="card-mood">
                        <span className="card-emoji">{moodEmojis[signal.mood]}</span>
                        <span className="card-mood-label">{signal.mood}</span>
                        {fading && <span className="fading-badge">fading soon</span>}
                    </div>
                    <div className="card-meta">
                        <span className="card-time">{timeAgo()}</span>
                        <button className="close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                <div className="card-note">
                    {signal.note}
                </div>

                {songEmbed && (
                    <div className="card-song">
                        {songEmbed.type === 'spotify' && (
                            <iframe
                                src={songEmbed.embedUrl}
                                width="100%"
                                height="80"
                                frameBorder="0"
                                allow="encrypted-media"
                                title="spotify"
                                style={{ borderRadius: 0, border: '1px solid var(--border)' }}
                            />
                        )}
                        {songEmbed.type === 'youtube' && (
                            <iframe
                                src={songEmbed.embedUrl}
                                width="100%"
                                height="80"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                title="youtube"
                                style={{ borderRadius: 0, border: '1px solid var(--border)' }}
                            />
                        )}
                        {songEmbed.type === 'link' && (
                            <a href={songEmbed.embedUrl} target="_blank" rel="noreferrer" className="song-link">
                                🎵 {songEmbed.embedUrl}
                            </a>
                        )}
                    </div>
                )}

                <div className="card-reactions">
                    <button
                        className={`reaction-btn ${reacted.felt ? 'reacted' : ''}`}
                        onClick={() => handleReact('felt')}
                    >
                        🌊 <span>{signal.reaction_felt}</span>
                    </button>
                    <button
                        className={`reaction-btn ${reacted.hug ? 'reacted' : ''}`}
                        onClick={() => handleReact('hug')}
                    >
                        🫂 <span>{signal.reaction_hug}</span>
                    </button>
                    <button
                        className={`reaction-btn ${reacted.heart ? 'reacted' : ''}`}
                        onClick={() => handleReact('heart')}
                    >
                        💛 <span>{signal.reaction_heart}</span>
                    </button>
                </div>

                <div className="card-replies-section">
                    <button
                        className="toggle-replies"
                        onClick={() => setShowReplies(!showReplies)}
                    >
                        {showReplies ? '▾ hide replies' : `▸ replies (${replies.length})`}
                    </button>

                    {showReplies && (
                        <>
                            <div className="replies-list">
                                {replies.length === 0 && <p className="no-replies">no replies yet. be the first.</p>}
                                {replies.map(r => (
                                    <div key={r.id} className="reply-item">
                                        <span className="reply-text">{r.text}</span>
                                        <span className="reply-time">
                                            {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <form className="reply-form" onSubmit={handleReply}>
                                <input
                                    className="reply-input"
                                    placeholder="leave a reply..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value.slice(0, 140))}
                                />
                                <button type="submit" className="reply-submit" disabled={!replyText.trim()}>→</button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
