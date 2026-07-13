'use client'

import { useEffect, useState } from 'react'

const roles = [
  'backend systems',
  'AI platforms',
  'ML infrastructure',
  'scientific software',
] as const

type AnimationPhase = 'typing' | 'holding' | 'deleting' | 'waiting'

export function AnimatedRole() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<AnimationPhase>('typing')
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const phrase = roles[phraseIndex]
    const delay = phase === 'typing' ? 68 : phase === 'deleting' ? 38 : phase === 'holding' ? 1450 : 340
    const timer = window.setTimeout(() => {
      if (phase === 'typing') {
        if (text.length < phrase.length) setText(phrase.slice(0, text.length + 1))
        else setPhase('holding')
        return
      }

      if (phase === 'holding') {
        setPhase('deleting')
        return
      }

      if (phase === 'deleting') {
        if (text.length > 0) setText(text.slice(0, -1))
        else setPhase('waiting')
        return
      }

      setPhraseIndex((current) => (current + 1) % roles.length)
      setPhase('typing')
    }, delay)

    return () => window.clearTimeout(timer)
  }, [phase, phraseIndex, reducedMotion, text])

  return <>
    <span className="typewriter-line" aria-hidden="true">
      <span>{reducedMotion ? roles[0] : text}</span>
      <span className="typewriter-cursor" />
    </span>
    <span className="sr-only">backend systems, AI platforms, ML infrastructure, and scientific software</span>
  </>
}
