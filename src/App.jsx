import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Reflector } from "three/examples/jsm/objects/Reflector"
import "./App.css"
import fragmentShader from "./assets/shaders/fragment.glsl"
import vertexShader from "./assets/shaders/vertex.glsl"

function App() {
  const mountRef = useRef(null)

  useEffect(() => {
    let camera, scene, renderer, controls, sphere, reflector

    function init() {
      scene = new THREE.Scene()

      // Camera
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        300
      )
      camera.position.set(0, 0, 55)
      scene.add(camera)

      // Geometry and ShaderMaterial
      const geometry = new THREE.SphereGeometry(10, 64, 64)
      const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
          iTime: { value: 0.0 },
          iResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
        },
      })

      sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)

      const reflectorGeometry = new THREE.PlaneGeometry(100, 100)
      reflector = new Reflector(reflectorGeometry, {
        color: new THREE.Color(0x888888),
        textureWidth: window.innerWidth,
        textureHeight: window.innerHeight,
      })

      reflector.position.y = -13 // Position the reflector below the sphere
      reflector.rotation.x = -Math.PI / 2 // Rotate to face upwards
      scene.add(reflector)

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(0, 1, 0)
      scene.add(directionalLight)

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 1)
      renderer.debug.checkShaderErrors = true
      mountRef.current.appendChild(renderer.domElement)

      // Orbit Controls
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.enableZoom = false
      controls.autoRotate = false

      // Resize Event
      window.addEventListener("resize", onWindowResize)
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)

      // Update iResolution uniform
      sphere.material.uniforms.iResolution.value.set(
        window.innerWidth,
        window.innerHeight
      )
    }

    function animate() {
      sphere.material.uniforms.iTime.value += 0.01 // Update time
      controls.update()
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    init()
    animate()

    return () => {
      window.removeEventListener("resize", onWindowResize)
      mountRef.current.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <>
      <div
        id="canvas-container"
        ref={mountRef}
      ></div>
      <div id="overlay">
        <div className="navbar flex">
          <div className="brand">
            <h1>
              Anubhav <br />
              Hooda
            </h1>
          </div>

          <div className="available pl-40">
            <h2>For Work: </h2>
            <a
              className="h2 underline underline-offset-1 font-sans"
              href="mailto:hoodaanubhav@gmail.com"
            >
              {" "}
              hoodaanubhav@gmail.com
            </a>
          </div>
        </div>
        <main>
          <div className="columns">
            <div className="column"></div>
            <div className="column">
              {" "}
              This Website is actively under progress. Stay tuned! 🚀{" "}
            </div>
            <div className="column"></div>
          </div>
        </main>
      </div>
    </>
  )
}

export default App
