import { clamp, easeOut, randomBetween } from './math'
import { createProjectPages, revealCircle } from './overlay'
import { drawScene } from './scene/draw'
import { createScene } from './scene/simulation'
import type { SceneView } from './scene/types'
import { drawPulse, drawWire, layoutWires, wireAt, type Pulse, type Rect, type Wire } from './wires'

type Phase = 'intro' | 'wires' | 'home' | 'jolt' | 'expand' | 'open' | 'collapse'

/** Below this width the labels sit under the name (see wires-home.css) and the wires drop down to them. */
const STACKED_QUERY = '(max-width: 1100px)'

/** How brightly a wire lights up when its section is picked. */
const JOLT_FLASH = 0.7

/** Pixels from a wire that still count as clicking it. */
const WIRE_HIT_PX = 12

function required<T extends Element>(root: HTMLElement, selector: string): T {
  const el = root.querySelector<T>(selector)
  if (!el) throw new Error(`WiresHome: missing ${selector}`)
  return el
}

/** A set of timeouts that can be cancelled together. */
function createTimers() {
  let ids: number[] = []
  return {
    at(ms: number, fn: () => void) {
      ids.push(window.setTimeout(fn, ms))
    },
    clear() {
      ids.forEach(clearTimeout)
      ids = []
    },
  }
}

/**
 * Starts the home screen inside `root`: the typed intro, the wires, the block-stacking agents and the
 * section overlay. Returns a cleanup function that stops every timer, frame and listener (safe to call
 * under React strict mode's double effect).
 */
