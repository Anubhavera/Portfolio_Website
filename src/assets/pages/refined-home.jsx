import { useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"
import { WaterReflector } from "../components/WaterReflector"
import { useNavigate, useLocation } from "react-router-dom"
import gsap from "gsap"
import dottedFragmentShader from "../shaders/dotted_globe_fragment.glsl"
import dottedVertexShader from "../shaders/dotted_globe_vertex.glsl"
import roughnessMapImg from "../bg.jpg"

/**
 * RefinedHome
 * ───────────
 * Original iridescent sphere, reflective floor, mouse parallax, and GSAP
 * route transitions with a quieter responsive overlay and managed cleanup.
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
  const transitionRef = useRef(false)
  const timelineRef = useRef(null)
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
    const mount = mountRef.current
    if (!mount) return

    let camera, scene, renderer, sphere, reflector, roughnessMap
    let returnTimer
    let previousTime = performance.now()
    let disposed = false
    let textureReady = false
    let announcedReady = false
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    transitionRef.current = Boolean(isFromOtherPage)
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
        roughnessMap = textureLoader.load(roughnessMapImg, () => {
          if (disposed) roughnessMap.dispose()
          else { textureReady = true; renderStillFrame() }
        }, undefined, () => {
          textureReady = true
          renderStillFrame()
        })
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
        reflector.position.y = -11.5
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

        mount.appendChild(renderer.domElement)
        rendererRef.current = renderer

        window.addEventListener("resize", onWindowResize)
        window.addEventListener("mousemove", onMouseMove, { passive: true })
        window.addEventListener("blur", resetMouse)
        document.addEventListener("mouseleave", resetMouse)
        document.addEventListener("visibilitychange", onVisibilityChange)
        reducedMotion.addEventListener("change", onMotionChange)
        renderer.domElement.addEventListener("webglcontextlost", onContextLost)
        renderer.domElement.addEventListener("webglcontextrestored", onContextRestored)

        if (isFromOtherPage) {
          returnTimer = setTimeout(() => playZoomOutAnimation(), 100)
        }
      } catch (error) {
        console.error("Error initializing Three.js:", error)
        transitionRef.current = false
        if (overlayRef.current) overlayRef.current.style.opacity = "1"
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

      const tl = gsap.timeline({
        onComplete: () => {
          transitionRef.current = false
          renderStillFrame()
        },
      })
      timelineRef.current = tl

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
      if (reducedMotion.matches) tl.progress(1)
    }

    function onMouseMove(event) {
      if (reducedMotion.matches || !window.matchMedia("(pointer: fine)").matches) return
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      targetCameraPosition.x = mouse.x * 3
      targetCameraPosition.y = mouse.y * 3
    }

    function resetMouse() {
      targetCameraPosition.x = 0
      targetCameraPosition.y = 0
    }

    function onContextLost(event) {
      event.preventDefault()
      clearTimeout(returnTimer)
      cancelAnimationFrame(animationIdRef.current)
      timelineRef.current?.kill()
      transitionRef.current = false
      setIsAnimating(false)
      if (overlayRef.current) overlayRef.current.style.opacity = "1"
    }

    function onContextRestored() {
      sphere.position.set(0, 0, 0)
      sphere.scale.setScalar(1)
      sphere.material.uniforms.uTransitionProgress.value = 0
      reflector.material.uniforms.color.value.setRGB(.53, .53, .53)
      camera.position.set(0, 0, 60)
      resetMouse()
      onVisibilityChange()
    }

    function renderStillFrame() {
      if (!disposed && renderer && scene && camera && !renderer.getContext().isContextLost()) {
        camera.lookAt(0, 0, 0)
        renderer.render(scene, camera)
        if (textureReady && !announcedReady) {
          announcedReady = true
          document.fonts.ready.then(() => {
            if (!disposed) window.dispatchEvent(new Event("portfolio:ready"))
          })
        }
      }
    }

    function onMotionChange() {
      resetMouse()
      if (reducedMotion.matches) {
        timelineRef.current?.progress(1)
        camera?.position.set(0, 0, 60)
      }
      onVisibilityChange()
    }

    function onVisibilityChange() {
      cancelAnimationFrame(animationIdRef.current)
      if (!document.hidden && !disposed) {
        previousTime = performance.now()
        animate(previousTime)
      }
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
      reflector?.getRenderTarget().setSize(
        Math.max(1, Math.round(window.innerWidth * 0.5)),
        Math.max(1, Math.round(window.innerHeight * 0.5))
      )
      renderStillFrame()
    }

    function animate(now = performance.now()) {
      if (disposed || document.hidden || !renderer || renderer.getContext().isContextLost()) return
      const delta = Math.min((now - previousTime) / 1000, 0.05)
      previousTime = now
      if (!reducedMotion.matches) {
        sphere.material.uniforms.iTime.value += delta * 0.6
        reflector.material.uniforms.iTime.value += delta * 0.9
        // GSAP owns the camera during route transitions. Mouse parallax resumes afterward.
        if (!transitionRef.current) {
          const damping = 1 - Math.pow(0.97, delta * 60)
          camera.position.x += (targetCameraPosition.x - camera.position.x) * damping
          camera.position.y += (targetCameraPosition.y - camera.position.y) * damping
        }
      }
      renderStillFrame()
      if (!reducedMotion.matches || transitionRef.current) {
        animationIdRef.current = requestAnimationFrame(animate)
      }
    }

    init()
    animate()

    return () => {
      disposed = true
      clearTimeout(returnTimer)
      timelineRef.current?.kill()
      timelineRef.current = null
      window.removeEventListener("resize", onWindowResize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("blur", resetMouse)
      document.removeEventListener("mouseleave", resetMouse)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      reducedMotion.removeEventListener("change", onMotionChange)
      renderer?.domElement.removeEventListener("webglcontextlost", onContextLost)
      renderer?.domElement.removeEventListener("webglcontextrestored", onContextRestored)
      cancelAnimationFrame(animationIdRef.current)
      sphere?.geometry.dispose()
      sphere?.material.dispose()
      reflector?.geometry.dispose()
      reflector?.dispose()
      roughnessMap?.dispose()
      renderer?.dispose()
      if (renderer?.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      sceneRef.current = cameraRef.current = sphereRef.current = reflectorRef.current = rendererRef.current = null
    }
  }, [isFromOtherPage])

  /* ── navigation w/ transition ───────────────────────────────────── */
  const handleNavigateWithAnimation = useCallback(
    (path) => {
      if (isAnimating || transitionRef.current) return
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !sphereRef.current || !cameraRef.current || !reflectorRef.current ||
        !rendererRef.current || rendererRef.current.getContext().isContextLost()
      ) {
        navigate(path)
        return
      }
      setIsAnimating(true)
      transitionRef.current = true

      const sphere = sphereRef.current
      const camera = cameraRef.current

      const tl = gsap.timeline({
        onComplete: () => navigate(path, { state: { fromPage: "home" } }),
      })
      timelineRef.current = tl

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

  return (
    <div className="refined-home">
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
              <h1 className="ah-mark">
                Anubhav
                <br />
                Hooda
              </h1>
              <div className="role">
                <b>Design&nbsp;Engineer</b>&nbsp;·&nbsp;WebGL&nbsp;·&nbsp;Interfaces
              </div>
            </div>

            <nav className="rh-nav" aria-label="Main navigation">
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
                <span className="dot"></span>Open to opportunities
              </div>

            </div>
          </header>

          {/* ───────────────── STAGE ───────────────── */}
          <section className="rh-stage">
            <div className="name-overlay" aria-hidden="true">Anubhav&nbsp;Hooda</div>

            <div className="tag-block">
              <p className="tag">
                I design and build <b>web applications</b><br className="rh-desktop-break" />
                {" "}and interactive experiences.
              </p>
              <button className="rh-work-link" type="button" disabled={isAnimating}
                onClick={() => handleNavigateWithAnimation("/projects")}>
                View selected work <span aria-hidden="true">↗</span>
              </button>
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
            <div className="bb-right">
              <div className="label">Let’s work together</div>
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

        {/* hairline frame w/ corner ticks */}
        <div className="rh-frame-edge">
          <span></span>
          <span></span>
        </div>

        {/* film grain */}
        <div className="rh-grain"></div>
      </div>
    </div>
  )
}

export default RefinedHome
