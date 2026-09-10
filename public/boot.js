/* A paced circular introduction, independent of React and bounded on failure. */
(() => {
  const loader = document.getElementById('portfolio-loader')
  const root = document.getElementById('root')
  if (!loader || !root) return
  const replay = new URLSearchParams(window.location.search).get('intro') === '1'
  try {
    if (!replay && sessionStorage.getItem('portfolio-intro-seen')) return
  } catch { /* Storage is optional. */ }

  // One timeline drives both CSS and interaction: settle, draw, hold, reveal.
  const timing = { settle: 550, draw: 1400, hold: 650, reveal: 2400 }
  for (const [phase, duration] of Object.entries(timing)) {
    loader.style.setProperty(`--intro-${phase}`, `${duration}ms`)
  }
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  loader.hidden = false
  root.inert = true
  let ready = false
  let ringComplete = motion.matches
  let finished = false
  let released = false
  let deadline, ringTimer, holdTimer, releaseTimer

  function release() {
    if (released) return
    released = true
    clearTimeout(deadline)
    clearTimeout(ringTimer)
    clearTimeout(holdTimer)
    clearTimeout(releaseTimer)
    window.removeEventListener('portfolio:ready', onReady)
    motion.removeEventListener('change', onMotionChange)
    loader.hidden = true
    root.inert = false
    try { sessionStorage.setItem('portfolio-intro-seen', '1') } catch { /* Optional. */ }
  }
  function reveal() {
    loader.classList.add('is-complete')
    loader.setAttribute('aria-hidden', 'true')
    // Allow the black scrim to finish fading before removing it.
    releaseTimer = setTimeout(release, timing.reveal + 50)
  }
  function finish() {
    if (finished || !ready || !ringComplete) return
    finished = true
    clearTimeout(deadline)
    clearTimeout(ringTimer)
    window.removeEventListener('portfolio:ready', onReady)
    if (motion.matches) { release(); return }
    // The completed circle gets a quiet halo before the scene begins to emerge.
    loader.classList.add('is-ready')
    holdTimer = setTimeout(reveal, timing.hold)
  }
  function onReady() {
    ready = true
    finish()
  }
  function onMotionChange() {
    if (!motion.matches) return
    ringComplete = true
    if (finished) release()
    else finish()
  }
  motion.addEventListener('change', onMotionChange)
  window.addEventListener('portfolio:ready', onReady)
  ringTimer = setTimeout(() => { ringComplete = true; finish() }, motion.matches ? 0 : timing.settle + timing.draw)
  // A failed download must still reveal the static contact fallback.
  deadline = setTimeout(() => { ringComplete = true; onReady() }, 4000)
})()
