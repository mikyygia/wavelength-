// Extract embed URL from Spotify or YouTube Music links

export function getSongEmbed(url) {
    if (!url) return null;

    // Spotify track
    // e.g. https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6
    const spotifyMatch = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
        return {
            type: 'spotify',
            embedUrl: `https://open.spotify.com/embed/track/${spotifyMatch[1]}?theme=0`,
        };
    }

    // YouTube / YouTube Music
    // e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ
    // e.g. https://music.youtube.com/watch?v=dQw4w9WgXcQ
    // e.g. https://youtu.be/dQw4w9WgXcQ
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
        return {
            type: 'youtube',
            embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
        };
    }

    // Unknown — just return the raw link
    return {
        type: 'link',
        embedUrl: url,
    };
}
