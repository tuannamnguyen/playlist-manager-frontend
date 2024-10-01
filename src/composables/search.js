import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const searchSongs = async (track, artist) => {
    const error = ref(null);
    const isPending = ref(true);
    const searchResults = ref(null);

    try {
        const response = await fetch(`${apiServerUrl}/api/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                track,
                artist
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to search songs');
        }

        searchResults.value = await response.json();
        console.log('Search results:', searchResults.value);
    } catch (err) {
        console.error('Error searching songs:', err);
        error.value = 'Could not search songs';
    } finally {
        isPending.value = false;
    }

    return { error, isPending, searchResults };
};

export default searchSongs;
