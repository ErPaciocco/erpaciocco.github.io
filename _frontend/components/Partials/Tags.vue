<template>
    <div class="flex flex-row flex-wrap justify-around items-center">
        <div v-for="(tag, k) in data" :key="k" class="m-1 hover:bg-primary-dark rounded-xl transition transition-colors">
            <span class="rubik text-md text-primary-light p-1 cursor-pointer font-bold select-none">#{{ tag }}</span>
        </div>
    </div>
</template>
<script setup>
defineProps({
    data: {
        type: Array,
        required: true
    }
})
</script>