<template>
    <div class="md:m-4 m-2 cursor-pointer hover:scale-105 transform transition transition-transform w-full p-4 rounded-xl bg-linear-65 from-blue-800 to-blue-900 transition transition-colors hover:from-blue-900 hover:to-blue-800 min-h-48 flex flex-col justify-center items-center">
        <div
            class="w-full flex justify-center items-center">
            <div class="flex flex-row flex-wrap justify-evenly items-center"
                @click="openWindow(data.url)">
                <div class="w-24">
                    <img :src="imgMapping[data.image]" class="rounded-xl" :alt="data.name">
                </div>
                <div class="portfolio-box-caption pl-4">
                    <div class="text-[#f0f0f0] rubik text-sm">
                        <div class="select-none">
                            {{  data.name }}
                        </div>
                        <div class="select-none font-light">
                            {{  data.description }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <tags :data="tagsDecoded"></tags>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import Tags from './Tags.vue';
import img1 from '/images/portfolio/1.jpg';
import img2 from '/images/portfolio/2.jpg';
import img3 from '/images/portfolio/3.jpg';

const imgMapping = ref({
    '/images/portfolio/1.jpg': img1,
    '/images/portfolio/2.jpg': img2,
    '/images/portfolio/3.jpg': img3
});

const props = defineProps({
    data: {
        type: Object,
        required: true
    }
});

const tagsDecoded = props.data.tags.split(",");

const openWindow = (url) => {
    window.open(url, '_blank');
}
</script>