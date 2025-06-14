#version 300 es
precision mediump float;


#define PERSISTENCE 0.5

uniform float u_tiling;
uniform float u_seed;
uniform float u_scale;
uniform float u_lacunarity;

uniform vec2 u_resolution;
out vec4 out_FragColor;

vec4 permute(vec4 t) {
    return t * (t * 34.0 + 133.0);
}

vec3 grad(float hash) {
    vec3 cube = mod(floor(hash / vec3(1.0, 2.0, 4.0)), 2.0) * 2.0 - 1.0;
    vec3 cuboct = cube;
    int index = int(floor(hash / 16.0));
    if (index == 0) {
        cuboct.x = 0.0;
    } else if (index == 1) {
        cuboct.y = 0.0;
    } else {
        cuboct.z = 0.0;
    }
    float type = mod(floor(hash / 8.0), 2.0);
    vec3 rhomb = (1.0 - type) * cube + type * (cuboct + cross(cube, cuboct));
    vec3 gradient = cuboct * 1.22474487139 + rhomb;
    gradient *= (1.0 - 0.042942436724648037 * type) * 32.80201376986577;
    return gradient;
}

vec4 openSimplex2Base(vec3 X) {
    vec3 v1 = round(X);
    vec3 d1 = X - v1;
    vec3 score1 = abs(d1);
    vec3 dir1 = step(max(score1.yzx, score1.zxy), score1);
    vec3 v2 = v1 + dir1 * sign(d1);
    vec3 d2 = X - v2;
    
    vec3 X2 = X + 144.5;
    vec3 v3 = round(X2);
    vec3 d3 = X2 - v3;
    vec3 score2 = abs(d3);
    vec3 dir2 = step(max(score2.yzx, score2.zxy), score2);
    vec3 v4 = v3 + dir2 * sign(d3);
    vec3 d4 = X2 - v4;
    
    vec4 hashes = permute(mod(vec4(v1.x, v2.x, v3.x, v4.x), 289.0));
    hashes = permute(mod(hashes + vec4(v1.y, v2.y, v3.y, v4.y), 289.0));
    hashes = mod(permute(mod(hashes + vec4(v1.z, v2.z, v3.z, v4.z), 289.0)), 48.0);
    
    vec4 a = max(0.5 - vec4(dot(d1, d1), dot(d2, d2), dot(d3, d3), dot(d4, d4)), 0.0);
    vec4 aa = a * a; vec4 aaaa = aa * aa;
    vec3 g1 = grad(hashes.x); vec3 g2 = grad(hashes.y);
    vec3 g3 = grad(hashes.z); vec3 g4 = grad(hashes.w);
    vec4 extrapolations = vec4(dot(d1, g1), dot(d2, g2), dot(d3, g3), dot(d4, g4));
    
    vec3 derivative = -8.0 * mat4x3(d1, d2, d3, d4) * (aa * a * extrapolations)
        + mat4x3(g1, g2, g3, g4) * aaaa;
    
    return vec4(derivative, dot(aaaa, extrapolations));
}

vec4 openSimplex2_ImproveXY(vec3 X) {
    mat3 orthonormalMap = mat3(
        0.788675134594813, -0.211324865405187, -0.577350269189626,
        -0.211324865405187, 0.788675134594813, -0.577350269189626,
        0.577350269189626, 0.577350269189626, 0.577350269189626);
    
    vec4 result = openSimplex2Base(orthonormalMap * X);
    return vec4(result.xyz * orthonormalMap, result.w);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution -.5 ;
    st *= (u_tiling * 15.0);
    st += sin(u_seed * 10.0);
    
    // --- Period Calculation for Tiling ---
    float period = 3000.0 / u_scale; 

    vec2 fractional_coords = fract(st / period);

    vec2 smooth_blend_weights = fractional_coords * fractional_coords * (3.0 - 2.0 * fractional_coords);

    float noise_value = 0.0;
    float total_amplitude = 0.0;
    float current_amplitude = 1.0;
    float current_frequency_multiplier = 1.0;
    float current_seed = u_seed;

    // --- First Octave ---
    vec2 coord00_2D_oct1 = fractional_coords * period * current_frequency_multiplier;
    vec2 coord10_2D_oct1 = (fractional_coords - vec2(1.0, 0.0)) * period * current_frequency_multiplier;
    vec2 coord01_2D_oct1 = (fractional_coords - vec2(0.0, 1.0)) * period * current_frequency_multiplier;
    vec2 coord11_2D_oct1 = (fractional_coords - vec2(1.0, 1.0)) * period * current_frequency_multiplier;

    float n00_oct1 = openSimplex2_ImproveXY(vec3(coord00_2D_oct1, current_seed)).w;
    float n10_oct1 = openSimplex2_ImproveXY(vec3(coord10_2D_oct1, current_seed)).w;
    float n01_oct1 = openSimplex2_ImproveXY(vec3(coord01_2D_oct1, current_seed)).w;
    float n11_oct1 = openSimplex2_ImproveXY(vec3(coord11_2D_oct1, current_seed)).w;

    float nx0_oct1 = mix(n00_oct1, n10_oct1, smooth_blend_weights.x);
    float nx1_oct1 = mix(n01_oct1, n11_oct1, smooth_blend_weights.x);
    noise_value += mix(nx0_oct1, nx1_oct1, smooth_blend_weights.y) * current_amplitude;
    total_amplitude += current_amplitude;

    // --- Second Octave ---
    current_amplitude *= PERSISTENCE;
    current_frequency_multiplier *= u_lacunarity;
    current_seed += 1.0;

    vec2 coord00_2D_oct2 = fractional_coords * period * current_frequency_multiplier;
    vec2 coord10_2D_oct2 = (fractional_coords - vec2(1.0, 0.0)) * period * current_frequency_multiplier;
    vec2 coord01_2D_oct2 = (fractional_coords - vec2(0.0, 1.0)) * period * current_frequency_multiplier;
    vec2 coord11_2D_oct2 = (fractional_coords - vec2(1.0, 1.0)) * period * current_frequency_multiplier;

    float n00_oct2 = openSimplex2_ImproveXY(vec3(coord00_2D_oct2, current_seed)).w;
    float n10_oct2 = openSimplex2_ImproveXY(vec3(coord10_2D_oct2, current_seed)).w;
    float n01_oct2 = openSimplex2_ImproveXY(vec3(coord01_2D_oct2, current_seed)).w;
    float n11_oct2 = openSimplex2_ImproveXY(vec3(coord11_2D_oct2, current_seed)).w;

    float nx0_oct2 = mix(n00_oct2, n10_oct2, smooth_blend_weights.x);
    float nx1_oct2 = mix(n01_oct2, n11_oct2, smooth_blend_weights.x);
    noise_value += mix(nx0_oct2, nx1_oct2, smooth_blend_weights.y) * current_amplitude;
    total_amplitude += current_amplitude;

    out_FragColor = vec4(vec3((noise_value / total_amplitude + 1.0) * 0.5), 1.0);
}