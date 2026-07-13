import { describe, expect, it } from 'vitest'
import { navigation, projects, siteConfig, socialLinks } from './portfolio'

describe('portfolio content', () => {
  it('uses unique project slugs', () => {
    const slugs = projects.map((project) => project.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('references only existing related projects', () => {
    const slugs = new Set(projects.map((project) => project.slug))
    const related = projects.flatMap((project) => project.relatedProjects ?? [])
    expect(related.every((slug) => slugs.has(slug))).toBe(true)
  })

  it('defines real primary routes and contact links', () => {
    expect(navigation.map((item) => item.href)).toEqual(['/', '/work', '/timeline', '/research', '/about'])
    expect(siteConfig.resume).toMatch(/^\/resume\/.+\.pdf$/)
    expect(socialLinks.find((link) => link.label === 'Email')?.href).toBe(`mailto:${siteConfig.email}`)
    expect(socialLinks.every((link) => link.href.length > 0)).toBe(true)
  })
})
