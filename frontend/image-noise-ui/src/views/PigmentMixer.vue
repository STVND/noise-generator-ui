<script setup lang="ts">
import { watch, ref, onMounted } from 'vue';
import PigmentViewer from '@/components/PigmentViewer.vue';
import PigmentPreview from '@/components/PigmentPreview.vue';
import type { Pigment } from '@/stores/pigments'; // Corrected import path
import { usePigmentStore } from '@/stores/pigments';
import { storeToRefs } from 'pinia';

const store = usePigmentStore();
const { white_value, red_value, blue_value, yellow_value, black_value, pigment_image } = storeToRefs(store);

// Define pure pigment objects for the previews
const pureWhite: Pigment = { white: 1.0, red: 0.0, blue: 0.0, yellow: 0.0, black: 0.0 };
const pureRed: Pigment = { white: 0.0, red: 1.0, blue: 0.0, yellow: 0.0, black: 0.0 };
const pureBlue: Pigment = { white: 0.0, red: 0.0, blue: 1.0, yellow: 0.0, black: 0.0 };
const pureYellow: Pigment = { white: 0.0, red: 0.0, blue: 0.0, yellow: 1.0, black: 0.0 };
const pureBlack: Pigment = { white: 0.0, red: 0.0, blue: 0.0, yellow: 0.0, black: 1.0 };

const predefinedPigments: { name: string, value: Pigment }[] = [
  { name: "White", value: pureWhite },
  { name: "Red", value: pureRed },
  { name: "Blue", value: pureBlue },
  { name: "Yellow", value: pureYellow },
  { name: "Black", value: pureBlack },
];

const pigmentComponents = [
  { name: 'Red',    valueRef: red_value,    previewPigment: pureRed },
  { name: 'Blue',   valueRef: blue_value,   previewPigment: pureBlue },
  { name: 'Yellow', valueRef: yellow_value, previewPigment: pureYellow },
  { name: 'White',  valueRef: white_value,  previewPigment: pureWhite },
  { name: 'Black',  valueRef: black_value,  previewPigment: pureBlack },
];

// Simple debounce function
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
}, 300); // Update after 300ms of inactivity

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
    currentHexColor.value = '#000000'; // Default or error color
    copyButtonText.value = 'N/A';
    return;
  }
  // Use OffscreenCanvas to avoid adding to the DOM
  const offscreenCanvas = new OffscreenCanvas(1, 1);
  const ctx = offscreenCanvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(imageBitmap, 0, 0);
    const pixelData = ctx.getImageData(0, 0, 1, 1).data;
    currentHexColor.value = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
    copyButtonText.value = currentHexColor.value; // Update button text with the new hex
  }
}

watch(pigment_image, (newImageBitmap) => {
  updateHexColorFromImageBitmap(newImageBitmap);
}, { immediate: true }); // immediate: true to run on initial load if pigment_image is already set

async function copyHexToClipboard() {
  if (currentHexColor.value && currentHexColor.value !== 'N/A') {
    await navigator.clipboard.writeText(currentHexColor.value);
    copyButtonText.value = 'Copied!';
    setTimeout(() => { copyButtonText.value = currentHexColor.value; }, 1500); // Reset after 1.5s
  }
}

function initializeRandomSliderValues() {
  pigmentComponents.forEach(component => {
    if (component.name === 'Red' || component.name === 'Blue' || component.name === 'Yellow') {
      component.valueRef.value = Math.random(); // Assigns a float between 0.0 and 1.0
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
                <td>
                    
                    <label>
                        <PigmentPreview 
                        :name="component.name" 
                        :pigment="component.previewPigment"
                        :staggerIndex="index" 
                        shaderFragmentPath="/pigment_shaders/pigment.frag"
                        shaderBasePath="/pigment_shaders/" />
                    </label>
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
/* General table styling to center content */
table {
  display: grid; /* Changed from flex to grid for easier centering of the table itself */
  justify-items: center; /* Center items within the grid (table cells) */
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
  width: auto; /* Allow table to size to content */
}


tr {
  display: flex; /* Use flex for items within a row */
  justify-content: center; /* Center content horizontally within rows */
  align-items: center; /* Align items vertically in the center */
  margin-bottom: 5px; /* Add a bit of space between rows */
  width: 100%; /* Ensure rows take up available width for centering */
}

/* Styling for table cells */
td {
    padding: 8px;
    vertical-align: middle; /* Better vertical alignment for mixed content */
    text-align: center; /* Center text within table cells */
}

/* Specific styling for slider rows to ensure good layout */
.pigment-slider-row td:first-child {
  /* The PigmentPreview itself is a flex container, so it will center its content. */
  /* We can add a min-width if needed, but flex should handle it. */
  /* min-width: 150px; */ /* Adjust if previews + names cause inconsistent widths */
}

.pigment-slider-row input[type="range"] {
  width: 200px; /* Adjust slider width as needed */
  margin: 0 10px; /* Add some horizontal margin around the slider */
}

.pigment-slider-row td:last-child {
    min-width: 40px; /* Ensure space for the numeric value */
    text-align: right; /* Align numeric value to the right */
}

.hex-copy-button {
  padding: 8px 15px;
  font-family: monospace; /* Good for hex codes */
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