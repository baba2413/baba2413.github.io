#version 300 es

layout (location = 0) in vec3 aPos;

uniform float moveHorizon;
uniform float moveVertical;

void main() {
    gl_Position = vec4(aPos[0] + moveHorizon, aPos[1] + moveVertical, aPos[2], 1.0);
} 