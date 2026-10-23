// ===== LUCI, HUD, MAPPA, MENU =====
const lc = document.createElement('canvas'); lc.width = W; lc.height = H;
const lx = lc.getContext('2d');

function text(s, x, y, c = '#e8dfcf', al = 'left', sz = 8, font = PF) {
  ctx.font = `${sz}px ${font}`; ctx.textAlign = al; ctx.textBaseline = 'top';
  ctx.fillStyle = '#000'; ctx.fillText(s, Math.round(x) + 1, Math.round(y) + 1);
  ctx.fillStyle = c; ctx.fillText(s, Math.round(x), Math.round(y));
}
function panel(x, y, w, h, border = '#5a4a6a') {
  ctx.fillStyle = 'rgba(10,6,14,.92)'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = border; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillStyle = '#c9a24a'; for (const [cx, cy] of [[x, y], [x + w - 3, y], [x, y + h - 3], [x + w - 3, y + h - 3]]) ctx.fillRect(cx, cy, 3, 3);
}

function drawLighting() {
  const ar = AREAS[room.def.a];
  lx.globalCompositeOperation = 'source-over';
  lx.clearRect(0, 0, W, H);
  lx.fillStyle = `rgba(4,2,10,${Math.max(0, ar.dark - lightning * .45)})`; lx.fillRect(0, 0, W, H);
  lx.globalCompositeOperation = 'destination-out';
  const light = (x, y, r, a) => { const g = lx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(.6, `rgba(0,0,0,${a * .55})`); g.addColorStop(1, 'rgba(0,0,0,0)'); lx.fillStyle = g; lx.fillRect(x - r, y - r, r * 2, r * 2); };
  light(P.x + P.w / 2, P.y + 10, 105, .95);
  let i = 0;
  for (const l of room.lights) { const fl = 1 + .06 * Math.sin(gameT * 11 + i++ * 1.7); light(l.x, l.y, l.r * fl, .9); }
  for (const w of room.windows) light((w.x0 + w.x1) / 2, 100, 70, .5);
  for (const p of projs) if (p.kind !== 'bone' && p.kind !== 'rock' && p.kind !== 'shock') light(p.x + p.w / 2, p.y + p.h / 2, p.kind === 'pillar' ? 60 : 26, .8);
  for (const k of pickups) if (k.kind === 'item') light(k.x + 6, k.y + 7, 40, .8);
  if (boss && boss.fly) light(boss.x + boss.w / 2, boss.y + boss.h / 2, 60, .5);
  ctx.drawImage(lc, 0, 0);
  // bagliore caldo delle candele
  ctx.globalCompositeOperation = 'lighter';
  for (const l of room.lights) {
    if (!l.fl.length && l.kind !== 'altar') continue;
    const col = l.kind === 'altar' ? '60,120,255' : '255,140,50';
    const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * .6); g.addColorStop(0, `rgba(${col},.16)`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
  // vignettatura
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .65);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

function drawHUD() {
  // PV
  const hpw = Math.min(150, 60 + S.maxhp * .45);
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(6, 6, hpw + 4, 14);
  ctx.fillStyle = '#3a0a12'; ctx.fillRect(8, 8, hpw, 6);
  ctx.fillStyle = '#c0142a'; ctx.fillRect(8, 8, Math.round(hpw * S.hp / S.maxhp), 6);
  ctx.fillStyle = '#ff5a6a'; ctx.fillRect(8, 8, Math.round(hpw * S.hp / S.maxhp), 1);
  ctx.fillStyle = '#2a2010'; ctx.fillRect(8, 16, hpw, 2);
  ctx.fillStyle = '#c9a24a'; ctx.fillRect(8, 16, Math.round(hpw * S.xp / xpNeed(S.lvl)), 2);
  text(`LV ${S.lvl}`, 8, 22, lvlFx > 0 && Math.floor(lvlFx * 8) % 2 ? '#ffd34a' : '#e8dfcf');
  text(`PV ${S.hp}/${S.maxhp}`, 46, 22, '#d8c8c8');
  // pozioni
  for (let i = 0; i < S.maxPot; i++) {
    const x = 8 + i * 9, y = 33, full = i < S.potions;
    ctx.fillStyle = full ? '#2a6ad0' : '#1a1a2a'; ctx.fillRect(x, y + 3, 6, 6); ctx.fillStyle = '#aaa'; ctx.fillRect(x + 2, y, 2, 3);
    if (full) { ctx.fillStyle = '#9ac8ff'; ctx.fillRect(x + 1, y + 4, 1, 2); }
  }
  text(WEAPONS[S.weapon].name, 8, 45, '#b8b0c0');
  // emblemi
  for (let i = 0; i < 5; i++) {
    const x = W / 2 - 30 + i * 12, y = 8, got = i < S.sigils;
    ctx.fillStyle = got ? '#c9a24a' : '#2a2030';
    ctx.beginPath(); ctx.moveTo(x + 4, y); ctx.lineTo(x + 8, y + 4); ctx.lineTo(x + 4, y + 8); ctx.lineTo(x, y + 4); ctx.fill();
    if (got) { ctx.fillStyle = '#fff2b0'; ctx.fillRect(x + 3, y + 2, 2, 2); }
  }
  drawMinimap();
  // boss
  if (boss && !boss.dying && boss.st !== 'intro') {
    const bw = 300, bx = (W - bw) / 2, by = 254;
    text(boss.name, W / 2, by - 11, '#e8c0c0', 'center');
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(bx - 2, by - 2, bw + 4, 9);
    ctx.fillStyle = '#3a0a12'; ctx.fillRect(bx, by, bw, 5);
    ctx.fillStyle = '#8a1020'; ctx.fillRect(bx, by, Math.round(bw * boss.hp / boss.maxhp), 5);
    ctx.fillStyle = '#d03040'; ctx.fillRect(bx, by, Math.round(bw * boss.hp / boss.maxhp), 1);
  }
  if (banner) {
    const a = Math.min(1, banner.t, (3.2 - banner.t) * 3);
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 62, W, 34);
    text(banner.text, W / 2, 64, banner.boss ? '#ff8a8a' : '#e8d8b0', 'center', 22, DF);
    ctx.globalAlpha = 1;
  }
  if (toast) {
    ctx.globalAlpha = Math.min(1, toast.t * 2);
    ctx.font = `8px ${PF}`; const tw = ctx.measureText(toast.text).width + 16;
    panel(Math.round(W / 2 - tw / 2), 226, Math.round(tw), 16);
    text(toast.text, W / 2, 230, '#e8dfcf', 'center');
    ctx.globalAlpha = 1;
  }
}

