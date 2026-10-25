// ===== IL CANE COMPAGNO (dal disegno di Riccardo) =====
// Te lo affidano all'inizio del gioco: ti segue ovunque, non attacca e i nemici lo ignorano.
// Si può tenere o lasciare a casa dal Diario, scheda "Opzioni".
let dog = null;

function placeDog() {
  if (!S.dog || !P) { dog = null; return; }
  const x = clamp(P.x - P.face * 20, 20, W - 40);
  dog = { x, y: P.y + P.h - 16, w: 18, h: 16, vx: 0, vy: 0, face: P.face, t: 0, onGround: false, sit: 0, bark: 0, barkCD: 3 };
}

function warpDog() {
  burst(dog.x + dog.w / 2, dog.y + 7, 8, ['#ece6da', '#5a3a1e'], 50, .4, 2, 0);
  dog.x = clamp(P.x - P.face * 18, 20, W - 40); dog.y = P.y + P.h - dog.h; dog.vx = 0; dog.vy = 0;
  burst(dog.x + dog.w / 2, dog.y + 7, 8, ['#ece6da', '#5a3a1e'], 50, .4, 2, 0);
}

function updateDog(dt) {
  if (!S.dog) { dog = null; return; }
  if (!dog) placeDog();
  const d = dog; d.t += dt;
  const px = P.x + P.w / 2, dx0 = d.x + d.w / 2;
  const target = px - P.face * 22, diff = target - dx0, far = Math.abs(px - dx0);
  // ti raggiunge: corre se sei lontano, cammina se sei vicino, si siede se sei fermo
  if (Math.abs(diff) > 10) { d.vx = approach(d.vx, Math.sign(diff) * (far > 70 ? 150 : 90), 600 * dt); d.face = Math.sign(diff); d.sit = 0; }
  else { d.vx = approach(d.vx, 0, 600 * dt); d.face = Math.sign(px - dx0) || d.face; d.sit += dt; }
  // salta per seguirti sulle travi o oltre gli ostacoli
  const above = (d.y + d.h) - (P.y + P.h);
  if (d.onGround && ((above > 20 && Math.abs(px - dx0) < 70) || (d.hitWall && Math.abs(diff) > 10))) d.vy = -330;
  d.dropping = (P.y + P.h) - (d.y + d.h) > 20 && Math.abs(px - dx0) < 50;
  d.vy = Math.min(d.vy + 930 * dt, 430);
  moveEnt(d, dt);
  // se resta troppo indietro (o cade nel vuoto) ricompare accanto a te
  if (Math.hypot(px - dx0, (P.y - d.y)) > 190 || d.y > H) warpDog();
  // abbaia quando c'è un nemico vicino (solo per avvisarti)
  d.barkCD -= dt; if (d.bark > 0) d.bark -= dt;
  if (d.barkCD <= 0 && enemies.some(e => !e.dead && !e.collapse && Math.hypot(e.x - d.x, e.y - d.y) < 110)) {
    d.bark = .7; d.barkCD = rand(4, 7);
    tone(520, .07, 'square', .05, -120); tone(480, .08, 'square', .05, -140, .12);
  }
}

function drawDog() {
  if (!dog || state === 'title') return;
  const d = dog, K = '#1c120a', BR = '#7a4a26', BRL = '#9a6436', WH = '#f2ece0', RED = '#d83030', GOLD = '#f0d040';
  const run = Math.abs(d.vx) > 15 && d.onGround, f = run ? Math.floor(d.t * 12) % 2 : 0;
  const sitting = d.sit > 1.2 && d.onGround;
  ctx.save();
  ctx.translate(Math.round(d.x + d.w / 2), Math.round(d.y + d.h));
  ctx.scale(d.face * 1.3, 1.3); ctx.translate(0, -14);
  const by = sitting ? 2 : 0;
  // coda che scodinzola
  const wag = Math.sin(d.t * (sitting ? 14 : 8)) > 0 ? -1 : 0;
  R(-12, 3 + wag + by, 3, 2, K); R(-11, 3 + wag + by, 1, 1, BR);
  // zampe a forma di "L" con i piedi in avanti, come nel disegno
  const legs = sitting ? [[-9, 0], [-5, 0], [0, 0], [3, 0]] : [[-9, f], [-5, -f], [0, -f], [3, f]];
  legs.forEach(([lx, o], i) => {
    const back = i < 2 && sitting;
    const ly = back ? 10 : 8 + (o < 0 ? -1 : 0);
    R(lx, ly, 3, 13 - ly, K); R(lx + 1, ly, 1, 12 - ly, BR);
    R(lx, 12, 5, 2, K); R(lx + 1, 12, 3, 1, BRL);
  });
  // corpo marrone
  R(-10, 2 + by, 15, 7 - by, K); R(-9, 3 + by, 13, 5 - by, BR); R(-9, 3 + by, 13, 1, BRL);
  // testa bianca squadrata con orecchio nero, occhio e naso
  const hy = by - 1 + (d.bark > .4 ? -1 : 0);
  R(2, -5 + hy, 9, 9, K); R(3, -4 + hy, 7, 7, WH);
  R(5, -2 + hy, 1, 2, K);
  R(8, 1 + hy, 3, 2, K); R(9, 1 + hy, 1, 1, '#ffffff');
  R(9, -4 + hy, 3, 7, K); R(10, -3 + hy, 1, 5, '#2a2228');
  if (d.bark > .4) R(6, 3 + hy, 3, 1, '#b03a3a');
  // collare rosso con medaglietta gialla
  R(2, 2 + hy, 2, 4, RED); R(1, 5 + hy, 2, 2, GOLD);
  ctx.restore();
  if (d.bark > 0) text('Bau!', d.x + d.w / 2 + d.face * 6, d.y - 14, '#e8dfcf', 'center');
}

// ----- Scheda "Opzioni" del Diario -----
let optSel = 0;
function updateOptMenu() {
  if (hit('up') || hit('down')) optSel = 1 - optSel;
  if (['KeyX', 'KeyJ', 'KeyZ', 'Space', 'GP_jump', 'GP_attack'].some(k => pressed[k])) {
    if (optSel === 0) { S.dog = !S.dog; if (S.dog) placeDog(); else dog = null; persist(); sfx.pick(); }
    else toggleMute();
  }
}
function drawOptMenu() {
  panel(16, 40, 448, 168);
  text('OPZIONI', 26, 48, '#c9a24a');
  const rows = [['Cane compagno', S.dog ? 'Con te' : 'Rimasto a casa'], ['Audio', muted ? 'Disattivato' : 'Attivo']];
  rows.forEach(([k, v], i) => {
    const y = 66 + i * 16, sel = i === optSel;
    if (sel) { ctx.fillStyle = 'rgba(201,162,74,.18)'; ctx.fillRect(22, y - 3, 436, 13); }
    text(k, 30, y, sel ? '#fff2b0' : '#d8d0e0');
    text(v, 450, y, '#c8c0d0', 'right');
  });
  text('Il cane ti segue, abbaia quando sente un nemico', 30, 112, '#8a8098');
  text('vicino e non può essere ferito.', 30, 124, '#8a8098');
  text('Su/Giù scegli · X o pulsante Salta per cambiare · Sinistra/Destra cambia scheda', W / 2, 232, '#7a7088', 'center');
}
