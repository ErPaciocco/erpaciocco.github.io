<template>
    <div id="giscus-container" class="lg:m-16 md:m-8 m-2">
    </div>
</template>
<script setup>
const props = defineProps({
    giscus: {
        type: String,
        required: true,
    }
})
import { onMounted } from 'vue';

const giscusDecoded = JSON.parse(props.giscus);
console.log(giscusDecoded)
onMounted(() => {
    const existingScript = document.querySelector('script#giscus-script');
    if (existingScript) {
        return;
    }

    const script = document.createElement('script');
    script.id = 'giscus-script';
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.setAttribute('data-repo', giscusDecoded.repo);
    script.setAttribute('data-repo-id', giscusDecoded.repo_id);
    script.setAttribute('data-category-id', giscusDecoded.category_id);
    script.setAttribute('data-category', giscusDecoded.category_name);
    script.setAttribute('data-mapping', giscusDecoded.discussion_term);
    script.setAttribute('data-reactions-enabled', giscusDecoded.reactions_enabled);
    script.setAttribute('data-theme', giscusDecoded.theme);
    script.crossOrigin = giscusDecoded.crossorigin;

    const container = document.getElementById('giscus-container');
    if (container) {
        container.appendChild(script);
    }
});
</script>