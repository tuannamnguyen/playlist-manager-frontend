<script setup>
import { onMounted, ref, toRefs } from 'vue';
import Pause from 'vue-material-design-icons/Pause.vue';
import Play from 'vue-material-design-icons/Play.vue';
import { storeToRefs } from 'pinia';
import { useSongStore } from '../stores/song';

const useSong = useSongStore()
const { isPlaying, currentTrack } = storeToRefs(useSong)

let isHover = ref(false)
let isTrackTime = ref(null)
let formattedDate = ref('')

const props = defineProps({
    song: Object,
    index: Number,
})

const { song, index } = toRefs(props)

onMounted(() => {
    if (song.value && song.value.duration) {
        const durationInMS = song.value.duration;
        let duration = durationInMS / 1000;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        isTrackTime.value = minutes + ':' + seconds.toString().padStart(2, '0')
    } else {
        console.warn('Song duration not available');
        isTrackTime.value = '--:--';
    }

    if (song.value && song.value.created_at) {
        const date = new Date(song.value.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) {
            formattedDate.value = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
        } else {
            formattedDate.value = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }
})
</script>

<template>
    <li class="flex items-center justify-between rounded-md hover:bg-[#2A2929] px-4 py-2" @mouseenter="isHover = true"
        @mouseleave="isHover = false">
        <div class="flex items-center w-full">
            <div class="text-gray-400 font-semibold w-[30px] text-right mr-4">
                {{ index }}
            </div>
            <img :src="song.image_url" alt="Album Cover" class="w-10 h-10 mr-4 rounded">
            <div class="flex-grow">
                <div class="text-white font-semibold">
                    {{ song.song_name }}
                </div>
                <div class="text-sm text-gray-400">
                    {{ song.artist_names.join(', ') }}
                </div>
            </div>
            <div class="text-sm text-gray-400 w-1/4">
                {{ song.album_name }}
            </div>
            <div class="text-sm text-gray-400 w-1/5">
                {{ formattedDate }}
            </div>
            <div class="text-sm text-gray-400 w-[50px] text-right">
                {{ isTrackTime }}
            </div>
        </div>
    </li>
</template>

<style scoped>
li {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
li:last-child {
    border-bottom: none;
}
</style>
