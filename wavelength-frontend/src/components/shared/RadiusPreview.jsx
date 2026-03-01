import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function RadiusPreview({ map, center, radius, visible }) {
    const circleRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!map || !center) return;

        if (!visible) {
            if (circleRef.current) {
                map.removeLayer(circleRef.current);
                circleRef.current = null;
            }
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = null;
            return;
        }

        // Remove old circle
        if (circleRef.current) {
            map.removeLayer(circleRef.current);
        }

        circleRef.current = L.circle([center.lat, center.lng], {
            radius: radius,
            color: '#F9BD33',
            fillColor: '#F9BD33',
            fillOpacity: 0.04,
            weight: 1.5,
            dashArray: '4 4',
        }).addTo(map);

        // Clear old timer
        if (timerRef.current) clearTimeout(timerRef.current);

        // Auto-hide after 3 seconds
        timerRef.current = setTimeout(() => {
            if (circleRef.current && map) {
                map.removeLayer(circleRef.current);
                circleRef.current = null;
            }
        }, 3000);

        return () => {
            if (circleRef.current && map) {
                map.removeLayer(circleRef.current);
                circleRef.current = null;
            }
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [map, center?.lat, center?.lng, radius, visible]);

    return null; // This is a Leaflet-managed overlay, no React DOM
}
