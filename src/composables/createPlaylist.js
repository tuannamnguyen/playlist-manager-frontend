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

        if (!response.ok) throw new Error('Failed to create playlist');

        newPlaylist.value = await response.json();
    } catch (err) {
        error.value = err.message;
    }

    return { error, newPlaylist };
};

export default createPlaylist;
