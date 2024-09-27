import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const getPlaylist = async (id) => {
    const error = ref(null);
    const isPending = ref(true);
    const playlist = ref(null);

    try {
        const response = await fetch(`${apiServerUrl}/api/playlists/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch playlist');
        }
        playlist.value = await response.json();
        console.log('Fetched playlist:', playlist.value);
    } catch (err) {
        console.error('Error fetching playlist:', err);
        error.value = 'Could not fetch playlist';
    } finally {
        isPending.value = false;
    }

    return { error, isPending, playlist };
};

export default getPlaylist;
