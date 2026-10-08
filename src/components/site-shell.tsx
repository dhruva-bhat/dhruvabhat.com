import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { BackgroundGeometry } from '@/components/background-geometry'
import { PersonSchema } from '@/components/person-schema'
import { ScrollReveal } from '@/components/scroll-reveal'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import '@fontsource/comic-neue/400.css'
import '@fontsource/comic-neue/700.css'
import '@/styles/globals.css'

/** The document shell for every page except the animated home: header, footer, fonts and global styles. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <BackgroundGeometry />
        <ScrollReveal />
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
        <PersonSchema />
      </body>
    </html>
  )
}
