<script setup lang="ts">

import { useNoiseStore} from '@/stores/noise';
import type { NoiseType } from '@/stores/noise'
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';


const store = useNoiseStore();
const { noise_type } = storeToRefs(store);

const selected_noise = ref<NoiseType>(noise_type.value);
const selected_resolution = ref<number>(128);

watch(selected_noise, (newValue: NoiseType) => {
    if (newValue !== noise_type.value) {
        store.noise_type = newValue;
    }

    store.updateDescription();
});

watch(noise_type, (newStoreValue: NoiseType) => {
    selected_noise.value = newStoreValue;
});

watch(selected_resolution, (newValue: number) => {
    store.size = newValue;
})

</script>

<template>
    <div id="noiseSelections">
        <select v-model="selected_noise">
            <option value="worley">Worley</option>
            <option value="white_noise">White Noise</option>
            <option value="simplex">Simplex</option>
        </select>
        <select v-model="selected_resolution">
            <option v-for="n in 9" :value="2 ** (n + 1)">{{ 2 ** (n + 1) }} x {{ 2 ** (n + 1) }}</option>
        </select>
    </div>
</template>

<style scoped>

#noiseSelections{
    display: flex;
    justify-content: space-between;
}

</style>