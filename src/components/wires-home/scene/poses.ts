import { TAU, easeInOut, lerp, lerpPt, type Point } from '../math'
import { MUG, pileTopRow, slotPos } from './layout'
import type { Agent, Block, Emotion, SceneState } from './types'

/** Hand position (relative to the agent) through a coffee break; `sip` peaks while drinking. */
export function coffeeHand(a: Agent, u: number) {
  const d = a.dir
  const rest = { x: MUG.x - a.x, y: MUG.y - a.y }
  const hold = { x: d * 30, y: -24 }
  const sipAt = { x: d * 20, y: -35 }
  let h: Point
  let sip = 0
  if (u < 0.15) h = lerpPt({ x: 30 * d, y: -18 }, rest, u / 0.15)
  else if (u < 0.3) h = lerpPt(rest, hold, (u - 0.15) / 0.15)
  else if (u < 0.85) {
    const w = ((u - 0.3) / 0.55) * 2
    sip = Math.sin(Math.PI * (w % 1))
    h = lerpPt(hold, sipAt, sip)
  } else h = lerpPt(hold, rest, (u - 0.85) / 0.15)
  return { x: h.x, y: h.y, sip }
}

export type LiftPose = { hy: number; squat: number; emo: Emotion; held: boolean }

/** Barbell: squat and grab, two clean-and-press reps, set it down. */
export function liftPose(u: number, t: number): LiftPose {
  if (u < 0.1) {
    const e = easeInOut(u / 0.1)
    return { hy: lerp(-18, -9, e), squat: 6 * e, emo: 'focus', held: false }
  }
  if (u >= 0.9) {
    const e = easeInOut((u - 0.9) / 0.1)
    return { hy: lerp(-9, -18, e), squat: 6 * (1 - e), emo: 'happy', held: false }
  }
  const v = ((u - 0.1) / 0.8) * 2
  const rep = Math.floor(v)
  const r = v % 1
  if (r < 0.3) {
    const e = easeInOut(r / 0.3)
    return { hy: lerp(-9, -84, e), squat: lerp(6, 0, e), emo: 'effort', held: true }
  }
  if (r < 0.55) return { hy: -84 + Math.sin(t * 40) * 0.8, squat: 0, emo: rep ? 'proud' : 'effort', held: true }
  if (r < 0.85) {
    const e = easeInOut((r - 0.55) / 0.3)
    return { hy: lerp(-84, -9, e), squat: lerp(0, 6, e), emo: 'focus', held: true }
  }
  return { hy: -9, squat: 6, emo: 'happy', held: true }
}

/** Juggling ball positions relative to the agent; on a fumble the third ball drops at 60%. */
export function juggleBalls(a: Agent, u: number, t: number): Point[] {
  const balls: Point[] = []
  for (let i = 0; i < 3; i++) {
    if (i === 2 && a.act?.fumble && u > 0.6) {
      const tt = (u - 0.6) * a.act.dur
      balls.push({ x: Math.min(10 + tt * 40, 34), y: Math.min(-64 + 300 * tt * tt, -4) })
      continue
    }
    const ph = t * 4.5 + (i * TAU) / 3
    balls.push({ x: 26 * Math.cos(ph), y: -36 - 34 * Math.abs(Math.sin(ph)) })
  }
  return balls
}

/** How far into the seated nap pose (0 standing, 1 seated). */
export const napSit = (u: number) => Math.min(1, u / 0.08, (1 - u) / 0.08)

/** The face an agent makes when no emotion is queued. */
export function stateEmotion(a: Agent, t: number): Emotion {
  switch (a.st) {
    case 'pick':
    case 'toSlot':
      return 'focus'
    case 'place':
      return 'effort'
    case 'cheer':
      return 'proud'
    case 'act': {
      if (!a.act) return 'neutral'
      const u = a.t / a.act.dur
      switch (a.act.kind) {
        case 'jacks':
          return Math.floor(a.t / 0.6) % 2 ? 'happy' : 'effort'
        case 'type':
          return 'focus'
        case 'lift':
          return liftPose(u, t).emo
        case 'nap':
          return napSit(u) > 0.5 ? 'asleep' : 'sleepy'
        case 'juggle':
          if (a.act.fumble && u > 0.6) return u < 0.7 ? 'surprised' : 'laugh'
          return u > 0.88 ? 'proud' : 'focus'
        case 'coffee':
          return coffeeHand(a, u).sip > 0.4 ? 'happy' : u > 0.3 && u < 0.85 ? 'sleepy' : 'neutral'
      }
      return 'neutral'
    }
    default:
      return 'neutral'
  }
}

/** Where an agent's eyes point. */
export function lookTarget(sc: SceneState, a: Agent): Point {
  if (sc.drag?.moved) return { x: sc.drag.b.x, y: sc.drag.b.y }
  if (sc.claw && sc.claw.ph !== 'leave') return { x: sc.claw.x, y: sc.claw.y - 20 }
  if (a.st === 'act' && a.act?.kind === 'juggle') return { x: a.x, y: a.y - 70 }
  if (sc.mouse.inside) return sc.mouse
  if ((a.st === 'toBlock' || a.st === 'pick') && a.b >= 0) return { x: sc.blocks[a.b].x, y: sc.blocks[a.b].y }
  if (a.st === 'toSlot' || a.st === 'place') return slotPos(a.k)
  return { x: 0, y: -40 }
}

export function hitAgent(sc: SceneState, p: Point): Agent | null {
  for (let i = sc.agents.length - 1; i >= 0; i--) {
    const a = sc.agents[i]
    if (Math.abs(p.x - a.x) < 28 && p.y > a.y - 68 && p.y < a.y) return a
  }
  return null
}

/** The block a pointer at p would grab: placed blocks, ground blocks, or the top of a pile column. */
export function hitBlock(sc: SceneState, p: Point): Block | null {
  for (let i = sc.blocks.length - 1; i >= 0; i--) {
    const b = sc.blocks[i]
    if (b.st === 'carried' || b.pickBy >= 0 || b.st === 'claw') continue
    if (b.st === 'pile' && b.row !== pileTopRow(sc, b.col)) continue
    const at = b.st === 'placed' ? slotPos(b.slot) : b
    if (Math.abs(p.x - at.x) < 15 && Math.abs(p.y - at.y) < 11) return b
  }
  return null
}
