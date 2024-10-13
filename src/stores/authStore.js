import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        appleMusicToken: null,
    }),
    actions: {
        setAppleMusicToken(token) {
            this.appleMusicToken = token
        },
        clearAppleMusicToken() {
            this.appleMusicToken = null
        },

    },
    persist: true,
})
