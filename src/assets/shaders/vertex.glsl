uniform vec2 iResolution;
uniform float iTime;


void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// void main() {
//   vec3 transformed = position;
//   transformed.x += sin(uTime + position.y) * 0.5;
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
// }
