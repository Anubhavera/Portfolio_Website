import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const source = readFileSync(new URL('../public/boot.js', import.meta.url), 'utf8')

function boot({ seen = false, reduced = false, storageThrows = false, replay = false } = {}) {
  let now = 0, nextId = 0
  const timers = new Map(), events = new Map(), motionEvents = new Map()
  const classes = new Set(), styles = new Map()
  const loader = { hidden: true, style: { setProperty: (name, value) => styles.set(name, value) }, classList: { add: name => classes.add(name) }, setAttribute() {} }
  const root = { inert: false }
  const motion = {
    matches: reduced,
    addEventListener: (name, fn) => motionEvents.set(name, fn),
    removeEventListener: name => motionEvents.delete(name),
  }
  vm.runInNewContext(source, {
    URLSearchParams,
    document: { getElementById: id => id === 'root' ? root : loader },
    window: {
      location: { search: replay ? '?intro=1' : '' },
      matchMedia: () => motion,
      addEventListener: (name, fn) => events.set(name, fn),
      removeEventListener: name => events.delete(name),
    },
    sessionStorage: {
      getItem: () => { if (storageThrows) throw Error('Unavailable'); return seen ? '1' : null },
      setItem: () => { if (storageThrows) throw Error('Unavailable'); seen = true },
    },
    setTimeout: (fn, delay) => { const id = ++nextId; timers.set(id, { at: now + delay, fn }); return id },
    clearTimeout: id => timers.delete(id),
  })
  return {
    root, loader, events, timers, classes, styles,
    ready: () => events.get('portfolio:ready')?.(),
    reduce: () => { motion.matches = true; motionEvents.get('change')?.() },
    advance(ms) {
      const end = now + ms
      while (true) {
        const entry = [...timers].filter(([,t]) => t.at <= end).sort((a,b) => a[1].at - b[1].at)[0]
        if (!entry) break
        const [id, timer] = entry
        timers.delete(id); now = timer.at; timer.fn()
      }
      now = end
    },
  }
}

test('first load waits for readiness, draws the ring, then restores interaction', () => {
  const page = boot()
  assert.equal(page.loader.hidden, false)
  assert.equal(page.root.inert, true)
  page.ready(); page.advance(1949)
  assert.equal(page.loader.hidden, false)
  assert.equal(page.classes.has('is-ready'), false)
  page.advance(1)
  assert.equal(page.classes.has('is-ready'), true)
  assert.equal(page.classes.has('is-complete'), false)
  page.advance(649)
  assert.equal(page.classes.has('is-complete'), false)
  page.advance(1)
  assert.equal(page.classes.has('is-complete'), true)
  page.advance(2449)
  assert.equal(page.root.inert, true)
  page.advance(1)
  assert.equal(page.loader.hidden, true)
  assert.equal(page.root.inert, false)
  assert.equal(page.events.size, 0)
  assert.equal(page.timers.size, 0)
})
test('startup failure cannot leave the page blocked indefinitely', () => {
  const page = boot()
  page.advance(7100)
  assert.equal(page.loader.hidden, true)
  assert.equal(page.root.inert, false)
  assert.equal(page.events.size, 0)
})
test('repeat visits skip the intro; explicit preview can replay it', () => {
  const normal = boot({ seen: true })
  assert.equal(normal.loader.hidden, true)
  assert.equal(normal.root.inert, false)
  assert.equal(boot({ seen: true, replay: true }).loader.hidden, false)
})
test('blocked session storage does not break readiness or cleanup', () => {
  const page = boot({ storageThrows: true })
  page.ready(); page.advance(5050)
  assert.equal(page.root.inert, false)
  assert.equal(page.loader.hidden, true)
})
test('reduced motion releases ready content without a timed reveal', () => {
  const page = boot({ reduced: true })
  page.ready(); page.advance(0)
  assert.equal(page.loader.hidden, true)
  assert.equal(page.root.inert, false)
})
test('switching to reduced motion during the fade immediately releases content', () => {
  const page = boot()
  page.ready(); page.advance(2600); page.reduce()
  assert.equal(page.loader.hidden, true)
  assert.equal(page.root.inert, false)
  assert.equal(page.timers.size, 0)
})

test('switching to reduced motion during the halo hold cancels all remaining phases', () => {
  const page = boot()
  page.ready(); page.advance(1950); page.reduce()
  assert.equal(page.loader.hidden, true)
  assert.equal(page.root.inert, false)
  assert.equal(page.timers.size, 0)
})
test('a slow scene stays behind black until ready, then gets the full reveal', () => {
  const page = boot()
  page.advance(3000)
  assert.equal(page.classes.has('is-complete'), false)
  page.ready(); page.advance(650)
  assert.equal(page.classes.has('is-complete'), true)
  page.advance(2450)
  assert.equal(page.loader.hidden, true)
  assert.equal(page.timers.size, 0)
})
test('CSS durations come from the same timeline as the readiness timers', () => {
  const page = boot()
  assert.equal(page.styles.get('--intro-settle'), '550ms')
  assert.equal(page.styles.get('--intro-draw'), '1400ms')
  assert.equal(page.styles.get('--intro-hold'), '650ms')
  assert.equal(page.styles.get('--intro-reveal'), '2400ms')
})
