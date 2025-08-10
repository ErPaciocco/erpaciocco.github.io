<template>
    <section id="advisories" class="features">
        <div class="w-full">
            <div class="mt-16 mb-4 text-center">
                <div class="w-full rubik text-3xl text-[#f0f0f0] font-bold">
                    <div class="row-span-2 w-auto">
                        <h2 class="section-heading select-none">Advisories</h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-row justify-center items-center">
            <div class="relative overflow-x-auto rounded-xl m-8 max-w-[700px]">
                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs rubik text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-[#a0a0a0] select-none">
                        <tr>
                            <th scope="col" class="px-6 py-3">
                                CVE ID
                            </th>
                            <th scope="col" class="px-6 py-3">
                                DESCRIPTION
                            </th>
                            <th scope="col" class="px-6 py-3">
                                CVSS RATING
                            </th>
                            <th scope="col" class="px-6 py-3">
                                COAUTHORS
                            </th>
                            <th scope="col" class="px-6 py-3">
                                LINK
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="advisory in advisories" :key="advisory.cveid"
                            class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200 rubik">
                            <th scope="row"
                                class="px-6 py-4 font-medium text-[#f0f0f0] whitespace-nowrap dark:font-bold dark:text-white select-all">
                                {{ advisory.cveid }}
                            </th>
                            <td class="px-6 py-4">
                                {{ advisory.product }}
                            </td>
                            <td class="px-6 py-4">
                                {{ advisory.cvss }}
                            </td>
                            <td class="px-6 py-4">
                                {{ advisory.coauthors }}
                            </td>
                            <td class="px-6 py-4">
                                <a :href="advisory.url"
                                    class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Link</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</template>
<script setup>
const props = defineProps({
    advisories: {
        type: Array,
        required: true
    }
})
</script>