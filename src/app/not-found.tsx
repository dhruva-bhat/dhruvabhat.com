import Link from 'next/link'

export default function NotFound() {
  return <main className="not-found"><span className="eyebrow">404</span><h1>Page not found</h1><p>The requested route does not exist or has moved.</p><div className="inline-links"><Link href="/">Home</Link><Link href="/work">Work</Link></div></main>
}
