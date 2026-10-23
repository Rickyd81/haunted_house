// ===== SPRITE pixel art disegnati via codice =====
let FL = false; // lampeggio bianco quando colpiti
function R(x, y, w, h, c) { ctx.fillStyle = FL ? '#ffffff' : c; ctx.fillRect(x, y, w, h); }

function drawPlayer() {
  const p = P;
  if (p.inv > 0 && p.dashT <= 0 && Math.floor(p.inv * 20) % 2) return;
  const run = p.onGround && Math.abs(p.vx) > 15, f = run ? Math.floor(p.animT * 10) % 4 : 0;
  const bob = run && (f === 1 || f === 3) ? 1 : 0;
  ctx.save();
  ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y) + bob);
  ctx.scale(p.face, 1);
  if (p.dashT > 0) ctx.globalAlpha = .75;
  // Eroe: ragazzo dai capelli castani, tunica verde, faretra sulla schiena
  const SKIN = '#e8b48a', SKD = '#c98e66', HAIR = '#3a2416', HAIRL = '#5a3a22', TUN = '#3f7a2a', TUNL = '#5a9a3a', TUND = '#2c5a1e',
    LEA = '#7a4a24', LEAD = '#5a3418', PANT = '#26345a', PANTL = '#34467a', BOOT = '#7a4422', BOOTL = '#9a5a2a';
  // faretra con frecce (dietro)
  R(-8, 5, 3, 9, LEA); R(-8, 5, 3, 1, LEAD); R(-7, 6, 1, 7, '#8a5a2c');
  R(-8, 2, 1, 3, '#cfc6b0'); R(-6, 1, 1, 4, '#cfc6b0'); R(-9, 1, 2, 2, '#8a8a90'); R(-7, 0, 2, 2, '#8a8a90');
  // gambe e stivali
  const l1 = run ? [0, 1, 0, -1][f] : 0;
  if (!p.onGround) { R(-4, 16, 3, 3, PANT); R(1, 15, 3, 3, PANT); R(-4, 18, 4, 3, BOOT); R(1, 17, 4, 3, BOOT); R(-4, 18, 4, 1, BOOTL); R(1, 17, 4, 1, BOOTL); }
  else {
    R(-4 + l1, 16, 3, 3, PANT); R(1 - l1, 16, 3, 3, PANT); R(-4 + l1, 16, 1, 3, PANTL);
    R(-4 + l1, 19, 4, 3, BOOT); R(1 - l1, 19, 4, 3, BOOT); R(-4 + l1, 19, 4, 1, BOOTL); R(1 - l1, 19, 4, 1, BOOTL);
  }
  // tunica verde con lacci
  R(-5, 8, 10, 8, TUN); R(-5, 8, 2, 8, TUNL); R(-5, 15, 10, 1, TUND); R(-4, 16, 2, 1, TUND); R(2, 16, 2, 1, TUND);
  R(1, 9, 1, 1, LEAD); R(2, 10, 1, 1, LEAD); R(1, 11, 1, 1, LEAD);
  // tracolla in diagonale e cintura con fibbia d'oro
  for (let i = 0; i < 7; i++) R(-4 + i, 8 + i, 2, 1, LEA);
  R(-5, 13, 10, 2, LEAD); R(0, 13, 2, 2, '#d4a83a'); R(-4, 15, 2, 2, LEA);
  // testa grande con sorriso
  R(-4, 1, 9, 7, SKIN); R(-4, 7, 9, 1, SKD); R(-4, 3, 1, 2, SKD);
  R(1, 3, 1, 2, '#1a0f0a'); R(3, 3, 1, 2, '#1a0f0a');
  R(0, 5, 5, 1, '#6a2a1a'); R(1, 5, 3, 1, '#ffffff'); R(1, 6, 3, 1, '#8a3a2a'); R(-1, 4, 1, 1, '#e89a80'); R(4, 4, 1, 1, '#e89a80');
  // capelli arruffati
  R(-5, -1, 10, 3, HAIR); R(-5, 2, 2, 2, HAIR); R(-6, 0, 2, 2, HAIR); R(-3, -3, 2, 2, HAIR); R(0, -3, 3, 2, HAIR); R(4, -2, 2, 2, HAIR);
  R(-1, -2, 2, 1, HAIRL); R(2, 0, 2, 1, HAIRL); R(3, 1, 2, 1, HAIR);
  // braccio con bracciale di cuoio
  if (p.atkT <= 0) { R(2, 9, 3, 3, TUN); R(2, 11, 3, 2, LEA); R(3, 13, 2, 2, SKIN); }
  ctx.restore();
  drawWeapon();
}

