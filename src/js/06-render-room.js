// ===== RENDER: stanza (cache), arredi gotici =====
function archPath(g, x0, x1, top, bottom) {
  const spring = top + (x1 - x0) * .55;
  g.beginPath(); g.moveTo(x0, bottom); g.lineTo(x0, spring);
  g.quadraticCurveTo(x0, top + 6, (x0 + x1) / 2, top);
  g.quadraticCurveTo(x1, top + 6, x1, spring);
  g.lineTo(x1, bottom); g.closePath();
}
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
  if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1);
}

function renderRoom(r) {
  const c = r.cache || (r.cache = document.createElement('canvas'));
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const ar = AREAS[r.def.a], rng = mulberry32(hashStr(r.key) + 7);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  R(0, 0, W, H, ar.bg);
  for (let y = 0; y < H; y += 8) {
    const off = (y / 8) % 2 ? 8 : 0;
    for (let x = -off; x < W; x += 16) { const n = rng(); R(x + 1, y + 1, 14, 6, n < .12 ? ar.brickHi : n > .95 ? ar.recess : ar.brick); }
  }
  // nicchie ad arco acuto e arredi
  for (const d of r.decor) {
    archPath(g, d.x0, d.x1, 36, 240); g.fillStyle = ar.recess; g.fill();
    g.strokeStyle = ar.pillarHi; g.lineWidth = 2; g.stroke();
    drawDecor(g, d, ar, R);
  }
  // pilastri
  for (let i = 0; i <= 5; i++) {
    const x = i * 96;
    R(x - 7, 16, 14, 224, ar.pillar); R(x - 7, 16, 3, 224, ar.pillarHi); R(x + 5, 16, 2, 224, ar.recess);
    R(x - 9, 28, 18, 4, ar.pillarHi); R(x - 8, 32, 16, 2, ar.recess);
    R(x - 9, 230, 18, 10, ar.pillarHi); R(x - 9, 230, 18, 2, shade(ar.pillarHi, .15));
  }
  // catene
  for (const ch of r.chains) {
    for (let y = 16; y < 16 + ch.len; y += 4) R(ch.x + ((y / 4) % 2 ? 0 : 1), y, 2, 3, '#3a3438');
    R(ch.x - 2, 16 + ch.len, 6, 2, '#4a4448'); R(ch.x + 2, 18 + ch.len, 2, 4, '#4a4448');
  }
  // ragnatele
  g.strokeStyle = 'rgba(210,205,220,.22)'; g.lineWidth = 1;
  const web = (cx, cy, sx) => {
    for (let i = 0; i < 5; i++) { const a = i / 4 * Math.PI / 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + sx * Math.cos(a) * 34, cy + Math.sin(a) * 34); g.stroke(); }
    for (let k = 1; k <= 3; k++) { g.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 4 * Math.PI / 2, rr = k * 10 + (i % 2) * 2; const px = cx + sx * Math.cos(a) * rr, py = cy + Math.sin(a) * rr; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  };
  if (r.cob[0]) web(16, 16, 1);
  if (r.cob[1]) web(W - 16, 16, -1);
  // supporti delle luci
  for (const l of r.lights) {
    if (l.kind === 'sconce') { R(l.x - 4, 118, 8, 2, '#2a2228'); R(l.x - 1, 118, 2, 6, '#2a2228'); R(l.x - 2, 111, 4, 7, '#e8dcc0'); R(l.x - 3, 117, 6, 2, '#5a4a3a'); }
    if (l.kind === 'cand') {
      const gy = l.gy, x = l.x;
      R(x - 1, gy - 24, 2, 24, '#3a3036'); R(x - 5, gy - 3, 10, 3, '#3a3036'); R(x - 8, gy - 24, 16, 2, '#3a3036');
      R(x - 8, gy - 28, 2, 5, '#e8dcc0'); R(x - 1, gy - 31, 2, 7, '#e8dcc0'); R(x + 6, gy - 28, 2, 5, '#e8dcc0');
    }
  }
  // altare
  if (r.def.altar) {
    R(ALT_X - 2, 219, 24, 4, ar.stoneHi); R(ALT_X, 223, 20, 17, ar.stone); R(ALT_X + 2, 223, 3, 17, ar.stoneHi);
    R(ALT_X + 9, 226, 2, 10, '#7ab8ff'); R(ALT_X + 6, 229, 8, 2, '#7ab8ff');
  }
  // piedistallo oggetto
  if (r.def.item) { const ix = itemX(r.def), gy = groundYT(r, ix + 6); R(ix - 4, gy - 8, 20, 8, ar.stone); R(ix - 6, gy - 10, 24, 3, ar.stoneHi); R(ix - 2, gy - 6, 2, 6, ar.stoneHi); }
  // tiles
  for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CW; tx++) {
    const t = r.tiles[ty * CW + tx], x = tx * TS, y = ty * TS;
    if (t === 1 || t === 3) {
      R(x, y, 16, 16, ar.stone);
      const n = rng();
      if (n < .25) R(x + 1, y + 1, 7, 6, shade(ar.stone, .06));
      if (n > .8) R(x + 9, y + 9, 6, 6, shade(ar.stone, -.1));
      R(x, y + 7, 16, 1, ar.stoneDk); R(x, y + 15, 16, 1, ar.stoneDk);
      R(x + ((ty % 2) ? 4 : 11), y, 1, 7, ar.stoneDk); R(x + ((ty % 2) ? 11 : 4), y + 8, 1, 7, ar.stoneDk);
      const above = ty > 0 ? r.tiles[(ty - 1) * CW + tx] : 1;
      if (!(above === 1 || above === 3)) { R(x, y, 16, 2, ar.stoneHi); if (r.def.a === 'K' && n < .5) R(x + Math.floor(n * 24), y - 1, 3, 2, '#3f6a3a'); }
      const below = ty < CH - 1 ? r.tiles[(ty + 1) * CW + tx] : 1;
      if (!(below === 1 || below === 3)) R(x, y + 14, 16, 2, shade(ar.stoneDk, -.3));
      if (t === 3) { // crepe appena visibili
        g.fillStyle = shade(ar.stoneDk, -.2);
        g.fillRect(x + 5, y + 3, 1, 3); g.fillRect(x + 6, y + 5, 1, 3); g.fillRect(x + 7, y + 8, 2, 1); g.fillRect(x + 9, y + 9, 1, 3);
      }
    } else if (t === 2) {
      R(x, y, 16, 4, ar.plank); R(x, y, 16, 1, shade(ar.plank, .25)); R(x, y + 4, 16, 1, 'rgba(0,0,0,.45)');
      R(x + 3, y + 1, 1, 2, shade(ar.plank, -.25)); R(x + 11, y + 2, 1, 1, shade(ar.plank, -.25));
      const lft = tx > 0 ? r.tiles[ty * CW + tx - 1] : 1, rgt = tx < CW - 1 ? r.tiles[ty * CW + tx + 1] : 1;
      if (lft !== 2 && !(ty === 15)) { R(x + 2, y + 4, 2, 6, shade(ar.plank, -.3)); R(x + 3, y + 9, 3, 2, shade(ar.plank, -.3)); }
      if (rgt !== 2 && !(ty === 15)) { R(x + 12, y + 4, 2, 6, shade(ar.plank, -.3)); R(x + 10, y + 9, 3, 2, shade(ar.plank, -.3)); }
    }
  }
  return c;
}

