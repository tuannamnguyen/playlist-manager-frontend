<script setup>
import { ref, unref } from 'vue';
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
        // First, create the playlist
        const playlistData = {
            playlist_name: playlistName.value,
            playlist_description: playlistDescription.value,
            user_id: user.value.sub,
            user_name: user.value.name
        };

        const { error: createError, newPlaylist } = await createPlaylist(playlistData);

        // Safely unwrap createError if it's a ref
        const unrefedCreateError = unref(createError);

        if (unrefedCreateError) {
            throw new Error(typeof unrefedCreateError === 'string' ? unrefedCreateError : JSON.stringify(unrefedCreateError));
        }

        // Safely unwrap newPlaylist
        const unrefedPlaylist = unref(newPlaylist);

        // Check if the unrefed value is null or undefined
        if (!unrefedPlaylist) {
            throw new Error("Failed to create playlist: No playlist data returned");
        }

        // If playlist creation was successful and an image was selected, upload it
        if (unrefedPlaylist.playlist_id && selectedImage.value) {
            const { error: uploadError } = await uploadPlaylistImage(unrefedPlaylist.playlist_id, selectedImage.value);
            const unrefedUploadError = unref(uploadError);

            if (unrefedUploadError) {
                console.error("Image upload failed:", unrefedUploadError);
            }
        }

        // Redirect to the new playlist page or home page
        router.push('/');
    } catch (err) {
        console.error('Error in handleSubmit:', err);
        error.value = err.message || "An unexpected error occurred while creating the playlist";
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
                    class="w-full p-2 bg-[#282828] rounded text-white">
            </div>
            <div class="mb-4">
                <label for="playlistDescription" class="block mb-2">Description</label>
                <textarea id="playlistDescription" v-model="playlistDescription"
                    class="w-full p-2 bg-[#282828] rounded text-white" rows="3"></textarea>
            </div>
            <div class="mb-4">
                <label for="playlistImage" class="block mb-2">Playlist Image</label>
                <input id="playlistImage" type="file" @change="handleImageSelect" accept="image/*"
                    class="w-full p-2 bg-[#282828] rounded text-white">
            </div>
            <button type="submit" :disabled="isLoading"
                class="bg-[#1DB954] text-black font-bold py-2 px-4 rounded hover:bg-[#1ed760] disabled:opacity-50">
                {{ isLoading ? 'Creating...' : 'Create Playlist' }}
            </button>
        </form>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>
