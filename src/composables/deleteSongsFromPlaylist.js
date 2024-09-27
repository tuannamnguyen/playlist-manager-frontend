import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const deleteSongsFromPlaylist = async (playlistId, songIds) => {
    const error = ref(null);
    const isPending = ref(true);
    const updatedPlaylist = ref(null);

    try {
        const response = await fetch(`${apiServerUrl}/api/playlists/${playlistId}/songs`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ songs_id: songIds }),
        });
        if (!response.ok) {
            throw new Error('Failed to delete songs from playlist');
        }
        updatedPlaylist.value = await response.json();
        console.log('Deleted songs from playlist:', updatedPlaylist.value);
    } catch (err) {
        console.error('Error deleting songs from playlist:', err);
        error.value = 'Could not delete songs from playlist';
    } finally {
        isPending.value = false;
    }

    return { error, isPending, updatedPlaylist };
};

export default deleteSongsFromPlaylist;
