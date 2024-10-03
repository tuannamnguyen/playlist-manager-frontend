const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;


async function fetchLyrics(song, artists) {
    const url = `${apiServerUrl}/api/metadata/song_lyrics`;
    const data = { song, artists };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching lyrics:', error);
        throw error;
    }
}