function drawWeapon() {
  const w = WEAPONS[S.weapon], p = P;
  if (p.inv > 0 && p.dashT <= 0 && Math.floor(p.inv * 20) % 2) return;
  ctx.save();
  ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y + 11));
  ctx.scale(p.face, 1);
  const atk = p.atkT > 0, prog = atk ? 1 - p.atkT / p.atkDur : 0;
  const blade = (len) => {
    if (S.weapon === 'axe') { R(0, -1, len, 2, w.hilt); R(len - 6, -6, 6, 9, w.blade); R(len - 6, -6, 1, 9, '#e0e6ec'); }
    else if (S.weapon === 'hammer') { R(0, -1, len, 2, w.hilt); R(len - 5, -6, 7, 12, w.blade); R(len - 5, -6, 2, 12, '#fff0b0'); }
    else if (S.weapon === 'scythe') { R(0, -1, len, 2, w.hilt); R(len - 1, -1, 2, 3, '#5a5a62'); R(len - 12, 1, 12, 2, w.blade); R(len - 16, 3, 6, 2, w.blade); R(len - 12, 1, 12, 1, '#e8eef4'); }
    else { R(0, -1, 3, 3, w.hilt); R(3, -3, 2, 6, '#c9a24a'); R(5, -1, len, 2, w.blade); R(5, -1, len, 1, '#ffffff'); R(5 + len, 0, 2, 1, w.blade); }
    if (w.fire) { // lama ardente: fiamme animate lungo il filo
      for (let i = 6; i < len + 4; i += 2) {
        const h = 2 + Math.floor((Math.sin(gameT * 18 + i * 1.7) + 1) * 1.5);
        R(i, -1 - h, 2, h, i % 4 ? '#ff7a1a' : '#ffb03a');
        if (h > 3) R(i, -1 - h, 1, 1, '#fff0a0');
      }
      R(6, -2, len - 1, 1, '#ffd060');
    }
  };
  if (!atk) {
    if (w.type === 'ranged') { R(0, 1, 10, 3, w.hilt); R(8, -3, 2, 10, '#8a8f98'); }
    else if (w.type === 'whip') { for (let i = 0; i < 6; i++) R(1 + (i % 2), 2 + i * 2, 2, 2, w.blade); R(0, 0, 3, 3, w.hilt); }
    else if (w.type === 'thrust') { ctx.rotate(-1.2); R(-10, -1, w.len, 2, w.hilt); R(w.len - 10, -2, 6, 4, w.blade); }
    else { ctx.rotate(2.0); blade(Math.round(w.len * .7)); }
  } else if (w.type === 'ranged') {
    R(0, -1, 12, 3, w.hilt); R(10, -6, 2, 12, '#8a8f98'); R(10, -6, 1, 12, '#c0c8d0');
  } else if (w.type === 'thrust') {
    const off = Math.sin(prog * Math.PI) * 16 - 4;
    R(off - 6, -1, w.len, 2, w.hilt); R(off + w.len - 6, -3, 7, 6, w.blade); R(off + w.len - 6, -3, 7, 1, '#ffffff');
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(Math.round(off + 6), -1, w.len - 6, 1);
  } else if (w.type === 'whip') {
    const ext = Math.min(1, prog * 2.2) * w.reach;
    for (let x = 2; x < ext; x += 3) R(x, Math.round(Math.sin(x * .25 + prog * 10) * 2 * (1 - x / w.reach)) - 1, 3, 2, (x / 3) % 2 ? w.blade : '#c0c4cc');
    if (ext > 10) R(ext - 2, -3, 5, 5, '#6a6f78');
    R(0, -1, 3, 3, w.hilt);
  } else {
    const [a0, a1] = w.type === 'arc' ? [-2.7, 1.3] : w.type === 'heavy' ? [-2.3, 1.2] : [-1.9, 1.0];
    const e = 1 - Math.pow(1 - prog, 3), a = a0 + (a1 - a0) * e, len = w.len + 4;
    ctx.strokeStyle = S.weapon === 'dusk' ? 'rgba(255,220,140,.55)' : w.fire ? 'rgba(255,130,40,.6)' : 'rgba(230,236,255,.45)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, len, Math.max(a0, a - 1.4), a); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(0, 0, len + 2, Math.max(a0, a - .7), a); ctx.stroke();
    ctx.rotate(a); blade(w.len);
  }
  ctx.restore();
}

