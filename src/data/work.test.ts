import { describe, expect, it } from 'vitest'
import { work } from './work'

describe('home work entries', () => {
  it('have unique titles and complete content', () => {
    expect(new Set(work.map((w) => w.title)).size).toBe(work.length)
    for (const entry of work) {
      expect(entry.role).not.toBe('')
      expect(entry.lead).not.toBe('')
      expect(entry.points.length).toBeGreaterThan(0)
    }
  })
})
