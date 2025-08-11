<template>
    <section id="portfolio" class="download bg-light text-center">
        <div class="w-full">
            <div class="mt-16 mb-4 pl-4 text-left">
                <div
                    class="flex flex-row flex-no-wrap justify-between items-center rubik text-3xl text-primary-light font-bold">
                    <div class="row-span-2 w-auto">
                        <h2 class="section-heading select-none">Portfolio</h2>
                    </div>
                    <div class="w-full ml-8 mr-4">
                        <div class="bg-gray-800 w-full h-[1px]"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="m-4">
            <div class="">
                <div class="flex flex-row flex-wrap justify-center items-center">
                    <div v-for="project in projectsDecoded" :key="project.name"
                        class="m-4 cursor-pointer hover:scale-105 transform transition transition-transform w-96">
                        <project :data="project"></project>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
<script setup>
import Project from '../../Partials/Project.vue';

const props = defineProps({
    projects: {
        type: String,
        required: true
    }
})

const projectsDecoded = JSON.parse(props.projects);

</script>