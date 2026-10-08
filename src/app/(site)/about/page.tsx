import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { experiences, siteConfig, skills } from '@/data/portfolio'

export const metadata:Metadata={title:'About',description:'About Dhruva Bhat, UC Berkeley EECS and Bioengineering student.'}

export default function AboutPage() {
  const skillGroups = [...new Set(skills.map((skill)=>skill.group))]

  return <main className="page-shell about-page" data-geometry-section="3">
    <header className="page-hero" data-reveal><span className="eyebrow">ABOUT / {siteConfig.positioning}</span><h1>Engineering reliable systems around machine learning</h1><p>{siteConfig.education}</p></header>

    <section className="about-narrative" data-reveal><div><span className="eyebrow">APPROACH</span></div><div><p className="lead">I build reliable AI systems and backend infrastructure for complex technical workflows.</p><p>At Oak Ridge National Laboratory, I engineered asynchronous FastAPI services that orchestrated multi-agent reasoning, retrieval, and generative-model workflows. At Blueprint, I build production software and data-driven routing logic for real operational users. My work at Carnegie Mellon focuses on modular LLM experimentation and automated evaluation.</p><p>My EECS and Bioengineering background also informs large-scale bioinformatics pipelines at UCSF and scientific machine-learning research at the Garcia Center. Across those settings, I focus on service boundaries, reproducible pipelines, failure handling, and systems that remain dependable beyond a model demo.</p><div className="inline-links"><a href={`mailto:${siteConfig.email}`}>Email</a><a href={siteConfig.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14}/></a><a href={siteConfig.resume} target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={14}/></a></div></div></section>

    <section className="about-section"><h2 data-reveal>Experience</h2><div className="experience-list full">{experiences.map((experience)=><article key={experience.organization} data-reveal><div><span className="eyebrow">{experience.dates}</span><h3>{experience.organization}</h3></div><div><strong>{experience.role}</strong><p>{experience.summary}</p></div></article>)}</div></section>

    <section className="about-section about-columns" data-reveal><div><h2>Engineering interests</h2><ul className="plain-list"><li>AI orchestration and ML platform reliability</li><li>Asynchronous backend systems</li><li>LLM experimentation and evaluation infrastructure</li><li>Retrieval-augmented generation</li><li>Scientific machine-learning pipelines</li><li>Large-scale biological data systems</li></ul></div><div><h2>Technical skills</h2><div className="skills-list">{skillGroups.map((group)=><section key={group}><h3>{group}</h3><p>{skills.filter((skill)=>skill.group===group).map((skill)=>skill.name).join(' · ')}</p></section>)}</div></div></section>
  </main>
}
