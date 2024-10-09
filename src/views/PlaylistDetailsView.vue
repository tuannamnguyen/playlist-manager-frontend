<script setup>
import addSongsToPlaylist from '@/composables/addSongsToPlaylist';
import deletePlaylist from '@/composables/deletePlaylist';
import deleteSongsFromPlaylist from '@/composables/deleteSongsFromPlaylist';
import getPlaylist from '@/composables/getPlaylist';
import getSongsInPlaylist from '@/composables/getSongsInPlaylist';
import searchSongs from '@/composables/search';
import fetchLyrics from '@/composables/fetchLyrics';
import { useAuth0 } from '@auth0/auth0-vue';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import ClockTimeThreeOutline from 'vue-material-design-icons/ClockTimeThreeOutline.vue';
import Close from 'vue-material-design-icons/Close.vue';
import DotsHorizontal from 'vue-material-design-icons/DotsHorizontal.vue';
import Heart from 'vue-material-design-icons/Heart.vue';
import Pause from 'vue-material-design-icons/Pause.vue';
import Play from 'vue-material-design-icons/Play.vue';
import Plus from 'vue-material-design-icons/Plus.vue';
import Loading from 'vue-material-design-icons/Loading.vue';
import { useRoute, useRouter } from 'vue-router';
import { useSongStore } from '../stores/song';
import { useArtistInfo } from '@/composables/artistInformation';


const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;


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
const router = useRouter();

const playlistId = route.params.id;

const error = ref(null);
const songs = ref([]);
const isPending = ref(false);
const playlist = ref({});
const { user } = useAuth0();

const sortBy = ref(null);
const sortOrder = ref(null);
const showSortMenu = ref(false);

const sortOptions = [
    { value: 's.song_name', label: 'Title' },
    { value: 'al.album_name', label: 'Album' },
    { value: 'pls.created_at', label: 'Date added' },
];

const fetchPlaylistData = async () => {
    try {
        const playlistResult = await getPlaylist(playlistId);
        playlist.value = playlistResult.playlist.value || {};
        error.value = playlistResult.error.value;

        const result = await getSongsInPlaylist(playlistId, sortBy.value, sortOrder.value);
        songs.value = result.songs.value || [];
        error.value = result.error.value;
    } catch (e) {
        error.value = "An unexpected error occurred";
        console.error(e);
    } finally {
        isPending.value = false;
    }
};

const toggleSortMenu = () => {
    showSortMenu.value = !showSortMenu.value;
};

const setSorting = (option) => {
    if (sortBy.value === option) {
        sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC';
    } else {
        sortBy.value = option;
        sortOrder.value = 'ASC';
    }
    showSortMenu.value = false;
    fetchPlaylistData();
};

const currentSortLabel = computed(() => {
    const option = sortOptions.find(opt => opt.value === sortBy.value);
    return option ? option.label : 'Sort by';
});



onMounted(async () => {
    await fetchPlaylistData();
    await checkSpotifyAuthStatus();
});

const ownership = computed(() => {
    return (
        playlist.value &&
        user.value &&
        user.value.sub == playlist.value.user_id
    );
});


const showSearchModal = ref(false);
const searchTrack = ref('');
const searchArtist = ref('');
const searchResults = ref([]);
const selectedSongs = ref([]);

const openSearchModal = () => {
    showSearchModal.value = true;
    searchTrack.value = '';
    searchArtist.value = '';
    searchResults.value = [];
    selectedSongs.value = [];
};

const closeSearchModal = () => {
    showSearchModal.value = false;
};

const toggleSongSelection = (song) => {
    const songKey = generateSongKey(song);
    const index = selectedSongs.value.findIndex(s => generateSongKey(s) === songKey);
    if (index > -1) {
        selectedSongs.value.splice(index, 1);
    } else {
        selectedSongs.value.push(song);
    }
};

