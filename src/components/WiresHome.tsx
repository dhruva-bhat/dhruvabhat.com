/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';
import { useEffect, useRef } from 'react';
import './wires.css';

function initWires(root) {
    const $ = (id) => document.getElementById(id);
    const cv = $('wCv'), ctx = cv.getContext('2d'), stTxt = $('wStatusTxt'), st = $('wStatus'), nameTxt = $('wNameTxt'), ghost = $('wGhost'), ov = $('wOv');
    const labels = [$('wLb0'), $('wLb1'), $('wLb2')];
    const secs = [$('wSecWork'), $('wSecAbout'), $('wSecContact')];
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const TAU = Math.PI * 2, TEAL = '46,230,208', GRAY = '#586064';
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const easeIO = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    let W = 0, H = 0, dpr = 1, wires = [], labGeo = [], grow = [0, 0, 0], hover = [0, 0, 0], flash = [0, 0, 0], pulses = [];
    let phase = 'intro', timers = [], wiresT0 = -1, hoverT = -1, nextIdle = 3, last = 0, dirty = true, clipRaf = 0, openIdx = -1, raf = 0;



    const ac = new AbortController(), sig = { signal: ac.signal };
    const at = (ms, fn) => { timers.push(setTimeout(fn, ms)); };
    const clearAll = () => { timers.forEach(clearTimeout); timers = []; if (clipRaf) cancelAnimationFrame(clipRaf); clipRaf = 0; };
    // ---- block-stacking agents ----
    const NB = 8;
    const BODY = ['#8f9a9c', '#7a8587', '#a3aeb0'], DARKC = ['#5f696b', '#525c5e', '#737d7f'];
    const FC = '#f2f5f5';
    let sceneCx = 0, sceneGy = 0, sceneS = 1;
    const sc = { started: false, alpha: 0, state: 'build', blocks: [], occ: [], resv: [], agents: [], t: 0, wobble: 0, wobFrom: 0, doneT: 0, deskBy: -1, tableBy: -1, typed: 0, mugAbs: null, mouse: { x: 0, y: 0, inside: false }, drag: null };
    const MUG = { x: 200, y: -25 }, KEYS = { x: 310, y: -24 };
    const slotPos = (k) => { const r = k >> 1, j = k & 1; return { x: (j - 0.5) * 27 + (r % 2 ? 6.5 : -6.5), y: -(r * 17 + 8.5) }; };
    const standOf = (k) => { const p = slotPos(k); return (k & 1) ? p.x + 50 : p.x - 50; };
    const dirTo = (k) => (k & 1) ? -1 : 1;
    const lerp = (p, q, t) => p + (q - p) * t;
    const lerpPt = (p, q, t) => ({ x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) });
    const rrect = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath(); };
    const setQ = (a, list) => { a.emoQ = list.map((e) => [e[0], e[1]]); };
    const pileTopRow = (col) => { let m = -1; sc.blocks.forEach((b) => { if (b.st === 'pile' && b.col === col && b.row > m) m = b.row; }); return m; };
    const rowsBelowFull = (k) => { for (let q = 0; q < (k >> 1) * 2; q++) if (sc.occ[q] < 0) return false; return true; };

    function resetScene() {
      sc.blocks = []; sc.occ = []; sc.resv = [];
      for (let i = 0; i < NB; i++) {
        sc.occ.push(-1); sc.resv.push(-1);
        sc.blocks.push({ id: i, x: -330 + (i % 2) * 28, y: -((i >> 1) * 17 + 8.5), rot: 0, vx: 0, vy: 0, vr: 0, st: 'pile', col: i % 2, row: i >> 1, owner: -1, slot: -1, pickBy: -1, hvx: 0, hvy: 0 });
      }
      sc.state = 'build'; sc.wobble = 0; sc.doneT = 0; sc.t = 0; sc.drag = null; sc.deskBy = -1; sc.tableBy = -1; sc.typed = 0; sc.mugAbs = null;
      const xs = [-170, -115, 125];
      sc.agents = [0, 1, 2].map((i) => ({ i: i, x: xs[i], y: 0, dir: i === 2 ? -1 : 1, st: 'idle', t: 0, rt: 0, emoQ: [], ph: 0, blink: 2 + Math.random() * 3, hop: 0, k: -1, b: -1, carry: false, act: null, spot: 0, x0: 0, mvKey: null, cross: false, cwa: 0, cwb: 0 }));
      if (reduce) {
        for (let k = 0; k < NB; k++) { const b = sc.blocks[k]; b.st = 'placed'; b.slot = k; sc.occ[k] = k; }
        sc.state = 'static';
      }
    }
    function release(a) {
      if (a.k >= 0) sc.resv[a.k] = -1;
      if (a.b >= 0) {
        const b = sc.blocks[a.b];
        if (b.owner === a.i) { b.owner = -1; b.pickBy = -1; }
        if (b.st === 'carried') { b.st = 'fall'; b.x = a.x + (a.carry ? 0 : 0); b.y = a.y - 12; b.vx = a.dir * 30; b.vy = -60; b.vr = (Math.random() - 0.5) * 5; b.rot = 0; }
      }
      a.k = -1; a.b = -1; a.carry = false; a.st = 'idle'; a.t = 0;
    }
    function endAct(a) {
      if (sc.deskBy === a.i) sc.deskBy = -1;
      if (sc.tableBy === a.i) { sc.tableBy = -1; sc.mugAbs = null; }
      a.act = null;
    }
    function topple(from, push) {
      const r0 = from >> 1, j0 = from & 1; let any = false;
      for (let k = 0; k < NB; k++) {
        const row = k >> 1, j = k & 1;
        if (sc.occ[k] >= 0 && (row > r0 || (row === r0 && j >= j0))) {
          const b = sc.blocks[sc.occ[k]], p = slotPos(k), dv = push || (Math.random() < 0.5 ? -1 : 1);
          b.x = p.x; b.y = p.y; b.rot = 0; b.st = 'fall'; b.slot = -1;
          b.vx = dv * (40 + Math.random() * 140) + (j ? 25 : -25); b.vy = -(60 + Math.random() * 190); b.vr = (Math.random() - 0.5) * 12;
          sc.occ[k] = -1; any = true;
        }
      }
      if (!any) return false;
      if (sc.state !== 'static') sc.state = 'build';
      sc.agents.forEach((a) => { release(a); endAct(a); a.st = 'react'; a.t = 0; a.rt = 2.0; a.hop = 0; setQ(a, [['surprised', 0.8], ['sad', 1.3]]); });
      return true;
    }
    function claimSlot(a) {
      for (let r = 0; r < NB / 2; r++) {
        const open = [2 * r, 2 * r + 1].filter((k) => sc.occ[k] < 0);
        if (!open.length) continue;
        const free = open.filter((k) => sc.resv[k] < 0);
        if (!free.length) return -1;
        free.sort((p, q) => Math.abs(standOf(p) - a.x) - Math.abs(standOf(q) - a.x));
        return free[0];
      }
      return -1;
    }
    function pickBlock(a, k) {
      const side = (k & 1) ? 1 : -1; let best = -1, bc = 1e9;
      sc.blocks.forEach((b) => {
        if (b.owner >= 0) return;
        if (b.st === 'pile') { if (b.row !== pileTopRow(b.col)) return; } else if (b.st !== 'ground') return;
        const c = Math.abs(b.x - a.x) + (b.x * side < 0 ? 160 : 0);
        if (c < bc) { bc = c; best = b.id; }
      });
      return best;
    }
    function startAct(a) {
      const opts = ['jacks'];
      if (sc.deskBy < 0) opts.push('type', 'type');
      if (sc.tableBy < 0) opts.push('coffee', 'coffee');
      const kind = opts[Math.floor(Math.random() * opts.length)];
      a.act = { kind: kind, dur: kind === 'jacks' ? 3.3 : kind === 'type' ? 4.6 : 5.4 };
      if (kind === 'type') { sc.deskBy = a.i; a.spot = 248; sc.typed = 0; }
      else if (kind === 'coffee') { sc.tableBy = a.i; a.spot = 150; }
      else a.spot = [-200, -120, 110][Math.floor(Math.random() * 3)];
      a.st = 'toSpot'; a.t = 0;
    }
    function decide(a) {
      const k = claimSlot(a);
      if (k >= 0) {
        const bid = pickBlock(a, k);
        if (bid >= 0) { sc.resv[k] = a.i; sc.blocks[bid].owner = a.i; a.k = k; a.b = bid; a.st = 'toBlock'; a.t = 0; return; }
      }
      startAct(a);
    }
    function move(a, tx, sp, dt) {
      if (a.mvKey !== tx) {
        a.mvKey = tx; a.x0 = a.x;
        a.cross = (a.x < 0) !== (tx < 0) && Math.abs(tx - a.x) > 20;
        if (a.cross) { const m = tx > a.x ? 1 : -1; a.cwa = m > 0 ? Math.max(a.x, -85) : Math.min(a.x, 85); a.cwb = m > 0 ? Math.min(tx, 85) : Math.max(tx, -85); }
      }
      const d = tx - a.x, step = (a.cross ? sp * 1.5 : sp) * dt;
      if (Math.abs(d) <= step) { a.x = tx; a.mvKey = null; a.cross = false; return true; }
      a.dir = d > 0 ? 1 : -1; a.x += a.dir * step; a.ph += dt * sp * 0.09;
      return false;
    }
    function coffeeHand(a, u) {
      const d = a.dir, def = { x: 30 * d, y: -18 }, rest = { x: MUG.x - a.x, y: MUG.y - a.y }, hold = { x: d * 30, y: -24 }, sipP = { x: d * 20, y: -35 };
      let h, sip = 0;
      if (u < 0.15) h = lerpPt(def, rest, u / 0.15);
      else if (u < 0.3) h = lerpPt(rest, hold, (u - 0.15) / 0.15);
      else if (u < 0.85) { const w = (u - 0.3) / 0.55 * 2; sip = Math.sin(Math.PI * (w % 1)); h = lerpPt(hold, sipP, sip); }
      else h = lerpPt(hold, rest, (u - 0.85) / 0.15);
      return { x: h.x, y: h.y, sip: sip };
    }
    function finishPlace(a) {
      const b = sc.blocks[a.b], k = a.k, p = slotPos(k);
      sc.resv[k] = -1; a.carry = false; a.k = -1; a.b = -1; a.st = 'idle'; a.t = 0;
      if (Math.random() < 0.12) {
        b.st = 'fall'; b.owner = -1; b.x = p.x; b.y = p.y; b.rot = 0; b.vx = -dirTo(k) * (30 + Math.random() * 50); b.vy = -40; b.vr = -dirTo(k) * (2 + Math.random() * 4);
        setQ(a, [['surprised', 0.6], ['sad', 1.2]]);
        return;
      }
      b.st = 'placed'; b.slot = k; b.owner = -1; b.rot = 0; b.pickBy = -1; sc.occ[k] = b.id;
      setQ(a, [['happy', 1.0]]); a.hop = 0.001;
      if ((k >> 1) >= 2 && sc.wobble <= 0 && Math.random() < 0.1) {
        sc.wobble = 0.9; sc.wobFrom = ((k >> 1) - 1) * 2;
        sc.agents.forEach((o) => setQ(o, [['surprised', 0.9]]));
      }
    }
    function updateAct(a, dt) {
      const kd = a.act.kind;
      if (kd === 'type') { sc.typed += dt * 3; if (sc.typed > 5.99) sc.typed = 0; }
      if (kd === 'coffee') {
        const u = a.t / a.act.dur;
        if (u >= 0.15 && u < 1) { const h = coffeeHand(a, u); sc.mugAbs = { x: a.x + h.x, y: a.y + h.y - 4 }; } else sc.mugAbs = null;
      }
      if (a.t >= a.act.dur) { endAct(a); a.st = 'idle'; a.t = 0; setQ(a, [['happy', 0.7]]); }
    }
    function updateAgent(a, dt) {
      a.t += dt;
      a.blink -= dt; if (a.blink < -0.13) a.blink = 2 + Math.random() * 3.5;
      if (a.emoQ.length) { a.emoQ[0][1] -= dt; if (a.emoQ[0][1] <= 0) a.emoQ.shift(); }
      if (a.hop > 0) { a.hop += dt * 3; if (a.hop >= 1) a.hop = 0; }
      const B = sc.blocks;
      switch (a.st) {
        case 'idle': if (a.t > 0.35) decide(a); break;
        case 'toBlock': {
          const b = B[a.b];
          if (!b || b.owner !== a.i || (b.st !== 'pile' && b.st !== 'ground')) { release(a); break; }
          if (move(a, b.x + (a.x < b.x ? -38 : 38), 96, dt)) { a.dir = a.x < b.x ? 1 : -1; a.st = 'pick'; a.t = 0; b.pickBy = a.i; }
          break;
        }
        case 'pick': {
          const b = B[a.b];
          if (!b || b.owner !== a.i || b.pickBy !== a.i || (b.st !== 'pile' && b.st !== 'ground')) { release(a); break; }
          if (a.t >= 0.5) { b.st = 'carried'; b.pickBy = -1; b.rot = 0; a.carry = true; a.st = 'toSlot'; a.t = 0; }
          break;
        }
        case 'toSlot':
          if (move(a, standOf(a.k), 96, dt)) {
            if (!rowsBelowFull(a.k)) { release(a); setQ(a, [['surprised', 0.6]]); break; }
            a.dir = dirTo(a.k); a.st = 'place'; a.t = 0;
          }
          break;
        case 'place': if (a.t >= 0.6) finishPlace(a); break;
        case 'toSpot': if (move(a, a.spot, 90, dt)) { a.st = 'act'; a.t = 0; a.dir = 1; } break;
        case 'act': updateAct(a, dt); break;
        case 'cheer': if (a.t > 2.8) { a.st = 'idle'; a.t = 0; } break;
        case 'react': if (a.t >= a.rt) { a.st = 'idle'; a.t = 0; } break;
      }
      let ty = 0;
      if (a.cross && a.st !== 'idle') { const span = a.cwb - a.cwa; const u = span ? clamp((a.x - a.cwa) / span, 0, 1) : 0; ty = -4 * u * (1 - u) * 135; }
      a.y += (ty - a.y) * Math.min(1, dt * 16);
    }
    function physics(b, dt) {
      if (b.st === 'fall') {
        b.vy += 1500 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
        if (Math.abs(b.x) < 40 && b.y > -76 && b.y < 0 && sc.occ.some((o) => o >= 0)) { const s = b.x >= 0 ? 1 : -1; b.x += s * dt * 260; b.vx = s * Math.max(Math.abs(b.vx), 40); }
        b.x = clamp(b.x, -365, 365);
        const rad = Math.abs(Math.cos(b.rot)) * 8 + Math.abs(Math.sin(b.rot)) * 13;
        if (b.y >= -rad) {
          b.y = -rad;
          if (Math.abs(b.vy) > 140) { b.vy = -b.vy * 0.32; b.vx *= 0.7; b.vr *= 0.6; }
          else { b.vy = 0; b.vx *= Math.pow(0.02, dt); b.vr *= Math.pow(0.01, dt); if (Math.abs(b.vx) < 8 && Math.abs(b.vr) < 0.6) { b.st = 'settle'; b.vx = 0; b.vr = 0; } }
        }
      } else if (b.st === 'settle') {
        const tg = Math.round(b.rot / Math.PI) * Math.PI;
        b.rot += (tg - b.rot) * Math.min(1, dt * 12); b.y += (-8 - b.y) * Math.min(1, dt * 12);
        if (Math.abs(tg - b.rot) < 0.01) { b.rot = 0; b.y = -8; b.st = 'ground'; }
      }
    }
    function updateScene(dt) {
      sc.t += dt;
      sc.blocks.forEach((b) => physics(b, dt));
      if (sc.drag && sc.drag.moved) {
        const b = sc.drag.b, nx = b.x + (sc.mouse.x - b.x) * Math.min(1, dt * 22), ny = Math.min(-8, b.y + (sc.mouse.y - b.y) * Math.min(1, dt * 22));
        b.hvx = b.hvx * 0.7 + ((nx - b.x) / Math.max(dt, 0.001)) * 0.3; b.hvy = b.hvy * 0.7 + ((ny - b.y) / Math.max(dt, 0.001)) * 0.3;
        b.x = nx; b.y = ny; b.rot *= 0.9;
      }
      if (sc.wobble > 0) { sc.wobble -= dt; if (sc.wobble <= 0) topple(sc.wobFrom, 0); }
      sc.agents.forEach((a) => updateAgent(a, dt));
      if (sc.state === 'build' && sc.occ.every((o) => o >= 0)) {
        sc.state = 'done'; sc.doneT = 0;
        sc.agents.forEach((a) => { endAct(a); a.st = 'cheer'; a.t = 0; a.cross = false; a.mvKey = null; });
      } else if (sc.state === 'done') {
        sc.doneT += dt;
        if (sc.doneT > 10) { sc.state = 'pending'; sc.wobble = 1.0; sc.wobFrom = 2 * Math.floor(Math.random() * 2); sc.agents.forEach((o) => setQ(o, [['surprised', 1.0]])); }
      }
    }
    // ---- drawing ----
    function drawBlock(x, y, rot, lift) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
      if (lift) { ctx.shadowColor = 'rgba(255,255,255,0.4)'; ctx.shadowBlur = 10; }
      rrect(-13, -8, 26, 16, 2.5); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = '#aeb7b9'; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(-11, 3, 22, 3);
      ctx.restore();
    }
    function drawMug(x, y) {
      ctx.fillStyle = '#e8eded'; rrect(x - 5.5, y - 5.5, 11, 11, 2); ctx.fill();
      ctx.strokeStyle = '#e8eded'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 6.5, y, 3.4, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.fillStyle = '#4a3a30'; ctx.fillRect(x - 4, y - 5, 8, 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      for (let i = 0; i < 2; i++) { const ox = x - 2 + i * 4; ctx.beginPath(); ctx.moveTo(ox, y - 8); ctx.quadraticCurveTo(ox + Math.sin(sc.t * 3 + i * 2) * 3, y - 14, ox + Math.sin(sc.t * 3 + i * 2 + 1) * 2, y - 20); ctx.stroke(); }
    }
    function drawProps() {
      ctx.lineWidth = 1.5; ctx.strokeStyle = '#4f595c'; ctx.fillStyle = '#14181a';
      rrect(282, -22, 60, 22, 3); ctx.fill(); ctx.stroke();
      rrect(186, -20, 28, 20, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1e2326'; rrect(292, -26, 36, 4, 1.5); ctx.fill(); ctx.stroke();
      rrect(296, -50, 28, 24, 3); ctx.fillStyle = '#0d1011'; ctx.fill(); ctx.strokeStyle = '#8a9496'; ctx.stroke();
      ctx.fillStyle = 'rgba(242,245,245,0.8)';
      const n = Math.floor(sc.typed);
      for (let i = 0; i < n && i < 5; i++) ctx.fillRect(300, -46 + i * 4, 6 + ((i * 7) % 13), 1.6);
      if (sc.deskBy >= 0 && Math.floor(sc.t * 2) % 2 === 0) ctx.fillRect(300 + 6 + ((Math.max(0, n - 1) * 7) % 13) + 2, -46 + Math.min(4, n) * 4, 3, 1.6);
      const m = sc.mugAbs || MUG; drawMug(m.x, m.y);
    }
    function drawFace(a, emo, lx, ly) {
      ctx.strokeStyle = FC; ctx.fillStyle = FC; ctx.lineCap = 'round'; ctx.lineWidth = 2.3;
      const bl = a.blink < 0 ? 0.12 : 1, ey = -41;
      const eyeE = (x, rx, ry, dy) => { ctx.beginPath(); ctx.ellipse(x + lx, ey + dy + ly, rx, Math.max(0.6, ry * bl), 0, 0, TAU); ctx.fill(); };
      const brow = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
      const arcEye = (x) => { ctx.beginPath(); ctx.arc(x + lx * 0.5, ey + 3, 4.6, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); };
      switch (emo) {
        case 'happy': arcEye(-10); arcEye(10); ctx.beginPath(); ctx.arc(0, -33, 6.5, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); break;
        case 'proud': arcEye(-10); arcEye(10); ctx.beginPath(); ctx.arc(0, -32, 7.5, 0, Math.PI); ctx.fill(); break;
        case 'surprised': eyeE(-10, 4.4, 6.2, 0); eyeE(10, 4.4, 6.2, 0); brow(-14, -52.5, -6, -54); brow(6, -54, 14, -52.5); ctx.beginPath(); ctx.ellipse(0, -26, 3, 4.2, 0, 0, TAU); ctx.stroke(); break;
        case 'sad': {
          eyeE(-10, 3.4, 4.4, 1); eyeE(10, 3.4, 4.4, 1); brow(-15, -47, -6, -51); brow(6, -51, 15, -47);
          ctx.beginPath(); ctx.arc(0, -20.5, 6.5, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
          ctx.globalAlpha *= 0.8; ctx.beginPath(); ctx.arc(11.5 + lx, ey + 8 + ((sc.t * 16) % 9), 1.6, 0, TAU); ctx.fill(); ctx.globalAlpha /= 0.8; break;
        }
        case 'focus': eyeE(-10, 3.4, 2.6, 0); eyeE(10, 3.4, 2.6, 0); brow(-15, -49, -6, -45.5); brow(6, -45.5, 15, -49); brow(-3.5, -27, 3.5, -27); break;
        case 'effort':
          ctx.beginPath(); ctx.moveTo(-14, ey - 3.5); ctx.lineTo(-7, ey); ctx.lineTo(-14, ey + 3.5); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(14, ey - 3.5); ctx.lineTo(7, ey); ctx.lineTo(14, ey + 3.5); ctx.stroke();
          ctx.lineWidth = 1.8; ctx.strokeRect(-6.5, -31, 13, 5.5); brow(-2, -31, -2, -25.5); brow(2, -31, 2, -25.5); break;
        case 'sleepy':
          [-10, 10].forEach((x) => { ctx.beginPath(); ctx.ellipse(x + lx, ey + 1, 3.8, 4, 0, 0, Math.PI); ctx.fill(); brow(x - 4.2, ey + 1, x + 4.2, ey + 1); });
          ctx.beginPath(); ctx.ellipse(0, -26, 2.6, 3, 0, 0, TAU); ctx.stroke(); break;
        default: eyeE(-10, 3.4, 4.8, 0); eyeE(10, 3.4, 4.8, 0); brow(-4, -27, 4, -27);
      }
    }
    function stateEmo(a) {
      switch (a.st) {
        case 'pick': case 'toSlot': return 'focus';
        case 'place': return 'effort';
        case 'cheer': return 'proud';
        case 'act': {
          const kd = a.act.kind;
          if (kd === 'jacks') return (Math.floor(a.t / 0.6) % 2) ? 'happy' : 'effort';
          if (kd === 'type') return 'focus';
          const u = a.t / a.act.dur, h = coffeeHand(a, u);
          return h.sip > 0.4 ? 'happy' : (u > 0.3 && u < 0.85 ? 'sleepy' : 'neutral');
        }
        default: return 'neutral';
      }
    }
    function lookOf(a) {
      if (sc.drag && sc.drag.moved) return { x: sc.drag.b.x, y: sc.drag.b.y };
      if (sc.mouse.inside) return sc.mouse;
      if ((a.st === 'toBlock' || a.st === 'pick') && a.b >= 0) return { x: sc.blocks[a.b].x, y: sc.blocks[a.b].y };
      if (a.st === 'toSlot' || a.st === 'place') return slotPos(a.k);
      return { x: 0, y: -40 };
    }
    function drawAgent(a) {
      const col = BODY[a.i], dk = DARKC[a.i], d = a.dir, B = sc.blocks;
      const air = a.y < -8, moving = a.st === 'toBlock' || a.st === 'toSlot' || a.st === 'toSpot';
      const s = Math.sin(a.ph);
      let bodyDy = moving && !air ? -Math.abs(s) * 2.2 : Math.sin(sc.t * 2 + a.i * 2) * 0.8;
      if (a.hop > 0) bodyDy -= Math.sin(Math.PI * a.hop) * 9;
      let hl = { x: -33, y: -18 + (moving ? s * 4 : 0) }, hr = { x: 33, y: -18 - (moving ? s * 4 : 0) };
      let legs = [-13, 13], lifts = [moving ? Math.max(0, s) * 4 : 0, moving ? Math.max(0, -s) * 4 : 0], blk = null;
      if (air || a.hop > 0) lifts = [5, 5];
      const abs = (x, y) => ({ x: x - a.x, y: y - a.y });
      if (a.st === 'pick' && a.b >= 0) {
        const b = B[a.b], p = clamp(a.t / 0.5, 0, 1), e = p * p * (3 - 2 * p), st0 = abs(b.x, b.y);
        blk = { x: lerp(st0.x, 0, e), y: lerp(st0.y, -12, e), rot: 0 }; bodyDy += Math.sin(p * Math.PI) * 5;
      } else if (a.st === 'toSlot' || (a.st === 'idle' && a.carry)) {
        blk = { x: 0, y: -12 + (moving ? -Math.abs(s) * 1.5 : 0), rot: 0 };
      } else if (a.st === 'place' && a.k >= 0) {
        const p = clamp(a.t / 0.6, 0, 1), e = p * p * (3 - 2 * p), en = abs(slotPos(a.k).x, slotPos(a.k).y);
        blk = { x: lerp(0, en.x, e), y: lerp(-12, en.y, e) - Math.sin(p * Math.PI) * 10, rot: 0 };
      } else if (a.st === 'cheer') {
        bodyDy -= Math.abs(Math.sin(a.t * 7)) * 10; if (bodyDy < -3) lifts = [5, 5];
        hl = { x: -30, y: -76 + Math.sin(sc.t * 14) * 3 }; hr = { x: 30, y: -76 - Math.sin(sc.t * 14) * 3 };
      } else if (a.st === 'act') {
        const kd = a.act.kind;
        if (kd === 'jacks') {
          const c = (a.t / 0.6) % 1, o = 0.5 - 0.5 * Math.cos(c * TAU);
          hl = { x: -34 + 6 * o, y: -14 - 62 * o }; hr = { x: 34 - 6 * o, y: -14 - 62 * o };
          legs = [-(13 + 11 * o), 13 + 11 * o]; bodyDy -= Math.abs(Math.sin(c * Math.PI)) * 5; if (bodyDy < -3) lifts = [3, 3];
        } else if (kd === 'type') {
          const tl = Math.max(0, Math.sin(sc.t * 24)) * 2.5, tr = Math.max(0, Math.sin(sc.t * 24 + Math.PI)) * 2.5, k0 = abs(KEYS.x, KEYS.y);
          hl = { x: k0.x - 7, y: k0.y + tl }; hr = { x: k0.x + 7, y: k0.y + tr };
        } else {
          const h = coffeeHand(a, a.t / a.act.dur);
          if (d > 0) hr = { x: h.x, y: h.y }; else hl = { x: h.x, y: h.y };
        }
      }
      if (blk) { hl = { x: blk.x - 20, y: blk.y }; hr = { x: blk.x + 20, y: blk.y }; }
      ctx.save(); ctx.translate(a.x, a.y);
      ctx.save(); ctx.translate(0, -a.y); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.ellipse(0, 0, 30 * (1 - Math.min(0.5, -a.y / 260)), 4, 0, 0, TAU); ctx.fill(); ctx.restore();
      ctx.fillStyle = dk;
      for (let i = 0; i < 2; i++) { rrect(legs[i] - 6, -11 - lifts[i], 12, 11, 3); ctx.fill(); }
      rrect(-28, -58 + bodyDy, 56, 48, 12); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = dk; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = col;
      if (a.i === 0) { rrect(-21, -66 + bodyDy, 10, 9, 2); ctx.fill(); rrect(11, -66 + bodyDy, 10, 9, 2); ctx.fill(); }
      else if (a.i === 1) { ctx.strokeStyle = dk; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -58 + bodyDy); ctx.lineTo(0, -69 + bodyDy); ctx.stroke(); ctx.fillStyle = '#e8eded'; ctx.beginPath(); ctx.arc(0, -71 + bodyDy, 3.2, 0, TAU); ctx.fill(); }
      else { rrect(-8, -64 + bodyDy, 16, 7, 2); ctx.fill(); }
      rrect(-22, -53 + bodyDy, 44, 32, 8); ctx.fillStyle = '#101314'; ctx.fill();
      const lt = lookOf(a), lx = clamp((lt.x - a.x) / 50, -1, 1) * 2.4 + d * 0.8, ly = clamp((lt.y - (a.y - 38)) / 50, -1, 1) * 1.8;
      const emo = a.emoQ.length ? a.emoQ[0][0] : stateEmo(a);
      ctx.save(); ctx.translate(0, bodyDy); drawFace(a, emo, lx, ly); ctx.restore();
      if (blk) { drawBlock(blk.x, blk.y, blk.rot, false); }
      const arm = (sx, sy, h) => {
        ctx.strokeStyle = dk; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(h.x, h.y); ctx.stroke();
        rrect(h.x - 6.5, h.y - 6.5, 13, 13, 3); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = dk; ctx.lineWidth = 1.5; ctx.stroke();
      };
      arm(-27, -36 + bodyDy, hl); arm(27, -36 + bodyDy, hr);
      ctx.restore();
    }
    function drawScene() {
      if (!sc.started || sc.alpha <= 0 || !sceneS) return;
      ctx.save(); ctx.globalAlpha = sc.alpha; ctx.translate(sceneCx, sceneGy); ctx.scale(sceneS, sceneS);
      const g = ctx.createLinearGradient(-390, 0, 390, 0);
      g.addColorStop(0, 'rgba(90,100,104,0)'); g.addColorStop(0.12, 'rgba(90,100,104,1)'); g.addColorStop(0.88, 'rgba(90,100,104,1)'); g.addColorStop(1, 'rgba(90,100,104,0)');
      ctx.fillStyle = g; ctx.fillRect(-390, 0, 780, 1.6);
      drawProps();
      const wob = sc.wobble > 0;
      sc.blocks.forEach((b) => {
        if (b.st === 'carried' || b.pickBy >= 0 || b.st === 'held') return;
        let x = b.x, y = b.y;
        if (b.st === 'placed') { const p = slotPos(b.slot); x = p.x; y = p.y; if (wob) x += Math.sin(sc.t * 55 + b.slot) * ((b.slot >> 1) + 1) * 0.55; }
        drawBlock(x, y, b.rot, false);
      });
      sc.agents.forEach(drawAgent);
      sc.blocks.forEach((b) => { if (b.st === 'held') drawBlock(b.x, b.y, b.rot, true); });
      ctx.restore();
    }
    // ---- pointer interaction ----
    const toScene = (e) => { const r = cv.getBoundingClientRect(), k = r.width ? W / r.width : 1; return { x: ((e.clientX - r.left) * k - sceneCx) / sceneS, y: ((e.clientY - r.top) * k - sceneGy) / sceneS }; };
    const live = () => sc.started && sc.alpha > 0.5 && sc.state !== 'static' && phase !== 'open' && phase !== 'expand' && phase !== 'jolt';
    const hitBlock = (p) => {
      for (let i = sc.blocks.length - 1; i >= 0; i--) {
        const b = sc.blocks[i];
        if (b.st === 'carried' || b.pickBy >= 0) continue;
        if (b.st === 'pile' && b.row !== pileTopRow(b.col)) continue;
        let x = b.x, y = b.y;
        if (b.st === 'placed') { const q = slotPos(b.slot); x = q.x; y = q.y; }
        if (Math.abs(p.x - x) < 15 && Math.abs(p.y - y) < 11) return b;
      }
      return null;
    };
    const grab = (dg, p) => {
      const b = dg.b;
      if (b.st === 'placed') {
        const k = b.slot; let above = false;
        for (let q = 0; q < NB; q++) if (sc.occ[q] >= 0 && (q >> 1) > (k >> 1)) above = true;
        if (above) topple(k, Math.sign(p.x - dg.sx) || 1); else sc.occ[k] = -1;
      }
      if (b.owner >= 0) { const a = sc.agents[b.owner]; release(a); setQ(a, [['surprised', 0.6]]); }
      b.st = 'held'; b.slot = -1; b.owner = -1; b.pickBy = -1; b.vx = 0; b.vy = 0; b.vr = 0; b.hvx = 0; b.hvy = 0; dg.moved = true;
    };
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', (e) => {
      if (!live()) return;
      const p = toScene(e), b = hitBlock(p);
      if (!b) return;
      sc.drag = { b: b, sx: p.x, sy: p.y, moved: false };
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    }, sig);
    cv.addEventListener('pointermove', (e) => {
      const p = toScene(e); sc.mouse.x = p.x; sc.mouse.y = p.y; sc.mouse.inside = true;
      if (!live()) { cv.style.cursor = 'default'; return; }
      if (sc.drag) {
        if (!sc.drag.moved && Math.hypot(p.x - sc.drag.sx, p.y - sc.drag.sy) > 6) grab(sc.drag, p);
        cv.style.cursor = 'grabbing';
      } else cv.style.cursor = hitBlock(p) ? 'grab' : 'default';
    }, sig);
    const endDrag = () => {
      const dg = sc.drag; if (!dg) return;
      sc.drag = null;
      const b = dg.b;
      if (!dg.moved) { if (b.st === 'placed') topple(b.slot, 0); return; }
      b.st = 'fall'; b.vx = clamp(b.hvx || 0, -500, 500) * 0.6; b.vy = clamp(b.hvy || 0, -500, 300) * 0.6; b.vr = (Math.random() - 0.5) * 6;
    };
    cv.addEventListener('pointerup', endDrag, sig);
    cv.addEventListener('pointercancel', endDrag, sig);
    cv.addEventListener('pointerleave', () => { if (!sc.drag) sc.mouse.inside = false; }, sig);
    resetScene();

    const buildPath = (P, r) => {
      const out = [P[0]];
      for (let i = 1; i < P.length - 1; i++) {
        const a = P[i - 1], b = P[i], c = P[i + 1];
        const d1 = Math.hypot(a.x - b.x, a.y - b.y) || 1, d2 = Math.hypot(c.x - b.x, c.y - b.y) || 1, rr = Math.min(r, d1 / 2, d2 / 2);
        const p1 = { x: b.x + (a.x - b.x) / d1 * rr, y: b.y + (a.y - b.y) / d1 * rr }, p2 = { x: b.x + (c.x - b.x) / d2 * rr, y: b.y + (c.y - b.y) / d2 * rr };
        out.push(p1);
        for (let s = 1; s <= 8; s++) { const t = s / 8, u = 1 - t; out.push({ x: u * u * p1.x + 2 * u * t * b.x + t * t * p2.x, y: u * u * p1.y + 2 * u * t * b.y + t * t * p2.y }); }
      }
      out.push(P[P.length - 1]);
      const pts = [out[0]], cum = [0]; let L = 0;
      for (let i = 1; i < out.length; i++) {
        const a = out[i - 1], b = out[i], d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(d / 3));
        for (let s = 1; s <= n; s++) { const t = s / n; pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); L += d / n; cum.push(L); }
      }
      return { pts: pts, cum: cum, len: L };
    };

    const measure = () => {
      const w = root.clientWidth, h = root.clientHeight;
      if (!w || !h) return false;
      const rr = root.getBoundingClientRect(), k = rr.width ? w / rr.width : 1;
      const rel = (el) => { const b = el.getBoundingClientRect(); return { l: (b.left - rr.left) * k, r: (b.right - rr.left) * k, t: (b.top - rr.top) * k, b: (b.bottom - rr.top) * k }; };
      W = w; H = h; dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const n = rel(ghost), cx = (n.l + n.r) / 2, cy = (n.t + n.b) / 2;
      sceneCx = cx; sceneGy = n.t - 4; sceneS = Math.max(0.4, Math.min(1.15, (sceneGy - 12) / 178, W / 800));
      labGeo = labels.map((l) => { const g = rel(l); return { l: g.l, r: g.r, t: g.t, b: g.b, cx: (g.l + g.r) / 2, cy: (g.t + g.b) / 2 }; });
      const a = labGeo[0], b = labGeo[1], c = labGeo[2];
      // left
      let sx = n.l - 18, ex = a.r + 6, ey = a.cy, dy = Math.abs(ey - cy);
      let p2x = ex + 40, p1x = Math.min(p2x + dy, sx - 20);
      const wL = buildPath([{ x: sx, y: cy }, { x: p1x, y: cy }, { x: p1x - dy, y: ey }, { x: ex, y: ey }], 26);
      // right
      sx = n.r + 18; ex = b.l - 6; ey = b.cy; dy = Math.abs(ey - cy);
      p2x = ex - 40; p1x = Math.max(p2x - dy, sx + 20);
      const wR = buildPath([{ x: sx, y: cy }, { x: p1x, y: cy }, { x: p1x + dy, y: ey }, { x: ex, y: ey }], 26);
      // bottom
      const sy = rel($('wSub')).b + 8, exb = c.cx, eyb = c.t - 8, jog = 70;
      const y1 = sy + (eyb - sy) * 0.3;
      const wB = buildPath([{ x: cx, y: sy }, { x: cx, y: y1 }, { x: cx + jog, y: y1 + jog }, { x: exb, y: eyb }], 26);
      wires = [wL, wR, wB];
      pulses = [];
      dirty = false;
      return true;
    };

    const range = (w, s0, s1, jit) => {
      s0 = Math.max(0, s0); s1 = Math.min(w.len, s1);
      if (s1 <= s0) return;
      ctx.beginPath();
      let started = false, jv = 0;
      for (let i = 0; i < w.pts.length; i++) {
        const c = w.cum[i];
        if (c < s0 - 3) continue;
        if (c > s1 + 3) break;
        const p = w.pts[i];
        let x = p.x, y = p.y;
        if (jit) {
          if (i % 4 === 0) jv = (Math.random() - 0.5) * 2 * jit * Math.sin(Math.PI * clamp((c - s0) / (s1 - s0), 0, 1));
          const q = w.pts[Math.min(i + 1, w.pts.length - 1)], pp = w.pts[Math.max(i - 1, 0)];
          const nx = -(q.y - pp.y), ny = q.x - pp.x, m = Math.hypot(nx, ny) || 1;
          x += nx / m * jv; y += ny / m * jv;
        }
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    const headAt = (w, s) => { const i = clamp(Math.round(s / (w.len / (w.pts.length - 1))), 0, w.pts.length - 1); return w.pts[i]; };

    const animClip = (from, to, ms, ox, oy, cb) => {
      const t0 = performance.now();
      const stepFn = (now) => {
        const p = clamp((now - t0) / ms, 0, 1), r = from + (to - from) * easeIO(p);
        ov.style.clipPath = 'circle(' + r.toFixed(1) + 'px at ' + ox.toFixed(1) + 'px ' + oy.toFixed(1) + 'px)';
        if (p < 1) clipRaf = requestAnimationFrame(stepFn); else { clipRaf = 0; if (cb) cb(); }
      };
      clipRaf = requestAnimationFrame(stepFn);
    };
    const maxR = (x, y) => Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y)) + 4;

    const openOv = (i) => {
      phase = 'expand'; openIdx = i;
      secs.forEach((s, j) => s.classList.toggle('cur', j === i));
      const g = labGeo[i], R = maxR(g.cx, g.cy);
      ov.style.visibility = 'visible';
      ov.setAttribute('aria-hidden', 'false');
      const done = () => { ov.style.clipPath = 'none'; ov.classList.add('on'); phase = 'open'; const bk = $('wBack'); if (bk) bk.focus({ preventScroll: true }); };
      if (reduce) { done(); return; }
      ov.style.clipPath = 'circle(0px at ' + g.cx + 'px ' + g.cy + 'px)';
      animClip(0, R, 1000, g.cx, g.cy, done);
    };
    const closeOv = () => {
      if (phase !== 'open') return;
      phase = 'collapse';
      ov.classList.remove('on');
      const g = labGeo[openIdx], R = maxR(g.cx, g.cy);
      const done = () => {
        ov.style.visibility = 'hidden'; ov.setAttribute('aria-hidden', 'true');
        ov.style.clipPath = 'circle(0px at 50% 50%)';
        labels.forEach((l) => l.classList.remove('zap'));
        phase = 'home';
        try { labels[openIdx].focus({ preventScroll: true }); } catch (e) {}
      };
      if (reduce) { done(); return; }
      ov.style.clipPath = 'circle(' + R + 'px at ' + g.cx + 'px ' + g.cy + 'px)';
      animClip(R, 0, 800, g.cx, g.cy, done);
    };
    const pick = (i) => {
      if (phase !== 'home') return;
      phase = 'jolt'; hoverT = -1;
      if (reduce) { labels[i].classList.add('zap'); openOv(i); return; }
      wires.forEach((w, j) => pulses.push({ w: w, i: j, s: 0, v: w.len / 0.55, tail: 150, a: j === i ? 1 : 0.75, lw: j === i ? 4 : 3, jit: j === i ? 5 : 3.5, hit: false }));
      flash[i] = 1; flash[(i + 1) % 3] = 0.6; flash[(i + 2) % 3] = 0.6;
      at(560, () => { labels[i].classList.add('zap'); flash[i] = 1; });
      at(780, () => openOv(i));
    };

    const typeStr = (str, t, rate, setter) => {
      for (let i = 1; i <= str.length; i++) { t += rate * (0.65 + Math.random() * 0.7); const s = str.slice(0, i); at(t, () => setter(s)); }
      return t;
    };
    const delStr = (str, t, rate, setter) => {
      for (let i = str.length - 1; i >= 0; i--) { t += rate * (0.65 + Math.random() * 0.7); const s = str.slice(0, i); at(t, () => setter(s)); }
      return t;
    };
    const setS = (s) => { stTxt.textContent = s; };
    const setN = (s) => { nameTxt.textContent = s; };

    const reset = () => {
      clearAll();
      phase = 'intro'; grow = [0, 0, 0]; hover = [0, 0, 0]; flash = [0, 0, 0]; pulses = []; wiresT0 = -1; hoverT = -1; openIdx = -1;
      root.classList.remove('w-moved', 'w-ready', 'w-namelive', 'w-sub');
      resetScene(); sc.started = false; sc.alpha = 0;
      st.classList.remove('live');
      labels.forEach((l) => l.classList.remove('show', 'zap'));
      setS(''); setN('');
      ov.classList.remove('on'); ov.style.visibility = 'hidden'; ov.style.clipPath = 'circle(0px at 50% 50%)'; ov.setAttribute('aria-hidden', 'true');
    };
    const seq = () => {
      reset();
      if (reduce) {
        root.classList.add('w-moved', 'w-ready'); st.classList.add('live');
        setS('loading...'); setN('dhruva bhat'); grow = [1, 1, 1]; root.classList.add('w-sub');
        sc.started = true; sc.alpha = 1;
        labels.forEach((l) => l.classList.add('show'));
        phase = 'home';
        return;
      }
      let t = 700;
      at(t, () => st.classList.add('live'));
      t = 1300; t = typeStr('hello...', t, 110, setS);
      t += 900; t = delStr('hello...', t, 60, setS);
      t += 450; t = typeStr('loading...', t, 95, setS);
      t += 650;
      at(t, () => root.classList.add('w-moved'));
      t += 1250;
      at(t, () => root.classList.add('w-namelive'));
      t = typeStr('dhruva bhat', t, 105, setN);
      at(t + 150, () => root.classList.add('w-sub'));
      at(t + 700, () => { sc.started = true; });
      t += 1500;
      const w0 = t;
      at(w0, () => { wiresT0 = performance.now(); phase = 'wires'; });
      for (let i = 0; i < 3; i++) at(w0 + i * 170 + 1250, () => labels[i].classList.add('show'));
      at(w0 + 340 + 1700, () => { phase = 'home'; root.classList.add('w-ready'); });
    };

    labels.forEach((l, i) => {
      l.addEventListener('click', () => pick(i), sig);
      l.addEventListener('mouseenter', () => { if (phase === 'home') hoverT = i; }, sig);
      l.addEventListener('mouseleave', () => { hoverT = -1; }, sig);
      l.addEventListener('focus', () => { if (phase === 'home') hoverT = i; }, sig);
      l.addEventListener('blur', () => { hoverT = -1; }, sig);
    });
    $('wBack').addEventListener('click', closeOv, sig);
    $('wRep').addEventListener('click', () => { seq(); }, sig);
    const onKey = (e) => { if (e.key === 'Escape') closeOv(); };
    document.addEventListener('keydown', onKey);
    const onRes = () => { dirty = true; };
    window.addEventListener('resize', onRes);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { dirty = true; });

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (root.clientWidth !== W || root.clientHeight !== H) dirty = true;
      if (dirty && !measure()) return;
      if (!wires.length) return;
      if (!reduce && wiresT0 >= 0) for (let i = 0; i < 3; i++) grow[i] = ease(clamp((now - wiresT0 - i * 170) / 1500, 0, 1));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (sc.started && sc.alpha < 1) sc.alpha = Math.min(1, sc.alpha + dt * 0.8);
      if (sc.started && sc.state !== 'static') updateScene(dt);
      drawScene();
      if (!reduce && phase === 'home') {
        nextIdle -= dt;
        if (nextIdle <= 0) { nextIdle = 2.5 + Math.random() * 2.5; const i = Math.floor(Math.random() * 3); pulses.push({ w: wires[i], i: i, s: 0, v: 320, tail: 70, a: 0.55, lw: 2.5, jit: 0, hit: false }); }
      }
      for (let i = 0; i < 3; i++) {
        const w = wires[i], g = grow[i];
        if (g <= 0) continue;
        hover[i] += ((hoverT === i && phase === 'home' ? 1 : 0) - hover[i]) * Math.min(1, dt * 10);
        flash[i] = Math.max(0, flash[i] - dt * 1.6);
        const len = w.len * g;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = GRAY; ctx.lineWidth = 2.5;
        range(w, 0, len, 0);
        const ta = Math.max(hover[i] * 0.55, flash[i]);
        if (ta > 0.01) { ctx.strokeStyle = 'rgba(232,237,237,' + (ta * 0.8).toFixed(3) + ')'; range(w, 0, len, 0); }
        ctx.fillStyle = GRAY; ctx.beginPath(); ctx.arc(w.pts[0].x, w.pts[0].y, 3.5, 0, TAU); ctx.fill();
        const h = headAt(w, len), growing = g < 0.999, rad = growing ? 5 : 5 + hover[i] * 2.5 + flash[i] * 3;
        ctx.fillStyle = '#e8eded';
        ctx.beginPath(); ctx.arc(h.x, h.y, rad, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
        if (!growing) { ctx.strokeStyle = 'rgba(232,237,237,' + (0.25 + 0.35 * hover[i]).toFixed(2) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(h.x, h.y, rad + 5, 0, TAU); ctx.stroke(); }
      }
      pulses = pulses.filter((p) => {
        p.s += p.v * dt;
        if (!p.hit && p.s >= p.w.len) { p.hit = true; flash[p.i] = Math.max(flash[p.i], p.a > 0.6 && p.tail > 100 ? 0.9 : 0.35); }
        if (p.s - p.tail > p.w.len) return false;
        ctx.strokeStyle = 'rgba(' + TEAL + ',' + p.a + ')'; ctx.lineWidth = p.lw;
        ctx.shadowColor = 'rgba(' + TEAL + ',1)'; ctx.shadowBlur = 16;
        range(p.w, p.s - p.tail, p.s, p.jit);
        if (p.jit) { ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(225,255,250,' + p.a + ')'; ctx.lineWidth = 1.2; range(p.w, p.s - p.tail * 0.7, p.s, p.jit * 0.6); }
        ctx.shadowBlur = 0;
        return true;
      });
    };

    const cleanup = () => {
      clearAll();
      if (raf) cancelAnimationFrame(raf);
      ac.abort();
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onRes);
    };
    seq();
    raf = requestAnimationFrame(frame);
    return cleanup;
}

