<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePigmentStore } from '@/stores/pigments';
import { storeToRefs } from 'pinia';



</script>

<template>
    <canvas ref="pigmentGradient" class="gradient" width="128" height="128"></canvas>
</template>

<style scoped>

</style>