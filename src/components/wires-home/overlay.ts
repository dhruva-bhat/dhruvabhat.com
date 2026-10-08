import { clamp, easeInOut, type Point } from './math'

/** Animates a circular clip-path on `el` from radius `from` to `to`. Returns a cancel function. */
export function revealCircle(el: HTMLElement, from: number, to: number, ms: number, origin: Point, done: () => void) {
  const t0 = performance.now()
  let raf = 0
  const step = (now: number) => {
    const p = clamp((now - t0) / ms, 0, 1)
    const r = from + (to - from) * easeInOut(p)
    el.style.clipPath = `circle(${r.toFixed(1)}px at ${origin.x.toFixed(1)}px ${origin.y.toFixed(1)}px)`
    if (p < 1) raf = requestAnimationFrame(step)
    else {
      raf = 0
      done()
    }
  }
  raf = requestAnimationFrame(step)
  return () => {
    if (raf) cancelAnimationFrame(raf)
  }
}

const letters = (el: Element) => [...el.querySelectorAll<HTMLElement>('.w-ch')]

/**
 * Flies copies of the `src` letters (measured at `srcRects`, before the view switched) onto the `dst` letters,
 * scattering and spinning on the way. The real letters stay hidden via `.w-flying` until they land.
 * Returns a cleanup function that removes the flying copies.
 */
function flyLetters(container: HTMLElement, src: HTMLElement[], srcRects: DOMRect[], dst: HTMLElement[], done: () => void) {
  const box = container.getBoundingClientRect()
  const from = getComputedStyle(src[0])
  const to = getComputedStyle(dst[0])
  const scale = parseFloat(to.fontSize) / parseFloat(from.fontSize)
  const layer = document.createElement('div')
  layer.className = 'w-fly'
  container.appendChild(layer)
  container.classList.add('w-flying')
  const cleanup = () => {
    container.classList.remove('w-flying')
    layer.remove()
  }
  let remaining = src.length
  src.forEach((ch, i) => {
    const a = srcRects[i]
    const b = dst[i].getBoundingClientRect()
    const el = document.createElement('span')
    el.textContent = ch.textContent
    el.style.left = `${a.left - box.left}px`
    el.style.top = `${a.top - box.top}px`
    el.style.font = `${from.fontStyle} ${from.fontWeight} ${from.fontSize} ${from.fontFamily}`
    el.style.color = from.color
    layer.appendChild(el)
    const dx = b.left - a.left
    const dy = b.top - a.top
    const midX = dx * 0.5 + (Math.random() - 0.5) * 60
    const midY = dy * 0.5 - (30 + Math.random() * 50)
    const spin = (Math.random() - 0.5) * 50
    const flight = el.animate(
      [
        { transform: 'translate(0,0) rotate(0) scale(1)', color: from.color },
        { transform: `translate(${midX}px,${midY}px) rotate(${spin}deg) scale(${(1 + scale) / 2})`, offset: 0.5 },
        { transform: `translate(${dx}px,${dy}px) rotate(0) scale(${scale})`, color: to.color },
      ],
      { duration: 760, delay: i * 16, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' },
    )
    flight.onfinish = () => {
      if (--remaining) return
      cleanup()
      done()
    }
  })
  return cleanup
}

type ProjectPagesOptions = {
  overlay: HTMLElement
  scroller: HTMLElement
  list: HTMLElement
  reduceMotion: boolean
  schedule: (ms: number, fn: () => void) => void
  onOpened: () => void
  onClosed: (button: HTMLElement) => void
}

/**
 * Work list ↔ project page. Opening fades the list and flies the clicked title's letters into the
 * project page heading; closing flies them back.
 */
export function createProjectPages({ overlay, scroller, list, reduceMotion, schedule, onOpened, onClosed }: ProjectPagesOptions) {
  const buttons = [...overlay.querySelectorAll<HTMLElement>('.w-proj')]
  const pages = [...overlay.querySelectorAll<HTMLElement>('.w-detail')]
  let current = -1
  let busy = false
  let listScroll = 0
  let fades: Animation[] = []
  let stopFlying: (() => void) | null = null

  const heading = (page: HTMLElement) => page.querySelector('h2') ?? page

  const fly = (src: HTMLElement[], srcRects: DOMRect[], dst: HTMLElement[], done: () => void) => {
    if (reduceMotion || !src.length) {
      done()
      return
    }
    stopFlying = flyLetters(overlay, src, srcRects, dst, () => {
      stopFlying = null
      done()
    })
  }

  function open(i: number) {
    if (busy || current >= 0) return
    busy = true
    current = i
    listScroll = scroller.scrollTop
    const button = buttons[i]
    const subtitle = button.querySelector(':scope > span')
    const others = [...list.children].filter((el) => el !== button)
    fades = [...others, ...(subtitle ? [subtitle] : [])].map((el) =>
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduceMotion ? 0 : 240, fill: 'forwards', easing: 'ease' }),
    )
    schedule(reduceMotion ? 0 : 260, () => {
      const src = letters(button)
      const srcRects = src.map((c) => c.getBoundingClientRect())
      list.classList.remove('cur')
      pages[i].classList.add('cur')
      scroller.scrollTop = 0
      fly(src, srcRects, letters(heading(pages[i])), () => {
        pages[i].classList.add('go')
        busy = false
        onOpened()
      })
    })
  }

  function close() {
    if (busy || current < 0) return
    busy = true
    const page = pages[current]
    const button = buttons[current]
    const contentFade = [...page.querySelectorAll('.rise2')].map((el) =>
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduceMotion ? 0 : 200, fill: 'forwards' }),
    )
    schedule(reduceMotion ? 0 : 220, () => {
      const src = letters(heading(page))
      const srcRects = src.map((c) => c.getBoundingClientRect())
      page.classList.remove('cur', 'go')
      contentFade.forEach((a) => a.cancel())
      list.classList.add('cur')
      scroller.scrollTop = listScroll
      fly(src, srcRects, letters(button), () => {
        const faded = fades
        fades = []
        for (const f of faded) {
          const el = f.effect instanceof KeyframeEffect ? f.effect.target : null
          f.cancel()
          if (el && !reduceMotion) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease' })
        }
        busy = false
        current = -1
        onClosed(button)
      })
    })
  }

  /** Snaps straight back to the list with nothing in flight. */
  function reset() {
    fades.forEach((f) => f.cancel())
    fades = []
    stopFlying?.()
    stopFlying = null
    pages.forEach((p) => p.classList.remove('cur', 'go'))
    current = -1
    busy = false
  }

  return {
    buttons,
    open,
    close,
    reset,
    get isOpen() {
      return current >= 0
    },
    get busy() {
      return busy
    },
  }
}
