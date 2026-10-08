import { clamp, easeInOut, lerp, pickRandom, randomBetween, type Point } from '../math'
import {
  BARBELL_X,
  CLAW_GRIP_Y,
  NB,
  PILE_CX,
  TOWER_CX,
  dirTo,
  pilePos,
  pileTopRow,
  rowsBelowFull,
  slotPos,
  standOf,
  towerFull,
} from './layout'
import { coffeeHand, hitAgent, hitBlock, liftPose } from './poses'
import type { ActivityKind, Agent, Claw, ClawPhase, Drag, EmotionQueue, SceneState } from './types'

const GRAVITY = 1500
const WALK_SPEED = 96
const ACTIVITY_SECONDS: Record<ActivityKind, number> = { jacks: 3.3, type: 4.6, coffee: 5.4, lift: 5.2, juggle: 4.4, nap: 6 }
const OPEN_SPOTS = [-200, -120, 110]
const AGENT_START_X = [-170, -115, 125]

export type Cursor = 'default' | 'grab' | 'grabbing' | 'pointer'

/** Type-checked partial update of a state object. */
const patch = <T extends object>(target: T, changes: Partial<T>) => Object.assign(target, changes)

export type Scene = ReturnType<typeof createScene>

/**
 * Three agents stack eight blocks into a tower, idle between jobs, and react to the visitor.
 * All coordinates are scene units: x = 0 is the tower, y = 0 is the floor, up is negative.
 */
