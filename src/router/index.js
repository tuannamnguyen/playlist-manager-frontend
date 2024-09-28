import CallbackPage from '@/views/auth/CallbackPage.vue';
import LibraryView from '@/views/LibraryView.vue';
import { authGuard } from "@auth0/auth0-vue";
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: authGuard,
    },
    {
      path: "/playlists/:id",
      name: "PlaylistDetails",
      component: LibraryView,
      props: true,
      beforeEnter: authGuard,
    },
    {
      path: "/playlists/create",
      name: "CreatePlaylist",
      component: LibraryView,
      beforeEnter: authGuard,
    },
    {
      path: "/playlists/user",
      name: "UserPlaylists",
      component: LibraryView,
      beforeEnter: authGuard,
    },
    {
      path: "/callback",
      name: "Callback",
      component: CallbackPage
    }
  ]
})

export default router
