import { describe, expect, it } from 'vitest'
import { buildWire, layoutWires, wireAt, type Rect } from './wires'

const rect = (l: number, t: number, r: number, b: number): Rect => ({ l, t, r, b, cx: (l + r) / 2, cy: (t + b) / 2 })

describe('wires', () => {
  it('samples a straight wire evenly with its true length', () => {
    const w = buildWire([{ x: 0, y: 0 }, { x: 300, y: 0 }], 26)
    expect(w.len).toBeCloseTo(300)
    expect(w.cum.at(-1)).toBeCloseTo(300)
    expect(w.pts.at(-1)).toEqual({ x: 300, y: 0 })
  })

  it('routes one wire from the name to each label', () => {
    const name = rect(400, 300, 800, 400)
    const labels = [rect(20, 180, 120, 240), rect(1140, 460, 1260, 520), rect(600, 700, 740, 760)]
    const [left, right, bottom] = layoutWires(name, labels, 430)
    expect(left.pts[0].x).toBeLessThan(name.l)
    expect(left.pts.at(-1)!.x).toBeCloseTo(labels[0].r + 6)
    expect(right.pts.at(-1)!.x).toBeCloseTo(labels[1].l - 6)
    expect(bottom.pts.at(-1)!.y).toBeCloseTo(labels[2].t - 8)
  })

  it('hit-tests the nearest wire within range', () => {
    const wires = [buildWire([{ x: 0, y: 0 }, { x: 100, y: 0 }], 26), buildWire([{ x: 0, y: 50 }, { x: 100, y: 50 }], 26)]
    expect(wireAt(wires, 50, 4, 12)).toBe(0)
    expect(wireAt(wires, 50, 44, 12)).toBe(1)
    expect(wireAt(wires, 50, 25, 12)).toBe(-1)
  })
})
