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
            return player.value.seek(positionMs).then(() => {
                console.log(`Changed position to ${positionMs}ms`);
            }).catch((error) => {
                console.error('Failed to change position:', error);
            });
        } else {
            console.error('Player is not initialized');
            return Promise.reject('Player is not initialized');
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
        seekToPosition
    };
});
