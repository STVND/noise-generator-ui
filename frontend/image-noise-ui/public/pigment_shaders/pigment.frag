#version 300 es

precision mediump float;

#include "./davis-km.glsl"

uniform float u_red_amount;
uniform float u_blue_amount;
uniform float u_yellow_amount;
uniform float u_white_amount;
uniform float u_black_amount;
 
uniform vec2 u_resolution;

out vec4 FragColor;

void main() {
    pigment active_pigment = make_pigment(u_red_amount, u_blue_amount, u_yellow_amount, u_white_amount, u_black_amount);
    FragColor = vec4(pigment_to_srgb(active_pigment),1.0);
}