function drawEnemy(e) {
  if (e.isBoss) return drawBoss(e);
  FL = e.flash > 0;
  ctx.save();
  ctx.translate(Math.round(e.x + e.w / 2), Math.round(e.y));
  ctx.scale(e.face, 1);
  const moving = Math.abs(e.vx) > 5, s = moving ? Math.round(Math.sin(e.t * 12) * 1.5) : 0;
  const B = '#ddd5c0', D = '#9d957f', K = '#120d10';
  switch (e.type) {
    case 'skel': case 'archer':
      R(-4, 0, 8, 7, B); R(-3, 7, 6, 1, D); R(-3, 2, 2, 2, K); R(1, 2, 2, 2, K); R(2, 2, 1, 1, '#ff3a3a'); R(0, 5, 1, 1, K);
      R(-1, 8, 2, 7, B); R(-3, 9, 6, 1, B); R(-3, 11, 6, 1, B); R(-2, 13, 4, 1, B); R(-3, 15, 6, 2, D);
      R(-3 + s, 17, 2, 5, B); R(1 - s, 17, 2, 5, B);
      R(-5, 9, 2, 6, D);
      if (e.type === 'skel') { R(3, 9, 2, 5, B); R(5, 3, 1, 9, '#9a948c'); R(4, 11, 3, 1, '#5a3a26'); }
      else { R(3, 9, 2, 3, B); R(5, 3, 1, 14, '#6a4a2a'); R(6, 2, 1, 2, '#6a4a2a'); R(6, 17, 1, 2, '#6a4a2a'); R(4, 4, 1, 12, '#bbbbbb'); }
      break;
    case 'zomb':
      R(-4, 0, 8, 7, '#7d9364'); R(-4, 0, 8, 2, '#2b2a22'); R(1, 3, 2, 1, '#e8e070'); R(-2, 3, 1, 1, '#e8e070'); R(0, 5, 3, 1, '#2a1a1a');
      R(-4, 7, 8, 9, '#3d3350'); R(-2, 11, 2, 3, '#7d9364'); R(-4, 15, 8, 1, '#2a2238');
      R(1, 8, 8, 2, '#7d9364'); R(1, 10, 7, 2, '#56693f');
      R(-3 + s, 16, 3, 6, '#2a2238'); R(1 - s, 16, 3, 6, '#2a2238'); R(-3 + s, 21, 3, 1, '#56693f');
      break;
    case 'bat': {
      if (e.st === 'hang') { R(-2, 0, 4, 2, '#2a1f33'); R(-3, 2, 6, 5, '#2a1f33'); R(-1, 5, 1, 1, '#ff3a3a'); R(1, 5, 1, 1, '#ff3a3a'); break; }
      const up = Math.sin(e.t * 22) > 0;
      R(-2, 1, 4, 5, '#3a2a48'); R(-2, 0, 1, 1, '#3a2a48'); R(1, 0, 1, 1, '#3a2a48'); R(-1, 2, 1, 1, '#ff3a3a'); R(1, 2, 1, 1, '#ff3a3a');
      if (up) { R(-6, 0, 4, 2, '#2a1f33'); R(-8, -2, 2, 3, '#2a1f33'); R(2, 0, 4, 2, '#2a1f33'); R(6, -2, 2, 3, '#2a1f33'); }
      else { R(-6, 3, 4, 2, '#2a1f33'); R(-8, 5, 2, 2, '#2a1f33'); R(2, 3, 4, 2, '#2a1f33'); R(6, 5, 2, 2, '#2a1f33'); }
      break;
    }
    case 'ghost': {
      ctx.globalAlpha = .55 + .25 * Math.sin(e.t * 3);
      const fr = Math.floor(e.t * 6) % 2;
      R(-5, 2, 10, 10, '#cfe0f5'); R(-4, 0, 8, 2, '#cfe0f5');
      for (let i = 0; i < 5; i++) R(-5 + i * 2, 12, 2, 2 + ((i + fr) % 2) * 2, '#cfe0f5');
      R(-3, 4, 2, 3, '#1b1530'); R(1, 4, 2, 3, '#1b1530'); R(-1, 8, 2, 2, '#1b1530');
      R(-7, 6, 2, 4, '#b0c8e8'); R(5, 5, 2, 4, '#b0c8e8');
      break;
    }
    case 'armor': {
      const lunge = e.lunge > 0;
      R(-8, 9, 4, 10, '#4b3a2a'); R(-7, 12, 2, 3, '#c9a24a');
      R(-5, 0, 10, 8, '#707a87'); R(-1, -3, 2, 3, '#7a1422'); R(-4, 4, 8, 1, '#000'); R(1, 4, 2, 1, '#ff5a3a'); R(-4, 0, 2, 7, '#9aa4b1');
      R(-6, 8, 12, 9, '#707a87'); R(-5, 9, 3, 7, '#9aa4b1'); R(-6, 16, 12, 1, '#3e444e');
      R(-5 + s, 17, 4, 7, '#3e444e'); R(1 - s, 17, 4, 7, '#3e444e');
      if (lunge) { R(4, 11, 3, 3, '#707a87'); R(7, 12, 16, 2, '#b8c0cc'); R(7, 12, 16, 1, '#ffffff'); }
      else { R(5, 9, 3, 5, '#707a87'); R(6, -2, 2, 14, '#b8c0cc'); R(5, 11, 4, 1, '#5a4a2a'); }
      break;
    }
  }
  ctx.restore(); FL = false;
}

