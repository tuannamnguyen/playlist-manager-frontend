import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const createPlaylist = async (playlistName, userId, userName) => {
    const error = ref(null);
    const isPending = ref(true);
    const newPlaylist = ref(null);

    try {
        const response = await fetch(`${apiServerUrl}/api/playlists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playlist_name: playlistName,
                user_id: userId,
                user_name: userName
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to create playlist');
        }
        newPlaylist.value = await response.json();
        console.log('Created playlist:', newPlaylist.value);
    } catch (err) {
        console.error('Error creating playlist:', err);
        error.value = 'Could not create playlist';
    } finally {
        isPending.value = false;
    }

    return { error, isPending, newPlaylist };
};

export default createPlaylist;
