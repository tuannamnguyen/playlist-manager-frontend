import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const fetchLyrics = async (song, artists) => {
    const error = ref(null);
    const lyrics = ref(null);
    const isPending = ref(true);

    try {
        const response = await fetch(`${apiServerUrl}/api/metadata/song_lyrics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ song, artists }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch song lyrics');
        }

        lyrics.value = await response.json();
    } catch (err) {
        console.error(`Error fetching lyrics for "${song}" by ${artists}:`, err);
        error.value = 'Could not fetch song lyrics';
    } finally {
        isPending.value = false;
    }

    return { error, isPending, lyrics };
};

export default fetchLyrics;