function drawDecor(g, d, ar, R) {
  const rng = mulberry32(Math.floor(d.seed * 1e9));
  const cx = (d.x0 + d.x1) / 2;
  if (d.k === 'window' || d.k === 'stained') {
    const x0 = d.x0 + 8, x1 = d.x1 - 8;
    archPath(g, x0, x1, 52, 150);
    if (d.k === 'window') {
      const gr = g.createLinearGradient(0, 52, 0, 150); gr.addColorStop(0, '#1d2848'); gr.addColorStop(1, '#0b0f20');
      g.fillStyle = gr; g.fill();
      g.save(); archPath(g, x0, x1, 52, 150); g.clip();
      for (let i = 0; i < 10; i++) R(x0 + rng() * (x1 - x0), 60 + rng() * 80, 1, 1, '#9aa8d0');
      if (rng() < .6) { g.fillStyle = '#e8e4d0'; g.beginPath(); g.arc(x0 + 12 + rng() * 16, 78, 7, 0, 7); g.fill(); g.fillStyle = '#c8c4b0'; g.fillRect(x0 + 16, 76, 2, 2); }
      g.fillStyle = '#05070d'; g.beginPath(); g.moveTo(x0, 150); for (let x = x0; x <= x1; x += 4) g.lineTo(x, 136 - rng() * 10); g.lineTo(x1, 150); g.fill();
      g.restore();
    } else {
      g.save(); archPath(g, x0, x1, 52, 150); g.clip();
      const cols = ['#7a1a2a', '#1a3a8a', '#8a7a1a', '#2a6a4a', '#5a2a8a', '#8a3a1a'];
      for (let y = 50; y < 150; y += 8) for (let x = x0; x < x1; x += 8) R(x, y, 8, 8, cols[Math.floor(rng() * cols.length)]);
      g.strokeStyle = '#0c0a10'; g.lineWidth = 1;
      for (let y = 50; y < 150; y += 8) { g.beginPath(); g.moveTo(x0, y + .5); g.lineTo(x1, y + .5); g.stroke(); }
      for (let x = x0; x < x1; x += 8) { g.beginPath(); g.moveTo(x + .5, 50); g.lineTo(x + .5, 150); g.stroke(); }
      g.fillStyle = 'rgba(255,240,200,.18)'; g.beginPath(); g.arc(cx, 84, 10, 0, 7); g.fill();
      g.restore();
    }
    archPath(g, x0, x1, 52, 150); g.strokeStyle = ar.pillarHi; g.lineWidth = 2; g.stroke();
    R(cx - 1, 60, 2, 90, ar.pillar); R(x0, 100, x1 - x0, 2, ar.pillar);
    R(x0 - 4, 150, x1 - x0 + 8, 4, ar.pillarHi);
  } else if (d.k === 'portrait') {
    const x = cx - 18, y = 72;
    R(x - 3, y - 3, 42, 54, '#8a6a2a'); R(x - 1, y - 1, 38, 50, '#5a4418'); R(x, y, 36, 48, '#1a1218');
    R(x + 2, y + 2, 32, 44, rng() < .5 ? '#2a1a22' : '#1a222a');
    g.fillStyle = '#b9a890'; g.beginPath(); g.ellipse(cx, y + 20, 7, 9, 0, 0, 7); g.fill();
    R(cx - 12, y + 30, 24, 16, rng() < .5 ? '#3a1018' : '#18203a');
    R(cx - 4, y + 18, 2, 2, '#1a0a0a'); R(cx + 2, y + 18, 2, 2, '#1a0a0a'); R(cx - 2, y + 25, 4, 1, '#5a3a3a');
    R(cx - 8, y + 10, 16, 4, '#2a1a12');
  } else if (d.k === 'shelf') {
    R(d.x0 + 4, 60, d.x1 - d.x0 - 8, 180, '#2a1a10'); R(d.x0 + 4, 60, d.x1 - d.x0 - 8, 3, '#4a3020');
    for (let y = 64; y < 236; y += 24) {
      let x = d.x0 + 6;
      while (x < d.x1 - 8) {
        const bw = 2 + Math.floor(rng() * 3), bh = 12 + Math.floor(rng() * 9);
        R(x, y + 22 - bh, bw, bh, ['#5a1a1a', '#1a3a2a', '#3a2a1a', '#2a2a4a', '#6a4a1a', '#4a1a3a'][Math.floor(rng() * 6)]);
        if (rng() < .3) R(x, y + 24 - bh, bw, 1, '#c9a24a');
        x += bw + (rng() < .1 ? 4 : 0);
      }
      R(d.x0 + 4, y + 22, d.x1 - d.x0 - 8, 3, '#4a3020');
    }
  } else if (d.k === 'niche') {
    for (let row = 0; row < 3; row++) for (let i = 0; i < 2; i++) {
      const x = d.x0 + 8 + i * 26, y = 70 + row * 52;
      archPath(g, x, x + 20, y, y + 28); g.fillStyle = '#050806'; g.fill();
      if (rng() < .8) { R(x + 6, y + 16, 8, 7, '#cfc6b0'); R(x + 7, y + 18, 2, 2, '#050806'); R(x + 11, y + 18, 2, 2, '#050806'); R(x + 8, y + 23, 4, 2, '#a89f88'); }
      if (rng() < .5) R(x + 2, y + 25, 16, 3, '#bdb4a0');
    }
  } else if (d.k === 'coffin') {
    const x = cx - 12, y = 150;
    g.fillStyle = '#3a2416'; g.beginPath(); g.moveTo(x + 6, y); g.lineTo(x + 18, y); g.lineTo(x + 24, y + 20); g.lineTo(x + 19, y + 88); g.lineTo(x + 5, y + 88); g.lineTo(x, y + 20); g.fill();
    g.strokeStyle = '#5a3a24'; g.lineWidth = 2; g.stroke();
    R(cx - 1, y + 20, 2, 30, '#8a7a5a'); R(cx - 7, y + 28, 14, 2, '#8a7a5a');
  } else if (d.k === 'banner') {
    const col = d.k === 'banner' && ar === AREAS.S ? '#5a0a14' : '#6a1420';
    R(cx - 12, 40, 24, 3, '#3a2a1a');
    g.fillStyle = col; g.beginPath(); g.moveTo(cx - 10, 43); g.lineTo(cx + 10, 43); g.lineTo(cx + 10, 140); g.lineTo(cx, 128); g.lineTo(cx - 10, 140); g.fill();
    R(cx - 10, 43, 20, 2, '#c9a24a'); R(cx - 1, 70, 2, 30, '#c9a24a'); R(cx - 8, 80, 16, 2, '#c9a24a');
    g.strokeStyle = '#c9a24a'; g.lineWidth = 1; g.beginPath(); g.arc(cx, 85, 7, 0, 7); g.stroke();
  } else if (d.k === 'rune') {
    g.strokeStyle = '#6a1020'; g.lineWidth = 2;
    g.beginPath(); g.arc(cx, 120, 22, 0, 7); g.stroke();
    g.beginPath(); for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 4 / 5; const px = cx + Math.cos(a) * 22, py = 120 + Math.sin(a) * 22; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
  }
}

