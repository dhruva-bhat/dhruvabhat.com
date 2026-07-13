import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { experiences, projectPriority, projects, publications, siteConfig } from '@/data/portfolio'

export default function Home() {
  const featured = projectPriority.slice(0, 4).map((slug)=>projects.find((project)=>project.slug===slug)).filter((project):project is (typeof projects)[number]=>Boolean(project))
  const currentExperience = experiences.slice(0, 4)

  return <>
    <section className="hero" data-geometry-section="0">
      <div className="hero-copy" data-reveal>
        <p className="hero-name">Dhruva Bhat</p>
        <p className="hero-positioning">{siteConfig.positioning}</p>
        <h1>Building reliable AI systems, backend infrastructure, and scientific ML pipelines.</h1>
        <p className="hero-summary">EECS and Bioengineering at UC Berkeley. I build infrastructure that orchestrates complex workflows, integrates machine-learning models, and operates reliably across research and production environments.</p>
        <div className="hero-actions">
          <Link className="button" href="/work">View selected work <ArrowRight size={16}/></Link>
          <Link className="text-link" href="/research">View research</Link>
          <a className="text-link" href={siteConfig.resume} target="_blank" rel="noreferrer">View résumé <ArrowUpRight size={14}/></a>
        </div>
        <div className="hero-secondary"><a href={siteConfig.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={`mailto:${siteConfig.email}`}>Email</a></div>
      </div>
    </section>

    <section className="section home-work" data-geometry-section="1">
      <SectionHeading index="01" kicker="SELECTED WORK" title="Infrastructure, platforms, and ML systems" copy="Four projects spanning AI orchestration, production backend software, LLM evaluation, and vector representations."/>
      <div className="editorial-list">{featured.map((project,index)=><Link key={project.slug} href={`/work/${project.slug}`} className="editorial-row project-row" data-reveal><span className="row-index">{String(index+1).padStart(2,'0')}</span><div><span className="eyebrow">{project.institution}</span><h3>{project.title}</h3><p>{project.summary}</p></div><div className="row-meta"><span>{project.disciplines[0]}</span><span>{project.metric||project.status}</span></div><ArrowUpRight className="row-arrow" size={16}/></Link>)}</div>
      <Link className="section-link" href="/work">View all projects <ArrowRight size={15}/></Link>
    </section>

    <section className="section home-experience" data-geometry-section="2">
      <SectionHeading index="02" kicker="CURRENT EXPERIENCE" title="Work across research and engineering"/>
      <div className="experience-list">{currentExperience.map((experience)=><article key={experience.organization} data-reveal><div><span className="eyebrow">{experience.dates}</span><h3>{experience.organization}</h3></div><div><strong>{experience.role}</strong><p>{experience.summary}</p></div></article>)}</div>
      <Link className="section-link" href="/about">Background and experience <ArrowRight size={15}/></Link>
    </section>

    <section className="section home-research" data-geometry-section="3">
      <SectionHeading index="03" kicker="RESEARCH" title="Selected publications and presentations"/>
      <div className="publication-list">{publications.slice(0,4).map((publication,index)=><article key={`${publication.title}${publication.type}`} data-reveal><span className="pub-number">{String(index+1).padStart(2,'0')}</span><span className="pub-type">{publication.type}</span><div><h3>{publication.title}</h3><p>{publication.venue}</p></div><div className="pub-meta"><span>{publication.year}</span><span>{publication.status}</span></div></article>)}</div>
      <Link className="section-link" href="/research">Full research index <ArrowRight size={15}/></Link>
    </section>

    <section className="home-contact" data-geometry-section="4" data-reveal>
      <div><span className="eyebrow">CONTACT</span><h2>Open to research and engineering opportunities.</h2></div>
      <div><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><a href={siteConfig.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14}/></a><a href={siteConfig.resume} target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={14}/></a></div>
    </section>
  </>
}
