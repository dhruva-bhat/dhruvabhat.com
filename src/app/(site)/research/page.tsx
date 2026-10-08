import type { Metadata } from 'next'
import { publications } from '@/data/portfolio'

export const metadata:Metadata={title:'Research',description:'Publications, presentations, patents, and current research interests.'}

const interests=['Molecular foundation models','Molecular generation','Scientific machine learning','Computational biology','Representation learning','Neural data analysis','Human-compatible recommendation systems','AI-assisted medical devices','Multimodal biological data']
const groups = [
  { title: 'Publications', types: ['Paper'] },
  { title: 'Presentations', types: ['Oral presentation'] },
  { title: 'Patents', types: ['Patent'] },
] as const

export default function ResearchPage() {
  return <main className="page-shell" data-geometry-section="4">
    <header className="page-hero" data-reveal><span className="eyebrow">RESEARCH / 2024—PRESENT</span><h1>Publications, presentations, and research interests</h1><p>A verified index of published, presented, patented, and in-progress work. Interests are distinguished from completed outputs.</p></header>
    <div className="research-layout">
      <div className="research-groups">{groups.map((group)=><section key={group.title}><h2 data-reveal>{group.title}</h2><div className="publication-list full">{publications.filter((publication)=>group.types.some((type)=>type===publication.type)).map((publication,index)=><article key={`${publication.title}${publication.type}`} data-reveal><span className="pub-number">{String(index+1).padStart(2,'0')}</span><span className="pub-type">{publication.type}</span><div><h3>{publication.title}</h3><p>{publication.summary}</p></div><div className="pub-meta"><span>{publication.venue}</span><span>{publication.year} · {publication.status}</span></div></article>)}</div></section>)}</div>
      <aside className="interest-map" data-reveal><span className="eyebrow">CURRENT INTERESTS</span><p>Areas for further investigation—not publication claims.</p><ul>{interests.map((interest)=><li key={interest}>{interest}</li>)}</ul></aside>
    </div>
  </main>
}
