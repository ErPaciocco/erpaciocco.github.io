<template>
    <Transition name="slide-fade">

        <div class="post-page" v-scroll-animate>
            <article>
                <div id="post" class="">
                    <div class="w-full flex flex-col justify-center items-center">
                        <div> <img class="rounded-xl text-center" :src="imagesMap[post['header-img']]"
                                alt="Post Image" /></div>
                        <div class="w-full max-w-5xl">
                            <div class="m-4 rubik text-primary-light font-light md:text-xl text-lg">
                                <Toc v-if="post.toc" />
                                <VueMarkdown :markdown="post.content"
                                    :rehype-plugins="[rehypeRaw, rehypeHighlight, remarkGfm]"
                                    :custom-attrs="customAttrs">
                                </VueMarkdown>
                            </div>
                            <div class="w-full">
                                <div class="pager flex flex-row justify-evenly items-center">
                                    <div class="previous dark:text-blue-500 rubik text-3xl" v-if="previous">
                                        <a :href="previous" data-toggle="tooltip" data-placement="top">
                                            <FontAwesomeIcon :icon="faArrowCircleLeft" />
                                        </a>
                                    </div>
                                    <div class="next dark:text-orange-500 rubik text-3xl" v-if="next">
                                        <a :href="next" data-toggle="tooltip" data-placement="top">
                                            <FontAwesomeIcon :icon="faArrowCircleRight" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    </Transition>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import { VueMarkdown } from '@crazydos/vue-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { ref } from 'vue';
import { Transition } from 'vue'
import remarkGfm from 'remark-gfm';
import Toc from './Partials/Toc.vue';

const images = import.meta.glob('@/images/posts/**/*.{jpg,jpeg,png,gif,webp}', { eager: true });

const imagesMap = ref({});
for (const path in images) {
    const fileName = path
    imagesMap.value[fileName] = images[path].default;
}


const post = ref({});

fetch('/posts.json')
    .then(r => r.json())
    .then(data => {
        post.value = data.content.filter(p => p.id === props.id)[0];
    })

const customAttrs = {
    h1: { class: 'text-5xl font-bold my-4 text-primary-light' },
    h2: { class: 'text-4xl font-semibold my-3 text-primary-light' },
    h3: { class: 'text-3xl font-medium my-2 text-primary-light' },
    h4: { class: 'text-2xl font-medium my-2 text-primary-light' },
    img: { class: 'rounded-lg mx-auto mt-4 shadow-lg' },
    table: { class: 'w-full my-4 border-collapse px-4 overflow-x-auto block md:table' },
    th: { class: 'border-b-4 border-gray-200 px-4 py-2 text-left' },
    tr: { class: 'even:bg-gray-800 even:bg-opacity-50' },
    hr: { class: 'border-t border-gray-700 my-4' },
    a: { class: 'text-blue-500 hover:underline wrap-break-word' },
    strong: { class: 'font-bold text-orange-300' },
    em: { class: 'italic text-gray-400' },
    figcaption: { class: 'text-sm text-gray-300 mb-4' },
    pre: { class: 'py-4 overflow-auto' },
    blockquote: { class: 'border-l-4 border-gray-700 pl-4 italic my-8' },
    li: { class: 'my-2 before:content-["●"] before:text-white before:mr-2' }
};

const props = defineProps({
    next: {
        type: String,
        required: true
    },
    previous: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});
</script>