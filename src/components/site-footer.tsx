import Link from 'next/link'
import { navigation, siteConfig } from '@/data/portfolio'

export function SiteFooter() {
  return <footer className="site-footer">
    <div><strong>Dhruva Bhat</strong><p>AI infrastructure, backend systems, and scientific ML.</p></div>
    <nav aria-label="Footer">{navigation.slice(1).map((item)=><Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
    <div className="footer-contact"><a href={`mailto:${siteConfig.email}`}>Email</a><a href={siteConfig.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={siteConfig.resume} target="_blank" rel="noreferrer">Résumé</a></div>
    <p className="footer-meta">© {new Date().getFullYear()} Dhruva Bhat</p>
  </footer>
}
