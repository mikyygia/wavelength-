import { useEffect } from 'react';
import { useMapEvents, MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { moodColors, moodEmojis, getSignalOpacity } from '../utils/moodColors';
import { severityColors, staticTypes } from '../utils/staticUtils';

const TILE_URLS = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
};

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Signal pin icon
function createMoodIcon(mood, opacity) {
    const color = moodColors[mood] || '#C0CEEB';
    const emoji = moodEmojis[mood] || '📍';
    const fading = opacity <= 0.4;

    return L.divIcon({
        className: 'signal-pin-icon',
        html: `
      <div class="pin-wrapper" style="opacity: ${opacity};">
        <div class="pin-glow" style="background: ${color}; box-shadow: 0 0 16px 4px ${color}88;"></div>
        <div class="pin-dot" style="background: ${color}; border: 2px solid ${color};">
          <span class="pin-emoji">${emoji}</span>
        </div>
        ${fading ? '<div class="pin-fading">fading</div>' : ''}
      </div>
    `,
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50],
    });
}

// Static report pin icon (angular, warning-style)
function createStaticIcon(type, severity, status) {
    const color = severityColors[severity] || '#FF4444';
    const typeInfo = staticTypes[type] || staticTypes.other;
    const resolved = status === 'resolved';

    return L.divIcon({
        className: 'static-pin-icon',
        html: `
      <div class="static-pin-wrapper" style="opacity: ${resolved ? 0.35 : 1}">
        <div class="static-pin-shape" style="
          border: 2px solid ${color};
          box-shadow: 0 0 12px ${color}88;
        ">
          <span class="static-pin-symbol">${typeInfo.icon}</span>
          ${resolved ? '<div class="resolved-check">✓</div>' : ''}
        </div>
        ${severity === 'critical' && !resolved ? '<div class="static-pin-pulse" style="border-color: ' + color + '"></div>' : ''}
      </div>
    `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
}

// Map click handler
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
}

// Expose Leaflet map instance to parent for flyTo / RadiusPreview
function MapRefSetter({ onMapReady }) {
    const map = useMap();
    useEffect(() => {
        onMapReady?.(map);
        return () => onMapReady?.(null);
    }, [map, onMapReady]);
    return null;
}

export default function CampusMap({
    signals,
    reports,
    onMapClick,
    onSignalClick,
    onReportClick,
    dominantMood,
    mode,
    center,
    theme = 'light',
    onMapReady,
}) {
    const glowColor = dominantMood ? moodColors[dominantMood] : '#C0CEEB';
    const showSignals = mode !== 'static';
    const showReports = mode !== 'signals';
    const dimSignals = mode === 'static';
    const dimReports = mode === 'signals';

    return (
        <div className="map-container" style={{ '--map-glow': glowColor }}>
            <div className="map-grid-overlay" />
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={16}
                className="campus-map"
                zoomControl={false}
                key={`${center.lat}-${center.lng}`}
            >
                <TileLayer
                    key={theme}
                    attribution='&copy; OpenStreetMap &copy; CARTO'
                    url={TILE_URLS[theme] || TILE_URLS.light}
                />
                {onMapReady && <MapRefSetter onMapReady={onMapReady} />}
                <MapClickHandler onMapClick={onMapClick} />

                {/* Signal pins */}
                {showSignals && signals.map(signal => {
                    const opacity = getSignalOpacity(signal.created_at, signal.expires_at);
                    const finalOpacity = dimSignals ? opacity * 0.35 : opacity;
                    const icon = createMoodIcon(signal.mood, finalOpacity);

                    return (
                        <Marker
                            key={`sig-${signal.id}`}
                            position={[signal.lat, signal.lng]}
                            icon={icon}
                            eventHandlers={{
                                click: () => onSignalClick(signal),
                            }}
                        />
                    );
                })}

                {/* Static report pins */}
                {showReports && reports.map(report => {
                    const icon = createStaticIcon(report.type, report.severity, report.status);

                    return (
                        <Marker
                            key={`rep-${report.id}`}
                            position={[report.lat, report.lng]}
                            icon={icon}
                            opacity={dimReports ? 0.35 : 1}
                            eventHandlers={{
                                click: () => onReportClick(report),
                            }}
                        />
                    );
                })}
            </MapContainer>
        </div>
    );
}
