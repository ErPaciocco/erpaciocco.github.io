<template>
    <nav id="mainNav" class="">
        <div class="w-full">
            <div class="mx-8">
                <div class="flex flex-row justify-between items-center mt-4">
                    <div class="rubik transform hover:scale-105 transition transition-all">
                        <a href="/"
                            class="page-scroll rubik font-black text-primary-light text-3xl not-underline select-none">ErPacy
                            🧑‍💻</a>
                    </div>
                    <button type="button"
                        class="cursor-pointer md:hidden hover:bg-primary-dark transition transition-colors rounded-xl p-4 transform transition transition-transform" :class="rotateStyle"><i
                            class="fa fa-bars !text-3xl text-primary-light" @click="open = !open; rotateButton()"></i>
                    </button>
                    <div class="text-primary-light flex-row flex-no-wrap items-center justify-center text-xl font-light select-none cursor-pointer hidden md:!flex">
                        <div v-for="(v, k) in labelsDecoded" :key="k" class="p-4 transition transition-colors hover:bg-primary-dark rounded-xl"><a :href="v">{{ k }}</a></div>
                    </div>
                </div>
            </div>
            <Transition name="dropdown">
                <div class="pt-4 md:hidden" id="navbar" v-if="open">
                    <div>
                        <ul
                            class="nav overflow-hidden navbar-nav navbar-right text-primary-light rubik p-4 rounded-xl bg-primary-dark">
                            <li class="my-2" v-for="(v, k) in labelsDecoded" :key="k" >
                                <a class="page-scroll hover:bg-[#2d3b4e] transition transition-all p-2 rounded-xl"
                                    :href="v">{{ k }}</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </Transition>
            <!-- /.navbar-collapse -->
        </div>
        <!-- /.container-fluid -->
    </nav>
</template>
<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
    opacity: 1;
    transform: translateY(0);
}
</style>
<script lang="js" setup>
import { computed, ref } from 'vue';
import { Transition } from 'vue';

const props = defineProps({
    labels: {
    type: String,
    required: true
    }
});

const labelsDecoded = computed(() => JSON.parse(props.labels))

const open = ref(false);
const rotateStyle = ref("");

const rotateButton = () => {
    if(!rotateStyle.value)
        rotateStyle.value = "rotate-90";
    else
        rotateStyle.value = "";
}
</script>