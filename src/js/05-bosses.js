// ===== BOSS =====
// Quote di volo (y del bordo superiore): restano alla portata del salto del giocatore
// Morwen si affronta senza doppio salto, quindi resta più in basso
const FLY_Y = { 2: [140, 185], 4: [100, 170], 6: [70, 160] };
function startBoss(id) {
  const b = BOSSES[id];
  boss = { isBoss: true, id, name: b.name, w: b.w, h: b.h, vx: 0, vy: 0, hp: b.hp, maxhp: b.hp, atk: b.atk, face: -1, t: 0, st: 'intro', stT: 1.6, flash: 0, fly: !!b.fly, ghost: !!b.ghost, def: 0, phase: 1, alpha: 1, n: 0 };
  boss.x = P.x > W / 2 ? 70 : W - 70 - b.w;
  boss.face = P.x > W / 2 ? 1 : -1;
  boss.y = b.fly ? FLY_Y[id][0] + 10 : 240 - b.h;
  boss.tx = boss.x; boss.ty = boss.y;
  enemies.push(boss);
  banner = { text: b.name, t: 3.2, boss: true };
  sfx.roar();
}
function closeDoors() {
  for (const d of ['L', 'R', 'U', 'D']) {
    const lk = room.def.links[d];
    if (!lk || lk.type === 'secret') continue;
    for (const [x, y] of openingCells(d)) room.tiles[y * CW + x] = 6;
  }
  room.closed = true; renderRoom(room); sfx.thud(); shake = .3;
}
function startBossDeath(b) {
  if (b.dying) return;
  b.dying = 2; b.invuln = true; b.hp = 0;
  projs = projs.filter(p => !p.hostile);
  enemies.forEach(o => { if (!o.isBoss && !o.dead) { o.dead = true; burst(o.x + o.w / 2, o.y + o.h / 2, 12, '#9a6ad0', 80, .6); } });
  sfx.roar();
}
function bossDefeated(b) {
  S.bosses[b.id] = true;
  if (b.id < 6) S.sigils++;
  if (BOSSES[b.id].xp) gainXP(BOSSES[b.id].xp);
  const r = buildRoom(room.key); room.tiles = r.tiles; room.closed = false; renderRoom(room);
  burst(b.x + b.w / 2, b.y + b.h / 2, 80, ['#ffd34a', '#ffffff', '#c9a24a', '#b0142a'], 220, 1.4, 3, 120);
  shake = .6; flashScreen = 1;
  pendingReward = { id: b.id, t: 1.4 };
  boss = null;
  persist();
}
let flashScreen = 0;

function newSpot(b) {
  let tx, tries = 0;
  do { tx = rand(40, W - 40 - b.w); } while (Math.abs(tx - P.x) < 70 && tries++ < 20);
  const [y0, y1] = FLY_Y[b.id] || [60, 140];
  b.tx = tx; b.ty = rand(y0, y1);
}
function teleport(b, total) {
  const half = total / 2;
  if (b.stT > half) { b.alpha = Math.max(0, (b.stT - half) / half); b.invuln = true; }
  else {
    if (!b.moved) { b.moved = true; newSpot(b); b.x = b.tx; b.y = b.ty; burst(b.x + b.w / 2, b.y + b.h / 2, 16, '#9a6ad0', 60, .5, 2, 0); }
    b.alpha = 1 - Math.max(0, b.stT) / half;
  }
}
function floatTo(b, dt, k = 1.6) {
  b.x += (b.tx - b.x) * Math.min(1, dt * k);
  b.y += (b.ty - b.y) * Math.min(1, dt * k) + Math.sin(b.t * 2.2) * .4;
}
function groundPhys(b, dt) { b.vy = Math.min(b.vy + 900 * dt, 520); moveEnt(b, dt); }
function shock(b, sp) {
  shoot(b.x - 4, 234, -sp, 0, b.atk * .8, 'shock', { w: 12, h: 12, life: 2.6 });
  shoot(b.x + b.w + 4, 234, sp, 0, b.atk * .8, 'shock', { w: 12, h: 12, life: 2.6 });
  shake = .35; sfx.thud();
}

