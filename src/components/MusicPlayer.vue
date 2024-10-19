<script setup>
import { ref, watch, onMounted } from 'vue'
import MusicPlayerVolume from '../components/MusicPlayerVolume.vue'
import Heart from 'vue-material-design-icons/Heart.vue';
import PictureInPictureBottomRight from 'vue-material-design-icons/PictureInPictureBottomRight.vue';
import Play from 'vue-material-design-icons/Play.vue';
import Pause from 'vue-material-design-icons/Pause.vue';
import SkipBackward from 'vue-material-design-icons/SkipBackward.vue';
import SkipForward from 'vue-material-design-icons/SkipForward.vue';

import { useArtistInfo } from '@/composables/artistInformation';
import { useSpotifyStore } from '../stores/spotify'
import { storeToRefs } from 'pinia';

const spotifyStore = useSpotifyStore()
const { is_active, player, current_track } = storeToRefs(spotifyStore)
const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;

let isHover = ref(false)
let isTrackTimeCurrent = ref(null)
let isTrackTimeTotal = ref(null)
let seeker = ref(null)
let seekerContainer = ref(null)
let range = ref(0)
let token = ref(null)

const checkAuthAndGetToken = async () => {
    try {
        const authResponse = await fetch(`${apiServerUrl}/api/oauth/check_auth/spotify`, {
            credentials: 'include'
        });

        if (authResponse.status === 401) {
            console.log('User not authenticated with Spotify');
            return false;
        }

        if (authResponse.status !== 200) {
            throw new Error('Failed to check authentication status');
        }

        const tokenResponse = await fetch(`${apiServerUrl}/api/oauth/token/spotify`, {
            credentials: 'include'
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to retrieve token');
        }

        const tokenData = await tokenResponse.json();
        token.value = tokenData.access_token;
        return true;
    } catch (error) {
        console.error('Error during authentication check or token retrieval:', error);
        return false;
    }
}

const initializeSpotifyPlayer = () => {
    const spotifyPlayer = new window.Spotify.Player({
        name: 'Playlist Manager Web Playback SDK',
        getOAuthToken: cb => { cb(token.value); },
        volume: 0.5
    });

    spotifyStore.setPlayer(spotifyPlayer);

    spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) {
            return;
        }

        spotifyStore.setTrack(state.track_window.current_track);
        spotifyStore.setPaused(state.paused);

        spotifyPlayer.getCurrentState().then(state => {
            (!state) ? spotifyStore.setActive(false) : spotifyStore.setActive(true)
        });
    });

    spotifyPlayer.connect();
}

onMounted(async () => {
    const isAuthenticated = await checkAuthAndGetToken();
    if (!isAuthenticated) {
        console.log('Authentication failed or user not logged in');
        return;
    }

    // Load Spotify SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = initializeSpotifyPlayer;

    if (seeker.value && seekerContainer.value) {
        seeker.value.addEventListener("change", function () {
            spotifyStore.player.getCurrentState().then((state) => {
                if (state) {
                    const time = Math.floor(state.duration * (seeker.value.value / 100));
                    console.log(`Seeking to: ${time}ms`);
                    spotifyStore.seekToPosition(time);
                }
            });
        });

        seeker.value.addEventListener("mousedown", function () {
            spotifyStore.pauseTrack();
        });

        seeker.value.addEventListener("mouseup", function () {
            spotifyStore.resumeTrack();
        });

        seekerContainer.value.addEventListener("click", function (e) {
            const clickPosition = (e.pageX - seekerContainer.value.offsetLeft) / seekerContainer.value.offsetWidth;
            spotifyStore.player.getCurrentState().then((state) => {
                if (state) {
                    const time = Math.floor(state.duration * clickPosition);
                    console.log(`Seeking to: ${time}ms`);
                    spotifyStore.seekToPosition(time);
                    seeker.value.value = clickPosition * 100;
                }
            });
        });
    }
})

