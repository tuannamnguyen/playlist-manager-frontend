<script setup>
import { ref, onMounted } from 'vue';
import HomeCard from '../components/HomeCard.vue';
import getAllPlaylists from "@/composables/getAllPlaylists";

const error = ref(null);
const isPending = ref(true);
const playlists = ref([]);

onMounted(async () => {
    try {
        const result = await getAllPlaylists();
        if (result === null) {
            error.value = "Unable to fetch playlists. Please try again later.";
        } else {
            playlists.value = result.playlists?.value || [];
            error.value = result.error?.value;
            console.log('Playlists in Home:', playlists.value); // Add this for debugging
        }
    } catch (e) {
        error.value = "An unexpected error occurred";
        console.error(e);
    } finally {
        isPending.value = false;
    }
});
</script>

<template>
    <div class="p-8">
        <button type="button" class="text-white text-2xl font-semibold hover:underline cursor-pointer">
            All playlists
        </button>

        <div class="py-1.5"></div>

        <div v-if="error" class="text-red-500">{{ error }}</div>

        <div v-else-if="isPending" class="text-white">Loading playlists...</div>

        <div v-else-if="playlists.length === 0" class="text-white">No playlists found. Create a new playlist to get
            started!</div>

        <div v-else class="flex items-center flex-wrap">
            <router-link v-for="playlist in playlists" :key="playlist.playlist_id"
                :to="{ name: 'PlaylistDetails', params: { id: playlist.playlist_id } }" class="m-2">
                <HomeCard :image="playlist.image_url" :title="playlist.playlist_name"
                    :subTitle="playlist.playlist_description || 'No description available'" :user="playlist.user_name"
                    :class="{
                        'md:block hidden': playlist.playlist_id === 3,
                        'lg:block hidden': playlist.playlist_id === 4,
                        'xl:block hidden': playlist.playlist_id === 5
                    }" />
            </router-link>
        </div>
    </div>
</template>
