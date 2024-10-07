import { ref } from 'vue';

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const createPlaylist = async (playlistData) => {
    const error = ref(null);
    const newPlaylist = ref(null);

    try {
        const formData = new FormData();

        // Append text fields
        formData.append('playlist_name', playlistData.playlist_name);
        formData.append('playlist_description', playlistData.playlist_description);
        formData.append('user_id', playlistData.user_id);
        formData.append('user_name', playlistData.user_name);

        // Append file if it exists
        if (playlistData.playlist_cover_image) {
            formData.append('playlist_cover_image', playlistData.playlist_cover_image);
        }

        const response = await fetch(`${apiServerUrl}/api/playlists`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        newPlaylist.value = data;
        console.log('New playlist created:', newPlaylist.value);
    } catch (err) {
        console.error('Error in createPlaylist:', err);
        error.value = err.message || 'An unexpected error occurred';
    }

    return { error, newPlaylist };
};

export default createPlaylist;
