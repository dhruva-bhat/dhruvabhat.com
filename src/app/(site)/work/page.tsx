import type { Metadata } from 'next'
import { WorkExplorer } from '@/components/work-explorer'
export const metadata:Metadata={title:'work',description:'Engineering case studies across AI infrastructure, backend systems, scientific machine learning, and biological data.'}
export default function WorkPage(){return <main className="page-shell" data-geometry-section="1"><header className="page-hero" data-reveal><span className="eyebrow">WORK / 2024—PRESENT</span><h1>AI infrastructure and backend systems</h1><p>Eight projects spanning AI orchestration, production software, LLM evaluation, scientific machine learning, and data systems.</p></header><WorkExplorer/></main>}
