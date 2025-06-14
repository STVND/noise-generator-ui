#version 300 es
precision mediump float;

uniform float u_seed;
uniform vec2 u_resolution;

out vec4 fragColor;

float random(vec2 st,  float seed) {
    st /= log(cos(seed));
    seed = max(0.00024, seed);
    seed = cos(seed * log(seed)) * sin(pow(seed, log(seed/10.0)));
    seed = fract(seed);
    return fract(
            sin(
            dot(st, vec2(12.9898 + seed , 78.233 + seed)))
            * 43758.5453123
            );
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution - .5;
    float rnd = random(st, u_seed);

    fragColor = vec4(vec3(rnd),1.0);
}