function updateBoss(b, dt) {
  b.t += dt; if (b.flash > 0) b.flash -= dt;
  if (b.dying) {
    b.dying -= dt; shake = Math.max(shake, .12);
    if (Math.random() < .5) burst(b.x + rand(0, b.w), b.y + rand(0, b.h), 6, ['#ffd34a', '#ffffff', '#b0142a'], 90, .6, 2, 0);
    if (b.dying <= 0) { b.dead = true; bossDefeated(b); }
    return;
  }
  if (b.st === 'intro') {
    if (!room.closed && P.x > 20 && P.x + P.w < W - 20 && P.y > 18 && P.y + P.h < 238) closeDoors();
    b.stT -= dt;
    if (b.fly) b.y = b.ty + Math.sin(b.t * 2) * 4; else groundPhys(b, dt);
    if (b.stT <= 0 && room.closed) { b.st = b.fly ? 'float' : 'walk'; b.stT = 1; }
    return;
  }
  BOSS_AI[b.id](b, dt);
  b.x = clamp(b.x, 16, W - 16 - b.w);
  if (b.fly) b.y = clamp(b.y, 18, 238 - b.h);
  if (!b.invuln && b.alpha > .5 && overlap(b, P)) hurtPlayer(b.atk, Math.sign((P.x + P.w / 2) - (b.x + b.w / 2)) || 1);
}