const updateTrackTime = () => {
    spotifyStore.player.getCurrentState().then((state) => {
        if (state) {
            const currentTime = state.position;
            const totalTime = state.duration;

            const currentMinutes = Math.floor(currentTime / 60000);
            const currentSeconds = Math.floor((currentTime % 60000) / 1000);
            isTrackTimeCurrent.value = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;

            const totalMinutes = Math.floor(totalTime / 60000);
            const totalSeconds = Math.floor((totalTime % 60000) / 1000);
            isTrackTimeTotal.value = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;

            range.value = (currentTime / totalTime) * 100;
            seeker.value.value = range.value;
        }
    });
}

const { fetchArtistInfo } = useArtistInfo();
const handleArtistClick = (artistName) => {
    fetchArtistInfo(artistName);
};


watch(() => spotifyStore.isPlaying(), (newIsPlaying) => {
    if (newIsPlaying) {
        const intervalId = setInterval(updateTrackTime, 1000);
        spotifyStore.setIntervalId(intervalId);
    } else {
        clearInterval(spotifyStore.intervalId);
    }
})
</script>

<template>
    <div id="MusicPlayer" v-if="is_active" class="
            fixed
            flex
            items-center
            justify-between
            bottom-0
            w-full
            z-50
            h-[90px]
            bg-[#181818]
            border-t
            border-t-[#272727]
        ">
        <div class="flex items-center w-1/4">
            <div class="flex items-center ml-4">
                <img class="rounded-sm shadow-2xl" width="55" :src="current_track.album.images[0].url">
                <div class="ml-4">
                    <div class="text-[14px] text-white hover:underline cursor-pointer">
                        {{ current_track.name }}
                    </div>
                    <div class="text-[11px] text-gray-500 hover:underline hover:text-white cursor-pointer"
                        @click="handleArtistClick(current_track.artists[0].name)">
                        {{ current_track.artists[0].name }}
                    </div>
                </div>
            </div>
            <div class="flex items-center ml-8">
                <Heart fillColor="#1BD760" :size="20" />
                <PictureInPictureBottomRight class="ml-4" fillColor="#FFFFFF" :size="18" />
            </div>
        </div>

        <div class="max-w-[35%] mx-auto w-2/4 mb-3">
            <div class="flex-col items-center justify-center">
                <div class="buttons flex items-center justify-center h-[30px]">
                    <button class="mx-2">
                        <SkipBackward fillColor="#FFFFFF" :size="25" @click="spotifyStore.previousTrack" />
                    </button>
                    <button class="p-1 rounded-full mx-3 bg-white" @click="spotifyStore.togglePlay">
                        <Play v-if="!spotifyStore.isPlaying()" fillColor="#181818" :size="25" />
                        <Pause v-else fillColor="#181818" :size="25" />
                    </button>
                    <button class="mx-2">
                        <SkipForward fillColor="#FFFFFF" :size="25" @click="spotifyStore.nextTrack" />
                    </button>
                </div>

                <div class="flex items-center h-[25px]">
                    <div v-if="isTrackTimeCurrent" class="text-white text-[12px] pr-2 pt-[11px]">{{ isTrackTimeCurrent
                        }}</div>
                    <div ref="seekerContainer" class="w-full relative mt-2 mb-3" @mouseenter="isHover = true"
                        @mouseleave="isHover = false">
                        <input v-model="range" ref="seeker" type="range" class="
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
                            :style="`width: ${range}%;`" :class="isHover ? 'bg-green-500' : 'bg-white'" />
                        <div
                            class="absolute h-[4px] z-[-0] mt-[6px] inset-y-0 left-0 w-full bg-gray-500 rounded-full" />

                    </div>
                    <div v-if="isTrackTimeTotal" class="text-white text-[12px] pl-2 pt-[11px]">{{ isTrackTimeTotal }}
                    </div>
                </div>
            </div>
        </div>

        <div class="flex items-center w-1/4 justify-end pr-10">
            <MusicPlayerVolume />
        </div>
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
