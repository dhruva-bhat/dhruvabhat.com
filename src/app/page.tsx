import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { AnimatedRole } from '@/components/animated-role'
import { SectionHeading } from '@/components/section-heading'
import { experiences, projectPriority, projects, publications, siteConfig } from '@/data/portfolio'

export default function Home() {
  const featured = projectPriority
    .slice(0, 4)
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is (typeof projects)[number] => Boolean(project))
  const currentExperience = experiences.slice(0, 3)

  return <>
    <section className="hero" data-geometry-section="0">
      <div className="hero-grid">
        <div className="hero-copy" data-reveal>
          <p className="hero-name">Hello, I’m Dhruva.</p>
          <h1><span className="hero-static-line">I build</span><AnimatedRole/></h1>
          <p className="hero-summary">EECS and Bioengineering at UC Berkeley, building reliable systems for AI, data, and scientific computing.</p>
          <div className="hero-actions">
            <Link className="button" href="/work">View Work <ArrowRight size={16}/></Link>
            <Link className="button button-secondary" href="/timeline">Experience</Link>
            <a className="button button-quiet" href="#contact">Contact</a>
          </div>
          <div className="hero-secondary">
            <a href={siteConfig.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={12}/></a>
            <a href={siteConfig.resume} target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={12}/></a>
          </div>
        </div>
        <figure className="hero-portrait" data-reveal>
          <div className="hero-portrait-media">
            <Image
              src="/portraits/dhruva-coastal-portrait.jpg"
              alt="Dhruva Bhat standing near a coastal overlook at sunset"
              fill
              priority
              sizes="(max-width: 640px) calc(100vw - 36px), (max-width: 900px) 620px, 440px"
            />
          </div>
          <figcaption><span>Dhruva Bhat</span><span>Engineer · researcher</span></figcaption>
        </figure>
      </div>
    </section>

    <section className="section home-work" data-geometry-section="1">
      <SectionHeading index="01" kicker="SELECTED WORK" title="Infrastructure, platforms, and ML systems" copy="Engineering records organized around the problem, system architecture, implementation, and result."/>
      <div className="editorial-list">{featured.map((project, index) => <Link key={project.slug} href={`/work/${project.slug}`} className="editorial-row project-row" data-reveal>
        <span className="row-index">{String(index + 1).padStart(2, '0')}</span>
        <div><span className="eyebrow">{project.institution}</span><h3>{project.title}</h3><p>{project.summary}</p></div>
        <div className="row-meta"><span>{project.disciplines[0]}</span><span>{project.metric || project.status}</span></div>
        <ArrowUpRight className="row-arrow" size={16}/>
      </Link>)}</div>
      <Link className="section-link" href="/work">View all projects <ArrowRight size={15}/></Link>
    </section>

    <section className="section home-experience" data-geometry-section="2">
      <SectionHeading index="02" kicker="EXPERIENCE" title="Systems built across research and production" copy="A concise chronology of platform engineering, backend software, and scientific machine learning."/>
      <div className="experience-list">{currentExperience.map((experience) => <article key={experience.id} data-reveal>
        <div><span className="eyebrow">{experience.dates}</span><h3>{experience.organization}</h3></div>
        <div><strong>{experience.role}</strong><p>{experience.summary}</p></div>
      </article>)}</div>
      <Link className="section-link" href="/timeline">View complete timeline <ArrowRight size={15}/></Link>
    </section>

    <section className="section home-research" data-geometry-section="3">
      <SectionHeading index="03" kicker="RESEARCH" title="Selected publications and presentations"/>
      <div className="publication-list">{publications.slice(0, 4).map((publication, index) => <article key={`${publication.title}${publication.type}`} data-reveal>
        <span className="pub-number">{String(index + 1).padStart(2, '0')}</span>
        <span className="pub-type">{publication.type}</span>
        <div><h3>{publication.title}</h3><p>{publication.venue}</p></div>
        <div className="pub-meta"><span>{publication.year}</span><span>{publication.status}</span></div>
      </article>)}</div>
      <Link className="section-link" href="/research">Full research index <ArrowRight size={15}/></Link>
    </section>

    <section id="contact" className="home-contact" data-geometry-section="4" data-reveal>
      <div><span className="eyebrow">CONTACT</span><h2>Open to engineering and research opportunities.</h2></div>
      <div><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><a href={siteConfig.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14}/></a><a href={siteConfig.resume} target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={14}/></a></div>
    </section>
  </>
}
