import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const getSongsInPlaylist = async (playlistId, sortBy = null, sortOrder = null) => {
    const error = ref(null);
    const songs = ref([]);
    const isPending = ref(true);

    try {
        const url = new URL(`${apiServerUrl}/api/playlists/${playlistId}/songs`);

        // Only add sorting parameters if both sortBy and sortOrder are provided
        if (sortBy && sortOrder) {
            // Validate sort parameters
            const validSortByValues = ['s.song_name', 'al.album_name', 'pls.created_at'];
            const validSortOrderValues = ['ASC', 'DESC'];

            if (validSortByValues.includes(sortBy) && validSortOrderValues.includes(sortOrder.toUpperCase())) {
                url.searchParams.append('sort_by', sortBy);
                url.searchParams.append('sort_order', sortOrder.toUpperCase());
            } else {
                console.warn('Invalid sorting parameters provided. Using default sorting.');
            }
        }

        const response = await fetch(url);
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
};

export default getSongsInPlaylist;
