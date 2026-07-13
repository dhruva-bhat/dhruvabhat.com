'use client'

import Link from 'next/link'
import { ArrowUpRight, GraduationCap } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { TimelineEntry } from '@/data/portfolio'

type ExperienceTimelineProps = {
  entries: TimelineEntry[]
}

export function ExperienceTimeline({ entries }: ExperienceTimelineProps) {
  const timelineRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const timeline = timelineRef.current
    if (!timeline) return

    const items = Array.from(timeline.querySelectorAll<HTMLElement>('[data-timeline-item]'))
    let frame = 0

    const updateProgress = () => {
      frame = 0
      const bounds = timeline.getBoundingClientRect()
      const readingLine = window.innerHeight * 0.55
      const progress = Math.min(1, Math.max(0, (readingLine - bounds.top) / Math.max(bounds.height, 1)))
      timeline.style.setProperty('--timeline-progress', String(progress))
    }

    const scheduleProgress = () => {
      if (frame) return
      frame = requestAnimationFrame(updateProgress)
    }

    const observer = new IntersectionObserver(
      (observations) => {
        observations.forEach((observation) => observation.target.classList.toggle('is-active', observation.isIntersecting))
      },
      { rootMargin: '-24% 0px -52% 0px', threshold: 0.1 },
    )

    items.forEach((item) => observer.observe(item))
    updateProgress()
    window.addEventListener('scroll', scheduleProgress, { passive: true })
    window.addEventListener('resize', scheduleProgress, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', scheduleProgress)
      window.removeEventListener('resize', scheduleProgress)
    }
  }, [])

  return <ol ref={timelineRef} className="timeline-list">
    {entries.map((entry) => <li key={entry.id} data-timeline-item data-reveal data-current={entry.current || undefined}>
      <span className="timeline-marker" aria-hidden="true">{entry.kind === 'education' && <GraduationCap size={13}/>}</span>
      <div className="timeline-date">{entry.dates}{entry.current && <span>Current</span>}</div>
      <article>
        <span className="eyebrow">{entry.kind === 'education' ? 'EDUCATION' : 'EXPERIENCE'}</span>
        <h2>{entry.role}</h2>
        <h3>{entry.organization}</h3>
        <p>{entry.summary}</p>
        <ul>{entry.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        <div className="tag-row timeline-tags">{entry.technologies.map((technology) => <span className="tag" key={technology}>{technology}</span>)}</div>
        {entry.projectSlugs[0] && <Link href={`/work/${entry.projectSlugs[0]}`}>View related case study <ArrowUpRight size={14}/></Link>}
      </article>
    </li>)}
  </ol>
}
