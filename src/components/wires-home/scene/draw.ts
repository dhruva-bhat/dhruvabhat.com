import { roundRect } from '../canvas'
import { TAU, clamp, lerp, smooth, type Point } from '../math'
import { drawFace } from './faces'
import { BARBELL_X, KEYS, MUG, slotPos } from './layout'
import { coffeeHand, hitAgent, juggleBalls, liftPose, lookTarget, napSit, stateEmotion } from './poses'
import type { Agent, SceneState, SceneView } from './types'

const BODY = ['#8f9a9c', '#7a8587', '#a3aeb0']
const BODY_DARK = ['#5f696b', '#525c5e', '#737d7f']
const FACE = '#f2f5f5'
const VISOR = '#101314'

type Ctx = CanvasRenderingContext2D

function drawBlock(ctx: Ctx, x: number, y: number, rot: number, lifted: boolean) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  if (lifted) {
    ctx.shadowColor = 'rgba(255,255,255,0.4)'
    ctx.shadowBlur = 10
  }
  roundRect(ctx, -13, -8, 26, 16, 2.5)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#aeb7b9'
  ctx.lineWidth = 1.3
  ctx.stroke()
  ctx.fillStyle = 'rgba(0,0,0,0.07)'
  ctx.fillRect(-11, 3, 22, 3)
  ctx.restore()
}

function drawMug(ctx: Ctx, x: number, y: number, t: number) {
  ctx.fillStyle = '#e8eded'
  roundRect(ctx, x - 5.5, y - 5.5, 11, 11, 2)
  ctx.fill()
  ctx.strokeStyle = '#e8eded'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x + 6.5, y, 3.4, -Math.PI / 2, Math.PI / 2)
  ctx.stroke()
  ctx.fillStyle = '#4a3a30'
  ctx.fillRect(x - 4, y - 5, 8, 2)
  // steam
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1.4
  ctx.lineCap = 'round'
  for (let i = 0; i < 2; i++) {
    const ox = x - 2 + i * 4
    ctx.beginPath()
    ctx.moveTo(ox, y - 8)
    ctx.quadraticCurveTo(ox + Math.sin(t * 3 + i * 2) * 3, y - 14, ox + Math.sin(t * 3 + i * 2 + 1) * 2, y - 20)
    ctx.stroke()
  }
}

function drawBarbell(ctx: Ctx, x: number, y: number) {
  ctx.strokeStyle = '#c4cccd'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - 36, y)
  ctx.lineTo(x + 36, y)
  ctx.stroke()
  ctx.fillStyle = '#3a4245'
  ctx.strokeStyle = '#7a8587'
  ctx.lineWidth = 1.2
  for (const s of [-1, 1]) {
    roundRect(ctx, x + s * 25 - 3, y - 9, 6, 18, 1.5)
    ctx.fill()
    ctx.stroke()
    roundRect(ctx, x + s * 31 - 2, y - 6, 4, 12, 1.2)
    ctx.fill()
    ctx.stroke()
  }
}

/** Desk with laptop, coffee table with mug, and the barbell. */
function drawProps(ctx: Ctx, sc: SceneState) {
  ctx.lineWidth = 1.5
  ctx.strokeStyle = '#4f595c'
  ctx.fillStyle = '#14181a'
  roundRect(ctx, 282, -22, 60, 22, 3)
  ctx.fill()
  ctx.stroke()
  roundRect(ctx, 186, -20, 28, 20, 3)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#1e2326'
  roundRect(ctx, 292, -26, 36, 4, 1.5)
  ctx.fill()
  ctx.stroke()
  roundRect(ctx, 296, -50, 28, 24, 3)
  ctx.fillStyle = '#0d1011'
  ctx.fill()
  ctx.strokeStyle = '#8a9496'
  ctx.stroke()
  // lines of "code" appearing on the laptop screen
  ctx.fillStyle = 'rgba(242,245,245,0.8)'
  const n = Math.floor(sc.typed)
  for (let i = 0; i < n && i < 5; i++) ctx.fillRect(300, -46 + i * 4, 6 + ((i * 7) % 13), 1.6)
  if (sc.deskBy >= 0 && Math.floor(sc.t * 2) % 2 === 0) ctx.fillRect(300 + 6 + ((Math.max(0, n - 1) * 7) % 13) + 2, -46 + Math.min(4, n) * 4, 3, 1.6)
  const mug = sc.mugAbs ?? MUG
  drawMug(ctx, mug.x, mug.y, sc.t)
  if (!sc.barUp) drawBarbell(ctx, BARBELL_X, -9)
}

