import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const getAllPlaylists = async (userId = null) => {
    const error = ref(null);
    const isPending = ref(true);
    const playlists = ref([]);

    try {
        let url = `${apiServerUrl}/api/playlists`;
        if (userId) {
            url += `?user_id=${encodeURIComponent(userId)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch playlists');
        }
        playlists.value = await response.json();
        console.log('Fetched playlists:', playlists.value);
    } catch (err) {
        console.error('Error fetching playlists:', err);
        error.value = 'Could not fetch playlists';
    } finally {
        isPending.value = false;
    }

    return { error, isPending, playlists };
};

export default getAllPlaylists;
