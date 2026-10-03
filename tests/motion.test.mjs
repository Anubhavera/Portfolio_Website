import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const source = readFileSync(new URL('../src/assets/components/motionPreference.js', import.meta.url), 'utf8').replaceAll('export function', 'function')

function setup({ saved = null, denied = false, reduced = false } = {}) {
  const window = new EventTarget()
  const media = Object.assign(new EventTarget(), { matches: reduced })
  const storage = new Map(saved === null ? [] : [['portfolio:motion-paused', saved]])
  window.matchMedia = () => media
  const context = vm.createContext({ window, Event, localStorage: {
    getItem(key) { if (denied) throw Error('Storage denied'); return storage.get(key) ?? null },
    setItem(key, value) { if (denied) throw Error('Storage denied'); storage.set(key, value) },
  } })
  vm.runInContext(source, context)
  return { context, window, media, storage }
}

test('a saved pause survives a new page and resuming persists the choice', () => {
  const { context, storage } = setup({ saved: 'true' })
  assert.equal(context.isMotionPaused(), true)
  context.setMotionPaused(false)
  assert.equal(context.isMotionPaused(), false)
  assert.equal(storage.get('portfolio:motion-paused'), 'false')
})

test('denied storage still allows in-memory pause and resume', () => {
  const { context } = setup({ denied: true })
  context.setMotionPaused(true)
  assert.equal(context.isMotionPaused(), true)
  context.setMotionPaused(false)
  assert.equal(context.isMotionPaused(), false)
})

test('device reduced motion takes priority and subscriptions clean up', () => {
  const { context, media } = setup({ reduced: true })
  let updates = 0
  const unsubscribe = context.subscribeToMotion(() => updates++)
  context.setMotionPaused(false)
  assert.equal(context.isMotionPaused(), true)
  media.matches = false
  media.dispatchEvent(new Event('change'))
  assert.equal(context.isMotionPaused(), false)
  assert.equal(updates, 2)
  unsubscribe()
  context.setMotionPaused(true)
  media.dispatchEvent(new Event('change'))
  assert.equal(updates, 2)
})

test('another tab can update or clear the preference without unrelated storage interference', () => {
  const { context, window } = setup()
  const unsubscribe = context.subscribeToMotion(() => {})
  function change(key, newValue) {
    window.dispatchEvent(Object.assign(new Event('storage'), { key, newValue }))
  }
  change('portfolio:motion-paused', 'true')
  assert.equal(context.isMotionPaused(), true)
  change('unrelated', 'false')
  assert.equal(context.isMotionPaused(), true)
  change(null, null)
  assert.equal(context.isMotionPaused(), false)
  unsubscribe()
})
