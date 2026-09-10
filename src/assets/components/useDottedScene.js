import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import fragmentShader from '../shaders/dotted_globe_fragment.glsl'
import vertexShader from '../shaders/dotted_globe_vertex.glsl'

// Both secondary pages share the original scene, with mirrored camera positions.
export default function useDottedScene(page) {
  const mountRef = useRef(null)
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let renderer, geometry, material, frame
    let removeListeners = () => {}
    let previous = performance.now()
    let disposed = false
    let announced = false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 300)
    const isServices = page === 'services'
    camera.position.set(isServices ? -25 : 15, 5, 50)
    const announceReady = () => {
      if (announced) return
      announced = true
      document.fonts.ready.then(() => {
        if (!disposed) window.dispatchEvent(new Event('portfolio:ready'))
      })
    }

    function cleanup() {
      disposed = true
      cancelAnimationFrame(frame)
      removeListeners()
      geometry?.dispose()
      material?.dispose()
      renderer?.dispose()
      if (renderer?.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }

    try {
      geometry = new THREE.SphereGeometry(10, 64, 64)
      material = new THREE.ShaderMaterial({
        vertexShader, fragmentShader,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          uTransitionProgress: { value: 1 },
        },
        transparent: true, side: THREE.DoubleSide, depthWrite: false,
      })
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(isServices ? -30 : 25, 0, 0)
      sphere.scale.setScalar(1.8)
      scene.add(sphere)
      renderer = new THREE.WebGLRenderer({ antialias: true, stencil: false, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 1)
      mount.appendChild(renderer.domElement)

      function render(now = performance.now()) {
        if (disposed || document.hidden || renderer.getContext().isContextLost()) return
        const delta = Math.min((now - previous) / 1000, 0.05)
        previous = now
        if (!reducedMotion.matches) {
          material.uniforms.iTime.value += delta * 0.6
          sphere.rotation.y += delta * 0.12
        }
        // Equivalent to the old disabled OrbitControls' target; preserves the side composition.
        camera.lookAt(0, 0, 0)
        renderer.render(scene, camera)
        announceReady()
        if (!reducedMotion.matches) frame = requestAnimationFrame(render)
      }
      function resume() {
        cancelAnimationFrame(frame)
        previous = performance.now()
        render(previous)
      }
      function resize() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight)
        resume()
      }
      function lost(event) {
        event.preventDefault()
        cancelAnimationFrame(frame)
      }
      window.addEventListener('resize', resize)
      document.addEventListener('visibilitychange', resume)
      reducedMotion.addEventListener('change', resume)
      renderer.domElement.addEventListener('webglcontextlost', lost)
      renderer.domElement.addEventListener('webglcontextrestored', resume)
      removeListeners = () => {
        window.removeEventListener('resize', resize)
        document.removeEventListener('visibilitychange', resume)
        reducedMotion.removeEventListener('change', resume)
        renderer.domElement.removeEventListener('webglcontextlost', lost)
        renderer.domElement.removeEventListener('webglcontextrestored', resume)
      }
      render()
      return cleanup
    } catch (error) {
      console.error('Unable to initialize the decorative scene:', error)
      cleanup()
      disposed = false
      announceReady()
      return () => { disposed = true }
    }
  }, [page])
  return mountRef
}