const BOSS_AI = {
  // Ossian, il Maggiordomo: cammina, lancia piatti, carica col vassoio
  1(b, dt) {
    const r = b.hp < b.maxhp / 2 ? 1.3 : 1, px = P.x + P.w / 2, bx = b.x + b.w / 2;
    b.stT -= dt;
    if (b.st === 'walk') {
      b.face = Math.sign(px - bx) || b.face; b.vx = b.face * 46 * r;
      if (b.stT <= 0) { b.vx = 0; if (Math.random() < .55) { b.st = 'throw'; b.stT = 1.3; b.n = 0; } else { b.st = 'wind'; b.stT = .55; } }
    } else if (b.st === 'throw') {
      b.vx = 0; b.face = Math.sign(px - bx) || b.face;
      const k = Math.floor((1.3 - b.stT) / (r > 1 ? .28 : .38));
      if (k >= b.n && b.n < (r > 1 ? 4 : 3)) { b.n++; lob(bx + b.face * 10, b.y + 18, px + rand(-26, 26), P.y + P.h / 2, .85, b.atk * .8, 'plate', 500, { w: 10, h: 6 }); sfx.throw(); }
      if (b.stT <= 0) { b.st = 'walk'; b.stT = rand(1.2, 2.2); }
    } else if (b.st === 'wind') {
      b.vx = 0; if (b.stT <= 0) { b.st = 'charge'; b.stT = 2.2; }
    } else if (b.st === 'charge') {
      b.vx = b.face * 240 * r;
      if (b.hitWall || b.stT <= 0) { b.st = 'stun'; b.stT = .9; b.vx = 0; shake = .3; sfx.thud(); }
    } else if (b.st === 'stun') { b.vx = 0; if (b.stT <= 0) { b.st = 'walk'; b.stT = 1.4; } }
    groundPhys(b, dt);
  },
  // Morwen, la Strega: teletrasporto, sfere a ventaglio, pioggia di libri
  2(b, dt) {
    const r = b.hp < b.maxhp / 2 ? 1.3 : 1, px = P.x + P.w / 2, py = P.y + P.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
    b.stT -= dt; b.face = Math.sign(px - bx) || 1;
    if (b.st === 'float') {
      floatTo(b, dt);
      if (b.stT <= 0) { const q = Math.random(); b.n = 0; if (q < .4) { b.st = 'spread'; b.stT = 1.5; } else if (q < .7) { b.st = 'rain'; b.stT = 2.2; } else { b.st = 'tele'; b.stT = .9; b.moved = false; } }
    } else if (b.st === 'spread') {
      const k = Math.floor((1.5 - b.stT) / .45);
      if (k >= b.n && b.n < 3) { b.n++; const a = Math.atan2(py - by, px - bx); for (let i = -2; i <= 2; i++) { const aa = a + i * .22; shoot(bx, by, Math.cos(aa) * 112 * r, Math.sin(aa) * 112 * r, b.atk * .75, 'orb'); } sfx.magic(); }
      if (b.stT <= 0) { b.st = 'float'; b.stT = 1.1; newSpot(b); }
    } else if (b.st === 'rain') {
      const k = Math.floor((2.2 - b.stT) / .2);
      if (k >= b.n && b.n < (r > 1 ? 10 : 7)) { b.n++; shoot(rand(32, W - 40), 18, 0, 30, b.atk * .7, 'book', { grav: 240, w: 10, h: 8 }); }
      if (b.stT <= 0) { b.st = 'float'; b.stT = 1; }
    } else if (b.st === 'tele') {
      teleport(b, .9);
      if (b.stT <= 0) { b.st = 'float'; b.stT = .8; b.alpha = 1; b.invuln = false; }
    }
  },
  // Gorvath, il Ghoul: carica, balzo con onde d'urto, sputi di bile
  3(b, dt) {
    const r = b.hp < b.maxhp / 2 ? 1.25 : 1, px = P.x + P.w / 2, bx = b.x + b.w / 2;
    b.stT -= dt;
    if (b.st === 'walk') {
      b.face = Math.sign(px - bx) || b.face; b.vx = b.face * 40 * r;
      if (b.stT <= 0) {
        const q = Math.random(); b.n = 0;
        if (q < .35) { b.st = 'wind'; b.stT = .6; b.vx = 0; }
        else if (q < .7 && b.onGround) { b.vy = -420; b.vx = clamp((px - bx) / .95, -260, 260); b.st = 'air'; sfx.roar(); }
        else { b.st = 'spit'; b.stT = 1; b.vx = 0; }
      }
    } else if (b.st === 'wind') {
      b.vx = 0; b.x += Math.sin(b.t * 60) * .6;
      if (b.stT <= 0) { b.st = 'charge'; b.stT = 2.5; }
    } else if (b.st === 'charge') {
      b.vx = b.face * 270 * r;
      if (b.hitWall || b.stT <= 0) {
        b.st = 'stun'; b.stT = 1.1; b.vx = 0; shake = .4; sfx.thud();
        for (let i = 0; i < 5; i++) shoot(rand(30, W - 40), 18, 0, 20, b.atk * .6, 'rock', { grav: 300, w: 8, h: 8 });
      }
    } else if (b.st === 'stun') { b.vx = 0; if (b.stT <= 0) { b.st = 'walk'; b.stT = 1.2; } }
    else if (b.st === 'air') {
      if (b.onGround && b.vy === 0) { b.vx = 0; shock(b, 160 * r); b.st = 'walk'; b.stT = rand(.8, 1.4); }
    } else if (b.st === 'spit') {
      b.vx = 0; b.face = Math.sign(px - bx) || b.face;
      const k = Math.floor((1 - b.stT) / .3);
      if (k >= b.n && b.n < 3) { b.n++; lob(bx + b.face * 16, b.y + 14, px + rand(-40, 40), P.y + P.h, .8, b.atk * .75, 'bile', 500, { w: 8, h: 8 }); sfx.throw(); }
      if (b.stT <= 0) { b.st = 'walk'; b.stT = 1.2; }
    }
    groundPhys(b, dt);
  },
  // Isolde, la Sposa: picchiate, anelli di lacrime, sparizioni
  4(b, dt) {
    const r = b.hp < b.maxhp / 2 ? 1.25 : 1, px = P.x + P.w / 2, py = P.y + P.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
    b.stT -= dt;
    if (b.st === 'float') {
      b.face = Math.sign(px - bx) || 1; floatTo(b, dt, 1.3);
      if (b.stT <= 0) { const q = Math.random(); b.n = 0; if (q < .38) { b.st = 'aim'; b.stT = .5; } else if (q < .72) { b.st = 'ring'; b.stT = r > 1 ? 1.9 : 1.3; } else { b.st = 'tele'; b.stT = .8; b.moved = false; } }
    } else if (b.st === 'aim') {
      b.x += Math.sin(b.t * 50) * .8; b.face = Math.sign(px - bx) || 1;
      if (b.stT <= 0) { const a = Math.atan2(py - by, px - bx); b.vx = Math.cos(a) * 290 * r; b.vy = Math.sin(a) * 290 * r; b.st = 'dive'; b.stT = .95; sfx.magic(); }
    } else if (b.st === 'dive') {
      b.x += b.vx * dt; b.y += b.vy * dt; b.vy -= 520 * dt;
      if (Math.random() < .6) parts.push({ x: bx, y: by, vx: 0, vy: 0, life: .4, max: .4, c: '#cfe0ff', s: 3 });
      if (b.stT <= 0) { b.st = 'float'; b.stT = 1.1; newSpot(b); }
    } else if (b.st === 'ring') {
      const k = Math.floor(((r > 1 ? 1.9 : 1.3) - b.stT) / .6);
      if (k >= b.n && b.n < (r > 1 ? 3 : 2)) { b.n++; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + b.n * .26; shoot(bx, by, Math.cos(a) * 85 * r, Math.sin(a) * 85 * r, b.atk * .7, 'tear', { w: 6, h: 6 }); } sfx.magic(); }
      if (b.stT <= 0) { b.st = 'float'; b.stT = 1; }
    } else if (b.st === 'tele') {
      teleport(b, .8);
      if (b.stT <= 0) { b.st = 'float'; b.stT = .7; b.alpha = 1; b.invuln = false; }
    }
  },
  // Sir Aldric, il Cavaliere: affondo, onde di spada alte/basse, salto con schianto
  5(b, dt) {
    const r = b.hp < b.maxhp / 2 ? 1.3 : 1, px = P.x + P.w / 2, bx = b.x + b.w / 2;
    b.stT -= dt;
    if (b.st === 'walk') {
      b.face = Math.sign(px - bx) || b.face; b.vx = b.face * 55 * r;
      if (b.stT <= 0) {
        const q = Math.random(); b.n = 0; b.vx = 0;
        if (q < .35) { b.st = 'wind'; b.stT = .45; }
        else if (q < .68) { b.st = 'waves'; b.stT = 1.5; }
        else if (b.onGround) { b.vy = -440; b.vx = clamp((px - bx) / 1.0, -230, 230); b.st = 'air'; }
      }
    } else if (b.st === 'wind') { b.vx = 0; if (b.stT <= 0) { b.st = 'dash'; b.stT = .6; sfx.dash(); } }
    else if (b.st === 'dash') {
      b.vx = b.face * 330 * r;
      if (Math.random() < .7) parts.push({ x: bx, y: b.y + rand(4, b.h), vx: 0, vy: 0, life: .3, max: .3, c: '#4a6a9a', s: 3 });
      if (b.hitWall || b.stT <= 0) { b.st = 'rec'; b.stT = .6; b.vx = 0; }
    } else if (b.st === 'rec') { b.vx = 0; if (b.stT <= 0) { b.st = 'walk'; b.stT = 1; } }
    else if (b.st === 'waves') {
      b.vx = 0; b.face = Math.sign(px - bx) || b.face;
      const k = Math.floor((1.5 - b.stT) / .45);
      if (k >= b.n && b.n < (r > 1 ? 3 : 2)) { const y = b.n % 2 ? 196 : 224; b.n++; shoot(bx + b.face * 14, y, b.face * 190 * r, 0, b.atk * .8, 'swave', { w: 12, h: 16, life: 3 }); sfx.swing(); }
      if (b.stT <= 0) { b.st = 'walk'; b.stT = 1.1; }
    } else if (b.st === 'air') {
      if (b.onGround && b.vy === 0) { b.vx = 0; shock(b, 175 * r); b.st = 'walk'; b.stT = rand(.8, 1.3); }
    }
    groundPhys(b, dt);
  },
  // Conte Malachia, il Necromante: due fasi
  6(b, dt) {
    const px = P.x + P.w / 2, py = P.y + P.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
    b.stT -= dt; b.face = Math.sign(px - bx) || 1;
    if (b.phase === 1 && b.hp < b.maxhp / 2) {
      b.phase = 2; b.st = 'trans'; b.stT = 2.2; b.invuln = true; b.alpha = 1; b.tx = W / 2 - b.w / 2; b.ty = 50;
      banner = { text: 'Malachia rivela la sua vera forma!', t: 2.6, boss: true }; sfx.roar(); shake = .7; flashScreen = .8;
      projs = projs.filter(p => !p.hostile);
    }
    const p2 = b.phase === 2;
    if (b.st === 'trans') { floatTo(b, dt, 2); if (b.stT <= 0) { b.invuln = false; b.st = 'float'; b.stT = .8; } }
    else if (b.st === 'float') {
      floatTo(b, dt);
      if (b.stT <= 0) {
        const q = Math.random(); b.n = 0;
        if (!p2) { if (q < .42) { b.st = 'fire'; b.stT = 1.5; } else if (q < .67) { b.st = 'summon'; b.stT = 1.1; } else { b.st = 'tele'; b.stT = .8; b.moved = false; } }
        else { if (q < .22) { b.st = 'fire'; b.stT = 1.5; } else if (q < .5) { b.st = 'spiral'; b.stT = 2.6; b.ang = Math.random() * 6; } else if (q < .78) { b.st = 'pillars'; b.stT = 1.6; } else if (q < .88) { b.st = 'summon'; b.stT = 1.1; } else { b.st = 'tele'; b.stT = .7; b.moved = false; } }
      }
    } else if (b.st === 'fire') {
      const k = Math.floor((1.5 - b.stT) / .45);
      if (k >= b.n && b.n < 3) { b.n++; const a = Math.atan2(py - by, px - bx); for (let i = -3; i <= 3; i++) { const aa = a + i * .18; shoot(bx, by, Math.cos(aa) * (p2 ? 140 : 120), Math.sin(aa) * (p2 ? 140 : 120), b.atk * .7, 'fire'); } sfx.magic(); }
      if (b.stT <= 0) { b.st = 'float'; b.stT = p2 ? .8 : 1.1; newSpot(b); }
    } else if (b.st === 'summon') {
      if (b.n === 0) {
        b.n = 1;
        if (enemies.filter(e => !e.isBoss && !e.dead).length < 3) for (const x of [50, W - 66]) { const e = spawnEnemy('skel', x, 17); burst(x + 5, e.y + 10, 20, '#9a6ad0', 70, .7, 2, -40); }
        sfx.roar();
      }
      if (b.stT <= 0) { b.st = 'float'; b.stT = 1; }
    } else if (b.st === 'spiral') {
      b.acc = (b.acc || 0) + dt;
      while (b.acc > .075) { b.acc -= .075; for (const o of [0, Math.PI]) shoot(bx, by, Math.cos(b.ang + o) * 95, Math.sin(b.ang + o) * 95, b.atk * .6, 'spiral', { w: 6, h: 6 }); b.ang += .23; }
      if (b.stT <= 0) { b.st = 'float'; b.stT = 1; }
    } else if (b.st === 'pillars') {
      if (b.n === 0) {
        b.n = 1;
        const xs = [px, px + rand(70, 130), px - rand(70, 130), rand(40, W - 40)];
        xs.forEach(x => shoot(clamp(x, 24, W - 24), 20, 0, 0, b.atk * .9, 'pillar', { x: clamp(x, 24, W - 24) - 8, y: 16, w: 16, h: 224, warn: .85, life: 1.2, pierce: true }));
        sfx.magic();
      }
      if (b.stT <= 0) { b.st = 'float'; b.stT = .9; }
    } else if (b.st === 'tele') {
      teleport(b, b.stT > 0 && p2 ? .7 : .8);
      if (b.stT <= 0) { b.st = 'float'; b.stT = .6; b.alpha = 1; b.invuln = false; }
    }
  },
};
