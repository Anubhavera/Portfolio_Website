import { useSyncExternalStore } from 'react'
import { isMotionPaused, setMotionPaused, subscribeToMotion } from './motionPreference'

function getMotionState() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'system'
  return isMotionPaused() ? 'paused' : 'playing'
}

export default function MotionControl() {
  const state = useSyncExternalStore(subscribeToMotion, getMotionState)
  const paused = state !== 'playing'
  const systemReduced = state === 'system'
  return (
    <button className="motion-control" type="button" aria-pressed={paused}
      disabled={systemReduced}
      title={systemReduced ? 'Reduced motion follows your device setting' : 'Pause or resume the animated background'}
      onClick={() => setMotionPaused(!paused)}>
      <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
      {systemReduced ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion'}
    </button>
  )
}
