import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { moodColors, moodEmojis, getSignalOpacity, isFadingSoon } from '../utils/moodColors';

// Fix default marker icon issue with Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create custom pin icon for each mood
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

// Map click handler component
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
}

export default function CampusMap({ signals, onMapClick, onSignalClick, dominantMood }) {
    // Default center — you can adjust to your campus
    // Using a generic campus location (UC Davis as example)
    const defaultCenter = [38.5382, -121.7617];
    const defaultZoom = 16;

    const glowColor = dominantMood ? moodColors[dominantMood] : '#C0CEEB';

    return (
        <div className="map-container" style={{ '--map-glow': glowColor }}>
            <div className="map-grid-overlay" />
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                className="campus-map"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <MapClickHandler onMapClick={onMapClick} />

                {signals.map(signal => {
                    const opacity = getSignalOpacity(signal.created_at, signal.expires_at);
                    const icon = createMoodIcon(signal.mood, opacity);

                    return (
                        <Marker
                            key={signal.id}
                            position={[signal.lat, signal.lng]}
                            icon={icon}
                            eventHandlers={{
                                click: () => onSignalClick(signal),
                            }}
                        />
                    );
                })}
            </MapContainer>
        </div>
    );
}
