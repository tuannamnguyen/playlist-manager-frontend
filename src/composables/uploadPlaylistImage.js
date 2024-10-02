import { ref } from 'vue';

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

const uploadPlaylistImage = async (playlistId, imageFile) => {
    const error = ref(null);
    const imageUrl = ref(null);

    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(`${apiServerUrl}/api/playlists/${playlistId}/image`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Failed to upload image');

        const data = await response.json();
        imageUrl.value = data.image_url;
    } catch (err) {
        error.value = err.message;
    }

    return { error, imageUrl };
};

export default uploadPlaylistImage;