function roomColor(def, alpha = 1) { return def.secret ? '#c9a24a' : AREAS[def.a].map; }
function drawMapGrid(ox, oy, cw, chh, cx0, cy0, cols, rows, big) {
  const inView = (x, y) => x >= cx0 && x < cx0 + cols && y >= cy0 && y < cy0 + rows;
  const pos = (x, y) => [ox + (x - cx0) * cw, oy + (y - cy0) * chh];
  // collegamenti
  for (const l of ALL_LINKS) {
    const va = S.visited[l.x1 + ',' + l.y1], vb = S.visited[l.x2 + ',' + l.y2];
    if (!va && !vb) continue;
    if (l.type === 'secret' && !S.broken[l.id]) continue;
    const col = l.type === 'lock' && S.sigils < l.need ? '#d03040' : l.type === 'ghost' ? '#7ad8ff' : '#d8d0e0';
    ctx.fillStyle = col;
    const both = va && vb;
    if (l.y1 === l.y2) {
      const x = Math.max(l.x1, l.x2), y = l.y1; if (!inView(x, y) && !inView(x - 1, y)) continue;
      const [px, py] = pos(x, y);
      const from = both || (l.x1 < l.x2 ? va : vb) ? px - 3 : px, to = both || (l.x1 < l.x2 ? vb : va) ? px + 3 : px;
      ctx.fillRect(from, py + chh / 2 - 1, Math.max(2, to - from), 3);
    } else {
      const y = Math.max(l.y1, l.y2), x = l.x1; if (!inView(x, y) && !inView(x, y - 1)) continue;
      const [px, py] = pos(x, y);
      const upVisited = l.y1 < l.y2 ? va : vb, downVisited = l.y1 < l.y2 ? vb : va;
      const from = both || upVisited ? py - 3 : py, to = both || downVisited ? py + 3 : py;
      ctx.fillRect(px + cw / 2 - 1, from, 3, Math.max(2, to - from));
    }
  }
  for (const d of ROOM_DEFS) {
    if (!S.visited[d.key] || !inView(d.x, d.y)) continue;
    const [px, py] = pos(d.x, d.y);
    ctx.fillStyle = shade(roomColor(d), -.45); ctx.fillRect(px + 2, py + 2, cw - 4, chh - 4);
    ctx.fillStyle = roomColor(d);
    ctx.fillRect(px + 2, py + 2, cw - 4, 1); ctx.fillRect(px + 2, py + chh - 3, cw - 4, 1); ctx.fillRect(px + 2, py + 2, 1, chh - 4); ctx.fillRect(px + cw - 3, py + 2, 1, chh - 4);
    const mx = px + cw / 2, my = py + chh / 2;
    if (big) {
      if (d.altar) { ctx.fillStyle = '#7ab8ff'; ctx.fillRect(mx - 1, my - 4, 2, 8); ctx.fillRect(mx - 3, my - 2, 6, 2); }
      if (d.boss) { const dead = S.bosses[d.boss]; ctx.fillStyle = dead ? '#6a6070' : '#ff4a5a'; ctx.fillRect(mx - 3, my - 4, 7, 5); ctx.fillRect(mx - 2, my + 1, 5, 2); ctx.fillStyle = '#000'; ctx.fillRect(mx - 2, my - 2, 2, 2); ctx.fillRect(mx + 1, my - 2, 2, 2); }
      if (d.item && !S.items[d.key]) { ctx.fillStyle = '#ffd34a'; ctx.fillRect(mx + 6, my - 1, 3, 3); }
    } else if (d.boss && !S.bosses[d.boss]) { ctx.fillStyle = '#ff4a5a'; ctx.fillRect(mx - 1, my - 1, 2, 2); }
    if (room && d.key === room.key && Math.floor(gameT * 3) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      const ppx = px + 3 + (P.x / W) * (cw - 6), ppy = py + 3 + (P.y / H) * (chh - 6);
      ctx.fillRect(Math.round(ppx) - 1, Math.round(ppy) - 1, big ? 3 : 2, big ? 3 : 2);
    }
  }
}
function drawMinimap() {
  const cw = 13, chh = 8, cols = 5, rows = 3, ox = W - cols * cw - 8, oy = 6;
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(ox - 2, oy - 2, cols * cw + 4, rows * chh + 4);
  ctx.save(); ctx.beginPath(); ctx.rect(ox, oy, cols * cw, rows * chh); ctx.clip();
  drawMapGrid(ox, oy, cw, chh, room.def.x - 2, room.def.y - 1, cols, rows, false);
  ctx.restore();
  text('M: mappa', W - 8, oy + rows * chh + 4, '#7a7088', 'right');
}
function drawMapScreen() {
  ctx.fillStyle = 'rgba(6,3,10,.94)'; ctx.fillRect(0, 0, W, H);
  text('Mappa di Villa Morgrave', W / 2, 10, '#e8d8b0', 'center', 22, DF);
  const cw = 40, chh = 24, ox = (W - 10 * cw) / 2, oy = 44;
  ctx.fillStyle = 'rgba(255,255,255,.03)';
  for (let y = 0; y < 7; y++) for (let x = 0; x < 10; x++) ctx.fillRect(ox + x * cw + 1, oy + y * chh + 1, cw - 2, chh - 2);
  drawMapGrid(ox, oy, cw, chh, 0, 0, 10, 7, true);
  const pct = Math.round(Object.keys(S.visited).length / ROOM_DEFS.length * 100);
  text(`Esplorazione ${pct}%   Segreti ${S.secrets}/6   Emblemi ${S.sigils}/5`, W / 2, 218, '#c9a24a', 'center');
  // legenda
  let lx0 = 24; const ly = 234;
  const leg = (col, label) => { ctx.fillStyle = col; ctx.fillRect(lx0, ly + 1, 6, 6); text(label, lx0 + 9, ly, '#a89eb0'); ctx.font = `8px ${PF}`; lx0 += ctx.measureText(label).width + 20; };
  for (const k of ['A', 'B', 'K', 'C', 'T', 'S']) if (ROOM_DEFS.some(d => d.a === k && S.visited[d.key])) leg(AREAS[k].map, AREAS[k].name.split(' ')[0]);
  leg('#c9a24a', 'Segreto');
  text('Altare = croce blu · Teschio = custode · Rosso = sigillato · Azzurro = barriera', W / 2, 250, '#6a6078', 'center');
  text('M / Esc per chiudere', W / 2, 260, '#6a6078', 'center');
}

