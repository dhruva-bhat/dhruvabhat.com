import { TAU, clamp, type Point } from './math'

/** A wire sampled every ~3px, with cumulative arc length for drawing partial ranges. */
export type Wire = { pts: Point[]; cum: number[]; len: number }

/** An electrical pulse travelling along a wire. */
export type Pulse = {
  wire: number
  /** Arc length of the head and the tail behind it. */
  s: number
  tail: number
  speed: number
  alpha: number
  width: number
  /** Sideways jitter amplitude; 0 for a smooth pulse. */
  jitter: number
  /** Glow radius in px. */
  blur: number
  /** Travels from the label back to the name instead of outward. */
  reverse: boolean
  arrived: boolean
}

export type Rect = { l: number; r: number; t: number; b: number; cx: number; cy: number }

const TEAL = '46,230,208'
const GRAY = '#586064'
const TIP = '#e8eded'
const CORNER_RADIUS = 26

/** Builds a polyline through P with rounded corners, resampled at even spacing. */
export function buildWire(P: Point[], radius: number): Wire {
  const out: Point[] = [P[0]]
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1]
    const b = P[i]
    const c = P[i + 1]
    const d1 = Math.hypot(a.x - b.x, a.y - b.y) || 1
    const d2 = Math.hypot(c.x - b.x, c.y - b.y) || 1
    const r = Math.min(radius, d1 / 2, d2 / 2)
    const p1 = { x: b.x + ((a.x - b.x) / d1) * r, y: b.y + ((a.y - b.y) / d1) * r }
    const p2 = { x: b.x + ((c.x - b.x) / d2) * r, y: b.y + ((c.y - b.y) / d2) * r }
    out.push(p1)
    for (let s = 1; s <= 8; s++) {
      const t = s / 8
      const u = 1 - t
      out.push({ x: u * u * p1.x + 2 * u * t * b.x + t * t * p2.x, y: u * u * p1.y + 2 * u * t * b.y + t * t * p2.y })
    }
  }
  out.push(P[P.length - 1])

  const pts: Point[] = [out[0]]
  const cum = [0]
  let len = 0
  for (let i = 1; i < out.length; i++) {
    const a = out[i - 1]
    const b = out[i]
    const d = Math.hypot(b.x - a.x, b.y - a.y)
    const n = Math.max(1, Math.ceil(d / 3))
    for (let s = 1; s <= n; s++) {
      const t = s / n
      pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
      len += d / n
      cum.push(len)
    }
  }
  return { pts, cum, len }
}

/** Routes the three wires from the name to the work (left), about (right) and contact (bottom) labels. */
export function layoutWires(name: Rect, labels: Rect[], subtitleBottom: number): Wire[] {
  const [left, right, bottom] = labels
  const cy = name.cy
  // left: out of the name, then a 45° run down to the label
  let sx = name.l - 18
  let ex = left.r + 6
  let ey = left.cy
  let dy = Math.abs(ey - cy)
  let bend = Math.min(ex + 40 + dy, sx - 20)
  const wL = buildWire([{ x: sx, y: cy }, { x: bend, y: cy }, { x: bend - dy, y: ey }, { x: ex, y: ey }], CORNER_RADIUS)
  // right: mirror image
  sx = name.r + 18
  ex = right.l - 6
  ey = right.cy
  dy = Math.abs(ey - cy)
  bend = Math.max(ex - 40 - dy, sx + 20)
  const wR = buildWire([{ x: sx, y: cy }, { x: bend, y: cy }, { x: bend + dy, y: ey }, { x: ex, y: ey }], CORNER_RADIUS)
  // bottom: down from the subtitle with a jog toward the label
  const sy = subtitleBottom + 8
  const y1 = sy + (bottom.t - 8 - sy) * 0.3
  const jog = 70
  const wB = buildWire([{ x: name.cx, y: sy }, { x: name.cx, y: y1 }, { x: name.cx + jog, y: y1 + jog }, { x: bottom.cx, y: bottom.t - 8 }], CORNER_RADIUS)
  return [wL, wR, wB]
}

