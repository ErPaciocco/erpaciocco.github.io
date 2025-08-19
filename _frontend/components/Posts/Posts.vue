<template>
    <div class="" v-scroll-animate>
        <Suspense>
            <div v-if="loaded.posts && loaded.categories" class="my-8">
                <Categories :categories="filters.posts.categories" />
                <div class="text-primary-light text-2xl flex flex-row flex-wrap justify-evenly items-center w-full">
                    <Post v-scroll-animate v-for="(post, k) in filters.posts.data.content"
                        class="my-4 md:w-96 cursor-pointer transform transition transition-transform hover:scale-105"
                        :key="k" :post="post" @click="goTo(post.url)" />
                </div>
                <div class="flex flex-row flex-no-wrap justify-evenly items-center m-4">
                    <div class="previous dark:text-blue-500 rubik text-3xl cursor-pointer" v-if="filters.posts.data.prev">
                        <a @click="fetchPage(filters.posts.page - 1)" data-toggle="tooltip" data-placement="top">
                            <FontAwesomeIcon :icon="faArrowCircleLeft" />
                        </a>
                    </div>
                    <div class="next dark:text-orange-500 rubik text-3xl cursor-pointer" v-if="filters.posts.data.next">
                        <a @click="fetchPage(filters.posts.page + 1)" data-toggle="tooltip" data-placement="top">
                            <FontAwesomeIcon :icon="faArrowCircleRight" />
                        </a>
                    </div>
                </div>
            </div>
            <div v-else class="text-primary-light text-2xl">
                <div class="spinner my-8 mx-auto"></div>
            </div>
        </Suspense>
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
<script async setup>
import { ref, watch } from 'vue';
import { useHash } from '../../utils/useHash';
import Categories from './Partials/Categories.vue';
import Post from './Partials/PostCard.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';

const hash = useHash();
window.location.hash = window.location.hash || '#posts/1';

const loaded = ref({
    posts: false,
    categories: false
});

const filters = ref({
    posts: {
        name: 'posts',
        data: {},
        page: 1,
        categories: [],
        selected: null
    }
});

const goTo = (url) => {
    window.location.href = url;
};

const fetchData =
    async (filter, page = null, category = null) => {
        return category ? await fetch(`/posts.json`).then(response => response.json()) : await fetch(`/${filter}/${page ?? ''}/${category ?? ''}/index.json`.replace(/\/+/g, '/')).then(response => response.json());
    };

const fetchPage = (page) => {
    hash.value = `#posts/${page}`;
};

const fetchCategories = async () => {
    return await fetch('/categories.json').then(response => response.json());
};

const populateFilters = async (path) => {
    const filter = path.filter;
    const page = path.page;
    const category = path.category;

    await Promise.all([
        fetchData(filter, page, category),
        fetchCategories()
    ]).then(([posts, categories]) => {
        posts.content = category ? posts.content.filter(p => p.categories.includes(category)) : posts.content;

        filters.value.posts.data = posts;
        filters.value.posts.page = page;
        filters.value.posts.categories = categories.content;

        loaded.value.posts = true;
        loaded.value.categories = true;
    });
};

watch(hash, async (newValue) => {
    if (newValue.match('#posts\\/\\d+(\\/[\\w\\s-]+)?')) {
        const path = newValue.substring(1).split('/');
        
        populateFilters({
            filter: path[0],
            page: new Number(path[1]),
            category: path[2]
        });
    }
}, { immediate: true });
</script>