export default function WiresHome() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cleanup = initWires(root);
    return () => { if (cleanup) cleanup(); };
  }, []);
  return (
    <div ref={ref} id="wRoot" style={{ position: 'relative', width: '100%', height: '100vh', minHeight: 560, background: '#000', overflow: 'hidden' }}>
  <canvas id="wCv" role="img" aria-label="Three gray wires with teal tips run from the name to the left, right and bottom edges" style={{position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', zIndex: '1'}}></canvas>
  <div style={{position: 'absolute', left: '0', top: '0', right: '0', bottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
    <h1 id="wName" aria-label="dhruva bhat, ai infrastructure and computational biology"><span id="wGhost">dhruva bhat</span><span id="wTyped" aria-hidden="true"><span id="wNameTxt"></span><span className="w-caret"></span></span><span id="wSub" aria-hidden="true">ai infrastructure and computational biology</span></h1>
  </div>
  <div id="wStatus" aria-live="polite"><span id="wStatusTxt"></span><span className="w-caret"></span></div>
  <button id="wLb0" className="w-lb">work</button>
  <button id="wLb1" className="w-lb">about</button>
  <button id="wLb2" className="w-lb">contact</button>
  <button id="wRep" className="w-rep">replay</button>
  <div id="wOv" role="dialog" aria-modal="true">
    <button id="wBack">&larr; back</button>
    <div className="w-scroll">
      <section id="wSecWork" className="w-sec">
        <h2 className="rise" style={{'--i': '0'}}>work</h2>
        <div className="w-item rise" style={{'--i': '1'}}><b>Enzyme&ndash;substrate co-design</b><span>[one line about it]</span></div>
        <div className="w-item rise" style={{'--i': '2'}}><b>Oakland Bloom</b><span>[one line about it]</span></div>
        <div className="w-item rise" style={{'--i': '3'}}><b>Amigos de los Rios</b><span>A production cloud application and constraint-aware routing system for Amigos de Los Rios.</span></div>
        <div className="w-item rise" style={{'--i': '4'}}><b>EEG with CEBRA</b><span>A vector representation pipeline for comparing Parkinson&rsquo;s and healthy-patient EEG signals.</span></div>
        <div className="w-item rise" style={{'--i': '5'}}><b>Thin-film ML</b><span>PyTorch and Gaussian-process models for predicting thin-film thickness from molecular properties.</span></div>
      </section>
      <section id="wSecAbout" className="w-sec">
        <h2 className="rise" style={{'--i': '0'}}>about</h2>
        <p className="rise" style={{'--i': '1'}}>I build AI infrastructure and computational biology tools.</p>
        <p className="dim rise" style={{'--i': '2'}}>Berkeley EECS, class of 2028.</p>
        <p className="dim rise" style={{'--i': '3'}}>[a few more sentences about you]</p>
      </section>
      <section id="wSecContact" className="w-sec">
        <h2 className="rise" style={{'--i': '0'}}>contact</h2>
        <div className="w-links rise" style={{'--i': '1'}}>
          <a href="https://github.com/dhruva-bhat">github</a>
          <a href="https://linkedin.com/in/dhruvabhat">linkedin</a>
          <span>dhruva.betkoppa@gmail.com</span>
        </div>
      </section>
    </div>
  </div>
    </div>
  );
}
