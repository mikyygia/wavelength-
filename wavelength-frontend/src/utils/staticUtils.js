// Static report type → display info
export const staticTypes = {
    threat: { label: 'threat', icon: '🚨', color: '#FF2222' },
    suspicious: { label: 'suspicious', icon: '👁️', color: '#FF6644' },
    harassment: { label: 'harassment', icon: '⚠️', color: '#FF8844' },
    infrastructure: { label: 'infrastructure', icon: '🔧', color: '#F9BD33' },
    crowd: { label: 'crowd', icon: '👥', color: '#C0CEEB' },
    other: { label: 'other', icon: '📋', color: '#888' },
};

export const severityColors = {
    critical: '#FF2222',
    high: '#FF6644',
    medium: '#F9BD33',
    low: '#C0CEEB',
};

export const severityLabels = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
};

export const statusLabels = {
    active: 'active',
    monitoring: 'monitoring',
    resolved: 'resolved',
};

export const typeList = Object.keys(staticTypes);
export const severityList = ['low', 'medium', 'high', 'critical'];

export function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

// Haversine distance — returns miles
export function distanceMiles(lat1, lng1, lat2, lng2) {
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(miles) {
    if (miles < 0.1) return `${Math.round(miles * 5280)} ft away`;
    return `${miles.toFixed(1)} mi away`;
}
