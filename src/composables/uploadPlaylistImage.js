import { ref } from "vue";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const uploadPlaylistImage = async (playlistId, imageFile) => {
    const error = ref(null);
    const isPending = ref(true);
    const imageUrl = ref(null);

    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(`${apiServerUrl}/api/playlists/${playlistId}/image`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload playlist image');
        }

        const result = await response.json();
        imageUrl.value = result.image_url;
        console.log('Uploaded playlist image:', imageUrl.value);
    } catch (err) {
        console.error('Error uploading playlist image:', err);
        error.value = 'Could not upload playlist image';
    } finally {
        isPending.value = false;
    }

    return { error, isPending, imageUrl };
};

export default uploadPlaylistImage;
