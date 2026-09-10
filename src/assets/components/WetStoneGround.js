import * as THREE from 'three'

// A displaced stone bed beneath the planar water. High stones physically occlude
// the mirror; their normal map supplies the fine relief caught by the pool light.
export function createWetStoneGround(surfaceMap, normalMap, fade) {
  const segments = window.innerWidth <= 760 ? 96 : 160
  const geometry = new THREE.PlaneGeometry(100, 100, segments, segments)
  const material = new THREE.MeshStandardMaterial({
    color: 0x4c5058,
    roughness: 0.8,
    metalness: 0.18,
    normalMap,
    normalScale: new THREE.Vector2(1.8, 1.8),
    displacementMap: surfaceMap,
    displacementScale: 1.25,
    displacementBias: -0.84,
    roughnessMap: surfaceMap,
  })
  material.onBeforeCompile = shader => {
    shader.uniforms.uGroundFade = fade
    shader.vertexShader = 'varying vec2 vGroundUv;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\nvGroundUv = uv;')
    shader.fragmentShader = 'uniform vec3 uGroundFade;\nvarying vec2 vGroundUv;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      float edgeFade = 1.0 - smoothstep(0.28, 0.5, distance(vGroundUv, vec2(0.5)));
      outgoingLight *= uGroundFade * edgeFade;
      #include <opaque_fragment>
    `)
  }
  const ground = new THREE.Mesh(geometry, material)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -11.5
  return ground
}
