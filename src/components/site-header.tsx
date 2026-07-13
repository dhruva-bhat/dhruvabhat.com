'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { navigation, siteConfig } from '@/data/portfolio'

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuPanelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const panel = menuPanelRef.current
    const focusable = panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    focusable?.[0]?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || !focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  function closeMenu(restoreFocus = false) {
    setOpen(false)
    if (restoreFocus) menuButtonRef.current?.focus()
  }

  return <header className="site-header">
    <div className="nav-shell">
      <Link className="brand" href="/" aria-label="Dhruva Bhat home"><span className="brand-node"/>Dhruva Bhat</Link>
      <nav className="desktop-nav" aria-label="Primary">{navigation.map((item)=><Link key={item.href} className={isActive(item.href)?'active':''} href={item.href}>{item.label}</Link>)}</nav>
      <div className="header-actions">
        <a className="resume-link" href={siteConfig.resume} target="_blank" rel="noreferrer">Résumé</a>
        <button ref={menuButtonRef} className="menu-button" onClick={()=>setOpen((value)=>!value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open?'Close navigation':'Open navigation'}>{open?<X aria-hidden="true"/>:<Menu aria-hidden="true"/>}</button>
      </div>
    </div>
    {open&&<div className="mobile-backdrop" onMouseDown={()=>closeMenu(true)}>
      <nav ref={menuPanelRef} id="mobile-navigation" className="mobile-nav" aria-label="Mobile" onMouseDown={(event)=>event.stopPropagation()}>
        {navigation.map((item)=><Link key={item.href} className={isActive(item.href)?'active':''} href={item.href} onClick={()=>closeMenu()}>{item.label}</Link>)}
        <a href={siteConfig.resume} target="_blank" rel="noreferrer" onClick={()=>closeMenu()}>Résumé</a>
      </nav>
    </div>}
  </header>
}
