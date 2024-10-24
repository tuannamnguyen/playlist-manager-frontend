import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const exportPlaylistToCsv = async (playlistId) => {
    const error = ref(null);
    const isPending = ref(true);

    try {
        const response = await fetch(`${apiServerUrl}/api/playlists/${playlistId}/songs/csv`);

        if (!response.ok) {
            throw new Error('Failed to download playlist songs CSV');
        }

        // Get the filename from the Content-Disposition header, or use a default name
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/["']/g, '')
            : `playlist-${playlistId}-songs.csv`;

        // Create a blob from the response
        const blob = await response.blob();

        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // Append the link to the document, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the temporary URL
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error(`Error downloading playlist ${playlistId} songs CSV`, err);
        error.value = 'Could not download playlist songs CSV';
    } finally {
        isPending.value = false;
    }

    return { error, isPending };
};

export default exportPlaylistToCsv;
