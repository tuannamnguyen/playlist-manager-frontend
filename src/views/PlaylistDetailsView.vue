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
import Plus from 'vue-material-design-icons/Plus.vue';
import Close from 'vue-material-design-icons/Close.vue';
import { useRoute } from 'vue-router';
import artist from '../artist.json';
import SongRow from '../components/SongRow.vue';
import { useSongStore } from '../stores/song';
import addSongsToPlaylist from '@/composables/addSongsToPlaylist';
import searchSongs from '@/composables/search';

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
const isPending = ref(false);
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

// New code for search and add functionality
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
    const index = selectedSongs.value.findIndex(s => s.song_name === song.song_name && s.artist_names.join(',') === song.artist_names.join(','));
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

const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
};

const addSelectedSongsToPlaylist = async () => {
    if (selectedSongs.value.length === 0) return;

    const { error, isPending, updatedPlaylist } = await addSongsToPlaylist(playlistId, selectedSongs.value);

    if (error.value) {
        console.error('Error adding songs:', error.value);
        // Handle error (e.g., show a notification to the user)
    } else {
        console.log('Songs added successfully:', updatedPlaylist.value);
        // Refresh the playlist data
        await fetchPlaylistData();
        closeSearchModal();
    }
};

const generateSongKey = (song) => {
    // Create a unique key using song name, artists, and album
    // Use optional chaining and nullish coalescing to handle potential undefined values
    const songName = song?.song_name ?? 'unknown';
    const artists = song?.artist_names?.join(',') ?? 'unknown';
    const albumName = song?.album_name ?? 'unknown';
    return `${songName}-${artists}-${albumName}`;
};

const formatArtists = (artists) => {
    return artists?.join(', ') ?? 'Unknown Artist';
};
const isSongSelected = (song) => {
    return selectedSongs.value.some(s => generateSongKey(s) === generateSongKey(song));
};
</script>

<template>
    <div class="p-8 overflow-x-hidden">
        <!-- Existing playlist header content -->
        <div class="py-1.5"></div>
        <div class="flex items-center w-full relative h-full">
            <img width="140" :src="artist.albumCover">

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
                    <button type="button" @click="openSearchModal"
                        class="flex items-center bg-[#1BD760] text-black px-4 py-2 rounded-full text-sm font-bold">
                        <Plus :size="20" class="mr-2" />
                        Add song to playlist
                    </button>
                </div>
            </div>
        </div>

        <div class="mt-6"></div>
        <!-- Existing song list header and content -->
        <div class="flex items-center justify-between px-4 pt-2 text-gray-400 text-sm">
            <div class="w-[30px] text-right mr-4">#</div>
            <div class="flex-grow">Title</div>
            <div class="w-1/4">Album</div>
            <div class="w-1/5">Date added</div>
            <div class="w-[50px] text-right">
                <ClockTimeThreeOutline fillColor="#FFFFFF" :size="18" />
            </div>
        </div>
        <div class="border-b border-b-[#2A2A2A] mt-2"></div>
        <div class="mb-4"></div>
        <ul class="w-full">
            <SongRow v-for="(song, index) in songs" :key="song.song_id" :song="song" :index="index + 1" />
        </ul>

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
                <div class="max-h-80 overflow-y-auto">
                    <div v-for="song in searchResults" :key="generateSongKey(song)"
                        class="flex items-center justify-between py-2 hover:bg-[#3E3E3E] px-4 rounded">
                        <div class="flex items-center">
                            <img :src="song.image_url" alt="Album cover" class="w-12 h-12 mr-4">
                            <div>
                                <div class="text-white font-semibold">{{ song.song_name || 'Unknown Song' }}</div>
                                <div class="text-gray-400 text-sm">{{ formatArtists(song.artist_names) }}</div>
                                <div class="text-gray-500 text-xs">{{ song.album_name || 'Unknown Album' }} • {{
                                    formatDuration(song.duration) }}</div>
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
</template>

<style scoped>
.circle {
    width: 4px;
    height: 4px;
    background-color: rgb(189, 189, 189);
    border-radius: 100%;
}
</style>
