<script setup lang="ts">
import { onMounted, ref, toRefs, watch } from 'vue';
import type { Pigment } from '@/stores/pigments';
import { initShaderProgram, initBuffers } from '@/utils/webglUtils';
import { getPigmentShaderSources } from '@/utils/shaderCache';

const props = defineProps<{
  pigment: Pigment;
  name: string;
  shaderFragmentPath?: string;
  shaderBasePath?: string;
  staggerIndex?: number; 
}>();

const { pigment, name } = toRefs(props);
const previewCanvas = ref<HTMLCanvasElement | null>(null);
const canvasSize = 64;
const STAGGER_DELAY_MS = 100;

let gl: WebGL2RenderingContext | null = null;
let programInfo: {
    program: WebGLProgram;
    attribLocations: { vertexPosition: number };
    uniformLocations: {
        resolution: WebGLUniformLocation | null;
        red_amount: WebGLUniformLocation | null;
        blue_amount: WebGLUniformLocation | null;
        yellow_amount: WebGLUniformLocation | null;
        white_amount: WebGLUniformLocation | null;
        black_amount: WebGLUniformLocation | null;
    };
} | null = null;
let buffers: { position: WebGLBuffer } | null = null;

async function setupWebGL() {
    if (!previewCanvas.value) return;
    gl = previewCanvas.value.getContext('webgl2');
    if (!gl) {
        console.error('WebGL2 not supported for pigment preview.');
        return;
    }

    let sources;
    try {
        sources = await getPigmentShaderSources();
    } catch (error) {
        console.error(`ERROR getting shader sources for PigmentPreview (${name.value}): `, error);
        return;
    }

    const shaderProgram = initShaderProgram(gl, sources.vsSource, sources.fsSource);
    if (!shaderProgram) {
         console.error(`Failed to initialize shader program for ${name.value}`);
        return;
    }

    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
            red_amount: gl.getUniformLocation(shaderProgram, 'u_red_amount'),
            blue_amount: gl.getUniformLocation(shaderProgram, 'u_blue_amount'),
            yellow_amount: gl.getUniformLocation(shaderProgram, 'u_yellow_amount'),
            white_amount: gl.getUniformLocation(shaderProgram, 'u_white_amount'),
            black_amount: gl.getUniformLocation(shaderProgram, 'u_black_amount'),
        },
    };
    buffers = initBuffers(gl);
    if (!buffers) {
        console.error(`Failed to initialize buffers for ${name.value}`);
    }
}

function drawScene() {
    if (!gl || !programInfo || !buffers || !pigment.value) return;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0); // Light gray background for preview
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programInfo.program);

    gl.uniform2f(programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(programInfo.uniformLocations.red_amount, pigment.value.red);
    gl.uniform1f(programInfo.uniformLocations.blue_amount, pigment.value.blue);
    gl.uniform1f(programInfo.uniformLocations.yellow_amount, pigment.value.yellow);
    gl.uniform1f(programInfo.uniformLocations.white_amount, pigment.value.white);
    gl.uniform1f(programInfo.uniformLocations.black_amount, pigment.value.black);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

onMounted(async () => {
    const delay = (props.staggerIndex || 0) * STAGGER_DELAY_MS;
    setTimeout(async () => {
        if (previewCanvas.value) {
            await setupWebGL();
            drawScene();
        }
    }, delay);
});

watch(pigment, () => {
    if (gl) drawScene();
}, { deep: true });

</script>

<template>
  <div class="pigment-preview-item">
    <canvas ref="previewCanvas" :width="canvasSize" :height="canvasSize" :title="name"></canvas>
    <span class="pigment-name">{{ name }}</span>
  </div>
</template>

<style scoped>
.pigment-preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
canvas {
  border: 1px solid #ccc;
  border-radius: 20px;
}
.pigment-name {
    font-size: 0.9em;
    width: 10ch;
}
</style>