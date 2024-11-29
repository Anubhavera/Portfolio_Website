import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Reflector } from "three/examples/jsm/objects/Reflector"
import "./App.css"
import "./assets/components/time"
import fragmentShader from "./assets/shaders/fragment.glsl"
import vertexShader from "./assets/shaders/vertex.glsl"
import LocalTime from "./assets/components/time"
import roughnessMapImg from "../src/assets/bg.jpg"

function App() {
  const mountRef = useRef(null)

  useEffect(() => {
    let camera, scene, renderer, controls, sphere, reflector

    function init() {
      scene = new THREE.Scene()

      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        300
      )
      camera.position.set(0, 0, 60)
      scene.add(camera)

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

      const textureLoader = new THREE.TextureLoader()
      const roughnessMap = textureLoader.load(roughnessMapImg)

      const reflectorGeometry = new THREE.PlaneGeometry(100, 100)
      reflector = new Reflector(reflectorGeometry, {
        color: new THREE.Color(0x888888),
        textureWidth: window.innerWidth,
        textureHeight: window.innerHeight,
        clipBias: 0.003,
        color: 0x888888,
      })

      reflector.material = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.6, // Adjust as needed
        roughnessMap: roughnessMap,
        metalness: 1, // Makes the surface more reflective
        envMapIntensity: 1.0,
      })

      reflector.position.y = -13 // Position the reflector below the sphere
      reflector.rotation.x = -Math.PI / 2 // Rotate to face upwards
      scene.add(reflector)

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(0, 1, 0)
      scene.add(directionalLight)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 1)
      renderer.debug.checkShaderErrors = true
      mountRef.current.appendChild(renderer.domElement)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.enableZoom = false
      controls.autoRotate = false

      window.addEventListener("resize", onWindowResize)
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)

      sphere.material.uniforms.iResolution.value.set(
        window.innerWidth,
        window.innerHeight
      )
    }

    function animate() {
      sphere.material.uniforms.iTime.value += 0.01
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
        <main>
          <div className="columns">
            <div className="grid grid-cols-4 gap-2 ">
              <div className="1 column h-screen relative flex flex-col ">
                <div className="brand">
                  <h1>
                    Anubhav <br />
                    Hooda
                  </h1>
                </div>

                <div className="absolute inset-x-0 bottom-2 h-16 jbm">
                  Local Time : <LocalTime />
                </div>
              </div>
              <div className="2 column h-screen">
                <div className="navbar flex">
                  <div className="available jbm decoration-slate-100">
                    <h2>For Work: </h2>
                    <a
                      className="h2 underline underline-offset-1 jbm"
                      href="mailto:hoodaanubhav@gmail.com"
                    >
                      hoodaanubhav@gmail.com
                    </a>
                  </div>
                  <div className="absolute inset-x-13 bottom-10 h-16  ">
                    <a
                      className="jbm font-light hover:font-bold"
                      href="https://www.linkedin.com/in/anubhavera"
                    >
                      LinkedIn
                    </a>
                    <br />
                    <a
                      className="jbm font-light hover:font-bold"
                      href="https://github.com/Anubhavera"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
              <div className="3 column justify-self-center h-screen jbm">
                <p>
                  <span className="font-normal hover:font-bold">React</span>,
                  <span className="font-normal hover:font-bold"> Routing</span>,
                  <br></br>
                  <span className="font-normal hover:font-bold"> Next.js</span>,
                  <span className="font-normal hover:font-bold"> GSAP</span>,
                  <span className="font-normal hover:font-bold"> Three.js</span>
                </p>
              </div>
              <div className="4 column justify-self-center jbm">
                <button className="btn font-normal hover:font-bold">
                  Home
                </button>
                <br />
                <button className="btn font-normal hover:font-bold">
                  Projects
                </button>
                <br />
                <button className="btn font-normal hover:font-bold">
                  Services
                </button>
                <br />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default App