export function mountWiresHome(root: HTMLElement) {
  const canvas = required<HTMLCanvasElement>(root, '#wCv')
  const context = canvas.getContext('2d')
  if (!context) return () => {}
  const ctx: CanvasRenderingContext2D = context
  const status = required<HTMLElement>(root, '#wStatus')
  const statusText = required<HTMLElement>(root, '#wStatusTxt')
  const nameText = required<HTMLElement>(root, '#wNameTxt')
  const nameGhost = required<HTMLElement>(root, '#wGhost')
  const subtitle = required<HTMLElement>(root, '#wSub')
  const overlay = required<HTMLElement>(root, '#wOv')
  const backButton = required<HTMLButtonElement>(root, '#wBack')
  const noLight = required<HTMLElement>(root, '#wNoLight')
  const labels = ['#wLb0', '#wLb1', '#wLb2'].map((id) => required<HTMLButtonElement>(root, id))
  const resumeButton = required<HTMLButtonElement>(root, '#wResume')
  const resumeFrame = required<HTMLIFrameElement>(root, '#wResumePdf')
  /** Section i's circle grows from origins[i]: the three wired labels, then the resume button. */
  const origins = [...labels, resumeButton]
  const sections = ['#wSecWork', '#wSecAbout', '#wSecContact', '#wSecResume'].map((id) => required<HTMLElement>(root, id))
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  const timers = createTimers()
  const listeners = new AbortController()
  const on = { signal: listeners.signal }
  const scene = createScene(reduceMotion)
  const sc = scene.state

  let phase: Phase = 'intro'
  let width = 0
  let height = 0
  let dpr = 1
  let view: SceneView = { cx: 0, gy: 0, s: 1 }
  let wires: Wire[] = []
  let originRects: Rect[] = []
  let pulses: Pulse[] = []
  let grow = [0, 0, 0]
  let glow = [0, 0, 0]
  let flash = [0, 0, 0]
  let hovered = -1
  /** Wire under the pointer on the canvas (separate from label hover/focus). */
  let wireHover = -1
  let wiresStart = -1
  let nextIdlePulse = 3
  let lastFrame = 0
  let needsLayout = true
  let openSection = -1
  let raf = 0
  let stopReveal: (() => void) | null = null
  let noLightTimer = 0

  // ---- layout ----

  function measure() {
    const w = root.clientWidth
    const h = root.clientHeight
    if (!w || !h) return false
    const box = root.getBoundingClientRect()
    const k = box.width ? w / box.width : 1
    const rel = (el: Element): Rect => {
      const b = el.getBoundingClientRect()
      const l = (b.left - box.left) * k
      const r = (b.right - box.left) * k
      const t = (b.top - box.top) * k
      const bt = (b.bottom - box.top) * k
      return { l, r, t, b: bt, cx: (l + r) / 2, cy: (t + bt) / 2 }
    }
    width = w
    height = h
    dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const name = rel(nameGhost)
    const gy = name.t - 4
    view = { cx: name.cx, gy, s: Math.max(0.4, Math.min(1.15, (gy - 12) / 178, width / 800)) }
    originRects = origins.map(rel)
    wires = layoutWires(name, originRects.slice(0, labels.length), rel(subtitle).b, window.matchMedia(STACKED_QUERY).matches)
    pulses = []
    needsLayout = false
    return true
  }

  const toScene = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    const k = r.width ? width / r.width : 1
    return { x: ((e.clientX - r.left) * k - view.cx) / view.s, y: ((e.clientY - r.top) * k - view.gy) / view.s }
  }
  const toCanvas = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    const k = r.width ? width / r.width : 1
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k }
  }

  // ---- section overlay ----

  const maxRadius = (x: number, y: number) =>
    Math.max(Math.hypot(x, y), Math.hypot(width - x, y), Math.hypot(x, height - y), Math.hypot(width - x, height - y)) + 4

  const projects = createProjectPages({
    overlay,
    scroller: required<HTMLElement>(root, '.w-scroll'),
    list: sections[0],
    reduceMotion,
    schedule: timers.at,
    onOpened: () => backButton.focus({ preventScroll: true }),
    onClosed: (button) => button.focus({ preventScroll: true }),
  })

  function openOverlay(i: number) {
    phase = 'expand'
    openSection = i
    sections.forEach((s, j) => s.classList.toggle('cur', j === i))
    overlay.style.visibility = 'visible'
    overlay.setAttribute('aria-hidden', 'false')
    const done = () => {
      overlay.style.clipPath = 'none'
      overlay.classList.add('on')
      phase = 'open'
      backButton.focus({ preventScroll: true })
    }
    if (reduceMotion) return done()
    const at = { x: originRects[i].cx, y: originRects[i].cy }
    overlay.style.clipPath = `circle(0px at ${at.x}px ${at.y}px)`
    stopReveal = revealCircle(overlay, 0, maxRadius(at.x, at.y), 1000, at, done)
  }

  function closeOverlay() {
    if (phase !== 'open' || projects.busy) return
    phase = 'collapse'
    overlay.classList.remove('on')
    const i = openSection
    const done = () => {
      overlay.style.visibility = 'hidden'
      overlay.setAttribute('aria-hidden', 'true')
      overlay.style.clipPath = 'circle(0px at 50% 50%)'
      labels.forEach((l) => l.classList.remove('zap'))
      phase = 'home'
      origins[i]?.focus({ preventScroll: true })
      // a quieter signal runs back from the label to the name
      if (!reduceMotion && wires[i]) {
        pulses.push(jolt(i, 0.7, true))
      }
    }
    if (reduceMotion) return done()
    const at = { x: originRects[i].cx, y: originRects[i].cy }
    const r = maxRadius(at.x, at.y)
    overlay.style.clipPath = `circle(${r}px at ${at.x}px ${at.y}px)`
    stopReveal = revealCircle(overlay, r, 0, 800, at, done)
  }

  /** Back button / Escape: project page → work list → home. */
  function goBack() {
    if (projects.isOpen) projects.close()
    else closeOverlay()
  }

  function openProject(i: number) {
    if (phase === 'open' && openSection === 0) projects.open(i)
  }

  /** The jittery signal sent along wire i when a section opens (outward) or closes (back to the name). */
  const jolt = (i: number, seconds: number, reverse: boolean): Pulse => ({
    wire: i, s: 0, speed: wires[i].len / seconds, tail: 140, alpha: 0.75, width: 3, jitter: 3.5, blur: 11, reverse, arrived: false,
  })

  /** Clicking a label or its wire: a jolt runs down that wire, then the section opens from the label. */
  function pick(i: number) {
    if (phase !== 'home') return
    phase = 'jolt'
    hovered = -1
    if (reduceMotion) {
      labels[i].classList.add('zap')
      openOverlay(i)
      return
    }
    if (wires[i]) pulses.push(jolt(i, 0.55, false))
    flash[i] = JOLT_FLASH
    timers.at(560, () => {
      labels[i].classList.add('zap')
      flash[i] = JOLT_FLASH
    })
    timers.at(780, () => openOverlay(i))
  }

  /** The resume has no wire: its section opens straight from the button. */
  function openResume() {
    if (phase !== 'home') return
    hovered = -1
    // load the PDF only once someone asks for it
    if (!resumeFrame.getAttribute('src') && resumeFrame.dataset.src) resumeFrame.src = resumeFrame.dataset.src
    openOverlay(origins.indexOf(resumeButton))
  }

  // ---- intro sequence ----

  const setStatus = (s: string) => {
    statusText.textContent = s
  }
  const setName = (s: string) => {
    nameText.textContent = s
  }
  /** Schedules typing (or backspacing) `str` one character at a time from `t` ms; returns when it finishes. */
  const type = (str: string, t: number, rate: number, set: (s: string) => void, erase = false) => {
    const n = str.length
    for (let i = 1; i <= n; i++) {
      t += rate * randomBetween(0.65, 1.35)
      const s = erase ? str.slice(0, n - i) : str.slice(0, i)
      timers.at(t, () => set(s))
    }
    return t
  }

  function reset() {
    timers.clear()
    stopReveal?.()
    stopReveal = null
    phase = 'intro'
    grow = [0, 0, 0]
    glow = [0, 0, 0]
    flash = [0, 0, 0]
    pulses = []
    wiresStart = -1
    hovered = -1
    openSection = -1
    root.classList.remove('w-ready', 'w-namelive', 'w-sub')
    scene.reset()
    sc.started = false
    sc.alpha = 0
    status.classList.remove('live')
    labels.forEach((l) => l.classList.remove('show', 'zap'))
    setStatus('')
    setName('')
    overlay.classList.remove('on')
    overlay.style.visibility = 'hidden'
    overlay.style.clipPath = 'circle(0px at 50% 50%)'
    overlay.setAttribute('aria-hidden', 'true')
    projects.reset()
    sections.forEach((s) => s.classList.remove('cur'))
  }

  function playIntro() {
    reset()
    if (reduceMotion) {
      root.classList.add('w-ready', 'w-sub')
      setName('dhruva bhat')
      grow = [1, 1, 1]
      sc.started = true
      sc.alpha = 1
      labels.forEach((l) => l.classList.add('show'))
      phase = 'home'
      return
    }
    timers.at(700, () => status.classList.add('live'))
    let t = type('hello...', 1300, 110, setStatus)
    t = type('hello...', t + 900, 60, setStatus, true)
    // the cursor hands over from the greeting to the name
    t += 350
    timers.at(t, () => {
      status.classList.remove('live')
      root.classList.add('w-namelive')
    })
    t = type('dhruva bhat', t + 250, 105, setName)
    timers.at(t + 150, () => root.classList.add('w-sub'))
    timers.at(t + 700, () => {
      sc.started = true
    })
    const wiresAt = t + 1500
    timers.at(wiresAt, () => {
      wiresStart = performance.now()
      phase = 'wires'
    })
    labels.forEach((l, i) => timers.at(wiresAt + i * 170 + 1250, () => l.classList.add('show')))
    timers.at(wiresAt + 340 + 1700, () => {
      phase = 'home'
      root.classList.add('w-ready')
    })
  }

  // ---- light-mode joke ----

  function hideNoLight() {
    clearTimeout(noLightTimer)
    noLight.classList.remove('show')
    noLight.setAttribute('aria-hidden', 'true')
  }

  function showNoLight() {
    noLight.classList.add('show')
    noLight.setAttribute('aria-hidden', 'false')
    scene.reactAll([['surprised', 0.6], ['sad', 2]])
    clearTimeout(noLightTimer)
    noLightTimer = window.setTimeout(hideNoLight, 3200)
  }

  // ---- input ----

  /** The agents only respond once they're visible and no overlay is in the way. */
  const sceneInteractive = () =>
    sc.started && sc.alpha > 0.5 && sc.state !== 'static' && phase !== 'open' && phase !== 'expand' && phase !== 'jolt'

  canvas.style.touchAction = 'none'
  canvas.addEventListener('pointerdown', (e) => {
    if (sceneInteractive() && scene.pointerDown(toScene(e))) {
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        // the pointer may already be gone
      }
      return
    }
    if (phase === 'home') {
      const p = toCanvas(e)
      const i = wireAt(wires, p.x, p.y, WIRE_HIT_PX)
      if (i >= 0) pick(i)
    }
  }, on)
  canvas.addEventListener('pointermove', (e) => {
    let cursor = scene.pointerMove(toScene(e), sceneInteractive())
    const p = toCanvas(e)
    const i = cursor === 'default' && phase === 'home' && !sc.drag ? wireAt(wires, p.x, p.y, WIRE_HIT_PX) : -1
    if (i !== wireHover) hovered = i
    wireHover = i
    if (i >= 0) cursor = 'pointer'
    canvas.style.cursor = cursor
  }, on)
  canvas.addEventListener('pointerup', () => scene.pointerUp(), on)
  canvas.addEventListener('pointercancel', () => scene.pointerUp(), on)
  canvas.addEventListener('pointerleave', () => {
    scene.pointerLeave()
    if (wireHover >= 0) hovered = -1
    wireHover = -1
  }, on)

  labels.forEach((label, i) => {
    const hover = () => {
      if (phase === 'home') hovered = i
    }
    const unhover = () => {
      hovered = -1
    }
    label.addEventListener('click', () => pick(i), on)
    label.addEventListener('mouseenter', hover, on)
    label.addEventListener('mouseleave', unhover, on)
    label.addEventListener('focus', hover, on)
    label.addEventListener('blur', unhover, on)
  })
  projects.buttons.forEach((b, i) => b.addEventListener('click', () => openProject(i), on))
  backButton.addEventListener('click', goBack, on)
  resumeButton.addEventListener('click', openResume, on)
  required<HTMLElement>(root, '#wMoon').addEventListener('click', showNoLight, on)
  noLight.addEventListener('click', hideNoLight, on)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    if (noLight.classList.contains('show')) hideNoLight()
    else goBack()
  }, on)
  window.addEventListener('resize', () => {
    needsLayout = true
  }, on)
  document.fonts?.ready.then(() => {
    needsLayout = true
  })

  // ---- frame loop ----

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - lastFrame) / 1000)
    lastFrame = now
    if (root.clientWidth !== width || root.clientHeight !== height) needsLayout = true
    if (needsLayout && !measure()) return
    if (!wires.length) return
    if (!reduceMotion && wiresStart >= 0) grow = grow.map((_, i) => easeOut(clamp((now - wiresStart - i * 170) / 1500, 0, 1)))

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (sc.started && sc.alpha < 1) sc.alpha = Math.min(1, sc.alpha + dt * 0.8)
    // the claw parks high enough to hide a hanging load above the canvas
    if (sc.started && sc.state !== 'static') scene.update(dt, -view.gy / view.s - 95)
    drawScene(ctx, sc, view)

    if (!reduceMotion && phase === 'home') {
      nextIdlePulse -= dt
      if (nextIdlePulse <= 0) {
        nextIdlePulse = randomBetween(2.5, 5)
        pulses.push({ wire: Math.floor(Math.random() * 3), s: 0, speed: 320, tail: 70, alpha: 0.35, width: 2, jitter: 0, blur: 10, reverse: false, arrived: false })
      }
    }
    wires.forEach((w, i) => {
      if (grow[i] <= 0) return
      glow[i] += ((hovered === i && phase === 'home' ? 1 : 0) - glow[i]) * Math.min(1, dt * 10)
      flash[i] = Math.max(0, flash[i] - dt * 1.6)
      drawWire(ctx, w, grow[i], Math.max(glow[i] * 0.55, flash[i]), glow[i] * 2.5 + flash[i] * 3, 0.25 + 0.35 * glow[i])
    })
    pulses = pulses.filter((p) => {
      const w = wires[p.wire]
      p.s += p.speed * dt
      if (!p.arrived && p.s >= w.len) {
        p.arrived = true
        flash[p.wire] = Math.max(flash[p.wire], p.reverse ? 0.3 : p.jitter ? 0.65 : 0.2)
      }
      if (p.s - p.tail > w.len) return false
      drawPulse(ctx, w, p)
      return true
    })
  }

  playIntro()
  raf = requestAnimationFrame(frame)

  return () => {
    timers.clear()
    stopReveal?.()
    cancelAnimationFrame(raf)
    listeners.abort()
    projects.reset()
    clearTimeout(noLightTimer)
  }
}
