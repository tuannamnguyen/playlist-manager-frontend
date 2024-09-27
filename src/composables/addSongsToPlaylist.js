import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const addSongsToPlaylist = async (playlistId, songs) => {
    const error = ref(null);
    const isPending = ref(true);
    const updatedPlaylist = ref(null);

    try {
        const response = await fetch(`${apiServerUrl}/api/playlists/${playlistId}/songs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(songs),
        });
        if (!response.ok) {
            throw new Error('Failed to add songs to playlist');
        }
        updatedPlaylist.value = await response.json();
        console.log('Added songs to playlist:', updatedPlaylist.value);
    } catch (err) {
        console.error('Error adding songs to playlist:', err);
        error.value = 'Could not add songs to playlist';
    } finally {
        isPending.value = false;
    }

    return { error, isPending, updatedPlaylist };
};

export default addSongsToPlaylist;
