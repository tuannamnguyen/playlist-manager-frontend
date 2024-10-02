<script setup>
import { ref } from 'vue';
import { useAuth0 } from "@auth0/auth0-vue";
import { useRouter } from 'vue-router';
import uploadPlaylistImage from '@/composables/uploadPlaylistImage';
import createPlaylist from '@/composables/createPlaylist';

const router = useRouter();
const { user } = useAuth0();

const playlistName = ref('');
const playlistDescription = ref('');
const selectedImage = ref(null);
const isLoading = ref(false);
const error = ref(null);

const handleImageSelect = (event) => {
    selectedImage.value = event.target.files[0];
};

const handleSubmit = async () => {
    if (!playlistName.value) {
        error.value = "Playlist name is required";
        return;
    }

    isLoading.value = true;
    error.value = null;

    try {
        let imageUrl = null;
        if (selectedImage.value) {
            const { error: uploadError, isPending, imageUrl: uploadedImageUrl } = await uploadPlaylistImage(selectedImage.value);
            if (uploadError) throw new Error(uploadError);
            imageUrl = uploadedImageUrl;
        }

        const playlistData = {
            playlist_name: playlistName.value,
            playlist_description: playlistDescription.value,
            image_url: imageUrl,
            user_id: user.value.sub,
            user_name: user.value.name
        };

        const { error: createError, isPending, newPlaylist } = await createPlaylist(playlistData);
        if (createError) throw new Error(createError);

        // Redirect to the new playlist page or home page
        router.push('/');
    } catch (err) {
        error.value = err.message || "An error occurred while creating the playlist";
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="p-8 text-white">
        <h1 class="text-3xl font-bold mb-6">Create New Playlist</h1>
        <form @submit.prevent="handleSubmit" class="max-w-md">
            <div class="mb-4">
                <label for="playlistName" class="block mb-2">Playlist Name *</label>
                <input id="playlistName" v-model="playlistName" type="text" required
                    class="w-full p-2 bg-[#282828] rounded">
            </div>
            <div class="mb-4">
                <label for="playlistDescription" class="block mb-2">Description</label>
                <textarea id="playlistDescription" v-model="playlistDescription" class="w-full p-2 bg-[#282828] rounded"
                    rows="3"></textarea>
            </div>
            <div class="mb-4">
                <label for="playlistImage" class="block mb-2">Playlist Image</label>
                <input id="playlistImage" type="file" @change="handleImageSelect" accept="image/*"
                    class="w-full p-2 bg-[#282828] rounded">
            </div>
            <button type="submit" :disabled="isLoading"
                class="bg-[#1DB954] text-black font-bold py-2 px-4 rounded hover:bg-[#1ed760] disabled:opacity-50">
                {{ isLoading ? 'Creating...' : 'Create Playlist' }}
            </button>
        </form>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>
