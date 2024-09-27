import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const deletePlaylist = async (id) => {
    const error = ref(null);
    const isPending = ref(true);

    try {
        const response = await fetch(`${apiServerUrl}/api/playlists/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete playlist');
        }
        console.log('Deleted playlist:', id);
    } catch (err) {
        console.error('Error deleting playlist:', err);
        error.value = 'Could not delete playlist';
    } finally {
        isPending.value = false;
    }

    return { error, isPending };
};

export default deletePlaylist;
