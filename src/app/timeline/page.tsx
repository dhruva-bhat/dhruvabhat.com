import type { Metadata } from 'next'
import { ExperienceTimeline } from '@/components/experience-timeline'
import { timelineEntries } from '@/data/portfolio'

export const metadata: Metadata = {
  title: 'Timeline',
  description: 'Dhruva Bhat’s engineering, research, and education timeline.',
}

export default function TimelinePage() {
  return <main className="page-shell timeline-page" data-geometry-section="2">
    <header className="page-hero timeline-hero" data-reveal>
      <span className="eyebrow">TIMELINE / 2024—PRESENT</span>
      <h1>Engineering experience, in sequence</h1>
      <p>A chronological view of platform engineering, production software, scientific machine learning, and the education connecting them.</p>
    </header>
    <ExperienceTimeline entries={timelineEntries}/>
  </main>
}
