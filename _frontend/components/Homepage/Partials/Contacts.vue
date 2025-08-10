<template>
    <section id="contacts" class="w-full">
        <div class="my-8 pl-4 text-left">
            <div
                class="flex flex-row flex-no-wrap justify-between items-center rubik text-3xl text-[#f0f0f0] font-bold">
                <div class="row-span-2 w-auto">
                    <h2 class="section-heading select-none">Contacts</h2>
                </div>
                <div class="w-full ml-8 mr-4">
                    <div class="bg-gray-800 w-full h-[1px]"></div>
                </div>
            </div>
        </div>
        <div class="text-center text-3xl rubik font-normal text-[#f0f0f0] select-none">
            I ❤️ new mates!
        </div>
        <div class="flex flex-row flex-wrap justify-evenly items-center my-8">
            <div
                class="text-6xl md:text-[6rem] text-[#f0f0f0] font-bold cursor-pointer transform hover:scale-105 transition transition-all hover:text-blue-500" @click="goTo('https://www.facebook.com/alberto.bruscino.7')">
                <FontAwesomeIcon :icon="faFacebook" />
            </div>
            <div
                class="text-6xl md:text-[6rem] text-[#f0f0f0] font-bold cursor-pointer transform hover:scale-105 transition transition-all hover:text-purple-500" @click="goTo('https://instagram.com/erpaciocco')">
                <FontAwesomeIcon :icon="faInstagram" />
            </div>
            <div
                class="text-6xl md:text-[6rem] text-[#f0f0f0] font-bold cursor-pointer transform hover:scale-105 transition transition-all hover:text-blue-800" @click="goTo('https://linkedin.com/in/erpaciocco')">
                <FontAwesomeIcon :icon="faLinkedin" />
            </div>
            <div
                class="text-6xl md:text-[6rem] text-[#f0f0f0] font-bold cursor-pointer transform hover:scale-105 transition transition-all hover:text-yellow-500" @click="goTo('http://github.com/erpaciocco')">
                <FontAwesomeIcon :icon="faGithub" />
            </div>
        </div>
    </section>
</template>
<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faFacebook, faInstagram, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';

const goTo = (url) => {
    window.open(url, '_blank');
}
</script>