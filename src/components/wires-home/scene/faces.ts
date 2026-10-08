import { line } from '../canvas'
import { TAU } from '../math'
import type { Emotion } from './types'

const FACE = '#f2f5f5'
const EYE_Y = -41

/**
 * Draws a face on an agent's visor. Coordinates are relative to the agent's feet.
 * (lx, ly) shifts the pupils toward what the agent is looking at; `blinking` squashes the eyes.
 */
export function drawFace(ctx: CanvasRenderingContext2D, emo: Emotion, lx: number, ly: number, blinking: boolean, t: number) {
  ctx.strokeStyle = FACE
  ctx.fillStyle = FACE
  ctx.lineCap = 'round'
  ctx.lineWidth = 2.3
  const squash = blinking ? 0.12 : 1
  const eye = (x: number, rx: number, ry: number, dy: number) => {
    ctx.beginPath()
    ctx.ellipse(x + lx, EYE_Y + dy + ly, rx, Math.max(0.6, ry * squash), 0, 0, TAU)
    ctx.fill()
  }
  /** Closed, smiling ^ eye. */
  const arcEye = (x: number) => {
    ctx.beginPath()
    ctx.arc(x + lx * 0.5, EYE_Y + 3, 4.6, Math.PI * 1.12, Math.PI * 1.88)
    ctx.stroke()
  }
  const arc = (y: number, r: number, from: number, to: number, fill = false) => {
    ctx.beginPath()
    ctx.arc(0, y, r, Math.PI * from, Math.PI * to)
    if (fill) ctx.fill()
    else ctx.stroke()
  }
  const brow = (x0: number, y0: number, x1: number, y1: number) => line(ctx, x0, y0, x1, y1)

  switch (emo) {
    case 'happy':
      arcEye(-10)
      arcEye(10)
      arc(-33, 6.5, 0.15, 0.85)
      break
    case 'proud':
      arcEye(-10)
      arcEye(10)
      arc(-32, 7.5, 0, 1, true)
      break
    case 'surprised':
      eye(-10, 4.4, 6.2, 0)
      eye(10, 4.4, 6.2, 0)
      brow(-14, -52.5, -6, -54)
      brow(6, -54, 14, -52.5)
      ctx.beginPath()
      ctx.ellipse(0, -26, 3, 4.2, 0, 0, TAU)
      ctx.stroke()
      break
    case 'sad':
      eye(-10, 3.4, 4.4, 1)
      eye(10, 3.4, 4.4, 1)
      brow(-15, -47, -6, -51)
      brow(6, -51, 15, -47)
      arc(-20.5, 6.5, 1.2, 1.8)
      // a falling tear
      ctx.save()
      ctx.globalAlpha *= 0.8
      ctx.beginPath()
      ctx.arc(11.5 + lx, EYE_Y + 8 + ((t * 16) % 9), 1.6, 0, TAU)
      ctx.fill()
      ctx.restore()
      break
    case 'focus':
      eye(-10, 3.4, 2.6, 0)
      eye(10, 3.4, 2.6, 0)
      brow(-15, -49, -6, -45.5)
      brow(6, -45.5, 15, -49)
      brow(-3.5, -27, 3.5, -27)
      break
    case 'effort':
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(s * 14, EYE_Y - 3.5)
        ctx.lineTo(s * 7, EYE_Y)
        ctx.lineTo(s * 14, EYE_Y + 3.5)
        ctx.stroke()
      }
      ctx.lineWidth = 1.8
      ctx.strokeRect(-6.5, -31, 13, 5.5)
      brow(-2, -31, -2, -25.5)
      brow(2, -31, 2, -25.5)
      break
    case 'sleepy':
      for (const x of [-10, 10]) {
        ctx.beginPath()
        ctx.ellipse(x + lx, EYE_Y + 1, 3.8, 4, 0, 0, Math.PI)
        ctx.fill()
        brow(x - 4.2, EYE_Y + 1, x + 4.2, EYE_Y + 1)
      }
      ctx.beginPath()
      ctx.ellipse(0, -26, 2.6, 3, 0, 0, TAU)
      ctx.stroke()
      break
    case 'angry':
      eye(-10, 3.4, 3.6, 1)
      eye(10, 3.4, 3.6, 1)
      brow(-15, -50, -5, -46.5)
      brow(5, -46.5, 15, -50)
      arc(-21.5, 6, 1.25, 1.75)
      // puffs of steam rising off the head
      ctx.lineWidth = 1.6
      for (let i = 0; i < 2; i++) {
        const q = (t * 1.6 + i * 0.5) % 1
        ctx.save()
        ctx.globalAlpha *= 1 - q
        ctx.beginPath()
        ctx.arc(i ? 20 : -20, -64 - q * 14, 2 + q * 3, 0, TAU)
        ctx.stroke()
        ctx.restore()
      }
      break
    case 'love': {
      const s = 4.6 * (1 + 0.12 * Math.sin(t * 8))
      for (const x of [-10, 10]) {
        const hx = x + lx * 0.5
        const hy = EYE_Y + ly * 0.5
        ctx.beginPath()
        ctx.moveTo(hx, hy + s * 0.9)
        ctx.bezierCurveTo(hx - s * 1.3, hy - s * 0.2, hx - s * 0.6, hy - s * 1.2, hx, hy - s * 0.35)
        ctx.bezierCurveTo(hx + s * 0.6, hy - s * 1.2, hx + s * 1.3, hy - s * 0.2, hx, hy + s * 0.9)
        ctx.fill()
      }
      arc(-31, 5, 0.15, 0.85)
      break
    }
    case 'dizzy':
      ctx.lineWidth = 1.7
      // spinning spiral eyes
      ;[-10, 10].forEach((x, k) => {
        ctx.beginPath()
        for (let th = 0; th <= 3 * Math.PI; th += 0.25) {
          const r = (th / (3 * Math.PI)) * 4.6
          const an = th + t * 7 * (k ? -1 : 1)
          const px = x + Math.cos(an) * r
          const py = EYE_Y + Math.sin(an) * r
          if (th === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.stroke()
      })
      // wobbly mouth
      ctx.beginPath()
      ctx.moveTo(-7, -27)
      for (let i = 1; i <= 4; i++) ctx.lineTo(-7 + i * 3.5, -27 + (i % 2 ? -2 : 1.5))
      ctx.stroke()
      // stars circling the head
      for (let k = 0; k < 3; k++) {
        const an = t * 4 + (k * TAU) / 3
        const sx = Math.cos(an) * 17
        const sy = -73 + Math.sin(an) * 4
        brow(sx - 2.6, sy, sx + 2.6, sy)
        brow(sx, sy - 2.6, sx, sy + 2.6)
      }
      break
    case 'laugh':
      arcEye(-10)
      arcEye(10)
      ctx.beginPath()
      ctx.arc(0, -32 + Math.sin(t * 28) * 0.8, 7, 0, Math.PI)
      ctx.closePath()
      ctx.fill()
      break
    case 'wink':
      eye(-10, 3.4, 4.8, 0)
      arcEye(10)
      arc(-32, 6, 0.15, 0.85)
      break
    case 'asleep':
      for (const x of [-10, 10]) {
        ctx.beginPath()
        ctx.arc(x, EYE_Y - 1, 4, Math.PI * 0.15, Math.PI * 0.85)
        ctx.stroke()
      }
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.ellipse(0, -27, 2, 2.4 + Math.sin(t * 1.6) * 0.5, 0, 0, TAU)
      ctx.stroke()
      break
    default:
      eye(-10, 3.4, 4.8, 0)
      eye(10, 3.4, 4.8, 0)
      brow(-4, -27, 4, -27)
  }
}
