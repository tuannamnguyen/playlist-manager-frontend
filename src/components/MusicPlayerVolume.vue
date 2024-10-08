<script setup>
import { ref, onMounted, watch } from 'vue'
import VolumeMute from 'vue-material-design-icons/VolumeMute.vue';
import VolumeHigh from 'vue-material-design-icons/VolumeHigh.vue';
import { useSpotifyStore } from '@/stores/spotify';
import { storeToRefs } from 'pinia';

const spotifyStore = useSpotifyStore();
const { volume } = storeToRefs(spotifyStore);

let isHover = ref(false);
let volumeInput = ref(null);

onMounted(async () => {
    // Initialize volume on component mount
    await spotifyStore.getVolume();

    volumeInput.value.addEventListener("input", async (e) => {
        await spotifyStore.setVolume(parseInt(e.currentTarget.value));
    });
});

// Watch for volume changes from other components
watch(volume, async (newVolume) => {
    if (volumeInput.value && volumeInput.value.value !== newVolume.toString()) {
        volumeInput.value.value = newVolume;
    }
});

const handleVolumeIconClick = async () => {
    if (volume.value > 0) {
        // Store the current volume before muting
        volumeInput.value.dataset.lastVolume = volume.value;
        await spotifyStore.setVolume(0);
    } else {
        // Restore the previous volume, or set to 50 if it was 0
        const lastVolume = parseInt(volumeInput.value.dataset.lastVolume) || 50;
        await spotifyStore.setVolume(lastVolume);
    }
};
</script>

<template>
    <div @click="handleVolumeIconClick" class="cursor-pointer">
        <VolumeMute v-if="volume === 0" fillColor="#FFFFFF" :size="20" />
        <VolumeHigh v-else fillColor="#FFFFFF" :size="20" />
    </div>
    <div class="flex items-center ml-2 w-[150px] relative mt-2 mb-[23px]" @mouseenter="isHover = true"
        @mouseleave="isHover = false">
        <input :value="volume" ref="volumeInput" type="range" min="0" max="100" class="
                mt-[24px]
                absolute
                rounded-full
                my-2
                w-full
                h-0
                z-40
                appearance-none
                bg-opacity-100
                focus:outline-none
                accent-white
            " :class="{ 'rangeDotHidden': !isHover }">
        <div class="pointer-events-none mt-[6px] absolute h-[4px] z-10 inset-y-0 left-0 w-0"
            :style="`width: ${volume}%;`" :class="isHover ? 'bg-green-500' : 'bg-white'" />
        <div class="absolute h-[4px] z-[-0] mt-[6px] inset-y-0 left-0 w-full bg-gray-500 rounded-full" />
    </div>
</template>

<style>
.rangeDotHidden[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0;
    height: 0;
}
</style>
