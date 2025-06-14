<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useNoiseStore } from '@/stores/noise';
import { storeToRefs } from 'pinia';

const store = useNoiseStore();
const { noise_image } = storeToRefs(store);
const noiseCanvas = ref<HTMLCanvasElement | null>(null);

watch(noise_image, (newImageBitmap: ImageBitmap | null) => {
    if (noiseCanvas.value) {
        const ctx: CanvasRenderingContext2D | null = noiseCanvas.value.getContext('2d');
        if (ctx) {
            if (newImageBitmap) {
                ctx.imageSmoothingEnabled = false;
                ctx.clearRect(0, 0, noiseCanvas.value.width, noiseCanvas.value.height);
                ctx.drawImage(newImageBitmap, 0, 0, noiseCanvas.value.width, noiseCanvas.value.height);
            } else {
                ctx.clearRect(0, 0, noiseCanvas.value.width, noiseCanvas.value.height);
            }
        }
    }
})

onMounted(() => {
        store.updateDescription();
        store.createNoiseImage();
    }
)

</script>

<template>
    <canvas ref="noiseCanvas" id="noiseImage" width=512 height=512></canvas>
</template>

<style scoped>

#noiseImage {
    border: 2px solid #191919;
    border-radius: 10px;
    margin: 10px;
}

</style>