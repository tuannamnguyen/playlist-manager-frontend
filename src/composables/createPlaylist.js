import { ref } from 'vue';

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const createPlaylist = async (playlistData) => {
    const error = ref(null);
    const newPlaylist = ref(null);

    try {
        const response = await fetch(`${apiServerUrl}/api/playlists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playlistData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        newPlaylist.value = data;
        console.log(newPlaylist.value)
    } catch (err) {
        console.error('Error in createPlaylist:', err);
        error.value = err.message || 'An unexpected error occurred';
    }

    return { error, newPlaylist };
};

export default createPlaylist;
