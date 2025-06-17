<script setup lang="ts">
import { watch, ref, onMounted } from 'vue';
import PigmentViewer from '@/components/PigmentViewer.vue';
import { usePigmentStore } from '@/stores/pigments';
import { storeToRefs } from 'pinia';

import whiteImage from '/pigment-colors/white.png';
import redImage from '/pigment-colors/red.png';
import blueImage from '/pigment-colors/blue.png';
import yellowImage from '/pigment-colors/yellow.png';
import blackImage from '/pigment-colors/black.png';

const store = usePigmentStore();
const { white_value, red_value, blue_value, yellow_value, black_value, pigment_image } = storeToRefs(store);


const pigmentComponents = [
  { name: 'Red',    valueRef: red_value,    imageSrc: redImage },
  { name: 'Blue',   valueRef: blue_value,   imageSrc: blueImage },
  { name: 'Yellow', valueRef: yellow_value, imageSrc: yellowImage },
  { name: 'White',  valueRef: white_value,  imageSrc: whiteImage },
  { name: 'Black',  valueRef: black_value,  imageSrc: blackImage },
];

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const debouncedUpdatePigment = debounce(() => {
  store.updatePigment();
}, 200);

watch([white_value, red_value, blue_value, yellow_value, black_value], debouncedUpdatePigment);

const currentHexColor = ref<string>('#000000');
const copyButtonText = ref<string>('Copy Hex');

function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

async function updateHexColorFromImageBitmap(imageBitmap: ImageBitmap | null) {
  if (!imageBitmap) {
    currentHexColor.value = '#000000';
    copyButtonText.value = 'N/A';
    return;
  }

  const offscreenCanvas = new OffscreenCanvas(1, 1);
  const ctx = offscreenCanvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(imageBitmap, 0, 0);
    const pixelData = ctx.getImageData(0, 0, 1, 1).data;
    currentHexColor.value = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
    copyButtonText.value = currentHexColor.value;
  }
}

watch(pigment_image, (newImageBitmap) => {
  updateHexColorFromImageBitmap(newImageBitmap);
}, { immediate: true });

async function copyHexToClipboard() {
  if (currentHexColor.value && currentHexColor.value !== 'N/A') {
    await navigator.clipboard.writeText(currentHexColor.value);
    copyButtonText.value = 'Copied!';
    setTimeout(() => { copyButtonText.value = currentHexColor.value; }, 1500);
  }
}

function initializeRandomSliderValues() {
  pigmentComponents.forEach(component => {
    if (component.name === 'Red' || component.name === 'Blue' || component.name === 'Yellow') {
      component.valueRef.value = Math.random();
    }
  });
}
initializeRandomSliderValues();

</script>
<template>
    <table>
        <tbody>
            <tr>
                <PigmentViewer />
            </tr>
            <tr>
                <td colspan="3">
                    <button @click="copyHexToClipboard" class="hex-copy-button">{{ copyButtonText }}</button>
                </td>
            </tr>

            <tr v-for="(component, index) in pigmentComponents" :key="component.name" class="pigment-slider-row">
                <td class="pigment-preview-cell">
                    <div class="pigment-preview-item">
                        <img :src="component.imageSrc" :alt="component.name" :title="component.name" class="pigment-image-display" />
                        <span class="pigment-name">{{ component.name }}</span>
                    </div>
                </td>
                <td>
                    <input 
                        type="range" 
                        :id="`slider-${component.name}`"
                        min="0.0" max="1.0" step="0.01" 
                        v-model.number="component.valueRef.value" />
                </td>
                <td>{{ component.valueRef.value.toFixed(2) }}</td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>

table {
  display: grid;
  justify-items: center;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
  width: auto;
}


tr {
  display: flex;
  justify-content: center; 
  align-items: center;
  margin-bottom: 5px;
  width: 100%; 
}

td {
    padding: 8px;
    vertical-align: middle;
    text-align: center;
}

.pigment-preview-cell {
    display: flex;
    justify-content: flex-start;
}

.pigment-slider-row input[type="range"] {
  width: 200px;
  margin: 0 10px;
}

.pigment-slider-row td:last-child {
    min-width: 40px;
    text-align: right;
}

.pigment-preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pigment-image-display {
  width: 40px; 
  height: 40px; 
  border: 1px solid #ccc;
  border-radius: 12px;
  object-fit: cover;
}

.pigment-name {
    font-size: 0.9em;
    width: 10ch;
}

.hex-copy-button {
  padding: 8px 15px;
  font-family: monospace;
  background-color: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.hex-copy-button:hover {
  background-color: #444;
}
</style>