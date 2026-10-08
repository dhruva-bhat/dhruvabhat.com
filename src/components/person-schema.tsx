import { siteConfig } from '@/data/portfolio'
import { siteUrl } from '@/lib/site-metadata'

/** schema.org Person structured data for search engines. */
export function PersonSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.name,
    url: siteUrl,
    email: `mailto:${siteConfig.email}`,
    sameAs: [siteConfig.linkedin, siteConfig.github],
    affiliation: { '@type': 'CollegeOrUniversity', name: 'University of California, Berkeley' },
    knowsAbout: ['AI infrastructure', 'Backend engineering', 'Machine-learning platforms', 'Scientific machine learning', 'Computational biology'],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
}
