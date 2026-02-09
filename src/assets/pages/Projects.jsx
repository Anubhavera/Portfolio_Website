import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { useNavigate } from "react-router-dom"
import dottedFragmentShader from "../shaders/dotted_globe_fragment.glsl"
import dottedVertexShader from "../shaders/dotted_globe_vertex.glsl"
import "../../App.css"

// Project data
const projects = [
  {
    title: "Sundown Studios",
    description: "A creative studio website displaying unique experiences, environments, and multidisciplinary design work.",
    tags: ["React", "GSAP", "Responsive Design", "Lenis"],
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    image: "sundown.png",
    link: "https://sundown-studios-snowy.vercel.app/"
  },
  {
    title: "Sprintly",
    description: "A multi-tenant kanban style project management tool built with Django + GraphQL backend and React + TypeScript frontend.",
    tags: ["React", "Django", "GraphQL", "TypeScript"],
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    image:"sprintly.png"
  },
  {
    title: "Legal AI Assistant",
    description: "Cross-platform AI assistant for legal queries with RAG pipeline and verified sources.",
    tags: ["Python", "FastAPI", "React Native", "LLM"],
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    // image:"https://placehold.co/600x400/667eea/ffffff?text=Working"
  },
  {
    title: "AdaptiveSLM",
    description: "Small Language Model with profile-aware knowledge distillation for edge devices.",
    tags: ["PyTorch", "Transformers", "PEFT", "Research"],
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    title: "Portfolio Website",
    description: "Three.js powered portfolio with animated globe and immersive transitions.",
    tags: ["Three.js", "React", "GSAP", "Shaders"],
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
  {
    title: "Video Editor App",
    description: "Expo-based mobile video editor with cloud rendering architecture.",
    tags: ["React Native", "Expo", "FFmpeg", "Cloud"],
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
  }
]

const Projects = () => {
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
      camera.position.set(15, 5, 50)
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
          uTransitionProgress: { value: 1.0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      })

      sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(25, 0, 0)
      sphere.scale.set(1.8, 1.8, 1.8)
      scene.add(sphere)

      // Ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
      scene.add(ambientLight)

      // Point light for globe glow
      const pointLight = new THREE.PointLight(0x4488ff, 2.0, 100)
      pointLight.position.set(25, 10, 20)
      scene.add(pointLight)

      // Rim light
      const rimLight = new THREE.PointLight(0x0066ff, 1.5, 60)
      rimLight.position.set(30, 0, -10)
      scene.add(rimLight)

      // Optimized renderer
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
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
      
      // Smooth auto-rotation
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
    navigate("/", { state: { fromPage: 'projects' } })
  }

  return (
    <>
      <div
        id="canvas-container"
        ref={mountRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
      ></div>
      
      <div 
        className="projects-page-content"
        style={{
          position: "relative",
          zIndex: 10,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "2rem",
          paddingTop: "3rem",
          paddingRight: "35%",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          animation: "slideInFromLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div style={{ width: "100%", maxWidth: "900px", marginBottom: "2rem" }}>
          <button 
            onClick={handleBackToHome}
            className="back-btn"
          >
            ← Back to Home
          </button>
          
          <h1 className="page-title">Featured Portfolio</h1>
          
          <p className="page-subtitle">
            I designed and developed these showcase projects with React, Three.js, and various cutting-edge technologies. 
            Various 3D elements and scenes are tailor-made to create more absorbing user experiences.
          </p>
        </div>
        
        <div className="projects-grid" style={{ maxWidth: "900px" }}>
          {projects.map((project, index) => (
            <div 
              key={index} 
              className="project-card"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {project.link ? (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-card-image-link"
                  style={{ display: "block", textDecoration: "none", color: "inherit" }}
                >
                  <div 
                    className="project-card-image"
                    style={{ 
                      background: project.image ? `url(${project.image}) center/cover no-repeat` : project.gradient,
                      position: "relative"
                    }}
                  >
                    {!project.image && (
                      <span style={{ 
                        fontSize: "3rem", 
                        opacity: 0.3, 
                        zIndex: 1,
                        fontFamily: "bebas"
                      }}>
                        {project.title.charAt(0)}
                      </span>
                    )}
                  </div>
                </a>
              ) : (
                <div 
                  className="project-card-image"
                  style={{ 
                    background: project.image ? `url(${project.image}) center/cover no-repeat` : project.gradient,
                    position: "relative"
                  }}
                >
                  {!project.image && (
                    <span style={{ 
                      fontSize: "3rem", 
                      opacity: 0.3, 
                      zIndex: 1,
                      fontFamily: "bebas"
                    }}>
                      {project.title.charAt(0)}
                    </span>
                  )}
                </div>
              )}

              <div className="project-card-content">
                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-card-description">{project.description}</p>
                <div className="project-card-tags">
                  {project.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
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
        
        .project-card {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        @media (max-width: 1200px) {
          .projects-page-content {
            padding-right: 2rem !important;
          }
          
          .projects-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}

export default Projects