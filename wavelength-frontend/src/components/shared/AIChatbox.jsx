export default function AIChatbox({ onClose }) {
    return (
        <div className="ai-chatbox-overlay" onClick={onClose}>
            <div className="ai-chatbox" onClick={e => e.stopPropagation()}>
                <div className="ai-chat-header">
                    <span className="ai-chat-title">⚡ wavelength ai</span>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="ai-chat-body">
                    <div className="ai-coming-soon">
                        <span className="ai-icon">🤖</span>
                        <p className="ai-prompt">ask how campus feels.</p>
                        <p className="ai-sub">coming soon.</p>
                    </div>
                </div>
                <div className="ai-chat-input-row">
                    <input
                        placeholder="ask wavelength..."
                        disabled
                        className="ai-input"
                    />
                    <button disabled className="ai-send">→</button>
                </div>
            </div>
        </div>
    );
}
