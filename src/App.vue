<script setup>
import { ref, onMounted, watch } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import MenuItem from './components/MenuItem.vue';
import MusicPlayer from './components/MusicPlayer.vue';
import ChevronUp from 'vue-material-design-icons/ChevronUp.vue';
import ChevronDown from 'vue-material-design-icons/ChevronDown.vue';
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue';
import ChevronLeft from 'vue-material-design-icons/ChevronLeft.vue';
import { useAuth0 } from "@auth0/auth0-vue";
import getAllPlaylists from './composables/getAllPlaylists';

import { useSongStore } from './stores/song';
import { storeToRefs } from 'pinia';

const useSong = useSongStore();
const { isPlaying, currentTrack } = storeToRefs(useSong);
const { logout, user } = useAuth0();

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;
const developerToken = import.meta.env.VITE_APPLE_MUSIC_ACCESS_TOKEN;

const handleLogout = () =>
    logout({
        logoutParams: {
            returnTo: window.location.origin,
        }
    });

let musicKitInstance = null;

onMounted(async () => {
    checkSpotifyAuthStatus();
    isPlaying.value = false;

    try {
        window.MusicKit.configure({
            developerToken: developerToken,
            app: {
                name: 'Playlist Manager',
                build: '1.0',
            },
        });
        musicKitInstance = window.MusicKit.getInstance();
        console.log('MusicKit loaded:', musicKitInstance);

        // Check if user was previously logged in
        const storedLoginState = localStorage.getItem('appleMusicLoginState');
        if (storedLoginState === 'true') {
            // Attempt to reauthorize
            try {
                await musicKitInstance.authorize();
                isAppleMusicLoggedIn.value = true;
            } catch (error) {
                console.error('Failed to reauthorize Apple Music:', error);
                localStorage.removeItem('appleMusicLoginState');
            }
        }
    } catch (error) {
        console.error('Error configuring MusicKit:', error);
    }
});

let openMenu = ref(false)

// Updated code for fetching playlists
const playlists = ref([]);
const fetchPlaylists = async () => {
    if (user.value && user.value.sub) {
        const { error, isPending, playlists: fetchedPlaylists } = await getAllPlaylists(user.value.sub);
        if (!error.value) {
            playlists.value = fetchedPlaylists.value;
        } else {
            console.error('Error fetching playlists:', error.value);
        }
    } else {
        console.log('User data not available yet');
    }
};


const isSpotifyLoggedIn = ref(false);
const showSpotifyDropdown = ref(false);
const showAppleMusicDropdown = ref(false);

const checkSpotifyAuthStatus = async () => {
    try {
        const authCheckResponse = await fetch(`${apiServerUrl}/api/oauth/check_auth/spotify`, {
            method: 'GET',
            credentials: 'include', // Include cookies for session validation
        });
        isSpotifyLoggedIn.value = authCheckResponse.status === 200;
    } catch (error) {
        console.error('Failed to check Spotify auth status:', error);
        isSpotifyLoggedIn.value = false;
    }
};