const performSearch = async () => {
    if (searchTrack.value.trim() === '' && searchArtist.value.trim() === '') return;

    const { error, isPending, searchResults: results } = await searchSongs(searchTrack.value, searchArtist.value);

    if (error.value) {
        console.error('Search error:', error.value);
        // Handle error (e.g., show a notification to the user)
    } else {
        searchResults.value = results || [];
    }
};

const addSelectedSongsToPlaylist = async () => {
    if (selectedSongs.value.length === 0) return;

    const { error, isPending, updatedPlaylist } = await addSongsToPlaylist(playlistId, selectedSongs.value);

    if (error.value) {
        console.error('Error adding songs:', error.value);
    } else {
        console.log('Songs added successfully:', updatedPlaylist.value);
        await fetchPlaylistData();
        closeSearchModal();
    }
};

const generateSongKey = (song) => {
    const songName = song?.song_name ?? 'unknown';
    const artists = song?.artist_names?.join(',') ?? 'unknown';
    const albumName = song?.album_name ?? 'unknown';
    const isrc = song?.isrc ?? 'unknown';
    return `${songName}-${artists}-${albumName}-${isrc}`;
};


const formatArtists = (artists) => {
    return artists && artists.length > 0 ? artists.join(', ') : 'Unknown Artist';
};

const formatDuration = (ms) => {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
};

const isSongSelected = (song) => {
    return selectedSongs.value.some(s => generateSongKey(s) === generateSongKey(song));
};

const showDropdown = ref(false);

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const handleDeletePlaylist = async () => {
    if (confirm('Are you sure you want to delete this playlist?')) {
        try {
            await deletePlaylist(playlistId);
            // Redirect to home page after successful deletion
            router.push('/');
        } catch (error) {
            console.error('Error deleting playlist:', error);
            // Handle error (e.g., show an error message to the user)
        }
    }
};

const showPlaylistDropdown = ref(false);
const showSongDropdown = ref({});

const togglePlaylistDropdown = () => {
    showPlaylistDropdown.value = !showPlaylistDropdown.value;
};

const toggleSongDropdown = (songId) => {
    showSongDropdown.value = {
        ...showSongDropdown.value,
        [songId]: !showSongDropdown.value[songId]
    };
};

const deleteSongFromPlaylist = async (songId) => {
    if (confirm('Are you sure you want to remove this song from the playlist?')) {
        try {
            const { error, updatedPlaylist } = await deleteSongsFromPlaylist(playlistId, [songId]);
            if (error.value) {
                throw new Error(error.value);
            }
            await fetchPlaylistData();
        } catch (error) {
            console.error('Error removing song from playlist:', error);
            // Handle error (e.g., show an error message to the user)
        }
    }
};


const isSpotifyLoggedIn = ref(false);

const checkSpotifyAuthStatus = async () => {
    try {
        const response = await fetch(`${apiServerUrl}/api/oauth/check_auth/spotify`, {
            method: 'GET',
            credentials: 'include',
        });
        isSpotifyLoggedIn.value = response.ok;
    } catch (error) {
        console.error('Error checking Spotify auth status:', error);
        isSpotifyLoggedIn.value = false;
    }
};


const isConverting = ref(false);
const conversionSuccess = ref(false);
const conversionError = ref(null);

