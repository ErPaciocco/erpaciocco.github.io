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
.section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stato iniziale */
.before-animate {
  opacity: 0;
  transform: translateY(-20px);
}

/* Stato animato */
.animate {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.8s ease;
}
</style>
<script setup>
import Overview from './Partials/Overview.vue'
import Portfolio from './Partials/Portfolio.vue'
import Advisories from './Partials/Advisories.vue'
import Whoami from './Partials/Whoami.vue'
import Contacts from './Partials/Contacts.vue'

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