function drawZzz(ctx: Ctx, bodyDy: number, t: number) {
  ctx.strokeStyle = FACE
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let k = 0; k < 3; k++) {
    const q = (t * 0.45 + k / 3) % 1
    const s = 2.5 + q * 3
    const x = 20 + q * 16
    const y = -62 + bodyDy - q * 34
    ctx.save()
    ctx.globalAlpha *= Math.min(1, (1 - q) * 1.6, q * 6)
    ctx.beginPath()
    ctx.moveTo(x - s, y - s)
    ctx.lineTo(x + s, y - s)
    ctx.lineTo(x - s, y + s)
    ctx.lineTo(x + s, y + s)
    ctx.stroke()
    ctx.restore()
  }
}

type Pose = {
  bodyDy: number
  hl: Point
  hr: Point
  legs: [number, number]
  lifts: [number, number]
  /** A block held in the hands. */
  block: Point | null
  barbellY: number | null
  balls: Point[] | null
  zzz: boolean
}

/** Body, hand and leg positions for the agent's current state, relative to its feet. */
function poseOf(a: Agent, sc: SceneState): Pose {
  const t = sc.t
  const air = a.y < -8
  const moving = a.st === 'toBlock' || a.st === 'toSlot' || a.st === 'toSpot'
  const s = Math.sin(a.ph)
  const pose: Pose = {
    bodyDy: moving && !air ? -Math.abs(s) * 2.2 : Math.sin(t * 2 + a.i * 2) * 0.8,
    hl: { x: -33, y: -18 + (moving ? s * 4 : 0) },
    hr: { x: 33, y: -18 - (moving ? s * 4 : 0) },
    legs: [-13, 13],
    lifts: [moving ? Math.max(0, s) * 4 : 0, moving ? Math.max(0, -s) * 4 : 0],
    block: null,
    barbellY: null,
    balls: null,
    zzz: false,
  }
  if (a.hop > 0) pose.bodyDy -= Math.sin(Math.PI * a.hop) * 9
  if (air || a.hop > 0) pose.lifts = [5, 5]
  const rel = (p: Point) => ({ x: p.x - a.x, y: p.y - a.y })

  if (a.st === 'pick' && a.b >= 0) {
    const p = clamp(a.t / 0.5, 0, 1)
    const from = rel(sc.blocks[a.b])
    pose.block = { x: lerp(from.x, 0, smooth(p)), y: lerp(from.y, -12, smooth(p)) }
    pose.bodyDy += Math.sin(p * Math.PI) * 5
  } else if (a.st === 'toSlot' || (a.st === 'idle' && a.carry)) {
    pose.block = { x: 0, y: -12 + (moving ? -Math.abs(s) * 1.5 : 0) }
  } else if (a.st === 'place' && a.k >= 0) {
    const p = clamp(a.t / 0.6, 0, 1)
    const to = rel(slotPos(a.k))
    pose.block = { x: lerp(0, to.x, smooth(p)), y: lerp(-12, to.y, smooth(p)) - Math.sin(p * Math.PI) * 10 }
  } else if (a.st === 'cheer') {
    pose.bodyDy -= Math.abs(Math.sin(a.t * 7)) * 10
    if (pose.bodyDy < -3) pose.lifts = [5, 5]
    pose.hl = { x: -30, y: -76 + Math.sin(t * 14) * 3 }
    pose.hr = { x: 30, y: -76 - Math.sin(t * 14) * 3 }
  } else if (a.st === 'act' && a.act) {
    const u = a.t / a.act.dur
    switch (a.act.kind) {
      case 'jacks': {
        const c = (a.t / 0.6) % 1
        const o = 0.5 - 0.5 * Math.cos(c * TAU)
        pose.hl = { x: -34 + 6 * o, y: -14 - 62 * o }
        pose.hr = { x: 34 - 6 * o, y: -14 - 62 * o }
        pose.legs = [-(13 + 11 * o), 13 + 11 * o]
        pose.bodyDy -= Math.abs(Math.sin(c * Math.PI)) * 5
        if (pose.bodyDy < -3) pose.lifts = [3, 3]
        break
      }
      case 'type': {
        const k = rel(KEYS)
        pose.hl = { x: k.x - 7, y: k.y + Math.max(0, Math.sin(t * 24)) * 2.5 }
        pose.hr = { x: k.x + 7, y: k.y + Math.max(0, Math.sin(t * 24 + Math.PI)) * 2.5 }
        break
      }
      case 'lift': {
        const lp = liftPose(u, t)
        pose.hl = { x: -16, y: lp.hy }
        pose.hr = { x: 16, y: lp.hy }
        pose.bodyDy += lp.squat
        if (lp.held) pose.barbellY = lp.hy
        break
      }
      case 'juggle':
        pose.hl = { x: -26, y: -30 + Math.max(0, Math.sin(t * 9)) * 5 }
        pose.hr = { x: 26, y: -30 + Math.max(0, Math.sin(t * 9 + Math.PI)) * 5 }
        pose.balls = juggleBalls(a, u, t)
        break
      case 'nap': {
        const sit = napSit(u)
        pose.bodyDy += sit * 8 + Math.sin(t * 1.6) * 1.2 * sit
        pose.legs = [-(13 + 5 * sit), 13 + 5 * sit]
        pose.hl = { x: -33 + 3 * sit, y: -18 + 10 * sit }
        pose.hr = { x: 33 - 3 * sit, y: -18 + 10 * sit }
        pose.zzz = sit > 0.5
        break
      }
      case 'coffee': {
        const h = coffeeHand(a, u)
        if (a.dir > 0) pose.hr = { x: h.x, y: h.y }
        else pose.hl = { x: h.x, y: h.y }
        break
      }
    }
  }
  if (pose.block) {
    pose.hl = { x: pose.block.x - 20, y: pose.block.y }
    pose.hr = { x: pose.block.x + 20, y: pose.block.y }
  }
  return pose
}

