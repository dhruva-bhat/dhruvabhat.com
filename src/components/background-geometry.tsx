'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

type GeometryNode = {
  baseX: number
  baseY: number
  radius: number
  phase: number
  accent: boolean
  group: number
  depth: number
}

type RenderedNode = {
  x: number
  y: number
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
    const canvas: HTMLCanvasElement = canvasCandidate
    const context: CanvasRenderingContext2D = contextCandidate

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes: GeometryNode[] = []
    const renderedNodes: RenderedNode[] = []
    const meshFaces: [number, number, number][] = []
    let width = 0
    let height = 0
    let deviceScale = 1
    let frame = 0
    let resizeFrame = 0
    let activeGroup = 0
    let scrollOffset = window.scrollY
    let scrollProgress = 0
    let targetScrollProgress = 0
    let visible = !document.hidden
    let compact = false
    let pointerX = 0
    let pointerY = 0
    let targetPointerX = 0
    let targetPointerY = 0

    function populate() {
      nodes.length = 0
      renderedNodes.length = 0
      meshFaces.length = 0
      compact = width < 640
      const columns = compact ? 4 : width < 960 ? 6 : 7
      const rows = compact ? 4 : 6

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column
          const rowOffset = row % 2 === 0 ? -0.12 : 0.18
          nodes.push({
            baseX: ((column + 0.5 + rowOffset) / columns) * width,
            baseY: ((row + 0.45) / rows) * height + Math.sin(index * 1.41) * 9,
            radius: 0.85 + (index % 4) * 0.18,
            phase: ((index * 43) % 360) * (Math.PI / 180),
            accent: index % 19 === 0,
            group: (column + row * 2) % 5,
            depth: 0.25 + (index % 4) * 0.12,
          })
          renderedNodes.push({ x: 0, y: 0 })
        }
      }

      for (let row = 0; row < rows - 1; row += 1) {
        for (let column = 0; column < columns - 1; column += 1) {
          if ((row + column) % 3 !== 0) continue
          const topLeft = row * columns + column
          const topRight = topLeft + 1
          const bottomLeft = topLeft + columns
          const bottomRight = bottomLeft + 1
          meshFaces.push(row % 2 === 0
            ? [topLeft, topRight, bottomRight]
            : [topLeft, bottomLeft, bottomRight])
        }
      }
    }

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      deviceScale = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * deviceScale)
      canvas.height = Math.round(height * deviceScale)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0)
      populate()
      handleScroll()
      if (reducedMotion) draw(0)
    }

    function scheduleResize() {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(resize)
    }

    function draw(time: number) {
      context.clearRect(0, 0, width, height)
      pointerX += (targetPointerX - pointerX) * 0.035
      pointerY += (targetPointerY - pointerY) * 0.035
      scrollProgress += (targetScrollProgress - scrollProgress) * 0.045
      const scrollPhase = scrollProgress * TAU * 2.25
      const parallax = reducedMotion ? 0 : Math.sin(scrollPhase * 0.55) * (compact ? 3 : 7)
      const driftScale = reducedMotion ? 0 : compact ? 0.75 : 1
      const timeBreathing = 0.5 + Math.sin(time * 0.00048) * 0.5
      const scrollBreathing = 0.5 + Math.sin(scrollPhase * 1.35) * 0.5
      const breathing = reducedMotion ? 0.45 : timeBreathing * 0.68 + scrollBreathing * 0.32
      const scrollMorph = reducedMotion ? 0 : compact ? 5 : 12

      nodes.forEach((node, index) => {
        renderedNodes[index].x = node.baseX
          + Math.sin(time * 0.00016 + node.phase) * 3.5 * driftScale
          + Math.sin(scrollPhase + node.phase * 1.35) * scrollMorph * node.depth
          + pointerX * node.depth
        renderedNodes[index].y = node.baseY
          + Math.cos(time * 0.00013 + node.phase) * 2.8 * driftScale
          + Math.cos(scrollPhase * 0.78 + node.phase) * scrollMorph * 0.72 * node.depth
          + pointerY * node.depth
          + parallax
      })

      meshFaces.forEach((face, index) => {
        const [first, second, third] = face.map((nodeIndex) => renderedNodes[nodeIndex])
        const active = face.some((nodeIndex) => nodes[nodeIndex].group === activeGroup)
        const alpha = active ? 0.026 + breathing * 0.012 : 0.012 + breathing * 0.006
        context.fillStyle = index % 7 === 0
          ? `rgba(167,185,186,${alpha * 0.65})`
          : `rgba(179,185,186,${alpha})`
        context.beginPath()
        context.moveTo(first.x, first.y)
        context.lineTo(second.x, second.y)
        context.lineTo(third.x, third.y)
        context.closePath()
        context.fill()
      })

      const connectionDistance = compact ? 165 : width < 960 ? 205 : 225
      const connectionDistanceSquared = connectionDistance * connectionDistance
      for (let first = 0; first < nodes.length; first += 1) {
        let connections = 0
        for (let second = first + 1; second < nodes.length && connections < 3; second += 1) {
          const a = renderedNodes[first]
          const b = renderedNodes[second]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distanceSquared = dx * dx + dy * dy
          if (distanceSquared > connectionDistanceSquared) continue
          connections += 1
          const active = nodes[first].group === activeGroup || nodes[second].group === activeGroup
          const accent = active && (nodes[first].accent || nodes[second].accent)
          const alpha = active ? 0.14 + breathing * 0.05 : 0.072 + breathing * 0.032
          context.strokeStyle = accent ? `rgba(167,185,186,${alpha})` : `rgba(194,198,196,${alpha})`
          context.lineWidth = active ? 0.9 : 0.72
          context.beginPath()
          context.moveTo(a.x, a.y)
          context.lineTo(b.x, b.y)
          context.stroke()
        }
      }

      nodes.forEach((node, index) => {
        const position = renderedNodes[index]
        const active = node.group === activeGroup
        const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 0.00042 + node.phase + scrollPhase * 0.65) * 0.14
        const alpha = node.accent ? (active ? 0.64 : 0.4) : active ? 0.38 : 0.24
        context.fillStyle = node.accent ? `rgba(167,185,186,${alpha})` : `rgba(216,214,207,${alpha})`
        context.beginPath()
        context.arc(position.x, position.y, node.radius * pulse, 0, TAU)
        context.fill()
      })

      if (!reducedMotion && visible) frame = requestAnimationFrame(draw)
    }

    function handleScroll() {
      scrollOffset = window.scrollY
      if (reducedMotion) return
      const scrollRange = Math.max(document.documentElement.scrollHeight - height, 1)
      targetScrollProgress = Math.min(Math.max(scrollOffset / scrollRange, 0), 1)
    }

    function handlePointer(event: PointerEvent) {
      if (compact || reducedMotion) return
      targetPointerX = (event.clientX / Math.max(width, 1) - 0.5) * 9
      targetPointerY = (event.clientY / Math.max(height, 1) - 0.5) * 7
    }

    function resetPointer() {
      targetPointerX = 0
      targetPointerY = 0
    }

    function handleVisibility() {
      visible = !document.hidden
      if (visible && !reducedMotion) frame = requestAnimationFrame(draw)
      else cancelAnimationFrame(frame)
    }

    const sections = document.querySelectorAll<HTMLElement>('[data-geometry-section]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.25) return
          activeGroup = Number((entry.target as HTMLElement).dataset.geometrySection || 0) % 5
        })
      },
      { threshold: [0.25, 0.55] },
    )
    sections.forEach((section) => observer.observe(section))

    resize()
    if (!reducedMotion) frame = requestAnimationFrame(draw)
    window.addEventListener('resize', scheduleResize, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pointermove', handlePointer, { passive: true })
    window.addEventListener('pointerleave', resetPointer)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      window.removeEventListener('resize', scheduleResize)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pointermove', handlePointer)
      window.removeEventListener('pointerleave', resetPointer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [pathname])

  return <canvas ref={canvasRef} className="background-geometry" aria-hidden="true" />
}
