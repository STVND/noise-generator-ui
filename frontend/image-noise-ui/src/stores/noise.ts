import { defineStore } from 'pinia';
import Rand from 'rand-seed';
import { initShaderProgram, loadShader, initBuffers } from '@/utils/webglUtils';


export enum NoiseType {
    WHITE_NOISE = "white_noise",
    SIMPLEX = "simplex",
    WORLEY = "worley",
}

interface NoiseState {
  noise_type: NoiseType;
  noise_image: ImageBitmap | null;
  size: number;
  description: string;
  scale: number;
  disorder: number;
  tiling: number;
  lacunarity: number;
  seed: string;
  seedToggle: boolean;
}

export const useNoiseStore = defineStore('noise', {
  state: (): NoiseState => ({
    noise_type: NoiseType.WORLEY,
    noise_image: null,
    size: 32, 
    description: "",
    scale: Math.round(Math.random() * 40.0) / 10.0 + 6.0,
    disorder: Math.round(Math.random() * 200.0) / 10.0 + 2.0,
    tiling: 2.0,
    lacunarity: 2.0,
    seed: String(Math.round(Math.random() * 5000)),
    seedToggle: false,
  }),
  actions: {
    async createNoiseImage() {
      if (!this.seedToggle)  {
        this.seed = String(Math.round(Math.random() * 5000));
      }

      switch (this.noise_type) {
        case NoiseType.WHITE_NOISE:
          await this.createWhiteNoiseImage();
          break;
        case NoiseType.SIMPLEX:
          await this.createSimplexNoiseImage(this.scale, this.tiling, this.lacunarity);
          break;
        case NoiseType.WORLEY:
          await this.createWorleyNoiseImage(this.scale, this.disorder, this.tiling);
          break;
        default:
          alert("Unable to process request.")
          break;
        }
    },
    async createWhiteNoiseImage() {
      const rand = new Rand(this.seed);
      const offscreenCanvas = new OffscreenCanvas(this.size, this.size);
      const gl = offscreenCanvas.getContext('webgl2');

      if (!gl) {
        console.error('WebGL2 not supported or could not get WebGL context.');

        throw new Error('WebGL2 not supported or could not get WebGL context.');
      }

      const vsSource = `#version 300 es
      in vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }`;

      // Path relative to the 'public' directory
      const shaderRelativePath = 'noise_shaders/white_noise.frag';
      let fsSource: string;
      try {
        fsSource = await fetch(`${import.meta.env.BASE_URL}${shaderRelativePath}`).then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch shader: ${res.status} ${res.statusText} from ${import.meta.env.BASE_URL}${shaderRelativePath}`);
          }
          return res.text();
        });
      } catch (error) {
        console.error("ERROR fetching fragment shader: ", error);
        throw error;
      }        

      const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
      if (!shaderProgram) {
        return;
      }

      const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
          resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
          seed: gl.getUniformLocation(shaderProgram, 'u_seed'),
        },
      }

      const buffers = initBuffers(gl);
      if (!buffers) {
        return;
      }

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(shaderProgram);

      gl.uniform2f(programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(programInfo.uniformLocations.seed, rand.next());

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      try {
        this.noise_image = await createImageBitmap(offscreenCanvas);

      } catch (error) {
        console.error('Error creating image bitmap frow WebGL2 canvas:', error);
      }

    },

    async createSimplexNoiseImage(scale: number, tiling: number, lacunarity: number) {
      const rand = new Rand(this.seed);
      const offscreenCanvas = new OffscreenCanvas(this.size, this.size);
      const gl = offscreenCanvas.getContext('webgl2');

      if (!gl) {
        console.error('WebGL2 not supported or could not get WebGL context.');
        throw new Error('WebGL2 not supported or could not get WebGL context.');
      }

      const vsSource = `#version 300 es
      in vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }`;

      // Path relative to the 'public' directory
      const shaderRelativePath = 'noise_shaders/simplex_noise.frag';
      let fsSource: string;
      try {
        fsSource = await fetch(`${import.meta.env.BASE_URL}${shaderRelativePath}`).then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch shader: ${res.status} ${res.statusText} from ${import.meta.env.BASE_URL}${shaderRelativePath}`);
          }
          return res.text();
        });
      } catch (error) {
        console.error("ERROR fetching fragment shader: ", error);
        throw error;
      }        

      const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
      if (!shaderProgram) {
        return;
      }

      const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
          resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
          seed: gl.getUniformLocation(shaderProgram, 'u_seed'),
          scale: gl.getUniformLocation(shaderProgram, 'u_scale'),
          tiling: gl.getUniformLocation(shaderProgram, 'u_tiling'),
          lacunarity: gl.getUniformLocation(shaderProgram, 'u_lacunarity'),
        },
      }

      const buffers = initBuffers(gl);
      if (!buffers) {
        return;
      }

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(shaderProgram);

      gl.uniform2f(programInfo.uniformLocations.resolution, this.size, this.size);
      gl.uniform1f(programInfo.uniformLocations.seed, rand.next());
      gl.uniform1f(programInfo.uniformLocations.scale, scale);
      gl.uniform1f(programInfo.uniformLocations.tiling, tiling);
      gl.uniform1f(programInfo.uniformLocations.lacunarity, lacunarity);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      try {
        this.noise_image = await createImageBitmap(offscreenCanvas);

      } catch (error) {
        console.error('Error creating image bitmap frow WebGL2 canvas:', error);
      }

    },

    async createWorleyNoiseImage(scale: number, disorder: number, tiling: number) {
      const rand = new Rand(this.seed);
      const offscreenCanvas = new OffscreenCanvas(this.size, this.size);
      const gl = offscreenCanvas.getContext('webgl2');

      if (!gl) {
        console.error('WebGL2 not supported or could not get WebGL context.');
        throw new Error('WebGL2 not supported or could not get WebGL context.');
      }

      const vsSource = `#version 300 es
      in vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }`;

      // Path relative to the 'public' directory
      const shaderRelativePath = 'noise_shaders/worley_noise.frag';
      let fsSource: string;
      try {
        fsSource = await fetch(`${import.meta.env.BASE_URL}${shaderRelativePath}`).then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch shader: ${res.status} ${res.statusText} from ${import.meta.env.BASE_URL}${shaderRelativePath}`);
          }
          return res.text();
        });
      } catch (error) {
        console.error("ERROR fetching fragment shader: ", error);
        throw error;
      }        

      const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
      if (!shaderProgram) {
        return;
      }

      const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
          resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
          seed: gl.getUniformLocation(shaderProgram, 'u_seed'),
          scale: gl.getUniformLocation(shaderProgram, 'u_scale'),
          disorder: gl.getUniformLocation(shaderProgram, 'u_disorder'),
          tiling: gl.getUniformLocation(shaderProgram, 'u_tiling'),
        },
      }

      const buffers = initBuffers(gl);
      if (!buffers) {
        return;
      }

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(shaderProgram);

      gl.uniform2f(programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(programInfo.uniformLocations.seed, rand.next());
      gl.uniform1f(programInfo.uniformLocations.scale, scale);
      gl.uniform1f(programInfo.uniformLocations.disorder, disorder);
      gl.uniform1f(programInfo.uniformLocations.tiling, tiling);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      try {
        this.noise_image = await createImageBitmap(offscreenCanvas);

      } catch (error) {
        console.error('Error creating image bitmap frow WebGL2 canvas:', error);
      }

    },

    updateDescription() {
      switch (this.noise_type) {
        case NoiseType.WHITE_NOISE:
          this.description = "Noise is randomly generated at each pixel."
          break;
        case NoiseType.WORLEY:
          this.description = "Noise is divided into 'cells' and measures the distance between points. Texture is tileable at all densities. Also known as Voronoi or Cellular noise"
          break;
        case NoiseType.SIMPLEX:
          this.description = "Implementation of OpenSimplex2 with 2 octaves of noise. Texture is tileable when density is set to 100."
          break;
        default:
          this.description = "Something Broke!"
          break;
      }
    },
  }
});
