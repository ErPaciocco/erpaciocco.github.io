<template>
    <div class="">
        <div v-if="loaded" class="text-primary-light text-2xl flex flex-row flex-wrap justify-evenly items-center w-full">
            <Post v-scroll-animate v-for="post in posts" class="my-4 md:w-96 cursor-pointer transform transition transition-transform hover:scale-105" :key="post.id" :post="post" @click="goTo(post.url)" />
        </div>
        <div v-else class="text-primary-light text-2xl">
            <div class="spinner my-8"></div>
        </div>
    </div>
</template>
<style scoped>
.spinner {
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-left-color: #fff;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
<script setup>
import { ref } from 'vue';
import Post from './Partials/PostCard.vue';

const loaded = ref(false);
const posts = ref([]);

const goTo = (url) => {
    // Navigate to the post's URL
    window.location.href = url;
};

fetch('/posts.json')
    .then(r => r.json())
    .then(data => {
        posts.value = data;
        loaded.value = true;
    })
</script>