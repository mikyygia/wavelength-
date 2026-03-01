import { useRef, useCallback } from 'react';

export function useMapRef() {
    const mapRef = useRef(null);

    const setMap = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const flyTo = useCallback((lat, lng, zoom = 17, duration = 1.2) => {
        if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], zoom, { duration });
        }
    }, []);

    const getCenter = useCallback(() => {
        if (mapRef.current) {
            const c = mapRef.current.getCenter();
            return { lat: c.lat, lng: c.lng };
        }
        return null;
    }, []);

    const zoomIn = useCallback(() => {
        if (mapRef.current) mapRef.current.zoomIn();
    }, []);

    const zoomOut = useCallback(() => {
        if (mapRef.current) mapRef.current.zoomOut();
    }, []);

    return { mapRef, setMap, flyTo, getCenter, zoomIn, zoomOut };
}
