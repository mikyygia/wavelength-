// mood → color mapping
export const moodColors = {
    calm: '#C0CEEB',  // mist blue
    happy: '#F9BD33',  // yellow
    anxious: '#DAC8C7',  // dusty rose
    sad: '#2A377F',  // deep cobalt
    overwhelmed: '#E8A0A0',  // warm red-pink
    energized: '#F9BD33',  // yellow-gold
    lonely: '#ADD8E6',  // light blue
    grateful: '#B8D4B8',  // soft green
};

export const moodEmojis = {
    calm: '🌊',
    happy: '☀️',
    anxious: '💭',
    sad: '🌧️',
    overwhelmed: '🌀',
    energized: '⚡',
    lonely: '🫧',
    grateful: '🌿',
};

export const moodList = Object.keys(moodColors);

// Get opacity based on signal age (0-24hrs)
export function getSignalOpacity(createdAt, expiresAt) {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const expires = new Date(expiresAt).getTime();
    const total = expires - created;
    const elapsed = now - created;
    const ratio = elapsed / total;

    if (ratio < 0.25) return 1.0;      // 0–6h: full
    if (ratio < 0.5) return 0.85;      // 6–12h: slightly faded
    if (ratio < 0.75) return 0.6;      // 12–18h: faded
    return 0.4;                         // 18–24h: ghostly
}

export function isFadingSoon(createdAt, expiresAt) {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const expires = new Date(expiresAt).getTime();
    const ratio = (now - created) / (expires - created);
    return ratio >= 0.75;
}
