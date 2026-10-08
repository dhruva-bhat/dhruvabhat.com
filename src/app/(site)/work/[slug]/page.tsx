import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { projects } from '@/data/portfolio'

type CaseStudyProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: CaseStudyProps): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((candidate) => candidate.slug === slug)

  if (!project) return { title: 'project not found' }

  return {
    title: project.title.toLowerCase(),
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
  }
}

export default async function CaseStudy({ params }: CaseStudyProps) {
  const { slug } = await params
  const project = projects.find((candidate) => candidate.slug === slug)
  if (!project) notFound()

  const related = projects
    .filter((candidate) => project.relatedProjects?.includes(candidate.slug))
    .slice(0, 3)

  return <main className="case-study" data-geometry-section="2">
    <Link className="back-link" href="/work"><ArrowLeft size={16}/>Back to Work</Link>
    <header className="case-hero" data-reveal>
      <div>
        <span className="eyebrow">{project.disciplines.join(' / ')}</span>
        <h1>{project.title}</h1>
        <p>{project.summary}</p>
      </div>
      <dl>
        <div><dt>Institution</dt><dd>{project.institution}</dd></div>
        <div><dt>Role</dt><dd>{project.role}</dd></div>
        <div><dt>Timeline</dt><dd>{project.dates}</dd></div>
        <div><dt>Status</dt><dd>{project.status}</dd></div>
      </dl>
    </header>

    <section className="case-overview" data-reveal>
      <span className="eyebrow">OVERVIEW</span>
      <p>{project.description}</p>
      <div className="tag-row">{project.technologies.map((technology)=><span className="tag" key={technology}>{technology}</span>)}</div>
    </section>

    <section className="case-topology" data-reveal>
      <span className="eyebrow">TECHNICAL FLOW</span>
      <div>{project.topology.map((step, index)=><span key={step}>
        <i>{String(index + 1).padStart(2, '0')}</i>
        <strong>{step}</strong>
        {index < project.topology.length - 1 && <ArrowRight aria-hidden="true"/>}
      </span>)}</div>
    </section>

    <div className="case-sections">{Object.entries(project.sections).map(([key, value])=><section key={key} data-reveal>
      <span className="eyebrow">{key.toUpperCase()}</span>
      <p>{value}</p>
    </section>)}</div>

    {related.length > 0 && <section className="related" data-reveal>
      <h2>Related work</h2>
      <div className="related-list">{related.map((candidate)=><Link key={candidate.slug} href={`/work/${candidate.slug}`}>
        <span>{candidate.institution}</span>
        <strong>{candidate.title}</strong>
        <ArrowUpRight size={15}/>
      </Link>)}</div>
    </section>}
  </main>
}