function drawAgent(ctx: Ctx, a: Agent, sc: SceneState) {
  const col = BODY[a.i]
  const dark = BODY_DARK[a.i]
  const t = sc.t
  const pose = poseOf(a, sc)

  let emo = a.emoQ.length ? a.emoQ[0][0] : stateEmotion(a, t)
  // hovering over an idle-faced agent gets heart eyes
  if (emo === 'neutral' && !sc.drag && sc.mouse.inside && hitAgent(sc, sc.mouse) === a) emo = 'love'
  if (emo === 'angry') pose.bodyDy += Math.sin(t * 40) * 0.7
  if (emo === 'laugh') pose.bodyDy += Math.sin(t * 28) * 1.2
  const dy = pose.bodyDy

  ctx.save()
  ctx.translate(a.x, a.y)

  // shadow stays on the floor and shrinks while airborne
  ctx.save()
  ctx.translate(0, -a.y)
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.beginPath()
  ctx.ellipse(0, 0, 30 * (1 - Math.min(0.5, -a.y / 260)), 4, 0, 0, TAU)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = dark
  for (let i = 0; i < 2; i++) {
    roundRect(ctx, pose.legs[i] - 6, -11 - pose.lifts[i], 12, 11, 3)
    ctx.fill()
  }
  roundRect(ctx, -28, -58 + dy, 56, 48, 12)
  ctx.fillStyle = col
  ctx.fill()
  ctx.strokeStyle = dark
  ctx.lineWidth = 1.5
  ctx.stroke()

  // each agent has its own head detail: ears, an antenna, or a crest
  ctx.fillStyle = col
  if (a.i === 0) {
    roundRect(ctx, -21, -66 + dy, 10, 9, 2)
    ctx.fill()
    roundRect(ctx, 11, -66 + dy, 10, 9, 2)
    ctx.fill()
  } else if (a.i === 1) {
    ctx.strokeStyle = dark
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, -58 + dy)
    ctx.lineTo(0, -69 + dy)
    ctx.stroke()
    ctx.fillStyle = '#e8eded'
    ctx.beginPath()
    ctx.arc(0, -71 + dy, 3.2, 0, TAU)
    ctx.fill()
  } else {
    roundRect(ctx, -8, -64 + dy, 16, 7, 2)
    ctx.fill()
  }

  roundRect(ctx, -22, -53 + dy, 44, 32, 8)
  ctx.fillStyle = VISOR
  ctx.fill()
  const look = lookTarget(sc, a)
  const lx = clamp((look.x - a.x) / 50, -1, 1) * 2.4 + a.dir * 0.8
  const ly = clamp((look.y - (a.y - 38)) / 50, -1, 1) * 1.8
  ctx.save()
  ctx.translate(0, dy)
  drawFace(ctx, emo, lx, ly, a.blink < 0, t)
  ctx.restore()

  if (pose.block) drawBlock(ctx, pose.block.x, pose.block.y, 0, false)
  if (pose.barbellY !== null) drawBarbell(ctx, 0, pose.barbellY)
  if (pose.zzz) drawZzz(ctx, dy, t)

  const arm = (sx: number, sy: number, h: Point) => {
    ctx.strokeStyle = dark
    ctx.lineWidth = 7
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(h.x, h.y)
    ctx.stroke()
    roundRect(ctx, h.x - 6.5, h.y - 6.5, 13, 13, 3)
    ctx.fillStyle = col
    ctx.fill()
    ctx.strokeStyle = dark
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
  arm(-27, -36 + dy, pose.hl)
  arm(27, -36 + dy, pose.hr)

  if (pose.balls) {
    ctx.fillStyle = FACE
    for (const b of pose.balls) {
      ctx.beginPath()
      ctx.arc(b.x, b.y, 3.6, 0, TAU)
      ctx.fill()
    }
  }
  ctx.restore()
}

