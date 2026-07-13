'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

type GeometryNode = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  phase: number
  accent: boolean
  group: number
}

const TAU = Math.PI * 2

export function BackgroundGeometry() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const canvasCandidate = canvasRef.current
    if (!canvasCandidate) return
    const contextCandidate = canvasCandidate.getContext('2d')
    if (!contextCandidate) return
    const canvasElement: HTMLCanvasElement = canvasCandidate
    const drawingContext: CanvasRenderingContext2D = contextCandidate

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes: GeometryNode[] = []
    let width = 0
    let height = 0
    let deviceScale = 1
    let frame = 0
    let resizeFrame = 0
    let activeGroup = 0
    let scrollOffset = window.scrollY
    let signalStarted = 0
    let signalFrom = -1
    let signalTo = -1
    let visible = !document.hidden

    function populate() {
      nodes.length = 0
      const count = width < 640 ? 16 : width < 960 ? 30 : 52
      for (let index = 0; index < count; index += 1) {
        const column = index % 8
        const row = Math.floor(index / 8)
        const horizontalOffset = Math.sin((index + 1) * 1.73) * Math.min(width * 0.012, 14)
        const verticalOffset = Math.cos((index + 1) * 1.31) * 10
        nodes.push({
          x: ((column + 0.5) / 8) * width + horizontalOffset,
          y: ((row + 0.5) / Math.ceil(count / 8)) * height + verticalOffset,
          vx: Math.sin(index * 2.17) * 0.018,
          vy: Math.cos(index * 1.91) * 0.014,
          radius: 0.9 + (index % 4) * 0.22,
          phase: ((index * 47) % 360) * (Math.PI / 180),
          accent: index % 17 === 0,
          group: index % 5,
        })
      }
    }

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      deviceScale = Math.min(window.devicePixelRatio || 1, 1.5)
      canvasElement.width = Math.round(width * deviceScale)
      canvasElement.height = Math.round(height * deviceScale)
      canvasElement.style.width = `${width}px`
      canvasElement.style.height = `${height}px`
      drawingContext.setTransform(deviceScale, 0, 0, deviceScale, 0, 0)
      populate()
      if (reducedMotion) draw(0)
    }

    function scheduleResize() {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(resize)
    }

    function draw(time: number) {
      drawingContext.clearRect(0, 0, width, height)
      const parallax = reducedMotion ? 0 : -(scrollOffset % height) * 0.025

      for (let first = 0; first < nodes.length; first += 1) {
        const a = nodes[first]
        for (let second = first + 1; second < nodes.length; second += 1) {
          const b = nodes[second]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distanceSquared = dx * dx + dy * dy
          if (distanceSquared > 13500) continue
          const active = a.group === activeGroup && b.group === activeGroup
          drawingContext.strokeStyle = active ? 'rgba(103,232,249,0.14)' : 'rgba(255,255,255,0.055)'
          drawingContext.lineWidth = active ? 0.75 : 0.5
          drawingContext.beginPath()
          drawingContext.moveTo(a.x, a.y + parallax)
          drawingContext.lineTo(b.x, b.y + parallax)
          drawingContext.stroke()
        }
      }

      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index]
        if (!reducedMotion) {
          node.x += node.vx
          node.y += node.vy
          if (node.x < 0 || node.x > width) node.vx *= -1
          if (node.y < 0 || node.y > height) node.vy *= -1
        }
        const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 0.00045 + node.phase) * 0.14
        const active = node.group === activeGroup
        const alpha = node.accent ? (active ? 0.48 : 0.28) : active ? 0.25 : 0.14
        drawingContext.fillStyle = node.accent
          ? `rgba(103,232,249,${alpha})`
          : `rgba(210,210,210,${alpha})`
        drawingContext.beginPath()
        drawingContext.arc(node.x, node.y + parallax, node.radius * pulse, 0, TAU)
        drawingContext.fill()
      }

      if (!reducedMotion && signalStarted > 0 && time - signalStarted < 1600) {
        const progress = (time - signalStarted) / 1600
        const first = nodes[signalFrom]
        const second = nodes[signalTo]
        if (first && second) {
          drawingContext.fillStyle = 'rgba(103,232,249,0.55)'
          drawingContext.beginPath()
          drawingContext.arc(first.x + (second.x - first.x) * progress, first.y + (second.y - first.y) * progress + parallax, 1.5, 0, TAU)
          drawingContext.fill()
        }
      }

      if (!reducedMotion && visible) frame = requestAnimationFrame(draw)
    }

    function handleScroll() {
      scrollOffset = window.scrollY
    }

    function handleVisibility() {
      visible = !document.hidden
      if (visible && !reducedMotion) frame = requestAnimationFrame(draw)
      else cancelAnimationFrame(frame)
    }

    const sections = document.querySelectorAll<HTMLElement>('[data-geometry-section]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.25) continue
          const index = Number((entry.target as HTMLElement).dataset.geometrySection || 0)
          activeGroup = index % 5
          signalFrom = -1
          signalTo = -1
          for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
            if (nodes[nodeIndex].group !== activeGroup) continue
            if (signalFrom === -1) signalFrom = nodeIndex
            else { signalTo = nodeIndex; break }
          }
          signalStarted = performance.now()
        }
      },
      { threshold: [0.25, 0.55] },
    )
    sections.forEach((section) => observer.observe(section))

    resize()
    if (!reducedMotion) frame = requestAnimationFrame(draw)
    window.addEventListener('resize', scheduleResize, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      window.removeEventListener('resize', scheduleResize)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [pathname])

  return <canvas ref={canvasRef} className="background-geometry" aria-hidden="true" />
}
