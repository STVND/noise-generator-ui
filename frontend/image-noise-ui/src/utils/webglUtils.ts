export function initShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram | null {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  if (!vertexShader || !fragmentShader) {
    gl.deleteShader(vertexShader); // Ensure cleanup
    gl.deleteShader(fragmentShader);
    return null;
  }

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) {
    console.error('Unable to create shader program');
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
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

  gl.detachShader(shaderProgram, vertexShader);
  gl.detachShader(shaderProgram, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return shaderProgram;
}

export function loadShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error('Unable to create shader of type: ' + type);
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const shaderInfoLog = gl.getShaderInfoLog(shader);
    console.error(`An error occurred compiling the shaders (${type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'}): ${shaderInfoLog}\nSource:\n${source}`);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function initBuffers(gl: WebGL2RenderingContext): { position: WebGLBuffer } | null {
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    console.error('Failed to create the buffer object');
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0]; // Covers the entire clip space
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return { position: positionBuffer };
}

export async function fetchAndProcessShader(
    shaderPath: string,
    basePath: string = shaderPath.substring(0, shaderPath.lastIndexOf('/') + 1)
): Promise<string> {
    const response = await fetch(shaderPath);
    if (!response.ok) {
        throw new Error(`Failed to fetch shader: ${response.status} ${response.statusText} from ${shaderPath}`);
    }
    let source = await response.text();

    const includeRegex = /#include\s+"(.*?)"/g;
    let match;
    const includePromises: Promise<{ placeholder: string, content: string }>[] = [];

    // Important: Create a new regex for each exec loop or reset lastIndex if using a global regex in a loop.
    // Simpler: just re-declare regex or use a non-global one if only one include is expected per line.
    // For multiple includes in a file, this loop is fine.
    while ((match = includeRegex.exec(source)) !== null) {
        const includePath = match[1];
        const placeholder = match[0]; // Capture the placeholder for this iteration
        const fullIncludePath = new URL(includePath, new URL(basePath, window.location.origin).href).pathname;
        
        includePromises.push(
            fetch(fullIncludePath)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch include: ${res.status} ${fullIncludePath}`);
                    return res.text();
                })
                // Use the captured placeholder variable
                .then(content => ({ placeholder: placeholder, content }))
        );
    }
    const includedContents = await Promise.all(includePromises);
    for (const item of includedContents) {
        source = source.replace(item.placeholder, item.content);
    }
    return source;
}