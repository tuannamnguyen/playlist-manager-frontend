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
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.redirect_url) {
                    // Open the redirect URL in a new tab
                    window.open(data.redirect_url, '_blank');
                } else {
                    console.error('No redirect URL provided');
                    error.value = 'Could not fetch artist information';
                }
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
