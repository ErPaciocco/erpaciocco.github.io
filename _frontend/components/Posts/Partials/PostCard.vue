<template>
    <div class="flex flex-col justify-center items-center">
        <div class="hidden bg-blue-600 bg-orange-600 bg-red-600 bg-green-600"></div>
        <div class="p-4 rounded-x">
            <img :src="imagesMap[post['header-img']]" :alt="post.title" class="mb-4 rounded-xl w-full" />
            <div class="category">
                <span class="text-sm text-[#f0f0f0] px-2 py-1 rounded-xl" :class="'bg-' + post.color + '-600'">{{ post.categories[0] }}</span>
            </div>
            <h2 class="text-2xl font-bold text-[#f0f0f0] mb-4">{{ post.title }}</h2>
            <p class="text-[#d0d0d0] mb-4" v-html="post.subtitle"></p>
            <div class="date text-sm text-[#d0d0d0] font-light">{{ new Date(post.date).toDateString() }}</div>
            <a :href="post.url" class="text-blue-400 hover:underline">Read more</a>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';


const images = import.meta.glob('@/images/posts/**/*.{jpg,jpeg,png,gif,webp}', { eager: true });

const imagesMap = ref({});
for (const path in images) {
  const fileName = path
  imagesMap.value[fileName] = images[path].default;
}

defineProps({
    post: {
        type: Object,
        required: true
    }
});
</script>