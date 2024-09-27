import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const getPlaylistSongs = async (playlistId) => {
    const error = ref(null);
    const isPending = ref(true);
    const songs = ref(null);

    try {
        const response = await fetch(`${apiServerUrl}/api/playlists/${playlistId}/songs`);
        if (!response.ok) {
            throw new Error('Failed to fetch playlist songs');
        }
        songs.value = await response.json();
        console.log('Fetched playlist songs:', songs.value);
    } catch (err) {
        console.error('Error fetching playlist songs:', err);
        error.value = 'Could not fetch playlist songs';
    } finally {
        isPending.value = false;
    }

    return { error, isPending, songs };
};

export default getPlaylistSongs;