function drawBoss(b) {
  FL = b.flash > 0 || (b.dying && Math.floor(b.dying * 12) % 2 === 0);
  ctx.save();
  ctx.globalAlpha = b.alpha ?? 1;
  const sc = b.id === 6 && b.phase === 2 ? 1.3 : 1;
  ctx.translate(Math.round(b.x + b.w / 2), Math.round(b.y + b.h));
  ctx.scale(b.face * sc, sc);
  ctx.translate(0, -b.h);
  const t = b.t, B = '#ddd5c0', D = '#9d957f', K = '#120d10';
  if (b.fly) { ctx.fillStyle = 'rgba(150,90,220,.12)'; ctx.beginPath(); ctx.ellipse(0, b.h / 2, b.w, b.h * .7, 0, 0, 7); ctx.fill(); }
  switch (b.id) {
    case 1: { // Ossian
      const s = Math.abs(b.vx) > 5 ? Math.round(Math.sin(t * 10) * 2) : 0, ch = b.st === 'charge' || b.st === 'wind';
      R(-11, 26, 6, 14, '#15121a');
      R(-5 + s, 30, 4, 12, '#1a1a22'); R(1 - s, 30, 4, 12, '#1a1a22'); R(-6 + s, 42, 6, 2, '#050505'); R(0 - s, 42, 6, 2, '#050505');
      R(-8, 12, 16, 19, '#15121a'); R(-3, 12, 6, 13, '#e8e2d4'); R(-3, 12, 6, 2, '#9b1b2a'); R(-8, 12, 3, 15, '#24202c'); R(5, 12, 3, 15, '#24202c');
      R(-1, 16, 2, 1, '#c9a24a'); R(-1, 20, 2, 1, '#c9a24a');
      R(-6, 0, 12, 10, B); R(-5, 10, 10, 2, D); R(-4, 3, 3, 3, K); R(1, 3, 3, 3, K); R(2, 4, 1, 1, '#ffcf4a'); R(-3, 4, 1, 1, '#ffcf4a'); R(-1, 7, 2, 1, K);
      for (let i = -4; i < 5; i += 2) R(i, 10, 1, 1, K);
      R(-11, 13, 3, 13, '#15121a'); R(-11, 25, 3, 3, '#f0f0f0');
      if (ch) { R(7, 14, 4, 4, '#15121a'); R(10, 8, 3, 18, '#c8ccd4'); R(10, 8, 1, 18, '#ffffff'); R(9, 15, 3, 3, '#f0f0f0'); }
      else { R(8, 13, 3, 8, '#15121a'); R(8, 21, 12, 2, '#c8ccd4'); R(9, 19, 3, 3, '#f0f0f0'); R(13, 17, 5, 4, '#c8ccd4'); R(14, 16, 3, 1, '#c8ccd4'); }
      break;
    }
    case 2: { // Morwen
      const fr = Math.floor(t * 5) % 2;
      R(-2, -13, 3, 3, '#3a1f4f'); R(-3, -10, 5, 4, '#3a1f4f'); R(-5, -6, 9, 4, '#3a1f4f'); R(-9, -2, 18, 2, '#24132f');
      R(-7, 0, 14, 10, '#3a1f4f'); R(-4, 3, 8, 7, '#0c0610'); R(-3, 5, 2, 1, '#7dff8a'); R(1, 5, 2, 1, '#7dff8a');
      R(-8, 10, 16, 14, '#3a1f4f'); R(-10, 22, 20, 8, '#24132f'); R(-1, 10, 2, 14, '#5a3a6f');
      for (let i = 0; i < 5; i++) R(-10 + i * 4, 30, 3, 3 + ((i + fr) % 2) * 3, '#24132f');
      R(7, 14, 4, 3, '#b9c7a3'); R(-10, 15, 3, 3, '#b9c7a3');
      const by = Math.round(Math.sin(t * 3) * 2);
      R(11, 6 + by, 9, 7, '#6b2a1a'); R(12, 7 + by, 7, 5, '#e0d4b0'); R(15, 7 + by, 1, 5, '#6b2a1a');
      ctx.fillStyle = 'rgba(125,255,138,.25)'; ctx.fillRect(10, 4 + by, 11, 11);
      break;
    }
    case 3: { // Gorvath
      const s = Math.abs(b.vx) > 5 ? Math.round(Math.sin(t * 9) * 2) : 0, sk = '#6d7a5e', dk = '#454f3a', hi = '#8d9a78';
      R(-14 + s, 26, 7, 8, dk); R(-2 - s, 26, 7, 8, dk);
      R(-17, 8, 30, 19, sk); R(-15, 3, 20, 8, sk); R(-15, 8, 26, 2, hi);
      R(-12, 0, 2, 4, B); R(-6, -1, 2, 4, B); R(0, 0, 2, 4, B);
      R(8, 9, 14, 12, sk); R(12, 15, 10, 6, '#2a0a0a'); for (let i = 13; i < 22; i += 3) { R(i, 15, 1, 2, B); R(i + 1, 19, 1, 2, B); }
      R(15, 11, 3, 2, '#ffde4a'); R(16, 11, 1, 1, '#000');
      const arm = b.st === 'charge' ? -4 : 0;
      R(10, 19 + arm, 6, 13, dk); R(13, 31 + arm, 7, 3, B); R(-18, 14, 5, 14, dk); R(-19, 27, 6, 3, B);
      R(-10, 12, 4, 3, '#4a3a2a'); R(-2, 18, 5, 2, '#4a3a2a');
      break;
    }
    case 4: { // Isolde
      ctx.globalAlpha = (b.alpha ?? 1) * (.7 + .15 * Math.sin(t * 2.5));
      const fr = Math.floor(t * 4) % 2;
      R(-11, 2, 4, 26, 'rgba(232,238,248,.6)');
      R(-6, 1, 12, 4, '#141018'); R(-7, 4, 3, 18, '#141018'); R(4, 4, 3, 15, '#141018');
      R(-5, 3, 10, 9, '#cdd8e8'); R(-3, 6, 2, 2, '#1a1030'); R(1, 6, 2, 2, '#1a1030'); R(-3, 8, 1, 4, '#6a7aa0'); R(1, 8, 1, 3, '#6a7aa0'); R(-1, 10, 2, 1, '#3a2a40');
      R(-7, -1, 14, 3, '#e8eef8'); R(-2, -3, 4, 2, '#c9c0d8');
      R(-7, 12, 14, 14, '#d6deea'); R(-7, 12, 14, 2, '#ffffff'); R(-10, 26, 20, 10, '#d6deea');
      for (let i = 0; i < 5; i++) R(-10 + i * 4, 36, 3, 2 + ((i + fr) % 2) * 3, '#d6deea');
      R(3, 16, 6, 6, '#5a4a3a'); R(4, 14, 2, 2, '#7a2a3a'); R(7, 15, 2, 2, '#5a1a2a');
      break;
    }
    case 5: { // Aldric
      const s = Math.abs(b.vx) > 5 ? Math.round(Math.sin(t * 10) * 2) : 0, ar = '#2b2f3a', hi = '#4b5262', tr = '#8a7a4a';
      const cs = Math.round(Math.sin(t * 4) * 1.5);
      R(-12 - cs, 10, 7, 30, '#3a0f17'); R(-13 - cs, 36, 3, 6, '#3a0f17'); R(-8 - cs, 38, 3, 5, '#3a0f17');
      R(-6 + s, 26, 5, 16, ar); R(1 - s, 26, 5, 16, ar); R(-7 + s, 41, 7, 3, '#15171c'); R(0 - s, 41, 7, 3, '#15171c');
      R(-8, 11, 16, 16, ar); R(-8, 11, 16, 1, tr); R(-6, 13, 3, 11, hi); R(-8, 25, 16, 2, tr);
      R(-6, 0, 12, 11, ar); R(-5, 1, 3, 9, hi); R(-8, -3, 2, 6, '#ccc5b0'); R(6, -3, 2, 6, '#ccc5b0'); R(-4, 5, 10, 2, '#000'); R(1, 5, 4, 1, '#6ad0ff');
      if (b.st === 'dash' || b.st === 'wind') { R(6, 15, 4, 4, ar); R(9, 16, 26, 3, '#aab4c4'); R(9, 16, 26, 1, '#ffffff'); R(8, 14, 2, 7, tr); }
      else { R(7, 14, 4, 6, ar); R(9, -10, 3, 26, '#aab4c4'); R(9, -10, 1, 26, '#ffffff'); R(6, 15, 9, 2, tr); R(9, 17, 3, 4, '#3a2a1a'); }
      break;
    }
    case 6: { // Malachia
      const fr = Math.floor(t * 4) % 2, gold = '#c9a24a';
      R(-12, 30, 24, 16, '#1a0d14'); for (let i = 0; i < 6; i++) R(-12 + i * 4, 46, 3, 1 + ((i + fr) % 2) * 3, '#1a0d14');
      R(-9, 12, 18, 22, '#1a0d14'); R(-1, 12, 2, 32, gold); R(-9, 8, 18, 5, '#7a1020'); R(-11, 5, 4, 8, '#7a1020'); R(7, 5, 4, 8, '#7a1020');
      R(-5, 0, 10, 10, '#e6dcc8'); R(-3, 3, 2, 3, '#000'); R(1, 3, 2, 3, '#000'); R(1, 4, 2, 1, '#ff3050'); R(-3, 4, 2, 1, '#ff3050'); R(-1, 7, 2, 1, '#000'); R(-3, 9, 6, 1, '#000');
      R(-6, -3, 12, 3, gold); R(-6, -6, 2, 3, gold); R(-1, -7, 2, 4, gold); R(4, -6, 2, 3, gold); R(-1, -2, 2, 1, '#ff3050');
      R(9, 18, 4, 3, '#e6dcc8'); R(12, -6, 2, 46, '#4a3020');
      const glow = .6 + .4 * Math.sin(t * 6);
      R(10, -12, 6, 6, '#5aff9a'); ctx.fillStyle = `rgba(90,255,154,${.25 * glow})`; ctx.fillRect(7, -15, 12, 12);
      if (b.phase === 2) { R(-15, 14, 4, 2, '#7a1020'); R(11, 14, 4, 2, '#7a1020'); ctx.fillStyle = 'rgba(255,40,80,.15)'; ctx.fillRect(-14, -8, 28, 56); }
      break;
    }
  }
  ctx.restore(); FL = false;
}

