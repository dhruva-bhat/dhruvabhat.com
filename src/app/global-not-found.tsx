import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundGeometry } from '@/components/background-geometry'
import NotFound from './(site)/not-found'
import '@fontsource/comic-neue/400.css'
import '@fontsource/comic-neue/700.css'
import './(site)/globals.css'
export const metadata={title:'Page not found — Dhruva Bhat'}
export default function GlobalNotFound(){return <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}><body><BackgroundGeometry/><SiteHeader/><div id="main-content"><NotFound/></div><SiteFooter/></body></html>}
