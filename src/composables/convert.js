import { ref } from 'vue';

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

// Function to convert a playlist to a specific service
export const convertPlaylist = async (playlistId, service, playlistName) => {
    const error = ref(null);
    const isPending = ref(true);
    const conversionResult = ref(null);

    try {
        // First, check if the user is authenticated by attempting to access the service
        const authCheckResponse = await fetch(`${apiServerUrl}/api/oauth/check_auth/${service}`, {
            method: 'GET',
            credentials: 'include', // Include cookies for session validation
        });

        if (authCheckResponse.status === 401) {
            // If the user is not authenticated, redirect them to the OAuth login page
            window.location.href = `${apiServerUrl}/api/oauth/${service}`;
            return; // Stop further execution as the user will be redirected
        }

        // If the user is authenticated, proceed with playlist conversion
        const response = await fetch(`${apiServerUrl}/api/playlists/${playlistId}/convert/${service}`, {
            method: 'POST',
            credentials: 'include', // Include session/cookie information
            body: JSON.stringify({
                "playlist_name": playlistName
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to convert playlist to ${service}`);
        }

    } catch (err) {
        console.error(`Error converting playlist to ${service}:`, err);
        error.value = `Could not convert playlist to ${service}`;
    } finally {
        isPending.value = false;
    }

    return { error, isPending, conversionResult };
};
