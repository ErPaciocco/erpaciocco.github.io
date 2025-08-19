<template>
    <div class="categories">
        <h2 class="text-2xl font-bold text-primary-light mb-4">Categories</h2>
        <div class="flex flex-row flex-wrap justify-evenly md:justify-start items-center">
            <div v-for="(category, k) in categories" :key="k" class="m-4 px-2 py-1 bg-gray-600 rounded-xl transform transition-transform hover:scale-105">
                <a :href="`/blog/#posts/1/${encodeURIComponent(category)}/index.json`" class="text-primary-light">{{ category }}</a>
            </div>
        </div>
    </div>
</template>
<script setup>
defineProps({
    categories: {
        type: Array,
        required: true
    }
});
</script>