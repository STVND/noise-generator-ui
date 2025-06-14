<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { usePigmentStore } from '@/stores/pigments';
import { storeToRefs } from 'pinia';

const store = usePigmentStore();
const { pigment_image } = storeToRefs(store);
const pigmentCanvas = ref<HTMLCanvasElement | null>(null);

onMounted(async () => {
    if (store.white_value === 0 && store.red_value === 0 && store.blue_value === 0 && store.yellow_value === 0 && store.black_value === 0) {
        store.white_value = 1.0; 
    }
    await store.updatePigment();
});

watch(pigment_image, (newImageBitmap) => {
    if (pigmentCanvas.value && newImageBitmap) {
        const ctx = pigmentCanvas.value.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, pigmentCanvas.value.width, pigmentCanvas.value.height);
            ctx.drawImage(newImageBitmap, 0, 0, pigmentCanvas.value.width, pigmentCanvas.value.height);
        }
    }
}, { immediate: true });
</script>

<template>
    <canvas ref="pigmentCanvas" class="pigment-display" width="512" height="512"></canvas>
</template>

<style scoped>
.pigment-display {
    border: 2px solid #4a4a4a;
    border-radius: 20px;
}
</style>