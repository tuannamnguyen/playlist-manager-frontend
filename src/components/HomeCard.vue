<script setup>
import { toRefs } from 'vue';

const props = defineProps({
    image: String,
    title: String,
    subTitle: String,
    user: String
})
const { image, title, subTitle, user } = toRefs(props)
</script>

<template>
    <div class="bg-[#111111] p-4 rounded-md hover:bg-[#252525] cursor-pointer m-2">
        <div class="w-40 h-40 mx-auto overflow-hidden rounded-md">
            <img class="w-full h-full object-cover" :src="image" :alt="title">
        </div>
        <div class="text-white pt-4 font-semibold text-[17px]">{{ title }}</div>
        <div class="text-gray-400 pt-1 text-[14px]">{{ subTitle }}</div>
        <div class="text-gray-400 pt-1 pb-3 text-[14px]">Created by {{ user }}</div>
    </div>
</template>
