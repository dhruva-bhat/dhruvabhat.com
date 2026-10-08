import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundGeometry } from '@/components/background-geometry'
import { ScrollReveal } from '@/components/scroll-reveal'
import { PersonSchema, siteMetadata } from '@/components/site-meta'
import '@fontsource/comic-neue/400.css'
import '@fontsource/comic-neue/700.css'
import './globals.css'
export const metadata=siteMetadata
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth" className={`${GeistSans.variable} ${GeistMono.variable}`}><body><a className="skip-link" href="#main-content">Skip to content</a><BackgroundGeometry/><ScrollReveal/><SiteHeader/><div id="main-content">{children}</div><SiteFooter/><PersonSchema/></body></html>}
