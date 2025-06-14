import { fetchAndProcessShader } from '@/utils/webglUtils';

export interface CachedShaderSources {
  vsSource: string;
  fsSource: string;
}

let cachedSources: CachedShaderSources | null = null;
let isFetching = false;
let fetchPromise: Promise<CachedShaderSources> | null = null;

const PIGMENT_VERTEX_SHADER_SOURCE = `#version 300 es
  in vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }`;

const PIGMENT_FRAGMENT_SHADER_PATH = '/pigment_shaders/pigment.frag';

async function fetchAndCachePigmentShaders(): Promise<CachedShaderSources> {
  const basePath = PIGMENT_FRAGMENT_SHADER_PATH.substring(0, PIGMENT_FRAGMENT_SHADER_PATH.lastIndexOf('/') + 1);
  
  try {
    const processedFsSource = await fetchAndProcessShader(PIGMENT_FRAGMENT_SHADER_PATH, basePath);
    cachedSources = {
      vsSource: PIGMENT_VERTEX_SHADER_SOURCE,
      fsSource: processedFsSource,
    };
    return cachedSources;
  } catch (error) {
    console.error("Failed to fetch and cache pigment shader sources:", error);
    throw error; // Re-throw to be caught by callers
  }
}

export async function getPigmentShaderSources(): Promise<CachedShaderSources> {
  if (cachedSources) {
    return Promise.resolve(cachedSources);
  }

  if (isFetching && fetchPromise) {
    return fetchPromise;
  }

  isFetching = true;
  fetchPromise = fetchAndCachePigmentShaders().finally(() => {
    isFetching = false;
  });
  return fetchPromise;
}