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
    <div class="bg-[#111111] p-4 rounded-md hover:bg-[#252525] cursor-pointer m-2 w-64 h-80 flex flex-col">
        <div class="w-56 h-56 mx-auto overflow-hidden rounded-md flex-shrink-0">
            <img class="w-full h-full object-cover" :src="image" :alt="title">
        </div>
        <div class="flex flex-col justify-between flex-grow mt-2">
            <div>
                <div class="text-white font-semibold text-[17px] truncate">{{ title }}</div>
                <div class="text-gray-400 text-[14px] truncate">{{ subTitle }}</div>
            </div>
            <div class="text-gray-400 text-[14px] truncate">Created by {{ user }}</div>
        </div>
    </div>
</template>
