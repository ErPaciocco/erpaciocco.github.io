<template>
  <footer class="text-[#f0f0f0] py-6 mt-12">
    <div class="w-full mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="w-full text-sm text-center select-none rubik">
        © {{ currentYear }} {{ name }}. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();
const name = "ErPaciocco";
</script>
<style scoped>
</style>
