import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import NotFound from './(site)/not-found'

export const metadata: Metadata = { title: 'page not found — dhruva bhat' }

/** 404 for unmatched URLs; needed because the app has two root layouts. */
export default function GlobalNotFound() {
  return (
    <SiteShell>
      <NotFound />
    </SiteShell>
  )
}
