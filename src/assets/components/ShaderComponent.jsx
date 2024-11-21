import * as THREE from "three";
import React, { useEffect, useRef } from "react";

const ShaderComponent = () => {
  const materialRef = useRef(null);

  useEffect(() => {
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 }, // For time-based animations
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float iTime;
        uniform vec2 iResolution;

        void main() {
          vec2 uv = vUv;
          vec3 color = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    if (materialRef.current) {
      materialRef.current.material = shaderMaterial;
    }

    return () => {
      shaderMaterial.dispose();
    };
  }, []);

  return (
    <mesh ref={materialRef}>
      <sphereGeometry args={[10, 64, 64]} />
    </mesh>
  );
};

export default ShaderComponent;
