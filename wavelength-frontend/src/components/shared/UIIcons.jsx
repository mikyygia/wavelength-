export function DashboardIcon({ size = 16, strokeWidth = 1.8 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="8" height="8" rx="1.5" />
            <rect x="13" y="3" width="8" height="5" rx="1.5" />
            <rect x="13" y="10" width="8" height="11" rx="1.5" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" />
        </svg>
    );
}

export function MapPinIcon({ size = 16, strokeWidth = 1.8 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

export function SettingsIcon({ size = 16, strokeWidth = 1.8 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.3 3.3 9.5 5a1 1 0 0 1-.9.6l-1.9.2a1 1 0 0 0-.8.6l-.7 1.6a1 1 0 0 1-.7.6l-1.5.4a1 1 0 0 0-.6.5l-.9 1.6a1 1 0 0 0 0 1l.9 1.6a1 1 0 0 1 .1.8l-.4 1.5a1 1 0 0 0 .2.9l1.1 1.1a1 1 0 0 0 .9.2l1.5-.4a1 1 0 0 1 .8.1l1.6.9a1 1 0 0 0 1 0l1.6-.9a1 1 0 0 1 .8-.1l1.5.4a1 1 0 0 0 .9-.2l1.1-1.1a1 1 0 0 0 .2-.9l-.4-1.5a1 1 0 0 1 .1-.8l.9-1.6a1 1 0 0 0 0-1l-.9-1.6a1 1 0 0 1-.1-.8l.4-1.5a1 1 0 0 0-.2-.9l-1.1-1.1a1 1 0 0 0-.9-.2l-1.5.4a1 1 0 0 1-.8-.1L14.5 5a1 1 0 0 0-1 0l-1.6.9a1 1 0 0 1-.8.1L9.6 5.6a1 1 0 0 1-.7-.6l-.8-1.7" />
            <circle cx="12" cy="12" r="3.2" />
        </svg>
    );
}

export function WaveIcon({ size = 14, strokeWidth = 1.8 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
            <path d="M2 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
        </svg>
    );
}

export function AlertIcon({ size = 14, strokeWidth = 1.8 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3 2 20h20L12 3z" />
            <path d="M12 9v5" />
            <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function NewsIcon({ size = 14, strokeWidth = 1.8 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 8h6M7 12h10M7 16h10" />
            <circle cx="17.5" cy="8.5" r="1.5" />
        </svg>
    );
}