// elementi animati della stanza
function drawRoomDynamic() {
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  for (const w of room.windows) {
    if (w.k === 'window' && (room.def.a === 'A' || room.def.a === 'T')) {
      ctx.save(); archPath(ctx, w.x0, w.x1, 52, 150); ctx.clip();
      ctx.fillStyle = 'rgba(140,160,210,.5)';
      for (let i = 0; i < 9; i++) { const x = w.x0 + ((gameT * 50 + i * 37) % (w.x1 - w.x0 + 10)) - 5, y = w.y0 + ((gameT * 230 + i * 53) % (w.y1 - w.y0)); ctx.fillRect(Math.round(x), Math.round(y), 1, 5); }
      if (lightning > 0) { ctx.fillStyle = `rgba(225,232,255,${lightning * .8})`; ctx.fillRect(w.x0, w.y0, w.x1 - w.x0, w.y1 - w.y0); }
      ctx.restore();
    }
  }
  let i = 0;
  for (const l of room.lights) for (const [fx, fy] of l.fl) {
    const f = (Math.sin(gameT * 13 + i * 2.1) + Math.sin(gameT * 7.3 + i)) > .6 ? 1 : 0; i++;
    R(fx - 1, fy - 4 - f, 3, 4 + f, '#ff9a3a'); R(fx, fy - 3 - f, 1, 3, '#fff2b0');
  }
  if (room.def.altar) {
    const f = Math.sin(gameT * 9) > 0 ? 1 : 0;
    R(ALT_X + 7, 211 - f, 6, 8 + f, '#3a7ad0'); R(ALT_X + 8, 213 - f, 4, 6, '#7ab8ff'); R(ALT_X + 9, 215, 2, 3, '#e8f4ff');
  }
  for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CW; tx++) {
    const t = room.tiles[ty * CW + tx], x = tx * TS, y = ty * TS;
    if (t === 4) {
      R(x, y, 16, 16, '#1a1414');
      for (let k = 1; k < 16; k += 5) { R(x + k, y, 2, 16, '#5a5a62'); R(x, y + k, 16, 2, '#5a5a62'); }
      const pulse = .5 + .5 * Math.sin(gameT * 3);
      R(x + 6, y + 6, 4, 4, `rgba(201,162,74,${.4 + pulse * .6})`);
    } else if (t === 5) {
      ctx.fillStyle = `rgba(120,220,255,${.25 + .15 * Math.sin(gameT * 5 + ty)})`; ctx.fillRect(x, y, 16, 16);
      for (let k = 0; k < 3; k++) R(x + ((gameT * 20 + k * 6 + ty * 3) % 16), y + ((k * 5 + gameT * 30) % 16), 1, 3, 'rgba(220,250,255,.8)');
    } else if (t === 6) {
      R(x, y, 16, 16, '#140808');
      for (let k = 2; k < 16; k += 5) R(x + k, y, 2, 16, '#6a2a2a');
      R(x, y + 3, 16, 2, '#4a1a1a'); R(x, y + 11, 16, 2, '#4a1a1a');
    }
  }
}
