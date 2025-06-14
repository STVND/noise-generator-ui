import { defineStore } from 'pinia';    
import { getPigmentShaderSources } from '@/utils/shaderCache';
// fetchAndProcessShader is no longer directly needed here if getPigmentShaderSources handles it.

export interface Pigment {
    white: number,
    red: number,
    blue: number,
    yellow: number,
    black: number,
}

const WHITE: Pigment = {
    white: 1.0,
    red: 0.0,
    blue: 0.0,
    yellow: 0.0,
    black: 0.0,
}

const RED: Pigment = {
    white: 0.0,
    red: 1.0,
    blue: 0.0,
    yellow: 0.0,
    black: 0.0,
}

const BLUE: Pigment = {
    white: 0.0,
    red: 0.0,
    blue: 1.0,
    yellow: 0.0,
    black: 0.0,
}

const YELLOW: Pigment = {
    white: 0.0,
    red: 0.0,
    blue: 0.0,
    yellow: 1.0,
    black: 0.0,
}

const BLACK: Pigment = {
    white: 0.0,
    red: 0.0,
    blue: 0.0,
    yellow: 0.0,
    black: 1.0,
}

interface PigmentState {
    white_value: number,
    red_value: number,
    blue_value: number,
    yellow_value: number,
    black_value: number,
    current_pigment: Pigment,
    pigment_image: ImageBitmap | null,
}

export const usePigmentStore = defineStore('pigment', {
    state: (): PigmentState => ({
        white_value: 0.0,
        red_value : 0.0,
        blue_value: 0.0,
        yellow_value: 0.0,
        black_value: 0.0,
        current_pigment: {
            white: 0.0,
            red: 0.0,
            blue: 0.0,
            yellow: 0.0,
            black: 0.0,
        },
        pigment_image: null,
    }),
    actions: {
        async updatePigment() {
            const offscreenCanvas = new OffscreenCanvas(1, 1);
            const gl = offscreenCanvas.getContext('webgl2');

            if (!gl) {
                console.error('WebGL2 not supported or could not get WebGL context.');

                throw new Error('WebGL2 not supported or could not get WebGL context.');
            }

            let sources;
            try {
                sources = await getPigmentShaderSources();
            } catch (error) {
                console.error("ERROR getting shader sources in pigment store: ", error);
                throw error;
            }

            const shaderProgram = initShaderProgram(gl, sources.vsSource, sources.fsSource);
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
                    white_amount: gl.getUniformLocation(shaderProgram, 'u_white_amount'),
                    red_amount: gl.getUniformLocation(shaderProgram, 'u_red_amount'),
                    blue_amount: gl.getUniformLocation(shaderProgram, 'u_blue_amount'),
                    yellow_amount: gl.getUniformLocation(shaderProgram, 'u_yellow_amount'),
                    black_amount: gl.getUniformLocation(shaderProgram, 'u_black_amount'),
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
            // Pass current pigment values from state to the shader
            // Order for make_pigment: red, blue, yellow, white, black
            gl.uniform1f(programInfo.uniformLocations.red_amount, this.red_value);
            gl.uniform1f(programInfo.uniformLocations.blue_amount, this.blue_value);
            gl.uniform1f(programInfo.uniformLocations.yellow_amount, this.yellow_value);
            gl.uniform1f(programInfo.uniformLocations.white_amount, this.white_value);
            gl.uniform1f(programInfo.uniformLocations.black_amount, this.black_value);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            try {
                this.pigment_image = await createImageBitmap(offscreenCanvas);

            } catch (error) {
                console.error('Error creating image bitmap frow WebGL2 canvas:', error);
            }
            
        },
    },

})

function initShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram | null {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const shaderProgram = gl.createProgram();
      
  if (!shaderProgram) {
    return null;
  }

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    gl.deleteProgram(shaderProgram);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return shaderProgram;
}

function loadShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error('Unable to create shader');
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function initBuffers(gl: WebGL2RenderingContext): { position: WebGLBuffer } | null {
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    console.error('Failed to create the buffer object');
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return {position: positionBuffer};
}
