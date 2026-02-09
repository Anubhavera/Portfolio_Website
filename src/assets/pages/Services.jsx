import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { useNavigate } from "react-router-dom"
import dottedFragmentShader from "../shaders/dotted_globe_fragment.glsl"
import dottedVertexShader from "../shaders/dotted_globe_vertex.glsl"
import "../../App.css"

// Service categories data
const serviceCategories = [
  {
    title: "DESIGN SERVICES",
    services: ["Web Design", "App Design", "3D Design", "UI/UX Design", "Prototyping"]
  },
  {
    title: "DEVELOPMENT SERVICES",
    services: [
      "Frontend Development",
      "Backend Development",
      "Full Stack",
      "API Development",
      "Database Design"
    ]
  },
  {
    title: "TECHNOLOGIES",
    services: [
      "React",
      "Next.js",
      "Three.js",
      "Node.js",
      "Python",
      "TypeScript",
      "PostgreSQL",
      "Firebase"
    ]
  },
  {
    title: "AI & MACHINE LEARNING",
    services: [
      "LLM Integration",
      "Model Training",
      "RAG Systems",
      "Computer Vision",
      "NLP"
    ]
  }
]

const Services = () => {
  const navigate = useNavigate()
  const mountRef = useRef(null)

  useEffect(() => {
    let camera, scene, renderer, controls, sphere
    let animationId

    function init() {
      scene = new THREE.Scene()

      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        300
      )
      // Camera positioned to view globe on the left
      camera.position.set(-25, 5, 50)
      scene.add(camera)

      const geometry = new THREE.SphereGeometry(10, 64, 64)
      const material = new THREE.ShaderMaterial({
        vertexShader: dottedVertexShader,
        fragmentShader: dottedFragmentShader,
        uniforms: {
          iTime: { value: 0.0 },
          iResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
          uTransitionProgress: { value: 1.0 }, // Dotted wireframe mode
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      })

      sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(-30, 0, 0) // Globe on the left
      sphere.scale.set(1.8, 1.8, 1.8)
      scene.add(sphere)

      // Ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
      scene.add(ambientLight)

      // Point light for globe glow
      const pointLight = new THREE.PointLight(0x4488ff, 2.0, 100)
      pointLight.position.set(-25, 10, 20)
      scene.add(pointLight)

      // Rim light - blue tint for services page
      const rimLight = new THREE.PointLight(0x0066ff, 1.5, 60)
      rimLight.position.set(-35, 0, -10)
      scene.add(rimLight)

      // Optimized renderer
      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
      })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 1)
      mountRef.current.appendChild(renderer.domElement)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.enableZoom = false
      controls.autoRotate = false
      controls.enabled = false

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
      
      // Slow auto-rotation
      sphere.rotation.y += 0.002
      
      camera.lookAt(sphere.position.x, sphere.position.y, sphere.position.z)
      
      controls.update()
      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }

    init()
    animate()

    return () => {
      window.removeEventListener("resize", onWindowResize)
      cancelAnimationFrame(animationId)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  const handleBackToHome = () => {
    // Navigate with state to trigger zoom-out animation
    navigate("/", { state: { fromPage: 'services' } })
  }

  return (
    <>
      <div
        id="canvas-container"
        ref={mountRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
      ></div>
      
      <div className="services-container">
        <div 
          className="services-content"
          style={{ animation: "slideInFromRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <button 
            onClick={handleBackToHome}
            className="back-btn"
          >
            ← Back to Home
          </button>
          
          {serviceCategories.map((category, categoryIndex) => (
            <div 
              key={categoryIndex} 
              className="services-category"
              style={{ 
                animation: `fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                animationDelay: `${categoryIndex * 0.1}s`,
                opacity: 0
              }}
            >
              <h2 className="services-category-title">{category.title}</h2>
              <div className="services-pills">
                {category.services.map((service, serviceIndex) => (
                  <span 
                    key={serviceIndex} 
                    className="service-pill"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}

export default Services