import type { MetadataRoute } from 'next'
import { projects } from '@/data/portfolio'
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.NEXT_PUBLIC_SITE_URL||'https://dhruvabhat.com';return ['','/work','/timeline','/research','/about',...projects.map(p=>`/work/${p.slug}`)].map(url=>({url:`${base}${url}`,lastModified:new Date(),changeFrequency:'monthly' as const,priority:url===''?1:.7}))}
