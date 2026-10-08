import type { Metadata } from 'next'
import { siteConfig } from '@/data/portfolio'

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dhruvabhat.com'

const title = `${siteConfig.name} — AI Infrastructure and Backend Systems`
const description =
  'Portfolio of Dhruva Bhat, a UC Berkeley EECS and Bioengineering student building reliable AI infrastructure, backend systems, and scientific machine-learning pipelines.'

/** Shared by both root layouts (home and the rest of the site). */
export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s — ${siteConfig.name}` },
  description,
  alternates: { canonical: '/' },
  openGraph: { title, description, type: 'website', url: '/' },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
}