function fmtTime(s) { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60; return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(ss).padStart(2, '0'); }

function drawPause() {
  ctx.fillStyle = 'rgba(6,3,10,.94)'; ctx.fillRect(0, 0, W, H);
  text('Il Diario del Cavaliere', W / 2, 8, '#e8d8b0', 'center', 22, DF);
  panel(16, 40, 200, 168);
  text('STATISTICHE', 26, 48, '#c9a24a');
  const rows = [['Livello', S.lvl], ['PV', `${S.hp} / ${S.maxhp}`], ['Forza', S.str], ['Difesa', S.def], ['Fortuna', S.luck], ['Esperienza', `${S.xp} / ${xpNeed(S.lvl)}`], ['Pozioni', `${S.potions} / ${S.maxPot}`], ['Emblemi', `${S.sigils} / 5`], ['Nemici sconfitti', S.kills], ['Esplorazione', Math.round(Object.keys(S.visited).length / ROOM_DEFS.length * 100) + '%'], ['Tempo', fmtTime(S.time)]];
  rows.forEach(([k, v], i) => { text(k, 26, 62 + i * 12, '#a89eb0'); text(String(v), 206, 62 + i * 12, '#e8dfcf', 'right'); });
  panel(224, 40, 240, 168);
  text('ARMI', 234, 48, '#c9a24a');
  const list = WORDER.filter(k => S.weapons.includes(k));
  list.forEach((k, i) => {
    const y = 62 + i * 12, sel = i === pauseSel;
    if (sel) { ctx.fillStyle = 'rgba(201,162,74,.18)'; ctx.fillRect(230, y - 2, 228, 11); }
    text((k === S.weapon ? '» ' : '  ') + WEAPONS[k].name, 234, y, sel ? '#fff2b0' : '#d8d0e0');
    text('x' + WEAPONS[k].mult.toFixed(2), 452, y, '#8a8098', 'right');
  });
  const sw = WEAPONS[list[pauseSel]];
  if (sw) text(sw.desc + (sw.holy ? ' · sacra' : ''), 234, 62 + 8 * 12 + 4, '#a89eb0');
  text(`${WORDER.length - list.length} armi ancora nascoste`, 234, 192, '#6a6078');
  text('ABILITÀ', 26, 216, '#c9a24a');
  text(`Scatto ${S.dash ? '[C]' : '—'}    Doppio salto ${S.dj ? '[salto in aria]' : '—'}`, 90, 216, '#d8d0e0');
  text('Su/Giù scegli arma · X equipaggia · Invio/Esc riprendi · N audio', W / 2, 236, '#7a7088', 'center');
  text('Frecce muovi · Z/Spazio salta · Giù+salto scendi · X colpisci · C scatto · Q/E arma · F pozione', W / 2, 250, '#6a6078', 'center');
}

