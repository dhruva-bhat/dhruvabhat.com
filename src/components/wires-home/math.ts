export type Point = { x: number; y: number }

export const TAU = Math.PI * 2

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const lerpPt = (a: Point, b: Point, t: number): Point => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) })

/** Cubic ease-out. */
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
/** Cubic ease-in-out. */
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
/** Smoothstep on [0, 1]. */
export const smooth = (p: number) => p * p * (3 - 2 * p)

export const randomBetween = (lo: number, hi: number) => lo + Math.random() * (hi - lo)
export const pickRandom = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]
