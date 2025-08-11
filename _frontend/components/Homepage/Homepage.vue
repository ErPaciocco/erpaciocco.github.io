<template>
    <div>
        <!-- Overview -->
        <div id="overview">
            <Transition name="slide-fade">
                <Overview v-scroll-animate />
            </Transition>
        </div>

        <!-- Portfolio -->
        <div id="portfolio">
            <Transition name="slide-fade">
                <Portfolio v-scroll-animate :projects="projects" />
            </Transition>
        </div>

        <!-- Advisories -->
        <div id="advisories">
            <Transition name="slide-fade">
                <Advisories v-scroll-animate :advisories="JSON.parse(advisories)" />
            </Transition>
        </div>

        <!-- Whoami -->
        <div id="whoami">
            <Transition name="slide-fade">
                <Whoami v-scroll-animate />
            </Transition>
        </div>

        <!-- Contacts -->
        <div id="contacts">
            <Transition name="slide-fade">
                <Contacts v-scroll-animate />
            </Transition>
        </div>
    </div>
</template>
<style>
</style>
<script setup>
import Overview from './Partials/Overview.vue'
import Portfolio from './Partials/Portfolio.vue'
import Advisories from './Partials/Advisories.vue'
import Whoami from './Partials/Whoami.vue'
import Contacts from './Partials/Contacts.vue'
import { Transition } from 'vue'

const props = defineProps({
    projects: {
        type: String,
        required: true
    },
    advisories: {
        type: String,
        required: true
    }
})
</script>