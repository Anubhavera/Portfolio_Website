import React, { useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { WaterReflector } from "../components/WaterReflector"
import { useNavigate, useLocation } from "react-router-dom"
import gsap from "gsap"
import dottedFragmentShader from "../shaders/dotted_globe_fragment.glsl"
import dottedVertexShader from "../shaders/dotted_globe_vertex.glsl"
import roughnessMapImg from "../bg.jpg"

/**
 * RefinedHome
 * ───────────
 * Same Three.js scene + GSAP transitions as Home.jsx, with a refined
 * editorial layout: top studio light, hairline frame, stroked name
 * overlay, FIG. labels around the sphere, tagline, edge labels, and a
 * scrolling bottom marquee.
 */
function RefinedHome() {
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
  const [clock, setClock] = useState("IST —:—")

  const isFromOtherPage = location.state?.fromPage

  /* ── live clock ─────────────────────────────────────────────────── */
  useEffect(() => {
    const tick = () => {
      const t = new Date().toLocaleTimeString([], {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      setClock("IST " + t)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  /* ── three.js scene ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!mountRef.current) return

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

        if (isFromOtherPage) {
          if (isFromOtherPage === "services") camera.position.set(-25, 5, 50)
          else camera.position.set(15, 5, 50)
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
          if (isFromOtherPage === "services") sphere.position.set(-30, 0, 0)
          else sphere.position.set(25, 0, 0)
          sphere.scale.set(1.8, 1.8, 1.8)
        }
        scene.add(sphere)
        sphereRef.current = sphere

        const textureLoader = new THREE.TextureLoader()
        const roughnessMap = textureLoader.load(roughnessMapImg)
        roughnessMap.wrapS = THREE.RepeatWrapping
        roughnessMap.wrapT = THREE.RepeatWrapping
        roughnessMap.repeat.set(4, 4)

        const reflectorGeometry = new THREE.PlaneGeometry(100, 100)
        reflector = new WaterReflector(reflectorGeometry, {
          color: new THREE.Color(isFromOtherPage ? 0x000000 : 0x888888),
          textureWidth: window.innerWidth * 0.5,
          textureHeight: window.innerHeight * 0.5,
          clipBias: 0.003,
        })
        if (reflector.material.uniforms.tRoughness) {
          reflector.material.uniforms.tRoughness.value = roughnessMap
        }
        reflector.material.uniforms.iTime = { value: 0 }
        reflector.position.y = -15
        reflector.rotation.x = -Math.PI / 2
        scene.add(reflector)
        reflectorRef.current = reflector

        scene.add(new THREE.AmbientLight(0xffffff, 0.3))

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

        if (isFromOtherPage) {
          setTimeout(() => playZoomOutAnimation(), 200)
        }
      } catch (error) {
        console.error("Error initializing Three.js:", error)
      }
    }

    function playZoomOutAnimation() {
      if (
        !overlayRef.current ||
        !reflectorRef.current ||
        !sphereRef.current ||
        !cameraRef.current
      )
        return

      const tl = gsap.timeline()

      tl.to(overlayRef.current, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0)

      const rmat = reflectorRef.current.material
      if (rmat?.uniforms?.color) {
        tl.to(
          rmat.uniforms.color.value,
          { r: 0.53, g: 0.53, b: 0.53, duration: 0.6, ease: "power2.out" },
          0.2
        )
      }

      if (sphereRef.current.material?.uniforms?.uTransitionProgress) {
        tl.to(
          sphereRef.current.material.uniforms.uTransitionProgress,
          { value: 0.0, duration: 1.0, ease: "power2.inOut" },
          0.1
        )
      }

      tl.to(
        sphereRef.current.scale,
        { x: 1, y: 1, z: 1, duration: 1.2, ease: "power2.inOut" },
        0.1
      )
      tl.to(
        sphereRef.current.position,
        { x: 0, y: 0, z: 0, duration: 1.2, ease: "power2.inOut" },
        0.1
      )
      tl.to(
        cameraRef.current.position,
        { x: 0, y: 0, z: 60, duration: 1.2, ease: "power2.inOut" },
        0.1
      )
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
      if (
        !sphereRef.current ||
        !cameraRef.current ||
        !rendererRef.current ||
        !sceneRef.current
      ) {
        animationIdRef.current = requestAnimationFrame(animate)
        return
      }
      sphereRef.current.material.uniforms.iTime.value += 0.01
      if (reflectorRef.current?.material.uniforms.iTime) {
        reflectorRef.current.material.uniforms.iTime.value += 0.015
      }
      cameraRef.current.position.x +=
        (targetCameraPosition.x - cameraRef.current.position.x) * 0.03
      cameraRef.current.position.y +=
        (targetCameraPosition.y - cameraRef.current.position.y) * 0.03
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
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement)
      }
      rendererRef.current?.dispose()
    }
  }, [isFromOtherPage])

  /* ── navigation w/ transition ───────────────────────────────────── */
  const handleNavigateWithAnimation = useCallback(
    (path) => {
      if (
        isAnimating ||
        !sphereRef.current ||
        !cameraRef.current ||
        !reflectorRef.current
      )
        return
      setIsAnimating(true)

      const sphere = sphereRef.current
      const camera = cameraRef.current

      const tl = gsap.timeline({
        onComplete: () => navigate(path, { state: { fromPage: "home" } }),
      })

      if (overlayRef.current) {
        tl.to(overlayRef.current, { opacity: 0, duration: 0.5, ease: "power3.out" }, 0)
      }

      const rmat = reflectorRef.current.material
      if (rmat?.uniforms?.color) {
        tl.to(
          rmat.uniforms.color.value,
          { r: 0, g: 0, b: 0, duration: 0.4, ease: "power2.out" },
          0
        )
      }

      if (sphere.material?.uniforms?.uTransitionProgress) {
        tl.to(
          sphere.material.uniforms.uTransitionProgress,
          { value: 1.0, duration: 0.9, ease: "power2.inOut" },
          0.1
        )
      }
      tl.to(
        sphere.scale,
        { x: 1.8, y: 1.8, z: 1.8, duration: 1.0, ease: "power2.inOut" },
        0.1
      )

      const isServices = path === "/services"
      const targetX = isServices ? -30 : 25
      const cameraX = isServices ? -25 : 15

      tl.to(
        sphere.position,
        { x: targetX, y: 0, z: 0, duration: 1.0, ease: "power2.inOut" },
        0.1
      )
      tl.to(
        camera.position,
        { x: cameraX, y: 5, z: 50, duration: 1.0, ease: "power2.inOut" },
        0.1
      )
    },
    [isAnimating, navigate]
  )

  /* ── marquee content ────────────────────────────────────────────── */
  const marqueeItems = [
    ["Currently", "Available for Work · Q3 2026"],
    ["Built with", "Three.js · GSAP"],
    ["Latest project", "Temporal Workflow Agent"],
    ["Open to", "Freelance · Contract · Full-time"],
    ["Reach", "hoodaanubhav@gmail.com"],
    ["Region", "Asia / Kolkata · GMT +5:30"],
    ["Vol.", "01 / 2026"],
  ]
  const marqueeRow = (key) => (
    <React.Fragment key={key}>
      {marqueeItems.map(([k, v], i) => (
        <React.Fragment key={`${key}-${i}`}>
          <span>
            {k}&nbsp;<b>{v}</b>
          </span>
          <span className="sep">/</span>
        </React.Fragment>
      ))}
    </React.Fragment>
  )

  return (
    <div className="refined-home">
      {/* scoped styles for this page only */}
      <style>{refinedCss}</style>

      {/* three.js canvas mount */}
      <div id="canvas-container" ref={mountRef}></div>

      {/* top studio light */}
      <div className="rh-toplight"></div>

      {/* the entire UI overlay — animates as one unit during page transitions */}
      <div
        className="rh-overlay"
        ref={overlayRef}
        style={{ opacity: isFromOtherPage ? 0 : 1 }}
      >
        <div className="rh-frame">
          {/* ───────────────── TOP BAR ───────────────── */}
          <header className="rh-topbar">
            <div className="rh-brand">
              <div className="ah-mark">
                Anubhav
                <br />
                Hooda
              </div>
              <div className="role">
                <b>Design&nbsp;Engineer</b>&nbsp;·&nbsp;WebGL&nbsp;·&nbsp;Interfaces
              </div>
            </div>

            <nav className="rh-nav">
              <button
                type="button"
                className="active"
                onClick={() => navigate("/")}
                disabled={isAnimating}
              >
                <span className="ix">00</span>Home
              </button>
              <button
                type="button"
                onClick={() => handleNavigateWithAnimation("/projects")}
                disabled={isAnimating}
              >
                <span className="ix">01</span>Work
              </button>
              <button
                type="button"
                onClick={() => handleNavigateWithAnimation("/services")}
                disabled={isAnimating}
              >
                <span className="ix">02</span>About
              </button>
              <a href="mailto:hoodaanubhav@gmail.com">
                <span className="ix">03</span>Contact
              </a>
            </nav>

            <div className="rh-meta-right">
              <div className="status-pill">
                <span className="dot"></span>Available · Q3 2026
              </div>
              <div>
                <b>{clock}</b>&nbsp;·&nbsp;New Delhi
              </div>
              <div>28.61°N · 77.20°E</div>
            </div>
          </header>

          {/* ───────────────── STAGE ───────────────── */}
          <section className="rh-stage">
            <div className="name-overlay">Anubhav&nbsp;Hooda</div>

            <div className="fig t1">
              <span className="num">FIG.&nbsp;01</span>
              <span className="ln"></span>
              <span>Holographic&nbsp;Noise&nbsp;·&nbsp;GLSL</span>
            </div>
            <div className="fig t2">
              <span className="num">FIG.&nbsp;02</span>
              <span className="ln"></span>
              <span>Wet&nbsp;Stone&nbsp;Reflection</span>
            </div>

            <div className="tag-block">
              <div className="pre">A portfolio by Anubhav Hooda · Vol. 01 · 2026</div>
              <p className="tag">
                I design and build <b>interactive interfaces</b> on the web —
                usually sitting somewhere between a React app and a shader.
                <br />
                Currently selectively open to collaborations.
              </p>
            </div>
          </section>

          {/* ───────────────── BOTTOM BAR ───────────────── */}
          <footer className="rh-bottombar">
            <div className="bb-left">
              <div>Local Time</div>
              <div className="row">
                <b>{clock}</b>&nbsp;·&nbsp;<span>New&nbsp;Delhi,&nbsp;IN</span>
              </div>
            </div>
            <div className="bb-center">
              Stack&nbsp;·&nbsp;React&nbsp;·&nbsp;Next.js&nbsp;·&nbsp;Three.js&nbsp;·&nbsp;GSAP&nbsp;·&nbsp;TypeScript
            </div>
            <div className="bb-right">
              <div className="label">For Work</div>
              <a href="mailto:hoodaanubhav@gmail.com">hoodaanubhav@gmail.com</a>
              <div className="socials">
                <a
                  href="https://www.linkedin.com/in/anubhavera"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/Anubhavera"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </div>
            </div>
          </footer>
        </div>

        {/* edge labels */}
        <div className="rh-edge-l">FIG. 01 · ANUBHAV HOODA — Vol. 01 / 2026</div>
        <div className="rh-edge-r">SESSION ACTIVE · WEBGL ENABLED · 60FPS</div>

        {/* hairline frame w/ corner ticks */}
        <div className="rh-frame-edge">
          <span></span>
          <span></span>
        </div>

        {/* bottom marquee */}
        <div className="rh-marquee-strip">
          <div className="rh-marquee">
            {marqueeRow("a")}
            {marqueeRow("b")}
          </div>
        </div>

        {/* film grain */}
        <div className="rh-grain"></div>
      </div>
    </div>
  )
}

export default RefinedHome

/* ───────────────────────────────────────────────────────────────────
 * Scoped CSS — everything is namespaced under .refined-home so it
 * cannot leak into Projects/Services or fight with App.css.
 * ───────────────────────────────────────────────────────────────────*/
const refinedCss = `
.refined-home { background: #000; color: #fff; min-height: 100vh; }
.refined-home * { box-sizing: border-box; }
.refined-home { font-family: "jbm", ui-monospace, monospace; cursor: crosshair; }

.refined-home .rh-toplight {
  position: fixed; top: 0; left: 0; width: 100%; height: 50%;
  z-index: 2; pointer-events: none;
  background: radial-gradient(ellipse 70% 50% at 50% -10%,
    rgba(160, 200, 255, 0.18) 0%,
    rgba(100, 140, 255, 0.06) 30%,
    transparent 70%);
}

.refined-home .rh-grain {
  position: fixed; inset: 0; z-index: 30; pointer-events: none;
  opacity: 0.05; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

.refined-home .rh-frame-edge {
  position: fixed; inset: 16px; z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.06);
  pointer-events: none;
}
.refined-home .rh-frame-edge::before, .refined-home .rh-frame-edge::after,
.refined-home .rh-frame-edge > span:nth-child(1),
.refined-home .rh-frame-edge > span:nth-child(2) {
  content: ""; position: absolute; width: 12px; height: 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.refined-home .rh-frame-edge::before { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
.refined-home .rh-frame-edge::after  { top: -1px; right: -1px; border-left: 0; border-bottom: 0; }
.refined-home .rh-frame-edge > span:nth-child(1) { bottom: -1px; left: -1px; border-right: 0; border-top: 0; }
.refined-home .rh-frame-edge > span:nth-child(2) { bottom: -1px; right: -1px; border-left: 0; border-top: 0; }

.refined-home .rh-overlay {
  position: relative; z-index: 4;
  width: 100vw; height: 100vh;
  pointer-events: none;
}
.refined-home .rh-overlay > * { pointer-events: auto; }
.refined-home .rh-overlay .rh-toplight,
.refined-home .rh-overlay .rh-grain,
.refined-home .rh-overlay .rh-frame-edge { pointer-events: none; }

.refined-home .rh-frame {
  position: relative; z-index: 11;
  width: 100vw; height: 100vh;
  padding: 36px 48px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  pointer-events: none;
}
.refined-home .rh-frame > * { pointer-events: auto; }

.refined-home .rh-topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: start;
  gap: 32px;
}

.refined-home .rh-brand { display: flex; flex-direction: column; gap: 8px; }
.refined-home .rh-brand .ah-mark {
  font-family: "bebas";
  font-size: 56px;
  line-height: 0.86;
  letter-spacing: 0.01em;
  color: #fff;
}
.refined-home .rh-brand .role {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 6px;
}
.refined-home .rh-brand .role b { color: #fff; font-weight: 500; }

.refined-home .rh-nav {
  display: flex; gap: 36px;
  align-items: center;
  justify-self: center;
}
.refined-home .rh-nav a,
.refined-home .rh-nav button {
  background: none; border: 0; cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  position: relative;
  padding: 8px 0;
  display: flex; align-items: baseline; gap: 8px;
  transition: color 0.25s ease;
}
.refined-home .rh-nav a .ix,
.refined-home .rh-nav button .ix {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
}
.refined-home .rh-nav a::after,
.refined-home .rh-nav button::after {
  content: "";
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 1px;
  background: #fff;
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.7, 0, 0.2, 1);
}
.refined-home .rh-nav a:hover,
.refined-home .rh-nav button:hover { color: #fff; }
.refined-home .rh-nav a:hover::after,
.refined-home .rh-nav button:hover::after { transform: scaleX(1); }
.refined-home .rh-nav .active { color: #fff; }
.refined-home .rh-nav .active::after { transform: scaleX(1); }
.refined-home .rh-nav button:disabled { opacity: 0.55; cursor: default; }

.refined-home .rh-meta-right {
  justify-self: end;
  display: flex; flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}
.refined-home .rh-meta-right b { color: #fff; font-weight: 500; }
.refined-home .rh-meta-right .status-pill {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 12px;
  border: 1px solid rgba(124, 243, 161, 0.4);
  border-radius: 999px;
  background: rgba(124, 243, 161, 0.05);
  color: #fff;
  font-size: 10px; letter-spacing: 0.22em;
}
.refined-home .rh-meta-right .status-pill .dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #7cf3a1; box-shadow: 0 0 10px #7cf3a1;
  animation: rh-pulse 2s ease-in-out infinite;
}
@keyframes rh-pulse { 50% { opacity: 0.45; } }

.refined-home .rh-stage { position: relative; align-self: stretch; }

.refined-home .name-overlay {
  position: absolute;
  left: 50%; transform: translateX(-50%);
  top: 8%;
  font-family: "bebas";
  font-size: clamp(120px, 16vw, 240px);
  line-height: 0.88;
  letter-spacing: -0.005em;
  text-transform: uppercase;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.16);
  pointer-events: none;
  white-space: nowrap;
}

.refined-home .tag-block {
  position: absolute;
  left: 50%; bottom: 6%;
  transform: translateX(-50%);
  text-align: center;
  max-width: 640px;
  pointer-events: auto;
}
.refined-home .tag-block .pre {
  font-size: 10px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(180, 210, 255, 0.7);
  margin-bottom: 14px;
}
.refined-home .tag-block .pre::before { content: "— "; color: rgba(255,255,255,0.35); }
.refined-home .tag-block .pre::after  { content: " —"; color: rgba(255,255,255,0.35); }
.refined-home .tag-block .tag {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.02em;
}
.refined-home .tag-block .tag b { color: #fff; font-weight: 500; }

.refined-home .fig {
  position: absolute;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  display: flex; align-items: center; gap: 8px;
}
.refined-home .fig .num {
  color: rgba(255, 255, 255, 0.85);
  font-family: "bebas";
  font-size: 13px;
  letter-spacing: 0.04em;
}
.refined-home .fig .ln {
  width: 36px; height: 1px;
  background: rgba(255, 255, 255, 0.3);
}
.refined-home .fig.t1 { top: 30%; left: 16%; }
.refined-home .fig.t2 { top: 64%; right: 16%; flex-direction: row-reverse; }

.refined-home .rh-bottombar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: end;
  gap: 24px;
}
.refined-home .bb-left {
  font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.7;
}
.refined-home .bb-left b { color: #fff; font-weight: 500; font-family: "jbm"; letter-spacing: 0.1em; }
.refined-home .bb-left .row { display: flex; justify-content: space-between; gap: 24px; max-width: 240px; }

.refined-home .bb-center {
  text-align: center;
  font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.refined-home .bb-right {
  justify-self: end;
  display: flex; flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.refined-home .bb-right .label {
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 2px;
}
.refined-home .bb-right a {
  color: #fff;
  font-size: 13px;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 2px;
  transition: border-color 0.25s ease;
}
.refined-home .bb-right a:hover { border-color: #fff; }
.refined-home .bb-right .socials { display: flex; gap: 18px; margin-top: 6px; }
.refined-home .bb-right .socials a {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  border: 0;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.25s ease;
}
.refined-home .bb-right .socials a::after { content: " ↗"; color: rgba(255,255,255,0.3); }
.refined-home .bb-right .socials a:hover { color: #fff; }

.refined-home .rh-edge-l, .refined-home .rh-edge-r {
  position: fixed; top: 50%; z-index: 11;
  font-size: 10px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  transform-origin: center;
  pointer-events: none;
}
.refined-home .rh-edge-l { left: 30px; transform: translateY(-50%) rotate(-90deg); }
.refined-home .rh-edge-r { right: 30px; transform: translateY(-50%) rotate(90deg); }

.refined-home .rh-marquee-strip {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  height: 26px;
  overflow: hidden;
  z-index: 9;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
.refined-home .rh-marquee {
  display: flex; gap: 56px;
  white-space: nowrap;
  animation: rh-scroll 70s linear infinite;
  padding: 7px 0;
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
}
.refined-home .rh-marquee b { color: #fff; font-weight: 500; }
.refined-home .rh-marquee .sep { color: rgba(255, 255, 255, 0.18); }
@keyframes rh-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
`
