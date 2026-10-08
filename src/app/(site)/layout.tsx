import { SiteShell } from '@/components/site-shell'
import { siteMetadata } from '@/lib/site-metadata'

export const metadata = siteMetadata

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
