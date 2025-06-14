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

const PIGMENT_FRAGMENT_SHADER_RELATIVE_PATH = 'pigment_shaders/pigment.frag';
const PIGMENT_SHADER_DIR_RELATIVE_PATH = 'pigment_shaders/';

async function fetchAndCachePigmentShaders(): Promise<CachedShaderSources> {
  const fullShaderPath = `${import.meta.env.BASE_URL}${PIGMENT_FRAGMENT_SHADER_RELATIVE_PATH}`;
  const basePathForIncludes = `${import.meta.env.BASE_URL}${PIGMENT_SHADER_DIR_RELATIVE_PATH}`;
  try {
    const processedFsSource = await fetchAndProcessShader(fullShaderPath, basePathForIncludes);
    cachedSources = {
      vsSource: PIGMENT_VERTEX_SHADER_SOURCE,
      fsSource: processedFsSource,
    };
    return cachedSources;
  } catch (error) {
    console.error("Failed to fetch and cache pigment shader sources:", error);
    throw error;
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