function drawProj(p) {
  const x = Math.round(p.x), y = Math.round(p.y);
  ctx.save();
  switch (p.kind) {
    case 'bolt': R(x, y + 1, 9, 1, '#c0c8d0'); R(p.vx > 0 ? x + 7 : x, y, 2, 3, '#ffffff'); R(p.vx > 0 ? x : x + 7, y, 2, 3, '#7a5a3a'); break;
    case 'wave': ctx.globalAlpha = Math.min(1, p.life * 4) * .8; ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + (p.vx > 0 ? -6 : 16), y + 11, 14, p.vx > 0 ? -1 : Math.PI - 1, p.vx > 0 ? 1 : Math.PI + 1); ctx.stroke(); break;
    case 'plate': { const f = Math.floor(gameT * 16) % 2; R(x, y + (f ? 1 : 0), 10, f ? 4 : 6, '#e8e8f0'); R(x + 2, y + 2, 6, 1, '#b0b4c0'); break; }
    case 'bone': R(x, y + 2, 6, 2, '#ddd5c0'); R(x, y + 1, 2, 4, '#ddd5c0'); R(x + 4, y + 1, 2, 4, '#ddd5c0'); break;
    case 'orb': case 'spiral': case 'fire': case 'tear': {
      const col = { orb: ['#b07aff', '#f0e0ff'], spiral: ['#ff4a8a', '#ffd0e0'], fire: ['#ff6a1a', '#ffe08a'], tear: ['#8ab0ff', '#e8f0ff'] }[p.kind];
      const cx = x + p.w / 2, cy = y + p.h / 2, r = p.w / 2 + 1;
      ctx.fillStyle = col[0]; ctx.globalAlpha = .35; ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, 7); ctx.fill();
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
      ctx.fillStyle = col[1]; ctx.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 2, 2); break;
    }
    case 'book': R(x, y, 10, 8, '#5a1a1a'); R(x + 1, y + 1, 8, 6, '#e0d4b0'); R(x + 4, y, 2, 8, '#5a1a1a'); break;
    case 'bile': R(x + 1, y, 6, 8, '#7aa02a'); R(x, y + 2, 8, 4, '#7aa02a'); R(x + 2, y + 2, 2, 2, '#c8f08a'); break;
    case 'rock': R(x, y + 1, 8, 6, '#5a5a52'); R(x + 1, y, 6, 8, '#5a5a52'); R(x + 1, y + 1, 3, 2, '#8a8a80'); break;
    case 'shock': { const f = Math.floor(gameT * 20) % 2; R(x, y + 6, 12, 6, '#8a7a6a'); R(x + 2, y + (f ? 0 : 2), 3, 6, '#c8b8a0'); R(x + 7, y + (f ? 2 : 0), 3, 6, '#c8b8a0'); break; }
    case 'swave': ctx.globalAlpha = .85; ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + (p.vx > 0 ? 0 : 12), y + 8, 10, p.vx > 0 ? -1.2 : Math.PI - 1.2, p.vx > 0 ? 1.2 : Math.PI + 1.2); ctx.stroke(); break;
    case 'pillar':
      if (p.warn > 0) { ctx.fillStyle = `rgba(200,80,255,${.25 + .25 * Math.sin(gameT * 30)})`; ctx.fillRect(x + 6, 16, 4, 224); }
      else { ctx.fillStyle = 'rgba(220,140,255,.9)'; ctx.fillRect(x, 16, 16, 224); ctx.fillStyle = '#ffffff'; for (let yy = 16; yy < 240; yy += 8) ctx.fillRect(x + 6 + Math.round(Math.sin(yy + gameT * 40) * 3), yy, 3, 8); }
      break;
  }
  ctx.restore();
}