const convertToSpotify = async () => {
    if (!isSpotifyLoggedIn.value) {
        console.log('Please log in to Spotify first');
        return;
    }

    isConverting.value = true;
    conversionSuccess.value = false;
    conversionError.value = null;

    try {
        const response = await fetch(`${apiServerUrl}/api/playlists/${playlistId}/convert/spotify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ playlist_name: playlist.value.playlist_name })
        });

        if (!response.ok) {
            throw new Error('Failed to convert playlist');
        }

        const result = await response.json();
        console.log('Playlist converted successfully:', result);
        conversionSuccess.value = true;
    } catch (error) {
        console.error('Error converting playlist:', error);
        conversionError.value = error.message || 'An error occurred during conversion';
    } finally {
        isConverting.value = false;
    }
};

const showLyricsModal = ref(false);
const currentLyrics = ref('');
const currentSongForLyrics = ref(null);

const viewLyrics = async (song) => {
    currentSongForLyrics.value = song;
    showLyricsModal.value = true;
    const { error, isPending, lyrics } = await fetchLyrics(song.song_name, song.artist_names.join(', '));
    if (error.value) {
        currentLyrics.value = "Sorry, we couldn't fetch the lyrics for this song.";
    } else {
        currentLyrics.value = lyrics.value.lyrics;
    }
};

const closeLyricsModal = () => {
    showLyricsModal.value = false;
    currentLyrics.value = '';
    currentSongForLyrics.value = null;
};

const { fetchArtistInfo } = useArtistInfo();

const handleArtistClick = (artistName) => {
    fetchArtistInfo(artistName);
};

</script>

<template>
    <div class="p-8 overflow-x-hidden">
        <!-- Existing playlist header content -->
        <div class="py-1.5"></div>
        <div class="flex items-center w-full relative h-full">
            <img class="w-36 h-36 object-cover" :src="playlist.image_url">

            <div class="w-full ml-5">
                <div style="font-size: 33px;"
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

                <div class="text-gray-400 text-sm mt-2 mb-2">Created by {{ playlist.user_name }}</div>

                <div class="absolute flex gap-4 items-center justify-start bottom-0 mb-1.5">
                    <button class="p-1 rounded-full bg-white" @click="playFunc()">
                        <Play v-if="!isPlaying" fillColor="#181818" :size="25" />
                        <Pause v-else fillColor="#181818" :size="25" />
                    </button>
                    <button type="button">
                        <Heart fillColor="#1BD760" :size="30" />
                    </button>
                    <div class="relative">
                        <button @click="togglePlaylistDropdown" type="button">
                            <DotsHorizontal fillColor="#FFFFFF" :size="25" />
                        </button>
                        <div v-if="showPlaylistDropdown && ownership"
                            class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#282828] ring-1 ring-black ring-opacity-5">
                            <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <a href="#"
                                    class="block px-4 py-2 text-sm text-gray-300 hover:bg-[#3E3E3E] hover:text-white"
                                    role="menuitem" @click="handleDeletePlaylist">Delete Playlist</a>
                            </div>
                        </div>
                    </div>
                    <button type="button" @click="openSearchModal"
                        class="flex items-center bg-[#1BD760] text-black px-4 py-2 rounded-full text-sm font-bold">
                        <Plus :size="20" class="mr-2" />
                        Add song to playlist
                    </button>
                    <button type="button" @click="convertToSpotify" :class="[
                        'flex items-center px-4 py-2 rounded-full text-sm font-bold',
                        isSpotifyLoggedIn ? 'bg-[#1DB954] text-white cursor-pointer' : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    ]" :disabled="!isSpotifyLoggedIn || isConverting">
                        <span v-if="!isConverting">
                            {{ isSpotifyLoggedIn ? 'Convert to Spotify' : 'Log in to Spotify to Convert' }}
                        </span>
                        <Loading v-else class="animate-spin mr-2" :size="20" />
                        <span v-if="isConverting">Converting...</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="mt-6"></div>
        <!-- Updated song list header -->
        <div class="flex items-center justify-between px-4 pt-2 text-gray-400 text-sm">
            <div class="flex items-center flex-grow">
                <div class="w-[30px] text-right mr-4">#</div>
                <div class="flex-grow">Title</div>
                <div class="w-1/4">Album</div>
                <div class="w-1/5">Date added</div>
                <div class="w-[100px] text-right flex items-center justify-end">
                    <ClockTimeThreeOutline fillColor="#FFFFFF" :size="18" />
                </div>
            </div>
            <div class="relative ml-4">
                <button @click="toggleSortMenu"
                    class="flex items-center bg-[#282828] px-3 py-1 rounded-full text-white">
                    {{ currentSortLabel }}
                    <ChevronDown :size="20" class="ml-1" />
                </button>
                <div v-if="showSortMenu" class="absolute top-full right-0 mt-1 bg-[#282828] rounded-md shadow-lg z-50">
                    <div v-for="option in sortOptions" :key="option.value" @click="setSorting(option.value)"
                        class="px-4 py-2 hover:bg-[#3E3E3E] cursor-pointer whitespace-nowrap">
                        {{ option.label }}
                        <span v-if="sortBy === option.value" class="ml-2">
                            {{ sortOrder === 'ASC' ? '↑' : '↓' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="border-b border-b-[#2A2A2A] mt-2"></div>
        <div class="mb-4"></div>
        <ul class="w-full">
            <li v-for="(song, index) in songs" :key="song.song_id"
                class="flex items-center justify-between rounded-md hover:bg-[#2A2929] px-4 py-2">
                <div class="flex items-center w-full">
                    <div class="text-gray-400 font-semibold w-[30px] text-right mr-4">
                        {{ index + 1 }}
                    </div>
                    <img :src="song.image_url" alt="Album Cover" class="w-10 h-10 mr-4 rounded">
                    <div class="flex-grow">
                        <div class="text-white font-semibold">
                            {{ song.song_name }}
                        </div>
                        <div class="text-sm text-gray-400">
                            <span v-for="(artist, artistIndex) in song.artist_names" :key="artistIndex">
                                <span @click="handleArtistClick(artist)"
                                    class="cursor-pointer hover:underline hover:text-white">
                                    {{ artist }}
                                </span>
                                <span v-if="artistIndex < song.artist_names.length - 1">, </span>
                            </span>
                        </div>
                    </div>
                    <div class="text-sm text-gray-400 w-1/4">
                        {{ song.album_name }}
                    </div>
                    <div class="text-sm text-gray-400 w-1/5">
                        {{ song.created_at ? new Date(song.created_at).toLocaleDateString() : 'N/A' }}
                    </div>
                    <div class="text-sm text-gray-400 w-[100px] flex items-center justify-end">
                        <span class="mr-2">{{ formatDuration(song.duration) }}</span>
                        <div class="relative">
                            <button @click="toggleSongDropdown(song.song_id)" type="button" class="focus:outline-none">
                                <DotsHorizontal fillColor="#FFFFFF" :size="20" />
                            </button>
                            <div v-if="showSongDropdown[song.song_id]"
                                class="absolute right-0 bottom-full mb-2 w-48 rounded-md shadow-lg bg-[#282828] ring-1 ring-black ring-opacity-5 z-50">
                                <div class="py-1" role="menu" aria-orientation="vertical"
                                    aria-labelledby="options-menu">
                                    <a href="#"
                                        class="block px-4 py-2 text-sm text-gray-300 hover:bg-[#3E3E3E] hover:text-white"
                                        role="menuitem" @click.prevent="deleteSongFromPlaylist(song.song_id)">Remove
                                        from playlist</a>
                                    <a href="#"
                                        class="block px-4 py-2 text-sm text-gray-300 hover:bg-[#3E3E3E] hover:text-white"
                                        role="menuitem" @click.prevent="viewLyrics(song)">View Lyrics</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </li>
        </ul>

        <!-- Lyrics Modal -->
        <div v-if="showLyricsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-[#282828] p-8 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-white">
                        {{ currentSongForLyrics?.song_name }} - {{ currentSongForLyrics?.artist_names.join(', ') }}
                    </h2>
                    <button @click="closeLyricsModal" class="text-gray-400 hover:text-white">
                        <Close :size="24" />
                    </button>
                </div>
                <div class="text-white whitespace-pre-wrap">{{ currentLyrics }}</div>
            </div>
        </div>

        <!-- Search and Add Songs Modal -->
        <div v-if="showSearchModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-[#282828] p-8 rounded-lg w-full max-w-3xl">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-white">Add Songs to Playlist</h2>
                    <button @click="closeSearchModal" class="text-gray-400 hover:text-white">
                        <Close :size="24" />
                    </button>
                </div>
                <div class="mb-4 flex gap-4">
                    <input v-model="searchTrack" @keyup.enter="performSearch" placeholder="Song name"
                        class="bg-[#3E3E3E] text-white px-4 py-2 rounded-full flex-grow">
                    <input v-model="searchArtist" @keyup.enter="performSearch" placeholder="Artist name"
                        class="bg-[#3E3E3E] text-white px-4 py-2 rounded-full flex-grow">
                    <button @click="performSearch"
                        class="bg-[#1BD760] text-black px-6 py-2 rounded-full font-bold">Search</button>
                </div>
                <div class="bg-[#3E3E3E] text-white p-4 rounded-md mb-4 text-sm">
                    <strong>Tip:</strong> For better conversion results, choose songs with an ISRC when available to
                    help make conversion process more precise.
                </div>
                <div class="max-h-80 overflow-y-auto">
                    <div v-for="song in searchResults.value" :key="generateSongKey(song)"
                        class="flex items-center justify-between py-2 hover:bg-[#3E3E3E] px-4 rounded">
                        <div class="flex items-center">
                            <img :src="song.image_url || '/path/to/default-album-cover.jpg'"
                                :alt="`${song.song_name || 'Unknown Song'} cover`"
                                class="w-12 h-12 mr-4 object-cover rounded">
                            <div>
                                <div class="text-white font-semibold">{{ song.song_name || 'Unknown Song' }}</div>
                                <div class="text-gray-400 text-sm">{{ formatArtists(song.artist_names) }}</div>
                                <div class="text-gray-500 text-xs">
                                    {{ song.album_name || 'Unknown Album' }} • {{ formatDuration(song.duration) }}
                                </div>
                                <div class="text-gray-500 text-xs mt-1">
                                    ISRC: {{ song.isrc || 'Not available' }}
                                </div>
                            </div>
                        </div>
                        <button @click="toggleSongSelection(song)"
                            :class="isSongSelected(song) ? 'bg-[#1BD760] text-black' : 'bg-[#3E3E3E] text-white'"
                            class="px-4 py-1 rounded-full text-sm font-bold">
                            {{ isSongSelected(song) ? 'Selected' : 'Select' }}
                        </button>
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <button @click="addSelectedSongsToPlaylist"
                        class="bg-[#1BD760] text-black px-6 py-2 rounded-full font-bold"
                        :disabled="selectedSongs.length === 0">
                        Add Selected Songs ({{ selectedSongs.length }})
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- Conversion Loading Modal -->
    <div v-if="isConverting" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-[#282828] p-8 rounded-lg w-full max-w-md text-center">
            <Loading class="animate-spin mx-auto mb-4" :size="48" fillColor="#1DB954" />
            <h2 class="text-2xl font-bold text-white mb-4">Converting Playlist to Spotify</h2>
            <p class="text-gray-300">Please wait while we process your request...</p>
        </div>
    </div>

    <!-- Conversion Result Modal -->
    <div v-if="!isConverting && (conversionSuccess || conversionError)"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-[#282828] p-8 rounded-lg w-full max-w-md text-center">
            <h2 class="text-2xl font-bold mb-4" :class="conversionSuccess ? 'text-green-500' : 'text-red-500'">
                {{ conversionSuccess ? 'Conversion Successful!' : 'Conversion Failed' }}
            </h2>
            <p class="text-gray-300 mb-6">
                {{ conversionSuccess ? 'Your playlist has been successfully converted to Spotify.' : conversionError }}
            </p>
            <button @click="conversionSuccess = false; conversionError = null"
                class="bg-[#1DB954] text-white px-6 py-2 rounded-full font-bold">
                Close
            </button>
        </div>
    </div>

</template>

<style scoped>
.circle {
    width: 4px;
    height: 4px;
    background-color: rgb(189, 189, 189);
    border-radius: 100%;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}
</style>