/** `top` is the scene y of the top edge of the canvas. */
function drawClaw(ctx: Ctx, sc: SceneState, top: number) {
  const c = sc.claw
  if (!c) return
  const w = lerp(30, 46, c.open)
  ctx.strokeStyle = '#4f595c'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(c.x, top - 10)
  ctx.lineTo(c.x, c.y - 34)
  ctx.stroke()
  ctx.lineJoin = 'round'
  ctx.lineWidth = 4.5
  ctx.strokeStyle = '#7a8587'
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(c.x + s * 9, c.y - 26)
    ctx.lineTo(c.x + s * w, c.y - 16)
    ctx.lineTo(c.x + s * w, c.y)
    ctx.lineTo(c.x + s * (w - 8), c.y + 6)
    ctx.stroke()
  }
  roundRect(ctx, c.x - 13, c.y - 37, 26, 13, 3)
  ctx.fillStyle = '#8f9a9c'
  ctx.fill()
  ctx.strokeStyle = '#525c5e'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = '#e8eded'
  ctx.beginPath()
  ctx.arc(c.x, c.y - 30.5, 2.2, 0, TAU)
  ctx.fill()
}

export function drawScene(ctx: Ctx, sc: SceneState, view: SceneView) {
  if (!sc.started || sc.alpha <= 0 || !view.s) return
  ctx.save()
  ctx.globalAlpha = sc.alpha
  ctx.translate(view.cx, view.gy)
  ctx.scale(view.s, view.s)

  // the floor, fading out at both ends
  const floor = ctx.createLinearGradient(-390, 0, 390, 0)
  floor.addColorStop(0, 'rgba(90,100,104,0)')
  floor.addColorStop(0.12, 'rgba(90,100,104,1)')
  floor.addColorStop(0.88, 'rgba(90,100,104,1)')
  floor.addColorStop(1, 'rgba(90,100,104,0)')
  ctx.fillStyle = floor
  ctx.fillRect(-390, 0, 780, 1.6)

  drawProps(ctx, sc)
  const wobbling = sc.wobble > 0
  for (const b of sc.blocks) {
    if (b.st === 'carried' || b.pickBy >= 0 || b.st === 'held') continue
    let { x, y } = b
    if (b.st === 'placed') {
      ;({ x, y } = slotPos(b.slot))
      if (wobbling) x += Math.sin(sc.t * 55 + b.slot) * ((b.slot >> 1) + 1) * 0.55
    }
    drawBlock(ctx, x, y, b.rot, false)
  }
  sc.agents.forEach((a) => drawAgent(ctx, a, sc))
  for (const b of sc.blocks) if (b.st === 'held') drawBlock(ctx, b.x, b.y, b.rot, true)
  drawClaw(ctx, sc, -view.gy / view.s)
  ctx.restore()
}
