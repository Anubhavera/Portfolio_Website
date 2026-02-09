import React, { useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { WaterReflector } from "../components/WaterReflector"
import { useNavigate, useLocation } from "react-router-dom"
import gsap from "gsap"
import dottedFragmentShader from "../shaders/dotted_globe_fragment.glsl"
import dottedVertexShader from "../shaders/dotted_globe_vertex.glsl"
import LocalTime from "../components/time"
import roughnessMapImg from "../bg.jpg"

function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const sphereRef = useRef(null)
  const reflectorRef = useRef(null)
  const overlayRef = useRef(null)
  const rendererRef = useRef(null)
  const animationIdRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Get initial state from location
  const isFromOtherPage = location.state?.fromPage

  useEffect(() => {
    // Ensure mountRef is ready before initializing
    if (!mountRef.current) {
      console.warn("Mount ref not ready")
      return
    }

    let camera, scene, renderer, controls, sphere, reflector
    const mouse = { x: 0, y: 0 }
    const targetCameraPosition = { x: 0, y: 0 }

    function init() {
      try {
        scene = new THREE.Scene()
        sceneRef.current = scene

        camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          1,
          300
        )
        
        
        // Set initial camera position based on where we came from
        if (isFromOtherPage) {
          if (isFromOtherPage === 'services') {
            camera.position.set(-25, 5, 50)
          } else {
            camera.position.set(15, 5, 50)
          }
        } else {
          camera.position.set(0, 0, 60)
        }
        
        scene.add(camera)
        cameraRef.current = camera

        const geometry = new THREE.SphereGeometry(10, 64, 64)
        const material = new THREE.ShaderMaterial({
          vertexShader: dottedVertexShader,
          fragmentShader: dottedFragmentShader,
          uniforms: {
            iTime: { value: 0.0 },
            iResolution: {
              value: new THREE.Vector2(window.innerWidth, window.innerHeight),
            },
            uTransitionProgress: { value: isFromOtherPage ? 1.0 : 0.0 },
          },
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: true,
        })

        sphere = new THREE.Mesh(geometry, material)
        
        if (isFromOtherPage) {
          if (isFromOtherPage === 'services') {
            sphere.position.set(-30, 0, 0)
          } else {
            sphere.position.set(25, 0, 0)
          }
          sphere.scale.set(1.8, 1.8, 1.8)
        }
        
        scene.add(sphere)
        sphereRef.current = sphere

        const textureLoader = new THREE.TextureLoader()
        const roughnessMap = textureLoader.load(roughnessMapImg)
        roughnessMap.wrapS = THREE.RepeatWrapping
        roughnessMap.wrapT = THREE.RepeatWrapping
        roughnessMap.repeat.set(4, 4)

        // Reflector (Mirror)
        const reflectorGeometry = new THREE.PlaneGeometry(100, 100)
        reflector = new WaterReflector(reflectorGeometry, {
          color: new THREE.Color(isFromOtherPage ? 0x000000 : 0x888888), // Tints the reflection
          textureWidth: window.innerWidth * 0.5,
          textureHeight: window.innerHeight * 0.5,
          clipBias: 0.003,
        })
        
        // Set uniforms for custom water reflector
        if (reflector.material.uniforms.tRoughness) {
          reflector.material.uniforms.tRoughness.value = roughnessMap
        }
        reflector.material.uniforms.iTime = { value: 0 } // Initialize iTime if not already

        reflector.position.y = -15
        reflector.rotation.x = -Math.PI / 2
        scene.add(reflector)
        reflectorRef.current = reflector

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
        scene.add(ambientLight)

        const topPointLight = new THREE.PointLight(0xffffff, 2.5, 100)
        topPointLight.position.set(0, 35, 10)
        scene.add(topPointLight)

        const spotLight = new THREE.SpotLight(0xaaccff, 1.5)
        spotLight.position.set(0, 40, 0)
        spotLight.angle = Math.PI / 4
        spotLight.penumbra = 0.5
        spotLight.decay = 1.5
        spotLight.distance = 100
        spotLight.target = sphere
        scene.add(spotLight)

        const rimLight = new THREE.PointLight(0x6688ff, 1.2, 60)
        rimLight.position.set(0, 10, -20)
        scene.add(rimLight)

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
        fillLight.position.set(0, 5, 30)
        scene.add(fillLight)

        // Renderer
        renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
        })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x000000, 1)
        
        if (mountRef.current) {
          mountRef.current.appendChild(renderer.domElement)
          rendererRef.current = renderer
        }

        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.enableZoom = false
        controls.autoRotate = false
        controls.enabled = false

        window.addEventListener("resize", onWindowResize)
        window.addEventListener("mousemove", onMouseMove)
        
        setIsInitialized(true)
        
        // If coming from another page, trigger zoom-out animation after a delay
        if (isFromOtherPage) {
          setTimeout(() => playZoomOutAnimation(), 200)
        }
      } catch (error) {
        console.error("Error initializing Three.js:", error)
      }
    }
    
    function playZoomOutAnimation() {
      if (!overlayRef.current || !reflectorRef.current || !sphereRef.current || !cameraRef.current) {
        console.warn('Refs not ready for zoom-out animation')
        return
      }
      
      const tl = gsap.timeline()
      
      // Fade in UI Overlay
      if (overlayRef.current) {
        tl.to(overlayRef.current, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out"
        }, 0)
      }
      
      // Fade in reflector (by tinting color from black to grey)
      // Standard Reflector doesn't support opacity, so we animate color
      if (reflectorRef.current) {
        const material = reflectorRef.current.material
        if (material && material.uniforms && material.uniforms.color) {
          tl.to(material.uniforms.color.value, {
            r: 0.53, // 0x888888
            g: 0.53,
            b: 0.53,
            duration: 0.6,
            ease: "power2.out"
          }, 0.2)
        }
      }
      
      // Transform globe from dotted to solid
      if (sphereRef.current.material?.uniforms?.uTransitionProgress) {
        tl.to(sphereRef.current.material.uniforms.uTransitionProgress, {
          value: 0.0,
          duration: 1.0,
          ease: "power2.inOut"
        }, 0.1)
      }
      
      // Scale down globe
      tl.to(sphereRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.2,
        ease: "power2.inOut"
      }, 0.1)
      
      // Move globe back to center
      tl.to(sphereRef.current.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: "power2.inOut"
      }, 0.1)
      
      // Pan camera back
      tl.to(cameraRef.current.position, {
        x: 0,
        y: 0,
        z: 60,
        duration: 1.2,
        ease: "power2.inOut"
      }, 0.1)
    }

    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      targetCameraPosition.x = mouse.x * 3
      targetCameraPosition.y = mouse.y * 3
    }

    function onWindowResize() {
      if (!cameraRef.current || !rendererRef.current || !sphereRef.current) return
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      sphereRef.current.material.uniforms.iResolution.value.set(
        window.innerWidth,
        window.innerHeight
      )
    }

    function animate() {
      if (!sphereRef.current || !cameraRef.current || !rendererRef.current || !sceneRef.current) {
        animationIdRef.current = requestAnimationFrame(animate)
        return
      }
      
      sphereRef.current.material.uniforms.iTime.value += 0.01
      
      // Animate water distortion
      if (reflectorRef.current && reflectorRef.current.material.uniforms.iTime) {
        reflectorRef.current.material.uniforms.iTime.value += 0.015
      }
      
      // Smooth camera movement
      cameraRef.current.position.x += (targetCameraPosition.x - cameraRef.current.position.x) * 0.03
      cameraRef.current.position.y += (targetCameraPosition.y - cameraRef.current.position.y) * 0.03
      
      cameraRef.current.lookAt(
        sphereRef.current.position.x, 
        sphereRef.current.position.y, 
        sphereRef.current.position.z
      )
      
      controls.update()
      rendererRef.current.render(sceneRef.current, cameraRef.current)
      animationIdRef.current = requestAnimationFrame(animate)
    }

    init()
    animate()

    return () => {
      window.removeEventListener("resize", onWindowResize)
      window.removeEventListener("mousemove", onMouseMove)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement)
      }
      rendererRef.current?.dispose()
    }
  }, [isFromOtherPage])

  const handleNavigateWithAnimation = useCallback((path) => {
    if (isAnimating || !sphereRef.current || !cameraRef.current || !reflectorRef.current) return
    setIsAnimating(true)

    const sphere = sphereRef.current
    const camera = cameraRef.current
    const reflector = reflectorRef.current

    const tl = gsap.timeline({
      onComplete: () => {
        navigate(path, { state: { fromPage: 'home' } })
      }
    })

    // Fade out UI Overlay
    if (overlayRef.current) {
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power3.out"
      }, 0)
    }

    // Fade out reflector (tint to black)
    if (reflectorRef.current) {
      const material = reflectorRef.current.material
      if (material && material.uniforms && material.uniforms.color) {
        tl.to(material.uniforms.color.value, {
          r: 0,
          g: 0,
          b: 0,
          duration: 0.4,
          ease: "power2.out"
        }, 0)
      }
    }

    // Transform to dotted wireframe
    if (sphere.material?.uniforms?.uTransitionProgress) {
      tl.to(sphere.material.uniforms.uTransitionProgress, {
        value: 1.0,
        duration: 0.9,
        ease: "power2.inOut"
      }, 0.1)
    }

    // Scale up globe
    tl.to(sphere.scale, {
      x: 1.8,
      y: 1.8,
      z: 1.8,
      duration: 1.0,
      ease: "power2.inOut"
    }, 0.1)

    // Determine direction based on path
    const isServices = path === "/services"
    const targetX = isServices ? -30 : 25
    const cameraX = isServices ? -25 : 15

    // Move globe
    tl.to(sphere.position, {
      x: targetX,
      y: 0,
      z: 0,
      duration: 1.0,
      ease: "power2.inOut"
    }, 0.1)

    // Camera follows
    tl.to(camera.position, {
      x: cameraX,
      y: 5,
      z: 50,
      duration: 1.0,
      ease: "power2.inOut"
    }, 0.1)
  }, [isAnimating, navigate])

  return (
    <>
      <div className="top-light-gradient"></div>
      <div id="canvas-container" ref={mountRef}></div>
      <div id="overlay" ref={overlayRef} style={{ opacity: isFromOtherPage ? 0 : 1 }}>
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
                <button 
                  className="btn font-normal hover:font-bold" 
                  onClick={() => navigate("/")}
                  disabled={isAnimating}
                >
                  Home
                </button>
                <br />
                <button 
                  className="btn font-normal hover:font-bold" 
                  onClick={() => handleNavigateWithAnimation("/projects")}
                  disabled={isAnimating}
                >
                  Projects
                </button>
                <br />
                <button 
                  className="btn font-normal hover:font-bold" 
                  onClick={() => handleNavigateWithAnimation("/services")}
                  disabled={isAnimating}
                >
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

export default Home
