'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { projectPriority, projects, type Project } from '@/data/portfolio'

const filters = ['All','AI Infrastructure','Backend Engineering','Scientific ML','Computational Biology','Neuroscience'] as const
type ProjectFilter = (typeof filters)[number]

function matchesFilter(project: Project, filter: ProjectFilter) {
  if (filter === 'All') return true
  if (filter === 'AI Infrastructure') return project.disciplines.includes('AI Infrastructure')
  if (filter === 'Backend Engineering') return project.disciplines.includes('Backend Engineering')
  if (filter === 'Computational Biology') return project.disciplines.includes('Computational Biology')
  if (filter === 'Scientific ML') return project.disciplines.includes('Scientific Machine Learning')
  if (filter === 'Neuroscience') return project.disciplines.includes('Neuroscience')
  return true
}

export function WorkExplorer() {
  const [filter, setFilter] = useState<ProjectFilter>('All')
  const orderedProjects = [...projects].sort((first, second) => {
    const firstIndex = projectPriority.indexOf(first.slug as (typeof projectPriority)[number])
    const secondIndex = projectPriority.indexOf(second.slug as (typeof projectPriority)[number])
    return (firstIndex === -1 ? 99 : firstIndex) - (secondIndex === -1 ? 99 : secondIndex)
  })
  const shown = orderedProjects.filter((project) => matchesFilter(project, filter))

  return <>
    <div className="project-filters" aria-label="Filter projects">{filters.map((item)=><button key={item} type="button" className={filter===item?'active':''} aria-pressed={filter===item} onClick={()=>setFilter(item)}>{item}</button>)}</div>
    <p className="result-count" aria-live="polite">{shown.length} project{shown.length===1?'':'s'}</p>
    <div className="project-index">{shown.map((project,index)=><Link key={project.slug} className="project-index-row" href={`/work/${project.slug}`} data-reveal>
      <span className="row-index">{String(index+1).padStart(2,'0')}</span>
      <div><span className="eyebrow">{project.institution} · {project.dates}</span><h2>{project.title}</h2><p>{project.summary}</p></div>
      <div className="project-index-meta"><span>{project.disciplines.join(' / ')}</span><span>{project.technologies.slice(0,4).join(' · ')}</span><strong>{project.metric||project.status}</strong></div>
      <ArrowUpRight className="row-arrow" size={16}/>
    </Link>)}</div>
  </>
}
