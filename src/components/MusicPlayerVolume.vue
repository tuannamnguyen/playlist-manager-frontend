<script setup>
import { ref, onMounted, watch } from 'vue'
import VolumeMute from 'vue-material-design-icons/VolumeMute.vue';
import VolumeHigh from 'vue-material-design-icons/VolumeHigh.vue';
import { useSpotifyStore } from '@/stores/spotify';
import { storeToRefs } from 'pinia';

const spotifyStore = useSpotifyStore();
const { volume } = storeToRefs(spotifyStore);
const isHover = ref(false);
const volumeInput = ref(null);
const lastVolume = ref(50);
const currentVolume = ref(50);
onMounted(async () => {
    try {
        await spotifyStore.getVolume();
        currentVolume.value = volume?.value ?? 50;
    } catch (error) {
        console.error('Failed to initialize volume:', error);
    }
});

const handleVolumeChange = async (event) => {
    try {
        const newVolume = parseInt(event.target.value);
        currentVolume.value = newVolume;
        await spotifyStore.setVolume(newVolume);
    } catch (error) {
        console.error('Failed to set volume:', error);
    }
};

watch(() => volume?.value, (newVolume) => {
    if (newVolume !== undefined) {
        currentVolume.value = newVolume;
        if (volumeInput.value) {
            volumeInput.value.value = newVolume;
        }
    }
}, { immediate: true });

const handleVolumeIconClick = async () => {
    try {
        if (currentVolume.value > 0) {
            lastVolume.value = currentVolume.value;
            currentVolume.value = 0;
            await spotifyStore.setVolume(0);
        } else {
            currentVolume.value = lastVolume.value;
            await spotifyStore.setVolume(lastVolume.value);
        }
    } catch (error) {
        console.error('Failed to toggle volume:', error);
    }
};
</script>

<template>
    <div class="flex items-center">
        <button @click="handleVolumeIconClick" class="focus:outline-none">
            <VolumeMute v-if="currentVolume === 0" fillColor="#FFFFFF" :size="20" />
            <VolumeHigh v-else fillColor="#FFFFFF" :size="20" />
        </button>

        <div class="flex items-center ml-2 w-[150px] relative" @mouseenter="isHover = true"
            @mouseleave="isHover = false">
            <input :value="currentVolume" @input="handleVolumeChange" ref="volumeInput" type="range" min="0" max="100"
                class="
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
                    cursor-pointer
                " :class="{ 'rangeDotHidden': !isHover }">
            <div class="pointer-events-none absolute h-[4px] z-10 inset-y-0 left-0 w-0"
                :style="`width: ${currentVolume}%;`" :class="isHover ? 'bg-green-500' : 'bg-white'" />
            <div class="absolute h-[4px] z-[-0] inset-y-0 left-0 w-full bg-gray-500 rounded-full" />
        </div>
    </div>
</template>

<style scoped>
.rangeDotHidden[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0;
    height: 0;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    margin-top: -4px;
}

input[type="range"]::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    border: none;
}

input[type="range"]::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 2px;
    background: transparent;
}

input[type="range"]::-moz-range-track {
    height: 4px;
    border-radius: 2px;
    background: transparent;
}
</style>
