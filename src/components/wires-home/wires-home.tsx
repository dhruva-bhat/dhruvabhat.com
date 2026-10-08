'use client'

import Image from 'next/image'
import { useEffect, useRef, type CSSProperties } from 'react'
import { siteConfig } from '@/data/portfolio'
import { work, type WorkEntry } from '@/data/work'
import { mountWiresHome } from './mount'
import './wires-home.css'

/** Stagger index for the `.rise` / `.rise2` entrance animations. */
const stagger = (i: number) => ({ '--i': String(i) }) as CSSProperties

/** Splits text into per-letter spans so titles can fly between the work list and project pages. */
const letters = (text: string) =>
  [...text].map((c, i) => (
    <span key={i} className="w-ch">
      {c}
    </span>
  ))

const meta = (entry: WorkEntry) => entry.role + (entry.dates ? ` · ${entry.dates}` : '')

function WorkList() {
  return (
    <section id="wSecWork" className="w-sec">
      <h2 className="rise" style={stagger(0)}>work</h2>
      {work.map((entry, i) => (
        <button key={entry.title} className="w-item w-proj rise" style={stagger(i + 1)}>
          <b>{letters(entry.title)}</b>
          <span>{meta(entry)}</span>
        </button>
      ))}
    </section>
  )
}

function ProjectPage({ entry }: { entry: WorkEntry }) {
  return (
    <section className="w-sec w-detail">
      <h2>{letters(entry.title)}</h2>
      <p className="dim rise2" style={stagger(0)}>{meta(entry)}</p>
      <p className="rise2" style={stagger(1)}>{entry.lead}</p>
      <ul className="w-points">
        {entry.points.map((point, j) => (
          <li key={j} className="rise2" style={stagger(j + 2)}>{point}</li>
        ))}
      </ul>
      <p className="dim rise2" style={stagger(entry.points.length + 2)}>{entry.stack}</p>
    </section>
  )
}

function About() {
  const photoSizes = '(max-width: 760px) 90vw, 320px'
  return (
    <section id="wSecAbout" className="w-sec">
      <h2 className="rise" style={stagger(0)}>about</h2>
      <div className="w-about">
        <figure className="rise" style={stagger(1)}>
          <Image src="/portraits/dhruva-coastal-portrait.jpg" alt="Dhruva at a coastal overlook at sunset" width={2048} height={1536} sizes={photoSizes} />
          <Image className="w-alt" src="/portraits/dhruva-closeup.jpg" alt="" aria-hidden="true" width={1500} height={2000} sizes={photoSizes} />
        </figure>
        <div>
          <p className="rise" style={stagger(2)}>
            hi, i&rsquo;m dhruva, an eecs student at uc berkeley. i&rsquo;m a swe specifically interested in backend and infra
            development, particularly integration with ai systems (check out my work section!).
          </p>
          <p className="dim rise" style={stagger(3)}>
            in my free time, i like to fiddle with my espresso machine, try new food spots, and read the nyt!
          </p>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="wSecContact" className="w-sec">
      <h2 className="rise" style={stagger(0)}>contact</h2>
      <div className="w-links rise" style={stagger(1)}>
        <a href={siteConfig.github}>github</a>
        <a href={siteConfig.linkedin}>linkedin</a>
        <span>{siteConfig.email}</span>
      </div>
    </section>
  )
}

/**
 * Full-screen animated home: the name types in, wires grow out to work / about / contact, and little
 * agents stack blocks above the name. The canvas animation and all interaction live in ./mount.ts;
 * this component only renders the static markup it drives (looked up by id).
 */
export function WiresHome() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    return mountWiresHome(ref.current)
  }, [])

  return (
    <div ref={ref} id="wRoot">
      <canvas id="wCv" role="img" aria-label="Three gray wires run from the name to the work, about and contact links" />
      <div className="w-center">
        <h1 id="wName" aria-label="dhruva bhat, building backend and infra">
          <span id="wGhost">dhruva bhat</span>
          <span id="wTyped" aria-hidden="true">
            <span id="wNameTxt" />
            <span className="w-caret" />
          </span>
          <span id="wSub" aria-hidden="true">building backend and infra</span>
        </h1>
      </div>
      <div id="wStatus" aria-live="polite">
        <span id="wStatusTxt" />
        <span className="w-caret" />
      </div>
      <button id="wLb0" className="w-lb">work</button>
      <button id="wLb1" className="w-lb">about</button>
      <button id="wLb2" className="w-lb">contact</button>
      <button id="wMoon" aria-label="switch to light mode">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z" fill="currentColor" />
        </svg>
      </button>
      <div id="wNoLight" role="alert" aria-hidden="true">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="88" />
          <circle className="eye" cx="70" cy="80" r="9" />
          <circle className="eye" cx="130" cy="80" r="9" />
          <path d="M58 150 Q100 112 142 150" />
        </svg>
        <p>no light mode (why would you try this...)</p>
      </div>
      <div id="wOv" role="dialog" aria-modal="true" aria-hidden="true">
        <button id="wBack">&larr; back</button>
        <div className="w-scroll">
          <WorkList />
          {work.map((entry) => (
            <ProjectPage key={entry.title} entry={entry} />
          ))}
          <About />
          <Contact />
        </div>
      </div>
    </div>
  )
}
