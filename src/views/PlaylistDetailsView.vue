<script setup>
import getSongsInPlaylist from '@/composables/getSongsInPlaylist';
import getPlaylist from '@/composables/getPlaylist';
import { useAuth0 } from '@auth0/auth0-vue';
import { storeToRefs } from 'pinia';
import { onMounted, ref, computed } from 'vue';
import ClockTimeThreeOutline from 'vue-material-design-icons/ClockTimeThreeOutline.vue';
import DotsHorizontal from 'vue-material-design-icons/DotsHorizontal.vue';
import Heart from 'vue-material-design-icons/Heart.vue';
import Pause from 'vue-material-design-icons/Pause.vue';
import Play from 'vue-material-design-icons/Play.vue';
import { useRoute } from 'vue-router';
import artist from '../artist.json';
import SongRow from '../components/SongRow.vue';
import { useSongStore } from '../stores/song';

const useSong = useSongStore()
const { isPlaying, currentTrack, currentArtist } = storeToRefs(useSong)

const playFunc = () => {
    if (currentTrack.value) {
        useSong.playOrPauseThisSong(currentArtist.value, currentTrack.value)
        return
    }
    useSong.playFromFirst()
}

const route = useRoute();
const playlistId = route.params.id;

const error = ref(null);
const songs = ref([]);
const playlist = ref({});
const { user } = useAuth0();

const fetchPlaylistData = async () => {
    try {
        const playlistResult = await getPlaylist(playlistId);
        playlist.value = playlistResult.playlist.value || {};
        error.value = playlistResult.error.value;

        const result = await getSongsInPlaylist(playlistId);
        songs.value = result.songs.value || [];
        error.value = result.error.value;
    } catch (e) {
        error.value = "An unexpected error occurred";
        console.error(e);
    } finally {
        isPending.value = false;
    }
};

onMounted(fetchPlaylistData);

const ownership = computed(() => {
    return (
        playlist.value &&
        user.value &&
        user.value.sub == playlist.value.user_id
    );
});
</script>

<template>
    <div class="p-8 overflow-x-hidden">
        <div class="py-1.5"></div>
        <div class="flex items-center w-full relative h-full">
            <img width="140" :src="artist.albumCover">

            <div class="w-full ml-5">
                <div style=" font-size: 33px;"
                    class="text-white absolute w-full hover:underline cursor-pointer top-0 font-bosemiboldld">
                    {{ playlist.playlist_name }}
                </div>

                <div class="text-gray-300 text-[13px] flex">
                    <div class="flex">Playlist</div>
                    <div class="ml-2 flex">
                        <div class="circle mt-2 mr-2" />
                        <span class="-ml-0.5">{{ songs.length }} songs</span>
                    </div>
                </div>

                <div class="absolute flex gap-4 items-center justify-start bottom-0 mb-1.5">
                    <button class="p-1 rounded-full bg-white" @click="playFunc()">
                        <Play v-if="!isPlaying" fillColor="#181818" :size="25" />
                        <Pause v-else fillColor="#181818" :size="25" />
                    </button>
                    <button type="button">
                        <Heart fillColor="#1BD760" :size="30" />
                    </button>
                    <button type="button">
                        <DotsHorizontal fillColor="#FFFFFF" :size="25" />
                    </button>
                </div>
            </div>
        </div>

        <div class="mt-6"></div>
        <div class="flex items-center justify-between px-5 pt-2">
            <div class="flex items-center justify-between text-gray-400">
                <div class="mr-7">#</div>
                <div class="text-sm">Title</div>
            </div>
            <div>
                <ClockTimeThreeOutline fillColor="#FFFFFF" :size="18" />
            </div>
        </div>
        <div class="border-b border-b-[#2A2A2A] mt-2"></div>
        <div class="mb-4"></div>
        <ul class="w-full" v-for="track, index in artist.tracks" :key="track">
            <SongRow :artist="artist" :track="track" :index="++index" />
        </ul>
    </div>
</template>

<style scoped>
.circle {
    width: 4px;
    height: 4px;
    background-color: rgb(189, 189, 189);
    border-radius: 100%;
}
</style>
