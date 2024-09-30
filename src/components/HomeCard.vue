<script setup>
import { toRefs } from 'vue'
import { RouterLink } from 'vue-router';

const props = defineProps({
    image: String,
    title: String,
    subTitle: String
})
const { image, title, subTitle } = toRefs(props)
</script>

<template>
        <div class="bg-[#111111] p-4 rounded-md hover:bg-[#252525] cursor-pointer m-2">
            <img class="rounded-md w-full h-48 object-cover" :src="image" :alt="title">
            <div class="text-white pt-4 font-semibold text-[17px]">{{ title }}</div>
            <div class="text-gray-400 pt-1 pb-3 text-[14px]">{{ subTitle }}</div>
        </div>
</template>
