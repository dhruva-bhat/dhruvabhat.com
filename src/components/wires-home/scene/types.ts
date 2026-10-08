import type { Point } from '../math'

export type Emotion =
  | 'neutral'
  | 'happy'
  | 'proud'
  | 'surprised'
  | 'sad'
  | 'focus'
  | 'effort'
  | 'sleepy'
  | 'angry'
  | 'love'
  | 'dizzy'
  | 'laugh'
  | 'wink'
  | 'asleep'

/** Queued emotions override the state-derived face; each entry is [emotion, seconds]. */
export type EmotionQueue = [Emotion, number][]

export type ActivityKind = 'jacks' | 'type' | 'coffee' | 'lift' | 'juggle' | 'nap'

export type Activity = {
  kind: ActivityKind
  dur: number
  /** Juggling only: drop a ball partway through. */
  fumble: boolean
}

export type AgentState = 'idle' | 'toBlock' | 'pick' | 'toSlot' | 'place' | 'toSpot' | 'act' | 'cheer' | 'react'

export type Agent = {
  i: number
  x: number
  y: number
  vy: number
  dir: number
  st: AgentState
  /** Seconds in the current state. */
  t: number
  /** Duration of the current 'react' state. */
  rt: number
  emoQ: EmotionQueue
  /** Walk-cycle phase. */
  ph: number
  /** Counts down to the next blink; negative while blinking. */
  blink: number
  /** Hop progress in (0, 1); 0 when not hopping. */
  hop: number
  /** Reserved tower slot, or -1. */
  k: number
  /** Claimed block id, or -1. */
  b: number
  carry: boolean
  act: Activity | null
  /** Where the current activity happens. */
  spot: number
  /** Current walk target, used to detect a new move. */
  mvKey: number | null
  /** Crossing over the tower with a jump between cwa and cwb. */
  cross: boolean
  cwa: number
  cwb: number
  pokes: number
  pokeT: number
}

export type BlockState = 'pile' | 'carried' | 'placed' | 'fall' | 'settle' | 'ground' | 'held' | 'claw'

export type Block = {
  id: number
  x: number
  y: number
  rot: number
  vx: number
  vy: number
  vr: number
  st: BlockState
  /** Pile position. */
  col: number
  row: number
  /** Agent that has claimed this block, or -1. */
  owner: number
  /** Tower slot while placed, or -1. */
  slot: number
  /** Agent currently lifting it off the ground, or -1. */
  pickBy: number
  /** Smoothed hand velocity while dragged, used for throws. */
  hvx: number
  hvy: number
  /** Cooldown after bouncing off an agent. */
  bonk: number
}

export type ClawPhase = 'down' | 'grip' | 'up' | 'drop' | 'release' | 'leave'

export type Claw = {
  ph: ClawPhase
  t: number
  x: number
  y: number
  from: number
  to: number
  dur: number
  /** 1 = jaws open, 0 = closed. */
  open: number
  load: { id: number; dx: number; dy: number }[]
}

export type TowerState = 'build' | 'done' | 'claw' | 'static'

export type Drag = { b: Block; sx: number; sy: number; moved: boolean }

export type SceneState = {
  started: boolean
  alpha: number
  state: TowerState
  blocks: Block[]
  /** Block id in each tower slot, or -1. */
  occ: number[]
  /** Agent reserving each tower slot, or -1. */
  resv: number[]
  agents: Agent[]
  t: number
  wobble: number
  wobFrom: number
  doneT: number
  deskBy: number
  tableBy: number
  liftBy: number
  typed: number
  mugAbs: Point | null
  barUp: boolean
  claw: Claw | null
  mouse: Point & { inside: boolean }
  drag: Drag | null
}

/** Maps scene coordinates (origin on the floor above the name) to canvas pixels. */
export type SceneView = { cx: number; gy: number; s: number }
