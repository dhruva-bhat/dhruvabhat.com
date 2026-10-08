import { describe, expect, it } from 'vitest'
import { NB, slotPos } from './layout'
import { createScene } from './simulation'

const run = (scene: ReturnType<typeof createScene>, seconds: number) => {
  for (let t = 0; t < seconds; t += 1 / 60) scene.update(1 / 60, -400)
}

describe('block-stacking scene', () => {
  it('starts with every block on the pile and three idle agents', () => {
    const { state } = createScene(false)
    expect(state.blocks).toHaveLength(NB)
    expect(state.blocks.every((b) => b.st === 'pile')).toBe(true)
    expect(state.agents.map((a) => a.st)).toEqual(['idle', 'idle', 'idle'])
  })

  it('shows a finished, static tower with reduced motion', () => {
    const { state } = createScene(true)
    expect(state.state).toBe('static')
    expect(state.occ).toEqual([...Array(NB).keys()])
  })

  it('agents start carrying blocks to the tower', () => {
    const scene = createScene(false)
    run(scene, 8)
    const busy = scene.state.blocks.some((b) => b.st !== 'pile')
    expect(busy).toBe(true)
  })

  it('clicking a tower block knocks it and everything above it down', () => {
    const scene = createScene(true)
    scene.state.state = 'build'
    const p = slotPos(2)
    expect(scene.pointerDown(p)).toBe(true)
    scene.pointerUp()
    expect(scene.state.occ.slice(0, 2).every((o) => o >= 0)).toBe(true)
    expect(scene.state.occ.slice(2).every((o) => o < 0)).toBe(true)
    expect(scene.state.agents.every((a) => a.st === 'react')).toBe(true)
  })

  it('agents knocked out of a hop fall back to the floor', () => {
    const scene = createScene(false)
    const a = scene.state.agents[0]
    a.y = -100
    scene.state.agents[0].st = 'react'
    a.rt = 5
    run(scene, 1)
    expect(a.y).toBe(0)
  })
})