const handleSpotifyLogin = async () => {
    if (!isSpotifyLoggedIn.value) {
        window.location.href = `${apiServerUrl}/api/oauth/spotify`;
    } else {
        showSpotifyDropdown.value = !showSpotifyDropdown.value;
    }
};
const handleSpotifyLogout = async () => {
    try {
        const response = await fetch(`${apiServerUrl}/api/oauth/logout/spotify`, {
            method: 'GET',
            credentials: 'include',
        });
        if (response.ok) {
            isSpotifyLoggedIn.value = false;
            showSpotifyDropdown.value = false;
            // You might want to show a success message here
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Error logging out from Spotify:', error);
        // You might want to show an error message here
    }
};

const isAppleMusicLoggedIn = ref(false);

const handleAppleMusicLogin = async () => {
    console.log('Attempting Apple Music login...');
    if (!isAppleMusicLoggedIn.value && musicKitInstance) {
        try {
            const token = await musicKitInstance.authorize();
            isAppleMusicLoggedIn.value = musicKitInstance.isAuthorized;
            console.log('Music User Token:', token);
            localStorage.setItem('appleMusicLoginState', 'true');
        } catch (error) {
            console.error('Error authorizing Apple Music:', error);
        }
    } else {
        showAppleMusicDropdown.value = !showAppleMusicDropdown.value;
    }
};

const handleAppleMusicLogout = async () => {
    if (isAppleMusicLoggedIn.value && musicKitInstance) {
        await musicKitInstance.unauthorize();
        isAppleMusicLoggedIn.value = false;
        showAppleMusicDropdown.value = false;
        localStorage.removeItem('appleMusicLoginState');
    }
};

// Watch for changes in the user object
watch(() => user.value, (newUser) => {
    if (newUser && newUser.sub) {
        fetchPlaylists();
    }
}, { immediate: true });
</script>

<template>
    <div>
        <div id="TopNav" class="
            w-[calc(100%-240px)]
            h-[60px]
            fixed
            right-0
            z-20
            bg-[#101010]
            bg-opacity-80
            flex
            items-center
            justify-between
          ">
            <div class="flex items-center ml-6">
                <button type="button" class="rounded-full bg-black p-[1px] cursor-pointer">
                    <ChevronLeft fillColor="#FFFFFF" :size="30" />
                </button>
                <button type="button" class="rounded-full bg-black p-[1px] hover:bg-[#] ml-4 cursor-pointer">
                    <ChevronRight fillColor="#FFFFFF" :size="30" />
                </button>
            </div>

            <div class="flex items-center">
                <div class="relative">
                    <button @click="handleSpotifyLogin"
                        :class="isSpotifyLoggedIn ? 'bg-[#1DB954] text-white' : 'bg-white text-black'"
                        class="px-4 py-2 rounded-full mr-4 hover:opacity-90">
                        {{ isSpotifyLoggedIn ? 'Logged in to Spotify' : 'Login to Spotify' }}
                    </button>
                    <div v-if="isSpotifyLoggedIn && showSpotifyDropdown"
                        class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#282828] ring-1 ring-black ring-opacity-5">
                        <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <a href="#"
                                class="block px-4 py-2 text-sm text-gray-300 hover:bg-[#3E3E3E] hover:text-white"
                                role="menuitem" @click="handleSpotifyLogout">Log out from Spotify</a>
                        </div>
                    </div>
                </div>

                <div class="relative mr-4">
                    <button @click="handleAppleMusicLogin"
                        :class="isAppleMusicLoggedIn ? 'bg-[#FC3C44] text-white' : 'bg-white text-black'"
                        class="px-4 py-2 rounded-full hover:opacity-90">
                        {{ isAppleMusicLoggedIn ? 'Logged in to Apple Music' : 'Login to Apple Music' }}
                    </button>
                    <div v-if="isAppleMusicLoggedIn && showAppleMusicDropdown"
                        class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#282828] ring-1 ring-black ring-opacity-5">
                        <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <a href="#"
                                class="block px-4 py-2 text-sm text-gray-300 hover:bg-[#3E3E3E] hover:text-white"
                                role="menuitem" @click="handleAppleMusicLogout">Log out from Apple Music</a>
                        </div>
                    </div>
                </div>

                <button @click="openMenu = !openMenu" :class="openMenu ? 'bg-[#282828]' : 'bg-black'"
                    class="bg-black hover:bg-[#282828] rounded-full p-0.5 mr-8 mt-0.5 cursor-pointer">
                    <div class="flex items-center">
                        <img class="rounded-full" width="27" :src="user.picture" alt="User profile">
                        <div class="text-white text-[14px] ml-1.5 font-semibold">{{ user.name }}</div>
                        <ChevronDown v-if="!openMenu" @click="openMenu = true" fillColor="#FFFFFF" :size="25" />
                        <ChevronUp v-else @click="openMenu = false" fillColor="#FFFFFF" :size="25" />
                    </div>
                </button>
            </div>

            <span v-if="openMenu"
                class="fixed w-[190px] bg-[#282828] shadow-2xl z-50 rounded-sm top-[52px] right-[35px] p-1 cursor-pointer">
                <ul class="text-gray-200 font-semibold text-[14px]">
                    <li class="px-3 py-2.5 hover:bg-[#3E3D3D]"><button @click="handleLogout">Log out</button></li>
                </ul>
            </span>
        </div>


        <div id="SideNav" class="h-[100%] p-6 w-[240px] fixed z-50 bg-black">
            <RouterLink to="/" class="text-white text-2xl font-semibold hover:underline cursor-pointer">
                Playlist manager
            </RouterLink>
            <div class="my-8"></div>
            <ul>
                <RouterLink to="/">
                    <MenuItem class="ml-[1px]" :iconSize="23" name="Home" iconString="home" pageUrl="/" />
                </RouterLink>
                <div class="py-3.5"></div>
                <RouterLink to="/playlists/create">
                    <MenuItem :iconSize="24" name="Create Playlist" iconString="playlist" pageUrl="/playlist" />
                </RouterLink>

                <MenuItem class="-ml-[1px]" :iconSize="27" name="Liked Songs" iconString="liked" pageUrl="/liked" />
            </ul>
            <div class="border-b border-b-gray-700"></div>
            <ul>
                <RouterLink v-for="playlist in playlists" :key="playlist.playlist_id"
                    :to="{ name: 'PlaylistDetails', params: { id: playlist.playlist_id } }" class="block">
                    <li class="font-semibold text-[13px] mt-3 text-gray-300 hover:text-white">
                        {{ playlist.playlist_name }}
                    </li>
                </RouterLink>
            </ul>
        </div>
    </div>

    <div class="
            fixed
            right-0
            top-0
            w-[calc(100%-240px)]
            overflow-auto
            h-full
            bg-gradient-to-b
            from-[#1C1C1C]
            to-black
        ">
        <div class="mt-[70px]"></div>
        <RouterView />
        <div class="mb-[100px]"></div>
    </div>

    <MusicPlayer v-if="currentTrack" />
</template>
