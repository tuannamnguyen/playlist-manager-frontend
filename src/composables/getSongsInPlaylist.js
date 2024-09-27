import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;


const getSongsInPlaylist = async (playlistId) => {
    const error = ref(null);
    const songs = ref([]);
    const isPending = ref(false);

    try {
        const response = await fetch(`${apiServerUrl}/api/playlists/${playlistId}/songs`);
        if (!response.ok) {
            throw new Error('Failed to fetch playlist songs');
        }
        songs.value = await response.json();
    } catch (err) {
        console.error(`Error fetching playlist ${playlistId} songs`, err);
        error.value = 'Could not fetch playlist songs';
    } finally {
        isPending.value = false;
    }

    return { error, isPending, songs };
}

export default getSongsInPlaylist
