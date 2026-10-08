import type { Point } from '../math'
import type { SceneState } from './types'

/** Number of blocks; the tower is NB / 2 rows of two. */
export const NB = 8

export const MUG: Point = { x: 200, y: -25 }
export const KEYS: Point = { x: 310, y: -24 }
export const BARBELL_X = -250

/** Grip height of the claw (center of the top row) and where it grabs. */
export const CLAW_GRIP_Y = -59.5
export const TOWER_CX = 6.5
export const PILE_CX = -316

export const pilePos = (i: number): Point => ({ x: -330 + (i % 2) * 28, y: -((i >> 1) * 17 + 8.5) })

/** Tower slot k: rows of two, alternate rows offset like brickwork. */
export const slotPos = (k: number): Point => {
  const r = k >> 1
  const j = k & 1
  return { x: (j - 0.5) * 27 + (r % 2 ? 6.5 : -6.5), y: -(r * 17 + 8.5) }
}

/** Where an agent stands to place into slot k. */
export const standOf = (k: number) => {
  const p = slotPos(k)
  return k & 1 ? p.x + 50 : p.x - 50
}

/** Direction an agent faces when placing into slot k. */
export const dirTo = (k: number) => (k & 1 ? -1 : 1)

export const pileTopRow = (sc: SceneState, col: number) => {
  let top = -1
  for (const b of sc.blocks) if (b.st === 'pile' && b.col === col && b.row > top) top = b.row
  return top
}

export const rowsBelowFull = (sc: SceneState, k: number) => {
  for (let q = 0; q < (k >> 1) * 2; q++) if (sc.occ[q] < 0) return false
  return true
}

export const towerFull = (sc: SceneState) => sc.occ.every((o) => o >= 0)
