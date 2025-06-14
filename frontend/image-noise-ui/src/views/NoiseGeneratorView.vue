<script setup lang="ts">
import ImageViewer from '../components/ImageViewer.vue'
import NoiseSelector from '../components/NoiseSelector.vue'
import NoiseSettings from '../components/NoiseSettings.vue'
import { useNoiseStore } from '@/stores/noise';

const store = useNoiseStore();

async function generateNoiseImage() {
  await store.createNoiseImage();
}

function saveNoiseImage() {
  const canvas: HTMLCanvasElement = document.getElementById('noiseImage') as HTMLCanvasElement;
  if (canvas) {
    const imageUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageUrl;
    const fileName = store.noise_type + '_' + crypto.randomUUID();
    link.download = fileName + '_.png';
    link.click();
    document.body.appendChild(link);
  } else {
    console.error('Canvas element not found.');
  }

}

</script>

<template>
  <header>
  </header>
    <table>
      <tbody>
        <tr id="viewer">
          <td>
            <ImageViewer />
          </td>
        </tr>
        <tr>
          Viewer Size: 512x512
        </tr>
        <tr id="noiseInteractors">
          <td>
            <NoiseSelector />
          </td>
          <td>
            <button @click="generateNoiseImage">
              Generate Noise
            </button>
          </td>
          <td>
            <button @click="saveNoiseImage">
              Save Image
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <table id="description">
      <tbody>
        <tr>
          <td> Description: </td>
        </tr>
        <tr>
          <td> {{ store.description }} </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>
            <NoiseSettings />
          </td>
        </tr>
      </tfoot>
    </table>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

tr {
  display: flex;
  justify-content: center;
  margin: 5px
}

table {
  display: grid;
  justify-content: center;
}

#noiseInteractors {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

#description {
  display: grid;
  justify-content: center;
  width: 600px
}

</style>
