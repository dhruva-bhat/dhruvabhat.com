'use client'
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="not-found"><span className="eyebrow">SYSTEM / RECOVERABLE ERROR</span><h1>A connection failed.</h1><p>The rest of the network is still intact.</p><button className="button" onClick={reset}>Try again</button></main>}