/** Strokes the stretch of a wire between arc lengths s0 and s1, optionally jittered like an arc of current. */
export function strokeRange(ctx: CanvasRenderingContext2D, w: Wire, s0: number, s1: number, jitter: number) {
  s0 = Math.max(0, s0)
  s1 = Math.min(w.len, s1)
  if (s1 <= s0) return
  ctx.beginPath()
  let started = false
  let offset = 0
  for (let i = 0; i < w.pts.length; i++) {
    const c = w.cum[i]
    if (c < s0 - 3) continue
    if (c > s1 + 3) break
    let { x, y } = w.pts[i]
    if (jitter) {
      if (i % 4 === 0) offset = (Math.random() - 0.5) * 2 * jitter * Math.sin(Math.PI * clamp((c - s0) / (s1 - s0), 0, 1))
      const next = w.pts[Math.min(i + 1, w.pts.length - 1)]
      const prev = w.pts[Math.max(i - 1, 0)]
      const nx = -(next.y - prev.y)
      const ny = next.x - prev.x
      const m = Math.hypot(nx, ny) || 1
      x += (nx / m) * offset
      y += (ny / m) * offset
    }
    if (!started) {
      ctx.moveTo(x, y)
      started = true
    } else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

const pointAt = (w: Wire, s: number) => w.pts[clamp(Math.round(s / (w.len / (w.pts.length - 1))), 0, w.pts.length - 1)]

/**
 * Draws a wire grown to fraction `grow`, brightened by `glow` (hover or a recent pulse),
 * with a white tip that swells by `tipBoost` once fully grown.
 */
export function drawWire(ctx: CanvasRenderingContext2D, w: Wire, grow: number, glow: number, tipBoost: number, ringAlpha: number) {
  const len = w.len * grow
  ctx.shadowBlur = 0
  ctx.strokeStyle = GRAY
  ctx.lineWidth = 2.5
  strokeRange(ctx, w, 0, len, 0)
  if (glow > 0.01) {
    ctx.strokeStyle = `rgba(232,237,237,${(glow * 0.8).toFixed(3)})`
    strokeRange(ctx, w, 0, len, 0)
  }
  ctx.fillStyle = GRAY
  ctx.beginPath()
  ctx.arc(w.pts[0].x, w.pts[0].y, 3.5, 0, TAU)
  ctx.fill()

  const tip = pointAt(w, len)
  const growing = grow < 0.999
  const r = growing ? 5 : 5 + tipBoost
  ctx.fillStyle = TIP
  ctx.beginPath()
  ctx.arc(tip.x, tip.y, r, 0, TAU)
  ctx.fill()
  if (!growing) {
    ctx.strokeStyle = `rgba(232,237,237,${ringAlpha.toFixed(2)})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(tip.x, tip.y, r + 5, 0, TAU)
    ctx.stroke()
  }
}

export function drawPulse(ctx: CanvasRenderingContext2D, w: Wire, p: Pulse) {
  // [head - length, head] along the wire's own direction, mirrored for reverse pulses
  const span = (length: number): [number, number] => (p.reverse ? [w.len - p.s, w.len - p.s + length] : [p.s - length, p.s])
  ctx.strokeStyle = `rgba(${TEAL},${p.alpha})`
  ctx.lineWidth = p.width
  ctx.shadowColor = `rgba(${TEAL},1)`
  ctx.shadowBlur = p.blur
  strokeRange(ctx, w, ...span(p.tail), p.jitter)
  if (p.jitter) {
    // a bright core inside the arc
    ctx.shadowBlur = 0
    ctx.strokeStyle = `rgba(225,255,250,${p.alpha})`
    ctx.lineWidth = 1.2
    strokeRange(ctx, w, ...span(p.tail * 0.7), p.jitter * 0.6)
  }
  ctx.shadowBlur = 0
}

/** Index of the wire within `maxDist` px of (x, y), or -1. */
export function wireAt(wires: Wire[], x: number, y: number, maxDist: number) {
  let best = -1
  let bestD = maxDist * maxDist
  wires.forEach((w, i) => {
    for (const p of w.pts) {
      const d = (p.x - x) ** 2 + (p.y - y) ** 2
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
  })
  return best
}
