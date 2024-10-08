import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSpotifyStore = defineStore('spotify', () => {
    // STATE
    const is_active = ref(false);
    const is_paused = ref(false);
    const player = ref(null);
    const current_track = ref({});
    const intervalId = ref(null);

    // GETTERS
    const isPlaying = () => !is_paused.value;

    // ACTIONS
    const setActive = (newValue) => {
        is_active.value = newValue;
    };
    const setPaused = (newValue) => {
        is_paused.value = newValue;
    };
    const setPlayer = (newValue) => {
        player.value = newValue;
    };
    const setTrack = (newValue) => {
        current_track.value = newValue;
    };
    const setIntervalId = (id) => {
        intervalId.value = id;
    };
    const togglePlay = () => {
        if (player.value) {
            player.value.togglePlay();
        }
    };
    const nextTrack = () => {
        if (player.value) {
            player.value.nextTrack();
        }
    };
    const previousTrack = () => {
        if (player.value) {
            player.value.previousTrack();
        }
    };
    const pauseTrack = () => {
        if (player.value) {
            player.value.pause();
        }
    };
    const resumeTrack = () => {
        if (player.value) {
            player.value.resume();
        }
    };
    const seekToPosition = (positionMs) => {
        if (player.value) {
            player.value.seek(positionMs).then(() => {
                console.log(`Seeked to position: ${positionMs}ms`);
            });
        }
    };

    const getVolume = async () => {
        if (player.value) {
            try {
                const state = await player.value.getState();
                volume.value = state.volume * 100; // Spotify uses 0-1 scale, we use 0-100
                return volume.value;
            } catch (error) {
                console.error('Failed to get volume:', error);
                return null;
            }
        }
        return null;
    };

    const setVolume = async (newVolume) => {
        if (player.value) {
            try {
                await player.value.setVolume(newVolume / 100); // Convert 0-100 to 0-1 scale
                volume.value = newVolume;
            } catch (error) {
                console.error('Failed to set volume:', error);
            }
        }
    };

    return {
        is_active,
        is_paused,
        player,
        current_track,
        intervalId,
        isPlaying,
        setActive,
        setPaused,
        setPlayer,
        setTrack,
        setIntervalId,
        togglePlay,
        nextTrack,
        previousTrack,
        pauseTrack,
        resumeTrack,
        seekToPosition,
        getVolume,
        setVolume,
    };
});
