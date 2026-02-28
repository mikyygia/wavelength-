import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState(
        () => localStorage.getItem('wl-theme') || 'dark'
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('wl-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    return { theme, setTheme, toggleTheme };
}