function drawMsg() {
  if (!msg) return;
  const lines = msg.lines, h = 46 + lines.length * 12, y = Math.round((H - h) / 2) - 10;
  panel(40, y, W - 80, h, '#8a6a2a');
  text(msg.title, W / 2, y + 6, '#ffd98a', 'center', 20, DF);
  lines.forEach((l, i) => text(l, W / 2, y + 32 + i * 12, '#e8dfcf', 'center'));
  if (msg.t > .4 && Math.floor(gameT * 2) % 2 === 0) text('▼', W - 54, y + h - 12, '#c9a24a');
}

function drawTitle() {
  if (titleRoom) { ctx.drawImage(titleRoom.cache, 0, 0); }
  ctx.fillStyle = `rgba(4,2,10,${.72 - lightning * .4})`; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(150,170,220,.35)';
  for (let i = 0; i < 70; i++) { const x = (i * 71 + gameT * 60) % (W + 40) - 20, y = (i * 37 + gameT * 260) % H; ctx.fillRect(Math.round(x), Math.round(y), 1, 6); }
  text('Villa Morgrave', W / 2, 46, '#e8d8b0', 'center', 52, DF);
  text('Un metroidvania gotico', W / 2, 108, '#a89eb0', 'center');
  const opts = titleOpts();
  opts.forEach((o, i) => {
    const sel = i === titleSel, y = 140 + i * 16;
    text((sel ? '» ' : '') + o + (sel ? ' «' : ''), W / 2, y, sel ? '#ffd98a' : '#8a8098', 'center');
  });
  if (opts.length > 1 && opts[titleSel] === 'Nuova partita') text('Il salvataggio esistente verrà sovrascritto', W / 2, 140 + opts.length * 16 + 2, '#8a4a5a', 'center');
  text('Frecce muovi · Z salta · X colpisci · C scatto · Q/E arma · F pozione · M mappa', W / 2, 228, '#6a6078', 'center');
  text('Invio, Spazio o tocca lo schermo per iniziare', W / 2, 242, '#8a8098', 'center');
}

function drawVictory() {
  ctx.fillStyle = '#0a0610'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,170,90,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  text('Fine', W / 2, 26, '#ffd98a', 'center', 48, DF);
  text('Villa Morgrave è libera dalla maledizione.', W / 2, 92, '#e8dfcf', 'center');
  const rows = [['Livello raggiunto', S.lvl], ['Tempo', fmtTime(S.time)], ['Nemici sconfitti', S.kills], ['Esplorazione', Math.round(Object.keys(S.visited).length / ROOM_DEFS.length * 100) + '%'], ['Segreti trovati', S.secrets + ' / 6'], ['Armi', S.weapons.length + ' / 8']];
  rows.forEach(([k, v], i) => { text(k, 150, 118 + i * 14, '#a89eb0'); text(String(v), 330, 118 + i * 14, '#e8dfcf', 'right'); });
  if (victoryT > 2) text('Premi Invio per tornare al titolo', W / 2, 220, '#8a8098', 'center');
}
