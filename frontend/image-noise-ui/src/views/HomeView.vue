<script setup lang="ts">
import { onMounted, ref } from 'vue'

const exampleCanvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
    const canvas = exampleCanvas.value;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = '/blue-yellow-square.png';
        img.onload = () => {
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    }
});

</script>

<template>
    <div class="home-container">
        <h1>
            Welcome
        </h1>
        <p>
            This website is supposed to be a little toolset for anyone doing digital art/game dev. When you first load up a tab it'll take a moment to load but should cache what you're working on. So as long as you don't leave the actual website you can keep swapping between tabs.
        </p>
        <p>
            It's broken down into a noise generator that can be used for textures. These are commonly used to add some visual interest to things like textures or can be used in really awesome effects in shader code like <a href="https://www.guerrilla-games.com/read/the-real-time-volumetric-cloudscapes-of-horizon-zero-dawn">clouds</a> 
        </p>
        <p>
            There's another part that is a 'pigment mixer'. This solves a problem with how colors are typically mixed digitally which is not too dissimilar to how light works. The normal way will be unintuitave to anyone coming from a physical media background where they might expect to make green by mixing blue and yellow because computers will typically make it gray. It also gives you the hex code of whatever color your working on if you really like it.
        </p>
        <canvas ref="exampleCanvas" id="pigment-canvas" width="512" height="512"></canvas>
    </div>

</template>

<style scoped>
.home-container {
    display: flex;
    flex-direction: column;
    text-align: start;
}

.home-container > canvas {
    align-self: center;   /* Specifically center the canvas element horizontally */
}

h1 {
    margin: 10px;
}

p {
    margin: 10px;
}

canvas {
    margin: 30px;
}
</style>