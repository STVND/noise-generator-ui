#version 300 es
precision mediump float;

#define PI 3.14159265
uniform float u_tiling;
uniform float u_seed;
uniform float u_scale;
uniform float u_disorder;

uniform vec2 u_resolution;

out vec4 FragColor;

vec2 noise2x2(vec2 p, float seed) {
    float x = dot(p + seed, vec2(123.4, 234.5));
    float y = dot(p + seed, vec2(345.6, 456.7));
    vec2 noise = vec2(x, y);
    noise = sin(noise);
    noise = noise * 43758.5453;
    noise = fract(noise);
    return noise;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;
    st *= u_scale;
    st += sin(u_seed * u_disorder * 17.0);
    st *= u_tiling;
    vec2 currentGridId = floor(st);
    vec2 currentGridCoord = fract(st);

    currentGridCoord = currentGridCoord -.5;
    float pointsOnGrid = 0.0;
    float minDistFromPixel = 100.0;

    for (float i = -1.0; i <= 1.0; i++) {
        for (float j = -1.0; j<= 1.0; j++) {
            vec2 adjGridCoords = vec2(i, j);

            vec2 neighborGridId = currentGridId + adjGridCoords;
            vec2 wrappedNeighborGridId = mod(neighborGridId, u_scale);
            vec2 noise = noise2x2(wrappedNeighborGridId, u_seed);
            vec2 pointOnAdjGrid = adjGridCoords + sin(u_disorder * PI * noise) * 0.5;


            pointOnAdjGrid = adjGridCoords + sin(u_disorder * PI * noise) * 0.5;

            float dist = length(currentGridCoord - pointOnAdjGrid);
            minDistFromPixel = min(dist, minDistFromPixel);

            pointsOnGrid += smoothstep(.95, .96, 1.0-dist);

        }
    }

    vec3 color = vec3(minDistFromPixel); 

    FragColor = vec4(color, 1.0);

    
}