function drawItemIcon(id, x, y) {
  x = Math.round(x); y = Math.round(y);
  const w = ITEMS[id] && ITEMS[id].weapon;
  if (w) {
    const c = WEAPONS[w];
    ctx.save(); ctx.translate(x + 6, y + 7); ctx.rotate(-.8);
    if (w === 'xbow') { R(-6, -1, 12, 3, c.hilt); R(3, -6, 2, 12, '#8a8f98'); }
    else if (w === 'spear') { R(-9, -1, 16, 2, c.hilt); R(6, -2, 5, 4, c.blade); }
    else if (w === 'axe') { R(-7, -1, 14, 2, c.hilt); R(3, -5, 5, 9, c.blade); }
    else if (w === 'scythe') { R(-8, -1, 16, 2, c.hilt); R(-2, 1, 10, 2, c.blade); R(-5, 3, 5, 2, c.blade); }
    else { R(-7, -1, 14, 2, c.blade); R(-8, -2, 2, 4, c.hilt); }
    ctx.restore();
  } else if (id === 'hpup') { R(x + 1, y + 2, 4, 4, '#c0142a'); R(x + 7, y + 2, 4, 4, '#c0142a'); R(x, y + 3, 12, 4, '#c0142a'); R(x + 2, y + 7, 8, 3, '#c0142a'); R(x + 4, y + 10, 4, 2, '#c0142a'); R(x + 2, y + 3, 2, 2, '#ff8a9a'); }
  else if (id === 'forup') { R(x + 4, y, 4, 3, '#8a7a5a'); R(x + 3, y + 3, 6, 2, '#ddd'); R(x + 2, y + 5, 8, 8, '#a0142a'); R(x + 3, y + 6, 2, 3, '#ff6a7a'); }
  else if (id === 'difup') { R(x + 1, y, 10, 9, '#6a7480'); R(x + 3, y + 9, 6, 2, '#6a7480'); R(x + 5, y + 11, 2, 2, '#6a7480'); R(x + 5, y + 2, 2, 6, '#c9a24a'); R(x + 3, y + 4, 6, 2, '#c9a24a'); }
  else if (id === 'flask') { R(x + 4, y, 4, 3, '#8a7a5a'); R(x + 3, y + 3, 6, 2, '#ddd'); R(x + 2, y + 5, 8, 8, '#2a6ad0'); R(x + 3, y + 6, 2, 3, '#9ac8ff'); }
}

function drawPickup(k) {
  if (k.kind === 'heart') {
    if (k.life < 2 && Math.floor(k.life * 10) % 2) return;
    const x = Math.round(k.x), y = Math.round(k.y);
    R(x, y + 1, 3, 3, '#e02040'); R(x + 4, y + 1, 3, 3, '#e02040'); R(x, y + 2, 7, 3, '#e02040'); R(x + 1, y + 5, 5, 1, '#e02040'); R(x + 2, y + 6, 3, 1, '#e02040'); R(x + 1, y + 2, 1, 1, '#ff9ab0');
  } else {
    const by = Math.sin(gameT * 3) * 2;
    ctx.fillStyle = 'rgba(255,220,120,.22)'; ctx.beginPath(); ctx.arc(k.x + 6, k.y + 7 + by, 11 + Math.sin(gameT * 5), 0, 7); ctx.fill();
    drawItemIcon(k.item, k.x, k.y + by);
  }
}
