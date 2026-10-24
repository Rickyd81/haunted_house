// ===== STATO DI GIOCO, FISICA, GIOCATORE, NEMICI =====
let state = 'title', room = null, P = null, enemies = [], projs = [], parts = [], texts = [], pickups = [], boss = null;
let banner = null, toast = null, msg = null, msgQueue = [], shake = 0, hitstop = 0, fade = 0, lightning = 0, lightningT = 6;
let titleSel = 0, pauseSel = 0, gameT = 0, deadT = 0, curArea = 'A', pendingReward = null, lvlFx = 0, projId = 0, victoryT = 0;

function showToast(s, d = 2.6) { if (toast && toast.text === s) { toast.t = Math.max(toast.t, 1.2); return; } toast = { text: s, t: d }; }
function showMsg(title, lines, opts = {}) {
  const m = Object.assign({ title, lines, t: 0 }, opts);
  if (state === 'msg' || msg) msgQueue.push(m); else { msg = m; m.prev = state; state = 'msg'; }
}

// ----- Tiles e collisioni -----
function tileAt(tx, ty) { if (tx < 0 || tx >= CW || ty < 0 || ty >= CH) return 0; return room.tiles[ty * CW + tx]; }
function solidAt(tx, ty, e) {
  const t = tileAt(tx, ty);
  if (t === 1 || t === 3 || t === 4 || t === 6) return true;
  if (t === 5) return !(e === P && P.dashT > 0);
  return false;
}
function moveEnt(e, dt) {
  e.hitWall = 0; e.blockTile = 0; e.headTile = 0;
  e.x += e.vx * dt;
  let y0 = Math.floor(e.y / TS), y1 = Math.floor((e.y + e.h - .01) / TS);
  let x0 = Math.floor(e.x / TS), x1 = Math.floor((e.x + e.w - .01) / TS);
  if (e.vx > 0) { for (let ty = y0; ty <= y1; ty++) if (solidAt(x1, ty, e)) { e.blockTile = tileAt(x1, ty); e.x = x1 * TS - e.w; e.vx = 0; e.hitWall = 1; break; } }
  else if (e.vx < 0) { for (let ty = y0; ty <= y1; ty++) if (solidAt(x0, ty, e)) { e.blockTile = tileAt(x0, ty); e.x = (x0 + 1) * TS; e.vx = 0; e.hitWall = -1; break; } }
  const prevBottom = e.y + e.h;
  e.y += e.vy * dt;
  x0 = Math.floor(e.x / TS); x1 = Math.floor((e.x + e.w - .01) / TS);
  y0 = Math.floor(e.y / TS); y1 = Math.floor((e.y + e.h - .01) / TS);
  e.onGround = false; e.groundTile = 0;
  if (e.vy > 0) {
    for (let tx = x0; tx <= x1; tx++) {
      const t = tileAt(tx, y1);
      if (solidAt(tx, y1, e) || (t === 2 && prevBottom <= y1 * TS + .5 && !e.dropping)) { e.groundTile = t; e.y = y1 * TS - e.h; e.vy = 0; e.onGround = true; break; }
    }
  } else if (e.vy < 0) {
    for (let tx = x0; tx <= x1; tx++) if (solidAt(tx, y0, e)) { e.headTile = tileAt(tx, y0); e.y = (y0 + 1) * TS; e.vy = 0; break; }
  }
}
function onOneWay(e) {
  const ty = Math.floor((e.y + e.h + 1) / TS);
  let ow = false;
  for (let tx = Math.floor(e.x / TS); tx <= Math.floor((e.x + e.w - .01) / TS); tx++) { const t = tileAt(tx, ty); if (isSolidT(t)) return false; if (t === 2) ow = true; }
  return ow;
}
const groundY = x => groundYT(room, x);

