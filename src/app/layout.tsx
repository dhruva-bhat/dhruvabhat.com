import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundGeometry } from '@/components/background-geometry'
import { ScrollReveal } from '@/components/scroll-reveal'
import '@fontsource/comic-neue/400.css'
import '@fontsource/comic-neue/700.css'
import './globals.css'
const title='Dhruva Bhat — AI Infrastructure and Backend Systems'
const description='Portfolio of Dhruva Bhat, a UC Berkeley EECS and Bioengineering student building reliable AI infrastructure, backend systems, and scientific machine-learning pipelines.'
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://dhruvabhat.com'),title:{default:title,template:'%s — Dhruva Bhat'},description,alternates:{canonical:'/'},openGraph:{title,description,type:'website',url:'/'},twitter:{card:'summary_large_image',title,description},robots:{index:true,follow:true}}
export default function RootLayout({children}:{children:React.ReactNode}){const schema={ '@context':'https://schema.org','@type':'Person',name:'Dhruva Bhat',url:process.env.NEXT_PUBLIC_SITE_URL||'https://dhruvabhat.com',email:'mailto:dhruva.betkoppa@gmail.com',sameAs:['https://linkedin.com/in/dhruvabhat'],affiliation:{'@type':'CollegeOrUniversity',name:'University of California, Berkeley'},knowsAbout:['AI infrastructure','Backend engineering','Machine-learning platforms','Scientific machine learning','Computational biology']};return <html lang="en" data-scroll-behavior="smooth" className={`${GeistSans.variable} ${GeistMono.variable}`}><body><a className="skip-link" href="#main-content">Skip to content</a><BackgroundGeometry/><ScrollReveal/><SiteHeader/><div id="main-content">{children}</div><SiteFooter/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/></body></html>}