export function createScene(reduceMotion: boolean) {
  const sc: SceneState = {
    started: false,
    alpha: 0,
    state: 'build',
    blocks: [],
    occ: [],
    resv: [],
    agents: [],
    t: 0,
    wobble: 0,
    wobFrom: 0,
    doneT: 0,
    deskBy: -1,
    tableBy: -1,
    liftBy: -1,
    typed: 0,
    mugAbs: null,
    barUp: false,
    claw: null,
    mouse: { x: 0, y: 0, inside: false },
    drag: null,
  }

  const feel = (a: Agent, queue: EmotionQueue) => {
    a.emoQ = queue.map(([emo, secs]) => [emo, secs])
  }
  const hop = (a: Agent) => {
    a.hop = 0.001
  }

  function reset() {
    sc.blocks = []
    sc.occ = []
    sc.resv = []
    for (let i = 0; i < NB; i++) {
      sc.occ.push(-1)
      sc.resv.push(-1)
      const p = pilePos(i)
      sc.blocks.push({ id: i, x: p.x, y: p.y, rot: 0, vx: 0, vy: 0, vr: 0, st: 'pile', col: i % 2, row: i >> 1, owner: -1, slot: -1, pickBy: -1, hvx: 0, hvy: 0, bonk: 0 })
    }
    patch(sc, { state: 'build', wobble: 0, doneT: 0, t: 0, drag: null, deskBy: -1, tableBy: -1, liftBy: -1, typed: 0, mugAbs: null, barUp: false, claw: null })
    sc.agents = [0, 1, 2].map((i) => ({
      i, x: AGENT_START_X[i], y: 0, vy: 0, dir: i === 2 ? -1 : 1, st: 'idle', t: 0, rt: 0, emoQ: [], ph: 0,
      blink: randomBetween(2, 5), hop: 0, k: -1, b: -1, carry: false, act: null, spot: 0,
      mvKey: null, cross: false, cwa: 0, cwb: 0, pokes: 0, pokeT: -9,
    }))
    if (reduceMotion) {
      sc.blocks.forEach((b, k) => {
        b.st = 'placed'
        b.slot = k
        sc.occ[k] = k
      })
      sc.state = 'static'
    }
  }

  /** Drops whatever the agent was doing; a carried block falls. */
  function release(a: Agent) {
    if (a.k >= 0) sc.resv[a.k] = -1
    if (a.b >= 0) {
      const b = sc.blocks[a.b]
      if (b.owner === a.i) {
        b.owner = -1
        b.pickBy = -1
      }
      if (b.st === 'carried') patch(b, { st: 'fall', x: a.x, y: a.y - 12, vx: a.dir * 30, vy: -60, vr: randomBetween(-2.5, 2.5), rot: 0 })
    }
    // an interrupted hop over the tower falls back down instead of hovering
    patch(a, { k: -1, b: -1, carry: false, st: 'idle', t: 0, cross: false, mvKey: null })
  }

  function endActivity(a: Agent) {
    if (sc.deskBy === a.i) sc.deskBy = -1
    if (sc.tableBy === a.i) {
      sc.tableBy = -1
      sc.mugAbs = null
    }
    if (sc.liftBy === a.i) {
      sc.liftBy = -1
      sc.barUp = false
    }
    a.act = null
  }

  /** Knocks slot `from` and everything above it off the tower. Returns false if nothing fell. */
  function topple(from: number, push: number) {
    const r0 = from >> 1
    const j0 = from & 1
    let any = false
    for (let k = 0; k < NB; k++) {
      const row = k >> 1
      const j = k & 1
      if (sc.occ[k] < 0 || !(row > r0 || (row === r0 && j >= j0))) continue
      const b = sc.blocks[sc.occ[k]]
      const p = slotPos(k)
      const dv = push || (Math.random() < 0.5 ? -1 : 1)
      patch(b, {
        x: p.x, y: p.y, rot: 0, st: 'fall', slot: -1,
        vx: dv * randomBetween(40, 180) + (j ? 25 : -25), vy: -randomBetween(60, 250), vr: randomBetween(-6, 6),
      })
      sc.occ[k] = -1
      any = true
    }
    if (!any) return false
    if (sc.state !== 'static') sc.state = 'build'
    for (const a of sc.agents) {
      release(a)
      endActivity(a)
      patch(a, { st: 'react', t: 0, rt: 2, hop: 0 })
      const after = Math.abs(a.x) < 60 ? 'dizzy' : Math.random() < 0.35 ? 'angry' : 'sad'
      feel(a, [['surprised', 0.8], [after, 1.3]])
    }
    return true
  }

  // ---- deciding what to do ----

  /** Lowest open tower row, nearest free slot; -1 if that row is fully reserved. */
  function claimSlot(a: Agent) {
    for (let r = 0; r < NB / 2; r++) {
      const open = [2 * r, 2 * r + 1].filter((k) => sc.occ[k] < 0)
      if (!open.length) continue
      const free = open.filter((k) => sc.resv[k] < 0)
      if (!free.length) return -1
      free.sort((p, q) => Math.abs(standOf(p) - a.x) - Math.abs(standOf(q) - a.x))
      return free[0]
    }
    return -1
  }

  /** Nearest unclaimed block, preferring ones on the same side as the target slot. */
  function pickBlock(a: Agent, k: number) {
    const side = k & 1 ? 1 : -1
    let best = -1
    let bestCost = Infinity
    for (const b of sc.blocks) {
      if (b.owner >= 0) continue
      if (b.st === 'pile' ? b.row !== pileTopRow(sc, b.col) : b.st !== 'ground') continue
      const cost = Math.abs(b.x - a.x) + (b.x * side < 0 ? 160 : 0)
      if (cost < bestCost) {
        bestCost = cost
        best = b.id
      }
    }
    return best
  }

  function startActivity(a: Agent) {
    const options: ActivityKind[] = ['jacks', 'juggle', 'nap']
    if (sc.deskBy < 0) options.push('type', 'type')
    if (sc.tableBy < 0) options.push('coffee', 'coffee')
    if (sc.liftBy < 0) options.push('lift', 'lift')
    const kind = pickRandom(options)
    a.act = { kind, dur: ACTIVITY_SECONDS[kind], fumble: Math.random() < 0.35 }
    if (kind === 'type') {
      sc.deskBy = a.i
      sc.typed = 0
      a.spot = 248
    } else if (kind === 'coffee') {
      sc.tableBy = a.i
      a.spot = 150
    } else if (kind === 'lift') {
      sc.liftBy = a.i
      a.spot = BARBELL_X
    } else a.spot = pickRandom(OPEN_SPOTS)
    a.st = 'toSpot'
    a.t = 0
  }

  function decide(a: Agent) {
    const k = claimSlot(a)
    if (k >= 0) {
      const id = pickBlock(a, k)
      if (id >= 0) {
        sc.resv[k] = a.i
        sc.blocks[id].owner = a.i
        patch(a, { k, b: id, st: 'toBlock', t: 0 })
        return
      }
    }
    startActivity(a)
  }

  /** Walks toward tx; crossing the tower turns into a jump over it. Returns true on arrival. */
  function walk(a: Agent, tx: number, speed: number, dt: number) {
    if (a.mvKey !== tx) {
      a.mvKey = tx
      a.cross = a.x < 0 !== tx < 0 && Math.abs(tx - a.x) > 20
      if (a.cross) {
        const right = tx > a.x
        a.cwa = right ? Math.max(a.x, -85) : Math.min(a.x, 85)
        a.cwb = right ? Math.min(tx, 85) : Math.max(tx, -85)
      }
    }
    const d = tx - a.x
    const step = (a.cross ? speed * 1.5 : speed) * dt
    if (Math.abs(d) <= step) {
      a.x = tx
      a.mvKey = null
      a.cross = false
      return true
    }
    a.dir = d > 0 ? 1 : -1
    a.x += a.dir * step
    a.ph += dt * speed * 0.09
    return false
  }

  function finishPlace(a: Agent) {
    const b = sc.blocks[a.b]
    const k = a.k
    const p = slotPos(k)
    sc.resv[k] = -1
    patch(a, { carry: false, k: -1, b: -1, st: 'idle', t: 0 })
    if (Math.random() < 0.12) {
      // the block slips off
      patch(b, { st: 'fall', owner: -1, x: p.x, y: p.y, rot: 0, vx: -dirTo(k) * randomBetween(30, 80), vy: -40, vr: -dirTo(k) * randomBetween(2, 6) })
      if (Math.random() < 0.5) feel(a, [['surprised', 0.6], ['sad', 1.2]])
      else {
        feel(a, [['surprised', 0.5], ['angry', 1.1]])
        hop(a)
      }
      return
    }
    patch(b, { st: 'placed', slot: k, owner: -1, rot: 0, pickBy: -1 })
    sc.occ[k] = b.id
    feel(a, [['happy', 1]])
    hop(a)
    if (k >> 1 >= 2 && sc.wobble <= 0 && Math.random() < 0.1) {
      sc.wobble = 0.9
      sc.wobFrom = ((k >> 1) - 1) * 2
      sc.agents.forEach((o) => feel(o, [['surprised', 0.9]]))
    }
  }

  function updateActivity(a: Agent, dt: number) {
    if (!a.act) return
    const u = a.t / a.act.dur
    if (a.act.kind === 'type') {
      sc.typed += dt * 3
      if (sc.typed > 5.99) sc.typed = 0
    }
    if (a.act.kind === 'coffee') {
      if (u >= 0.15 && u < 1) {
        const h = coffeeHand(a, u)
        sc.mugAbs = { x: a.x + h.x, y: a.y + h.y - 4 }
      } else sc.mugAbs = null
    }
    if (a.act.kind === 'lift') sc.barUp = liftPose(u, sc.t).held
    if (a.t >= a.act.dur) {
      endActivity(a)
      a.st = 'idle'
      a.t = 0
      feel(a, [['happy', 0.7]])
    }
  }

  function updateAgent(a: Agent, dt: number) {
    a.t += dt
    a.blink -= dt
    if (a.blink < -0.13) a.blink = randomBetween(2, 5.5)
    if (a.emoQ.length) {
      a.emoQ[0][1] -= dt
      if (a.emoQ[0][1] <= 0) a.emoQ.shift()
    }
    if (a.hop > 0) {
      a.hop += dt * 3
      if (a.hop >= 1) a.hop = 0
    }
    const b = a.b >= 0 ? sc.blocks[a.b] : undefined
    switch (a.st) {
      case 'idle':
        if (a.t > 0.35) decide(a)
        break
      case 'toBlock':
        if (!b || b.owner !== a.i || (b.st !== 'pile' && b.st !== 'ground')) release(a)
        else if (walk(a, b.x + (a.x < b.x ? -38 : 38), WALK_SPEED, dt)) {
          patch(a, { dir: a.x < b.x ? 1 : -1, st: 'pick', t: 0 })
          b.pickBy = a.i
        }
        break
      case 'pick':
        if (!b || b.owner !== a.i || b.pickBy !== a.i || (b.st !== 'pile' && b.st !== 'ground')) release(a)
        else if (a.t >= 0.5) {
          patch(b, { st: 'carried', pickBy: -1, rot: 0 })
          patch(a, { carry: true, st: 'toSlot', t: 0 })
        }
        break
      case 'toSlot':
        if (walk(a, standOf(a.k), WALK_SPEED, dt)) {
          if (!rowsBelowFull(sc, a.k)) {
            release(a)
            feel(a, [['surprised', 0.6]])
          } else patch(a, { dir: dirTo(a.k), st: 'place', t: 0 })
        }
        break
      case 'place':
        if (a.t >= 0.6) finishPlace(a)
        break
      case 'toSpot':
        if (walk(a, a.spot, 90, dt)) patch(a, { st: 'act', t: 0, dir: 1 })
        break
      case 'act':
        updateActivity(a, dt)
        break
      case 'cheer':
        if (a.t > 2.8) patch(a, { st: 'idle', t: 0 })
        break
      case 'react':
        if (a.t >= a.rt) patch(a, { st: 'idle', t: 0 })
        break
    }
    if (a.cross && a.st !== 'idle') {
      const span = a.cwb - a.cwa
      const u = span ? clamp((a.x - a.cwa) / span, 0, 1) : 0
      a.y += (-4 * u * (1 - u) * 135 - a.y) * Math.min(1, dt * 16)
      a.vy = 0
    } else if (a.y < 0 || a.vy) {
      a.vy += GRAVITY * dt
      a.y += a.vy * dt
      if (a.y >= 0) {
        if (a.vy > 300) hop(a)
        a.y = 0
        a.vy = 0
      }
    }
  }

  function updateBlock(b: SceneState['blocks'][number], dt: number) {
    if (b.st === 'fall') {
      b.vy += GRAVITY * dt
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.rot += b.vr * dt
      // keep falling blocks from landing inside a standing tower
      if (Math.abs(b.x) < 40 && b.y > -76 && b.y < 0 && sc.occ.some((o) => o >= 0)) {
        const s = b.x >= 0 ? 1 : -1
        b.x += s * dt * 260
        b.vx = s * Math.max(Math.abs(b.vx), 40)
      }
      b.x = clamp(b.x, -365, 365)
      if (b.bonk > 0) b.bonk -= dt
      else if (b.vx * b.vx + b.vy * b.vy > 240 * 240) {
        // a fast block bounces off an agent's head
        const a = sc.agents.find((o) => Math.abs(b.x - o.x) < 30 && b.y > o.y - 66 && b.y < o.y - 4)
        if (a) {
          b.vx = -b.vx * 0.5 + (b.x > a.x ? 60 : -60)
          b.vy = -Math.abs(b.vy) * 0.35 - 80
          b.bonk = 0.5
          feel(a, [['dizzy', 1.4]])
          hop(a)
        }
      }
      const rad = Math.abs(Math.cos(b.rot)) * 8 + Math.abs(Math.sin(b.rot)) * 13
      if (b.y >= -rad) {
        b.y = -rad
        if (Math.abs(b.vy) > 140) {
          b.vy = -b.vy * 0.32
          b.vx *= 0.7
          b.vr *= 0.6
        } else {
          b.vy = 0
          b.vx *= Math.pow(0.02, dt)
          b.vr *= Math.pow(0.01, dt)
          if (Math.abs(b.vx) < 8 && Math.abs(b.vr) < 0.6) patch(b, { st: 'settle', vx: 0, vr: 0 })
        }
      }
    } else if (b.st === 'settle') {
      const flat = Math.round(b.rot / Math.PI) * Math.PI
      b.rot += (flat - b.rot) * Math.min(1, dt * 12)
      b.y += (-8 - b.y) * Math.min(1, dt * 12)
      if (Math.abs(flat - b.rot) < 0.01) patch(b, { rot: 0, y: -8, st: 'ground' })
    }
  }

  // ---- the claw: takes a finished tower away, then drops a fresh pile ----

  function startClaw(top: number) {
    sc.state = 'claw'
    sc.claw = { ph: 'down', t: 0, x: TOWER_CX, y: top, from: top, to: CLAW_GRIP_Y, dur: 1.6, open: 1, load: [] }
    sc.agents.forEach((a) => feel(a, [['surprised', 0.9]]))
  }

  function clawPhase(c: Claw, ph: ClawPhase, to: number, dur: number) {
    patch(c, { ph, t: 0, from: c.y, to, dur })
  }

  /** `top` is the scene y the claw parks at, high enough to hide a hanging load off-screen. */
  function updateClaw(c: Claw, dt: number, top: number) {
    c.t += dt
    const p = clamp(c.t / c.dur, 0, 1)
    c.y = lerp(c.from, c.to, easeInOut(p))
    for (const l of c.load) {
      const b = sc.blocks[l.id]
      b.x = c.x + l.dx
      b.y = c.y + l.dy
    }
    // the tower got knocked over before the claw closed: leave empty-handed
    if ((c.ph === 'down' || c.ph === 'grip') && !towerFull(sc)) {
      if (sc.state === 'claw') sc.state = 'build'
      clawPhase(c, 'leave', top, 1)
      c.open = 1
      return
    }
    switch (c.ph) {
      case 'down':
        if (p >= 1) clawPhase(c, 'grip', c.y, 0.4)
        break
      case 'grip':
        c.open = 1 - p
        if (p < 1) break
        for (let k = 0; k < NB; k++) {
          const b = sc.blocks[sc.occ[k]]
          const q = slotPos(k)
          patch(b, { st: 'claw', slot: -1, owner: -1, pickBy: -1, rot: 0 })
          c.load.push({ id: b.id, dx: q.x - c.x, dy: q.y - CLAW_GRIP_Y })
          sc.occ[k] = -1
        }
        sc.wobble = 0
        sc.agents.forEach((a) => feel(a, [[Math.random() < 0.5 ? 'sad' : 'surprised', 1.2]]))
        clawPhase(c, 'up', top, 1.5)
        break
      case 'up':
        if (p < 1) break
        // off-screen: swap the tower for a fresh pile
        c.x = PILE_CX
        c.load.forEach((l, i) => {
          const b = sc.blocks[l.id]
          const pos = pilePos(i)
          b.col = i % 2
          b.row = i >> 1
          l.dx = pos.x - PILE_CX
          l.dy = pos.y - CLAW_GRIP_Y
        })
        clawPhase(c, 'drop', CLAW_GRIP_Y, 1.6)
        c.t = -0.6
        break
      case 'drop':
        if (p >= 1) clawPhase(c, 'release', c.y, 0.35)
        break
      case 'release':
        c.open = p
        if (p < 1) break
        for (const l of c.load) patch(sc.blocks[l.id], { st: 'pile', vx: 0, vy: 0, vr: 0 })
        c.load = []
        sc.state = 'build'
        sc.agents.forEach((a) => {
          feel(a, [['love', 1.1]])
          hop(a)
        })
        clawPhase(c, 'leave', top, 1.2)
        break
      case 'leave':
        if (p >= 1) sc.claw = null
        break
    }
  }

  function update(dt: number, clawTop: number) {
    sc.t += dt
    sc.blocks.forEach((b) => updateBlock(b, dt))
    const drag = sc.drag
    if (drag?.moved) {
      const b = drag.b
      const k = Math.min(1, dt * 22)
      const nx = b.x + (sc.mouse.x - b.x) * k
      const ny = Math.min(-8, b.y + (sc.mouse.y - b.y) * k)
      b.hvx = b.hvx * 0.7 + ((nx - b.x) / Math.max(dt, 0.001)) * 0.3
      b.hvy = b.hvy * 0.7 + ((ny - b.y) / Math.max(dt, 0.001)) * 0.3
      b.x = nx
      b.y = ny
      b.rot *= 0.9
    }
    if (sc.wobble > 0) {
      sc.wobble -= dt
      if (sc.wobble <= 0) topple(sc.wobFrom, 0)
    }
    sc.agents.forEach((a) => updateAgent(a, dt))
    if (sc.state === 'build' && towerFull(sc)) {
      sc.state = 'done'
      sc.doneT = 0
      for (const a of sc.agents) {
        endActivity(a)
        patch(a, { st: 'cheer', t: 0, cross: false, mvKey: null })
      }
    } else if (sc.state === 'done') {
      sc.doneT += dt
      if (!towerFull(sc)) sc.state = 'build'
      else if (sc.doneT > 4.5) startClaw(clawTop)
    }
    if (sc.claw) updateClaw(sc.claw, dt, clawTop)
  }

  // ---- visitor interaction ----

  /** Poking: a giggle or a wink, annoyance if busy, dizzy after three quick pokes. */
  function poke(a: Agent) {
    a.pokes = sc.t - a.pokeT < 1.5 ? a.pokes + 1 : 1
    a.pokeT = sc.t
    if (a.pokes >= 3) {
      a.pokes = 0
      release(a)
      endActivity(a)
      patch(a, { st: 'react', t: 0, rt: 1.6 })
      hop(a)
      feel(a, [['dizzy', 1.6]])
      return
    }
    if (a.st === 'pick' || a.st === 'toSlot' || a.st === 'place') {
      feel(a, [['angry', 0.8]])
      return
    }
    feel(a, [[Math.random() < 0.6 ? 'laugh' : 'wink', 0.9]])
    hop(a)
  }

  /** A drag past a few pixels picks the block up; pulling one out from under others topples them. */
  function grab(drag: Drag, p: Point) {
    const b = drag.b
    if (b.st === 'placed') {
      const k = b.slot
      const above = sc.occ.some((o, q) => o >= 0 && q >> 1 > k >> 1)
      if (above) topple(k, Math.sign(p.x - drag.sx) || 1)
      else sc.occ[k] = -1
    }
    if (b.owner >= 0) {
      const a = sc.agents[b.owner]
      release(a)
      feel(a, [['surprised', 0.6], ['angry', 0.9]])
    }
    patch(b, { st: 'held', slot: -1, owner: -1, pickBy: -1, vx: 0, vy: 0, vr: 0, hvx: 0, hvy: 0 })
    drag.moved = true
  }

  function pointerDown(p: Point) {
    const b = hitBlock(sc, p)
    if (b) {
      sc.drag = { b, sx: p.x, sy: p.y, moved: false }
      return true
    }
    const a = hitAgent(sc, p)
    if (a) poke(a)
    return false
  }

  function pointerMove(p: Point, interactive: boolean): Cursor {
    sc.mouse.x = p.x
    sc.mouse.y = p.y
    sc.mouse.inside = true
    if (!interactive) return 'default'
    if (sc.drag) {
      if (!sc.drag.moved && Math.hypot(p.x - sc.drag.sx, p.y - sc.drag.sy) > 6) grab(sc.drag, p)
      return 'grabbing'
    }
    return hitBlock(sc, p) ? 'grab' : hitAgent(sc, p) ? 'pointer' : 'default'
  }

  /** Release: a click (no drag) on the tower knocks it over; a drag throws the block. */
  function pointerUp() {
    const drag = sc.drag
    if (!drag) return
    sc.drag = null
    const b = drag.b
    if (!drag.moved) {
      if (b.st === 'placed') topple(b.slot, 0)
      return
    }
    patch(b, { st: 'fall', vx: clamp(b.hvx, -500, 500) * 0.6, vy: clamp(b.hvy, -500, 300) * 0.6, vr: randomBetween(-3, 3) })
  }

  function pointerLeave() {
    if (!sc.drag) sc.mouse.inside = false
  }

  /** Every agent shows the same reaction (e.g. to the light-mode joke). */
  function reactAll(queue: EmotionQueue) {
    sc.agents.forEach((a) => feel(a, queue))
  }

  reset()

  return { state: sc, reset, update, pointerDown, pointerMove, pointerUp, pointerLeave, reactAll }
}
