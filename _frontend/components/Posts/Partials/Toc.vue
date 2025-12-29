<template>
    <div class="flex flex-row w-full justify-center">
        <nav class="w-auto p-4 rounded-lg bg-[#ffffff10] my-8" v-if="toc.length">
            <h3 class="border-b-4 border-gray-200 text-left font-bold select-none text-3xl">Table of Contents</h3>
            <ol class="list-none list-inside space-y-1">
                <li v-for="item in toc" :key="item.id"
                    :class="getItemClasses(item)"
                    :style="{ 'text-indent': `${(item.level - 2) * 8}px` }">
                    <a class="py-1 text- hover:text-blue-600 transition-colors" :class="{'font-normal text-xl': item.level < 4, 'font-light text-md': item.level <= 6}" :href="`#${item.id}`"
                        @click="smoothScroll">{{ item.text }}</a>
                </li>
            </ol>
        </nav>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const toc = ref([])

const getItemClasses = (item) => ({
    'active text-blue-600 font-semibold': item.active,
    'has-children': item.children?.length,
})

const generateToc = () => {
    toc.value = Array.from(document.querySelectorAll('h3,h4,h5,h6'))
        .map(h => ({
            id: h.id || `h${h.tagName[1]}${Math.random().toString(36).substr(2, 9)}`,
            text: h.textContent.trim(),
            level: parseInt(h.tagName[1]),
            top: h.offsetTop,
            active: false,
            children: []
        }))
        .filter(item => item.text)
}

const smoothScroll = (e) => {
    e.preventDefault()
    const target = document.querySelector(e.target.getAttribute('href'))
    target?.scrollIntoView({ behavior: 'smooth' })
}

const updateActive = () => {
    const scrollPos = window.scrollY + 100
    toc.value.forEach(item => {
        item.active = item.top <= scrollPos && scrollPos < (item.top + 50)
    })
}

onMounted(async () => {
    await nextTick()
    generateToc()
    window.addEventListener('scroll', updateActive, { passive: true })
})

onUnmounted(() => {
    window.removeEventListener('scroll', updateActive)
})
</script>