// ----- Particelle -----
function burst(x, y, n, c, sp = 80, life = .5, s = 2, grav = 200) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = Math.random() * sp; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * .3, life: life * rand(.6, 1), max: life, c: Array.isArray(c) ? pick(c) : c, s, g: grav }); }
}
function updateParticles(dt) {
  for (const p of parts) { p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  parts = parts.filter(p => p.life > 0);
  if (parts.length > 600) parts.splice(0, parts.length - 600);
  for (const t of texts) { t.y += t.vy * dt; t.life -= dt; }
  texts = texts.filter(t => t.life > 0);
}

// ----- Giocatore -----
function makePlayer(x, y) { return { x, y, w: 10, h: 22, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, jbuf: 0, jumps: 0, dashT: 0, dashCD: 0, atkT: 0, atkCD: 0, atkDur: .2, swing: 0, inv: 0, dropT: 0, animT: 0, airDash: true, jumping: false }; }

function updatePlayer(dt) {
  const p = P;
  p.animT += dt;
  if (p.inv > 0) p.inv -= dt; if (p.dashCD > 0) p.dashCD -= dt; if (p.atkCD > 0) p.atkCD -= dt; if (p.dropT > 0) p.dropT -= dt;
  const mx = (down('right') ? 1 : 0) - (down('left') ? 1 : 0);
  if (p.dashT > 0) {
    p.dashT -= dt; p.vx = p.face * 285; p.vy = 0;
    if (Math.random() < .8) parts.push({ x: p.x + rand(0, p.w), y: p.y + rand(0, p.h), vx: -p.face * 20, vy: 0, life: .25, max: .25, c: '#7a5ab0', s: 2 });
    if (p.dashT <= 0) p.vx = p.face * 100;
  } else {
    if (hit('dash') && S.dash && p.dashCD <= 0 && (p.onGround || p.airDash)) {
      if (mx) p.face = mx; p.dashT = .2; p.dashCD = .5; if (!p.onGround) p.airDash = false; p.atkT = 0; sfx.dash();
    }
    let target = mx * 98; if (p.atkT > 0 && p.onGround) target *= .4;
    p.vx = approach(p.vx, target, (p.onGround ? 1100 : 700) * dt);
    if (mx && p.atkT <= 0) p.face = mx;
    p.vy = Math.min(p.vy + 930 * dt, 430);
  }
  if (p.onGround) { p.coyote = .1; p.jumps = 0; p.airDash = true; } else p.coyote -= dt;
  if (hit('jump')) p.jbuf = .13; else if (p.jbuf > 0) p.jbuf -= dt;
  if (p.jbuf > 0 && p.dashT <= 0) {
    if (down('down') && p.onGround && onOneWay(p)) { p.dropT = .25; p.jbuf = 0; p.onGround = false; p.y += 1; }
    else if (p.coyote > 0) { p.vy = -360; p.coyote = 0; p.jbuf = 0; p.jumps = 1; p.jumping = true; sfx.jump(); }
    else if (S.dj && p.jumps < 2) {
      p.vy = -315; p.jumps = 2; p.jbuf = 0; p.jumping = true; sfx.jump(1);
      for (let i = 0; i < 10; i++) parts.push({ x: p.x + p.w / 2, y: p.y + p.h, vx: rand(-70, 70), vy: rand(10, 60), life: .35, max: .35, c: '#a99ad0', s: 2 });
    }
  }
  if (p.jumping && !down('jump') && p.vy < -110) { p.vy = -110; p.jumping = false; }
  if (p.vy >= 0) p.jumping = false;
  if (hit('attack') && p.atkCD <= 0 && p.dashT <= 0) startAttack();
  if (p.atkT > 0) { p.atkT -= dt; if (p.atkT > p.atkDur * .2) attackHits(); }
  if (hit('potion')) usePotion();
  if (hit('prev')) cycleWeapon(-1);
  if (hit('next')) cycleWeapon(1);
  p.dropping = p.dropT > 0;
  const wasGround = p.onGround, vyb = p.vy;
  moveEnt(p, dt);
  if (p.onGround && !wasGround && vyb > 260) burst(p.x + p.w / 2, p.y + p.h, 6, '#6a5a70', 40, .3, 2, 0);
  if (p.blockTile === 4 || p.groundTile === 4 || p.headTile === 4) lockedMsg();
  if (p.blockTile === 5) showToast(S.dash ? 'Barriera spettrale: attraversala con lo scatto (C)' : 'Una barriera spettrale sbarra il passo...');
  if (p.blockTile === 6 || p.headTile === 6) showToast('Le porte sono sbarrate finché il custode vive!');
  checkExit();
}

function lockedMsg() {
  let need = 0;
  for (const d in room.def.links) { const l = room.def.links[d]; if (l.type === 'lock') need = l.need; }
  showToast(`Cancello sigillato: servono ${need} Emblemi (ne hai ${S.sigils})`);
}

function cycleWeapon(d) {
  const list = WORDER.filter(k => S.weapons.includes(k));
  if (list.length < 2) return;
  const i = list.indexOf(S.weapon);
  S.weapon = list[(i + d + list.length) % list.length];
  showToast(WEAPONS[S.weapon].name, 1.4); sfx.throw();
}
function addWeapon(k) { if (!S.weapons.includes(k)) S.weapons.push(k); S.weapon = k; }

function usePotion() {
  if (S.potions <= 0) { showToast('Nessuna pozione rimasta'); return; }
  if (S.hp >= S.maxhp) { showToast('Sei già in piena salute'); return; }
  S.potions--; const h = Math.round(S.maxhp * .5); S.hp = Math.min(S.maxhp, S.hp + h);
  texts.push({ x: P.x + P.w / 2, y: P.y - 6, s: '+' + h, c: '#7dff9a', life: .9, vy: -30 });
  burst(P.x + P.w / 2, P.y + 10, 14, ['#7dff9a', '#c8ffd4'], 50, .6, 2, -60); sfx.potion();
}

function atkBox(w) {
  const cx = P.x + P.w / 2, cy = P.y + 11;
  if (w.type === 'arc') return { x: P.face > 0 ? cx - 8 : cx - w.reach, y: P.y - 14, w: w.reach + 8, h: 38 };
  return { x: P.face > 0 ? cx + 2 : cx - 2 - w.reach, y: cy - w.hh / 2, w: w.reach, h: w.hh };
}
function startAttack() {
  const w = WEAPONS[S.weapon];
  P.atkCD = w.cd; P.swing++;
  P.atkT = w.dur; P.atkDur = w.dur;
  if (w.type === 'ranged') {
    projs.push({ id: ++projId, x: P.x + P.w / 2 + P.face * 6 - 4, y: P.y + 10, w: 9, h: 3, vx: P.face * w.speed, vy: 0, life: .9, friendly: true, wk: S.weapon, kind: 'bolt', grav: 0 });
    sfx.bow(); return;
  }
  (w.type === 'heavy' || w.type === 'arc') ? sfx.heavy() : sfx.swing();
  if (w.wave) projs.push({ id: ++projId, x: P.x + P.w / 2 + P.face * 10 - 5, y: P.y, w: 10, h: 22, vx: P.face * 250, vy: 0, life: .4, friendly: true, wk: 'dusk', kind: 'wave', pierce: true, hits: new Set(), grav: 0, scale: .6 });
}
function attackHits() {
  const w = WEAPONS[S.weapon];
  if (w.type === 'ranged') return;
  const b = atkBox(w);
  for (const e of enemies) {
    if (e.dead || e.lastSwing === P.swing) continue;
    if (overlap(b, e)) { e.lastSwing = P.swing; hurtEnemy(e, w, P.face); }
  }
  const x0 = Math.floor(b.x / TS), x1 = Math.floor((b.x + b.w) / TS), y0 = Math.floor(b.y / TS), y1 = Math.floor((b.y + b.h) / TS);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (tileAt(tx, ty) === 3) hitCrack(tx, ty, 's' + P.swing);
}
function hitCrack(tx, ty, sw) {
  const i = ty * CW + tx;
  room.cs = room.cs || {}; room.ch = room.ch || {};
  if (room.cs[i] === sw) return;
  room.cs[i] = sw; room.ch[i] = (room.ch[i] || 0) + 1;
  sfx.crack(); shake = Math.max(shake, .1);
  burst(tx * TS + 8, ty * TS + 8, 8, [AREAS[room.def.a].stone, AREAS[room.def.a].stoneHi], 70, .5, 2, 300);
  if (room.ch[i] >= 2) breakSecret(tx);
}
function breakSecret(tx) {
  const dir = tx === 0 ? 'L' : 'R', lk = room.def.links[dir];
  if (!lk || lk.type !== 'secret' || S.broken[lk.id]) return;
  S.broken[lk.id] = true;
  for (const [x, y] of openingCells(dir)) { room.tiles[y * CW + x] = 0; burst(x * TS + 8, y * TS + 8, 10, [AREAS[room.def.a].stone, AREAS[room.def.a].stoneDk], 120, .8, 3, 400); }
  renderRoom(room); sfx.secret(); shake = .3;
  showToast('Hai scoperto un passaggio segreto!', 3);
  persist();
}

function hurtEnemy(e, w, dir, scale = 1) {
  if (e.invuln || e.dying || e.dead || e.collapse > 0 || e.rise > 0) return;
  let d = S.str * w.mult * scale * rand(.9, 1.1);
  const crit = Math.random() < .03 + S.luck * .012;
  if (crit) d *= 1.6;
  if (e.ghost && w.holy) d *= 1.5;
  d *= 1 - (e.def || 0);
  d = Math.max(1, Math.round(d));
  e.hp -= d; e.flash = .12; hitstop = Math.max(hitstop, crit ? .06 : .03);
  texts.push({ x: e.x + e.w / 2, y: e.y - 4, s: String(d) + (crit ? '!' : ''), c: crit ? '#ffd34a' : '#ffffff', life: .7, vy: -40 });
  crit ? sfx.crit() : sfx.hit();
  const col = e.type === 'zomb' || e.id === 3 ? ['#6a8a4a', '#3a4a2a', '#8a1a1a'] : e.ghost ? ['#cfe0ff', '#8aa0d0'] : ['#e0d6c0', '#a09880'];
  burst(e.x + e.w / 2, e.y + e.h / 2, 6, col, 90, .45, 2, 300);
  if (!e.isBoss) { e.vx = dir * (w.kb || 90) * (e.type === 'armor' ? .4 : 1); if (!e.fly) e.vy = -90; e.stun = .28; }
  if (e.hp <= 0) { if (e.isBoss) startBossDeath(e); else killEnemy(e); }
}
function killEnemy(e) {
  if (e.type === 'mummy') { // si affloscia invece di sparire
    e.collapse = 1.1; e.vx = 0; S.kills++; gainXP(e.xp);
    texts.push({ x: e.x + e.w / 2, y: e.y - 10, s: '+' + e.xp + ' XP', c: '#c9a24a', life: .9, vy: -25 });
    burst(e.x + e.w / 2, e.y + e.h / 2, 12, ['#d8d0b8', '#2a2420'], 90, .6, 2, 300); sfx.kill();
    return;
  }
  e.dead = true; S.kills++;
  gainXP(e.xp);
  burst(e.x + e.w / 2, e.y + e.h / 2, 16, e.ghost ? ['#cfe0ff', '#ffffff'] : ['#e0d6c0', '#8a1a1a', '#5a4a40'], 120, .7, 2, 350);
  texts.push({ x: e.x + e.w / 2, y: e.y - 10, s: '+' + e.xp + ' XP', c: '#c9a24a', life: .9, vy: -25 });
  sfx.kill();
  if (Math.random() < .17) pickups.push({ kind: 'heart', x: e.x + e.w / 2 - 4, y: e.y, w: 8, h: 8, vy: -90, life: 9 });
}
function gainXP(n) {
  S.xp += n;
  while (S.xp >= xpNeed(S.lvl)) {
    S.xp -= xpNeed(S.lvl); S.lvl++;
    S.maxhp += 8; S.str += 2; S.def += 1; if (S.lvl % 2 === 0) S.luck += 1;
    S.hp = S.maxhp; lvlFx = 1.6; sfx.lvl();
    showToast(`Livello ${S.lvl}!  PV +8  FOR +2  DIF +1${S.lvl % 2 === 0 ? '  FORT +1' : ''}`, 3.2);
    burst(P.x + P.w / 2, P.y + 10, 30, ['#ffd34a', '#fff2b0', '#c9a24a'], 110, 1, 2, -40);
  }
}

function hurtPlayer(dmg, dir) {
  if (P.inv > 0 || P.dashT > 0 || state !== 'play') return;
  const d = Math.max(1, Math.round(dmg * 100 / (100 + S.def * 6) * rand(.9, 1.1)));
  S.hp -= d; P.inv = 1; P.vx = dir * 150; P.vy = -170; P.atkT = 0; P.jumping = false;
  shake = .25; hitstop = .05; sfx.hurt();
  texts.push({ x: P.x + P.w / 2, y: P.y - 4, s: '-' + d, c: '#ff5a5a', life: .8, vy: -35 });
  burst(P.x + P.w / 2, P.y + 10, 10, ['#b0142a', '#6a0a14'], 90, .5, 2, 300);
  if (S.hp <= 0) { S.hp = 0; die(); }
}
function die() { state = 'dead'; deadT = 0; sfx.die(); burst(P.x + P.w / 2, P.y + 10, 40, ['#b0142a', '#6a0a14', '#9aa3ad'], 140, 1.2, 2, 300); }
function respawn() {
  S.hp = S.maxhp; S.potions = S.maxPot;
  P = makePlayer(ALT_X + 30, 200);
  enterRoom(S.saveRoom);
  P.y = groundY(P.x + 5) - P.h;
  state = 'play';
}

// ----- Nemici -----
function spawnEnemy(type, x, lvl, y) {
  const b = EN[type];
  const e = { type, x, y: 0, w: b.w, h: b.h, vx: 0, vy: 0, face: Math.random() < .5 ? -1 : 1, lvl, t: Math.random() * 3, st: '', flash: 0, fly: !!b.fly, def: b.def || 0, ghost: !!b.ghost, spd: b.spd, stun: 0, lunge: 0 };
  e.hp = e.maxhp = Math.round(b.hp * (1 + .38 * (lvl - 1)));
  e.atk = Math.round(b.atk * (1 + .2 * (lvl - 1)));
  e.xp = Math.round(b.xp * (1 + .6 * (lvl - 1)));
  if (type === 'bat') { e.y = 17; e.st = 'hang'; }
  else if (type === 'ghost') e.y = y ?? rand(60, 170);
  else e.y = y ?? (groundY(x + e.w / 2) - e.h);
  enemies.push(e); return e;
}
function spawnEnemies() {
  const def = room.def;
  if (def.altar || def.secret || def.boss || def.start) return;
  const ar = AREAS[def.a];
  if (!ar.enemies.length) return;
  const lvl = ar.base + Object.keys(S.bosses).length;
  const pool = S.bosses[1] ? [...ar.enemies, 'mummy', 'mummy'] : ar.enemies;
  const n = 2 + Math.floor(Math.random() * 2) + (ar.base >= 7 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    let x, tries = 0;
    do { x = rand(48, W - 70); } while (Math.abs(x - P.x) < 120 && tries++ < 30);
    spawnEnemy(pick(pool), x, lvl);
  }
}
function updateEnemy(e, dt) {
  e.t += dt; if (e.flash > 0) e.flash -= dt; if (e.stun > 0) e.stun -= dt;
  // mummia afflosciata: dopo un attimo rinasce come scheletro lanciatore di ossa
  if (e.collapse > 0) {
    e.collapse -= dt; e.vy = Math.min(e.vy + 900 * dt, 400); moveEnt(e, dt);
    if (e.collapse < .35 && Math.random() < .4) parts.push({ x: e.x + rand(0, e.w), y: e.y + e.h - 3, vx: rand(-20, 20), vy: -40, life: .4, max: .4, c: '#ddd5c0', s: 2, g: 200 });
    if (e.collapse <= 0) {
      e.dead = true;
      const s = spawnEnemy('archer', e.x + 1, e.lvl);
      s.rise = .6; s.t = 1.3; s.face = e.face;
      burst(e.x + e.w / 2, e.y + e.h - 4, 18, ['#ddd5c0', '#9d957f', '#d8d0b8'], 100, .6, 2, 300); sfx.crack();
    }
    return;
  }
  if (e.rise > 0) { e.rise -= dt; e.t = Math.min(e.t, 1.3); e.vy = Math.min(e.vy + 900 * dt, 400); moveEnt(e, dt); return; }
  const px = P.x + P.w / 2, py = P.y + P.h / 2, ex = e.x + e.w / 2, ey = e.y + e.h / 2, dx = px - ex, dy = py - ey, dist = Math.hypot(dx, dy) || 1;
  if (e.type === 'skel' || e.type === 'zomb' || e.type === 'armor' || e.type === 'archer' || e.type === 'mummy') {
    if (e.stun > 0) { e.vx *= .9; e.punch = 0; }
    else if (e.type === 'mummy' && e.punch > 0) { // pugno: carica e colpisce
      e.punch -= dt; e.vx = 0;
      if (e.punch < .22 && !e.punched) {
        e.punched = true; sfx.swing();
        const box = { x: e.face > 0 ? e.x + e.w : e.x - 20, y: e.y + 6, w: 20, h: 12 };
        if (overlap(box, P)) hurtPlayer(e.atk * 1.4, e.face);
      }
    }
    else if (e.type === 'archer') {
      e.vx = 0; e.face = Math.sign(dx) || 1;
      if (e.t > 2.4 && dist < 260) {
        e.t = 0; const T = .9, g = 500;
        projs.push({ id: ++projId, x: ex - 3, y: e.y + 4, w: 6, h: 6, vx: dx / T, vy: (dy - .5 * g * T * T) / T, grav: g, life: 3, dmg: e.atk, kind: 'bone', hostile: true });
        sfx.throw();
      }
    } else {
      const chase = Math.abs(dx) < 150 && Math.abs(dy) < 40;
      if (chase) e.face = Math.sign(dx) || e.face;
      const sp = e.spd * (chase ? 1.6 : 1);
      if (e.lunge > 0) e.lunge -= dt;
      else if (e.type === 'mummy' && chase && Math.abs(dx) < 26 && e.t > 1.1) { e.punch = .5; e.punched = false; e.t = 0; e.vx = 0; }
      else if ((e.type === 'armor' || e.type === 'zomb') && chase && Math.abs(dx) < 60 && e.t > 2.5) { e.vx = e.face * (e.type === 'armor' ? 170 : 110); e.t = 0; e.lunge = .35; }
      else e.vx = e.face * sp;
      if (e.type === 'skel' && chase && e.onGround && Math.random() < dt * .6) e.vy = -230;
    }
    e.vy = Math.min(e.vy + 900 * dt, 400);
    moveEnt(e, dt);
    if (e.hitWall && e.stun <= 0) e.face = -e.hitWall;
    if (e.onGround && e.stun <= 0 && e.lunge <= 0 && e.type !== 'archer') {
      const tx = Math.floor((e.face > 0 ? e.x + e.w + 1 : e.x - 1) / TS), ty = Math.floor((e.y + e.h + 2) / TS);
      const t = tileAt(tx, ty);
      if (!(isSolidT(t) || t === 2)) e.face *= -1;
    }
    if (e.x < 18) e.face = 1; if (e.x + e.w > W - 18) e.face = -1;
  } else if (e.type === 'bat') {
    if (e.st === 'hang') { if (dist < 130 || e.flash > 0) e.st = 'fly'; }
    else {
      if (e.stun > 0) { e.vx *= .92; e.vy *= .92; }
      else {
        const a = Math.atan2(dy, dx);
        e.vx += (Math.cos(a) * e.spd - e.vx) * dt * 2;
        e.vy += (Math.sin(a) * e.spd + Math.sin(e.t * 6) * 50 - e.vy) * dt * 2;
      }
      e.x += e.vx * dt; e.y += e.vy * dt; e.face = Math.sign(e.vx) || 1;
    }
  } else if (e.type === 'ghost') {
    if (e.stun > 0) { e.x += e.vx * dt; e.vx *= .9; }
    else { e.x += dx / dist * e.spd * dt; e.y += dy / dist * e.spd * dt + Math.sin(e.t * 3) * .35; }
    e.face = Math.sign(dx) || 1;
  }
  if (e.fly) { e.x = clamp(e.x, 16, W - 16 - e.w); e.y = clamp(e.y, 16, 238 - e.h); }
  if (overlap(e, P) && e.st !== 'hang') hurtPlayer(e.atk, Math.sign(px - ex) || 1);
}

// ----- Proiettili -----
function shoot(x, y, vx, vy, dmg, kind, o = {}) { projs.push(Object.assign({ id: ++projId, x: x - 4, y: y - 4, w: 8, h: 8, vx, vy, dmg, kind, life: 5, grav: 0, hostile: true }, o)); }
function lob(x, y, tx, ty, T, dmg, kind, g = 500, o = {}) { shoot(x, y, (tx - x) / T, (ty - y - .5 * g * T * T) / T, dmg, kind, Object.assign({ grav: g }, o)); }
const TILE_STOP = { bolt: 1, plate: 1, bone: 1, bile: 1, book: 1, fire: 1, rock: 1 };
function updateProjs(dt) {
  for (const p of projs) {
    p.life -= dt;
    if (p.warn > 0) { p.warn -= dt; continue; }
    p.vy += (p.grav || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.x < -20 || p.x > W + 20 || p.y > H + 20 || p.y < -60) p.life = 0;
    if (TILE_STOP[p.kind]) {
      const tx = Math.floor((p.x + p.w / 2) / TS), ty = Math.floor((p.y + p.h / 2) / TS), t = tileAt(tx, ty);
      if (t === 1 || t === 3 || t === 4 || t === 5 || t === 6) {
        if (p.friendly && t === 3) hitCrack(tx, ty, 'p' + p.id);
        p.life = 0; burst(p.x + p.w / 2, p.y + p.h / 2, 5, '#8a8090', 50, .3, 2, 200);
      }
    }
    if (p.life <= 0) continue;
    if (p.hostile) {
      if (p.kind === 'pillar' && p.life > .32) continue;
      if (overlap(p, P)) { hurtPlayer(p.dmg, Math.sign(p.vx) || (P.x < p.x ? -1 : 1)); if (!p.pierce) p.life = 0; }
    } else if (p.friendly) {
      for (const e of enemies) {
        if (e.dead || !overlap(p, e)) continue;
        if (e.collapse > 0 || e.rise > 0) continue;
        if (p.pierce) { if (p.hits.has(e)) continue; p.hits.add(e); }
        hurtEnemy(e, WEAPONS[p.wk], Math.sign(p.vx) || 1, p.scale || 1);
        if (!p.pierce) { p.life = 0; break; }
      }
    }
  }
  projs = projs.filter(p => p.life > 0);
}

// ----- Oggetti raccoglibili -----
function updatePickups(dt) {
  for (const k of pickups) {
    k.t = (k.t || 0) + dt;
    if (k.kind === 'heart') {
      k.vy = Math.min(k.vy + 500 * dt, 300); k.y += k.vy * dt;
      const gy = groundY(k.x + 4); if (k.y + k.h > gy) { k.y = gy - k.h; k.vy = 0; }
      k.life -= dt;
      if (overlap(k, P)) { k.life = 0; const h = Math.max(3, Math.round(S.maxhp * .12)); S.hp = Math.min(S.maxhp, S.hp + h); texts.push({ x: P.x + 5, y: P.y - 6, s: '+' + h, c: '#ff8aa0', life: .8, vy: -30 }); sfx.potion(); }
    } else if (k.kind === 'item' && overlap(k, P)) {
      k.life = 0; giveItem(k.item);
    }
  }
  pickups = pickups.filter(k => k.kind === 'item' ? k.life !== 0 : k.life > 0);
}
function giveItem(id) {
  const it = ITEMS[id];
  S.items[room.key] = true;
  if (it.weapon) addWeapon(it.weapon);
  if (id === 'hpup') { S.maxhp += 15; S.hp = S.maxhp; }
  if (id === 'forup') S.str += 3;
  if (id === 'difup') S.def += 3;
  if (id === 'flask') { S.maxPot += 1; S.potions = S.maxPot; }
  sfx.pick(); burst(P.x + 5, P.y + 8, 24, ['#ffd34a', '#fff2b0'], 100, .8, 2, -30);
  persist();
  showMsg(it.title, it.lines);
}

// ----- Stanze -----
function enterRoom(key) {
  room = buildRoom(key); renderRoom(room);
  enemies = []; projs = []; pickups = []; boss = null; parts = []; texts = [];
  const def = room.def;
  if (!S.visited[key]) { S.visited[key] = 1; if (def.secret) { S.secrets++; showToast('Hai trovato una stanza segreta!', 3); } }
  if (curArea !== def.a) { curArea = def.a; banner = { text: AREAS[def.a].name, t: 3 }; }
  room.altarUsed = false;
  if (def.item && !S.items[key]) { const ix = itemX(def); pickups.push({ kind: 'item', item: def.item, x: ix, y: groundY(ix + 6) - 26, w: 12, h: 14, life: 1 }); }
  if (def.boss && !S.bosses[def.boss]) startBoss(def.boss);
  else spawnEnemies();
  fade = 1;
}
function checkExit() {
  const cx = P.x + P.w / 2, cy = P.y + P.h / 2;
  let dir = null;
  if (cx < 0) dir = 'L'; else if (cx > W) dir = 'R'; else if (cy < 0) dir = 'U'; else if (P.y > H) dir = 'D';
  if (!dir) return;
  const lk = room.def.links[dir];
  if (!lk) { P.x = clamp(P.x, 16, W - 16 - P.w); P.y = clamp(P.y, 16, 240 - P.h); return; }
  if (dir === 'L') P.x = W - P.w - 3;
  if (dir === 'R') P.x = 3;
  if (dir === 'U') { P.y = H - P.h - 2; P.vy = Math.min(P.vy, -330); P.jumping = false; }
  if (dir === 'D') P.y = 1;
  enterRoom(lk.to);
}
function checkAltar() {
  if (!room.def.altar || room.altarUsed) return;
  if (overlap(P, { x: ALT_X - 4, y: 196, w: 28, h: 44 })) {
    room.altarUsed = true;
    S.hp = S.maxhp; S.potions = S.maxPot; S.saveRoom = room.key;
    persist(); sfx.save();
    burst(ALT_X + 10, 214, 26, ['#7ab8ff', '#cfe6ff'], 70, 1, 2, -50);
    showToast('La fiamma della Veglia ti ristora. Partita salvata.', 3);
  }
}

function nextHint() {
  const s = S.sigils, b = S.bosses;
  if (s >= 5) return ['Il sigillo del Santuario è spezzato:', 'scendi nel cuore delle Cripte.'];
  if (s >= 4) return ['La scala della Torre del Corvo, sopra', "la Galleria dell'Atrio, ora è aperta."];
  if (s === 3) return b[3] ? ['Resta la Cappella, sopra la sala di Ossian.'] : ["Restano le Cripte: la grata è nell'Atrio."];
  if (s === 2) return ["La grata delle Cripte nell'Atrio si è aperta.", 'Con il doppio salto raggiungi anche', 'la Cappella, sopra la sala di Ossian.'];
  if (s === 1) return ["Una barriera spettrale sbarra l'ala ovest", "dell'Atrio: attraversala con lo scatto."];
  return [];
}
function giveReward(id) {
  const sig = `Emblema del custode ottenuto (${S.sigils}/5).`;
  if (id === 1) { S.dash = true; showMsg("Mantello dell'Ombra", ['Premi C per uno scatto fulmineo: sei immune', 'ai colpi e attraversi le barriere spettrali.', sig, ...nextHint()]); }
  if (id === 2) { S.dj = true; showMsg('Ali del Corvo', ["Premi salto a mezz'aria per il doppio salto.", sig, ...nextHint()]); }
  if (id === 3) { addWeapon('whip'); showMsg('Catena del Penitente', ['Una frusta di catene dalla portata enorme.', sig, ...nextHint()]); }
  if (id === 4) { addWeapon('hammer'); showMsg('Martello Consacrato', ['Colpi devastanti, danni extra agli spettri.', sig, ...nextHint()]); }
  if (id === 5) { addWeapon('dusk'); showMsg('Lama del Crepuscolo', ["Ogni fendente scaglia un'onda di luce.", sig, ...nextHint()]); }
  if (id === 6) showMsg('Alba su Villa Morgrave', ['Il Conte Malachia si dissolve in cenere.', 'Le campane tacciono, e i morti della sua', 'stirpe tornano finalmente al loro sonno.', 'Il sole sorge sulla villa.'], { next: 'victory' });
  persist();
}
