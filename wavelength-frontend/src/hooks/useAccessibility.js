import { useState, useEffect } from 'react';

export function useAccessibility() {
    const [fontSize, setFontSize] = useState(
        () => localStorage.getItem('wl-fontsize') || 'default'
    );
    const [highContrast, setHighContrast] = useState(
        () => localStorage.getItem('wl-highcontrast') === 'true'
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-fontsize', fontSize);
        localStorage.setItem('wl-fontsize', fontSize);
    }, [fontSize]);

    useEffect(() => {
        document.documentElement.setAttribute('data-highcontrast', highContrast ? 'true' : 'false');
        localStorage.setItem('wl-highcontrast', highContrast.toString());
    }, [highContrast]);

    return { fontSize, setFontSize, highContrast, setHighContrast };
}
