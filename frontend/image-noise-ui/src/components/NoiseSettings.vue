<template>
    <table>
        <tbody id="settings">
            <tr class="seed_toggle_row">
                <td>
                    <label for="seed_box">{{ store.seedToggle ? 'Seed enabled' : 'Seed disabled' }}</label>
                </td>
                <td>
                    <input type="checkbox" id="seed_box" v-model="store.seedToggle">
                </td>
            </tr>
            <tr class="seed_value_row" v-if="store.seedToggle">
                <td>
                    <input type="text" v-model="store.seed" >
                </td>
                <td>
                    <input type="range" min="0" max="5000" step=".1" v-model="store.seed">
                </td>
            </tr>
            <tr class="density_row" v-if="store.noise_type!='white_noise'">
                <td>
                    Noise Density
                </td>
            </tr>
            <tr class="density_row" v-if="store.noise_type!='white_noise'">
                <td>
                    <input type="text" v-model="store.scale" >
                </td>
                <td>
                    <input type="range" min="1.0" max="50" step=".1" v-model="store.scale">
                </td>
            </tr>
            <tr class="lacunarity_row" v-if="store.noise_type=='simplex'">
                <td>
                    Lacunarity
                </td>
            </tr>
            <tr v-if="store.noise_type=='simplex'">
                <td>
                    <input type="text" v-model="store.lacunarity" >
                </td>
                <td>
                    <input type="range" min="0.0" max="10" step=".1" v-model="store.lacunarity">
                </td>
            </tr>
            <tr v-if="store.noise_type=='worley'">
                <td>
                    Disorder
                </td>
            </tr>
            <tr v-if="store.noise_type=='worley'">
                <td>
                    <input type="text" v-model="store.disorder">
                </td>
                <td>
                    <input type="range" min="0.0" max="25" step=".1" v-model="store.disorder">
                </td>
            </tr>
        </tbody>
    </table>
    
</template>

<script setup lang="ts">
import { useNoiseStore } from '@/stores/noise';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

const store = useNoiseStore();
const { seed } = storeToRefs(store);

const sliderVal = ref<number>(Number(seed.value));




</script>

<style scoped>

#settings {
    display: inline-block;
    justify-content: space-between;
}

td {
    width: 40ch;
}

</style>

