const key = 'portfolio:motion-paused'
const eventName = 'portfolio:motion-change'
let paused = false
try { paused = localStorage.getItem(key) === 'true' } catch { /* Storage is optional. */ }

export function isMotionPaused() {
  return paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function setMotionPaused(value) {
  paused = value
  try { localStorage.setItem(key, String(value)) } catch { /* Keep the in-memory preference. */ }
  window.dispatchEvent(new Event(eventName))
}

export function subscribeToMotion(callback) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  const syncStorage = (event) => {
    if (event.key === key || event.key === null) {
      paused = event.newValue === 'true'
      callback()
    }
  }
  window.addEventListener(eventName, callback)
  window.addEventListener('storage', syncStorage)
  media.addEventListener('change', callback)
  return () => {
    window.removeEventListener(eventName, callback)
    window.removeEventListener('storage', syncStorage)
    media.removeEventListener('change', callback)
  }
}
