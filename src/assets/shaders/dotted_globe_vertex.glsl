uniform vec2 iResolution;
uniform float iTime;
uniform float uTransitionProgress;
uniform mat4 uSurfaceProjection;
varying vec4 vSurfaceClip;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vSurfaceClip = uSurfaceProjection * modelMatrix * vec4(position, 1.0);
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
