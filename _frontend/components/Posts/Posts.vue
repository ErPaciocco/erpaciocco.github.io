<template>
    <div class="">
        <div v-if="loaded"
            class="text-primary-light text-2xl flex flex-row flex-wrap justify-evenly items-center w-full">
            <Post v-scroll-animate v-for="post in posts['pages']"
                class="my-4 md:w-96 cursor-pointer transform transition transition-transform hover:scale-105"
                :key="post.id" :post="post" @click="goTo(post.url)" />
        </div>
        <div v-else class="text-primary-light text-2xl">
            <div class="spinner my-8"></div>
        </div>
        <div class="flex flex-row flex-no-wrap justify-evenly items-center m-4">
            <div class="previous dark:text-blue-500 rubik text-3xl cursor-pointer" v-if="posts.prev">
                <a @click="fetchPage(paginator - 1)" data-toggle="tooltip" data-placement="top">
                    <FontAwesomeIcon :icon="faArrowCircleLeft" />
                </a>
            </div>
            <div class="next dark:text-orange-500 rubik text-3xl cursor-pointer" v-if="posts.next">
                <a @click="fetchPage(paginator + 1)" data-toggle="tooltip" data-placement="top">
                    <FontAwesomeIcon :icon="faArrowCircleRight" />
                </a>
            </div>
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';

const loaded = ref(false);
const posts = ref([]);

const hash = window.location.hash;
const number = hash ? parseInt(hash.substring(1), 10) : 1;

const paginator = ref(number);

const goTo = (url) => {
    // Navigate to the post's URL
    window.location.href = url;
};

const fetchPage = (page) => {
    fetch(`/posts/${page}.json`)
        .then(r => r.json())
        .then(data => {
            posts.value = data;
            loaded.value = true;
            window.location.hash = `#${page}`;
            paginator.value = page;
        })
}

fetchPage(paginator.value);
</script>