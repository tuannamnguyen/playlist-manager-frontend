import { ref } from 'vue';

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

export function useArtistInfo() {
    const error = ref(null);
    const isLoading = ref(false);

    const fetchArtistInfo = async (artistName) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await fetch(`${apiServerUrl}/api/metadata/artist_information?artist_name=${encodeURIComponent(artistName)}`, {
                method: 'GET',
                redirect: 'follow' // This allows automatic redirection
            });

            if (response.redirected) {
                // If the API redirected, navigate to the new URL
                window.location.href = response.url;
            } else if (response.ok) {
                // If the API doesn't redirect but returns data directly
                const data = await response.json();
                console.log('Artist data:', data);
                // Handle the data as needed
            } else {
                throw new Error('Failed to fetch artist information');
            }
        } catch (err) {
            console.error('Error fetching artist information:', err);
            error.value = 'Could not fetch artist information';
        } finally {
            isLoading.value = false;
        }
    };

    return {
        fetchArtistInfo,
        error,
        isLoading
    };
}
