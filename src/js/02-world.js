// ===== MONDO: aree, stanze, collegamenti, armi, oggetti =====
const AREAS = {
  A: { name: 'Atrio dei Sussurri', base: 1, bg: '#1a1422', brick: '#241c2e', brickHi: '#2c2338', recess: '#100c16', pillar: '#2f2640', pillarHi: '#3e3352', stone: '#4a3f5a', stoneHi: '#6a5a80', stoneDk: '#2b2336', plank: '#5e3d28', map: '#8b6bab', dark: .58, enemies: ['skel', 'skel', 'bat', 'zomb'], root: 110 },
  B: { name: 'Biblioteca Proibita', base: 4, bg: '#1c140e', brick: '#271b13', brickHi: '#2f2218', recess: '#110b07', pillar: '#3a2618', pillarHi: '#4d3420', stone: '#5a4331', stoneHi: '#7a5d44', stoneDk: '#2f2218', plank: '#6a4528', map: '#b98345', dark: .6, enemies: ['skel', 'ghost', 'bat', 'archer'], root: 116.5 },
  K: { name: 'Cripte di Famiglia', base: 7, bg: '#0f1613', brick: '#16201b', brickHi: '#1c2822', recess: '#090e0c', pillar: '#26332c', pillarHi: '#33443a', stone: '#3b4a41', stoneHi: '#56695d', stoneDk: '#1e2822', plank: '#4a4438', map: '#5fa07c', dark: .7, enemies: ['zomb', 'skel', 'archer', 'bat', 'zomb'], root: 98 },
  C: { name: 'Cappella Sconsacrata', base: 10, bg: '#121729', brick: '#192036', brickHi: '#1f2842', recess: '#0a0e1b', pillar: '#27304e', pillarHi: '#343f66', stone: '#3e4a70', stoneHi: '#5d6b98', stoneDk: '#232b46', plank: '#4d3b5a', map: '#6d8ad6', dark: .58, enemies: ['ghost', 'bat', 'archer', 'armor'], root: 123.5 },
  T: { name: 'Torre del Corvo', base: 13, bg: '#0e131b', brick: '#151c27', brickHi: '#1b2431', recess: '#080b11', pillar: '#242e3d', pillarHi: '#313d50', stone: '#46515f', stoneHi: '#67768a', stoneDk: '#262e3a', plank: '#4f4033', map: '#a3b1c6', dark: .6, enemies: ['armor', 'archer', 'ghost', 'bat'], root: 92.5 },
  S: { name: 'Santuario del Necromante', base: 16, bg: '#1a080c', brick: '#250c12', brickHi: '#2e1018', recess: '#0f0408', pillar: '#3a121b', pillarHi: '#501a25', stone: '#4d1d26', stoneHi: '#73303c', stoneDk: '#2c0f15', plank: '#3a1a1f', map: '#d0475a', dark: .64, enemies: [], root: 87.3 },
};

// Stanze: ogni stanza è una cella della mappa (x, y)
const ROOM_DEFS = [
  // Atrio
  { x: 4, y: 3, a: 'A', start: 1, altar: 1 },
  { x: 3, y: 3, a: 'A' },
  { x: 2, y: 3, a: 'A', item: 'w_axe' },
  { x: 5, y: 3, a: 'A' },
  { x: 6, y: 3, a: 'A' },
  { x: 7, y: 3, a: 'A', altar: 1 },
  { x: 8, y: 3, a: 'A', boss: 1 },
  { x: 5, y: 2, a: 'A' },
  { x: 4, y: 2, a: 'A', item: 'flask' },
  { x: 4, y: 4, a: 'A', item: 'hpup' },
  { x: 6, y: 2, a: 'A', secret: 1, item: 'w_spear' },
  { x: 9, y: 3, a: 'A', secret: 1, item: 'w_xbow' },
  // Biblioteca
  { x: 1, y: 3, a: 'B' },
  { x: 0, y: 3, a: 'B', item: 'hpup' },
  { x: 1, y: 2, a: 'B' },
  { x: 0, y: 2, a: 'B', altar: 1 },
  { x: 2, y: 2, a: 'B' },
  { x: 1, y: 1, a: 'B' },
  { x: 2, y: 1, a: 'B' },
  { x: 0, y: 1, a: 'B', boss: 2 },
  { x: 3, y: 1, a: 'B', secret: 1, item: 'forup' },
  // Cripte
  { x: 6, y: 4, a: 'K' },
  { x: 5, y: 4, a: 'K', item: 'hpup' },
  { x: 7, y: 4, a: 'K' },
  { x: 7, y: 5, a: 'K' },
  { x: 6, y: 5, a: 'K' },
  { x: 5, y: 5, a: 'K', altar: 1 },
  { x: 4, y: 5, a: 'K' },
  { x: 3, y: 5, a: 'K', boss: 3 },
  { x: 8, y: 5, a: 'K', secret: 1, item: 'w_scythe' },
  // Cappella
  { x: 8, y: 2, a: 'C', item: 'hpup' },
  { x: 9, y: 2, a: 'C', altar: 1 },
  { x: 8, y: 1, a: 'C', item: 'flask' },
  { x: 9, y: 1, a: 'C', boss: 4 },
  // Torre
  { x: 5, y: 1, a: 'T' },
  { x: 6, y: 1, a: 'T' },
  { x: 7, y: 1, a: 'T', altar: 1 },
  { x: 6, y: 0, a: 'T' },
  { x: 5, y: 0, a: 'T', item: 'hpup' },
  { x: 7, y: 0, a: 'T', boss: 5 },
  { x: 4, y: 0, a: 'T', secret: 1, item: 'difup' },
  // Santuario
  { x: 5, y: 6, a: 'S', boss: 6 },
];

// Collegamenti: [x1,y1,x2,y2,tipo,requisito]
// tipi: n normale, secret muro fragile, ghost barriera spettrale (scatto), lock cancello (emblemi), dj serve doppio salto
const LINKS = [
  [3, 3, 4, 3], [2, 3, 3, 3], [4, 3, 5, 3], [5, 3, 6, 3], [6, 3, 7, 3], [7, 3, 8, 3],
  [5, 3, 5, 2], [4, 2, 5, 2], [5, 2, 6, 2, 'secret'], [8, 3, 9, 3, 'secret'], [4, 3, 4, 4],
  [1, 3, 2, 3, 'ghost'], [0, 3, 1, 3], [1, 3, 1, 2], [0, 2, 1, 2], [1, 2, 2, 2], [1, 2, 1, 1], [1, 1, 2, 1], [0, 1, 1, 1], [2, 1, 3, 1, 'secret'],
  [6, 3, 6, 4, 'lock', 2], [5, 4, 6, 4], [6, 4, 7, 4], [7, 4, 7, 5], [6, 5, 7, 5], [5, 5, 6, 5], [4, 5, 5, 5], [3, 5, 4, 5], [7, 5, 8, 5, 'secret'],
  [8, 3, 8, 2, 'dj'], [8, 2, 9, 2], [8, 2, 8, 1], [8, 1, 9, 1],
  [5, 2, 5, 1, 'lock', 4], [5, 1, 6, 1], [6, 1, 7, 1], [6, 1, 6, 0, 'dj'], [5, 0, 6, 0], [6, 0, 7, 0], [4, 0, 5, 0, 'secret'],
  [5, 5, 5, 6, 'lock', 5],
];

const ROOMS = {};
ROOM_DEFS.forEach(d => { d.key = d.x + ',' + d.y; d.links = {}; ROOMS[d.key] = d; });
LINKS.forEach((l, i) => {
  const [x1, y1, x2, y2, type = 'n', need = 0] = l;
  const A = ROOMS[x1 + ',' + y1], B = ROOMS[x2 + ',' + y2];
  let dA, dB;
  if (x2 > x1) { dA = 'R'; dB = 'L'; } else if (x2 < x1) { dA = 'L'; dB = 'R'; } else if (y2 < y1) { dA = 'U'; dB = 'D'; } else { dA = 'D'; dB = 'U'; }
  const base = { id: 'L' + i, type, need, a: A.key, b: B.key, dA, dB };
  A.links[dA] = Object.assign({}, base, { to: B.key });
  B.links[dB] = Object.assign({}, base, { to: A.key });
});
const ALL_LINKS = LINKS.map((l, i) => { const [x1, y1, x2, y2, type = 'n', need = 0] = l; return { id: 'L' + i, x1, y1, x2, y2, type, need }; });

const WEAPONS = {
  sword: { name: 'Spada Ardente', desc: 'Equilibrata e rapida, lama in fiamme', mult: 1, cd: .3, dur: .18, reach: 24, hh: 16, kb: 90, type: 'slash', len: 14, blade: '#d6dde6', hilt: '#8a3a1a', fire: 1 },
  axe: { name: 'Ascia del Boia', desc: 'Lenta, colpi pesanti', mult: 1.5, cd: .52, dur: .24, reach: 26, hh: 24, kb: 150, type: 'heavy', len: 15, blade: '#a9b0b8', hilt: '#5a3a22' },
  spear: { name: 'Lancia di Frassino', desc: 'Grande portata frontale', mult: 1.15, cd: .36, dur: .2, reach: 42, hh: 8, kb: 100, type: 'thrust', len: 28, blade: '#cfd6de', hilt: '#7a5a36' },
  xbow: { name: "Balestra d'Argento", desc: 'Dardi a distanza', mult: .95, cd: .42, dur: .15, type: 'ranged', speed: 330, len: 12, blade: '#c0c8d0', hilt: '#5a3a22' },
  whip: { name: 'Catena del Penitente', desc: 'Portata enorme', mult: 1.25, cd: .42, dur: .24, reach: 56, hh: 10, kb: 80, type: 'whip', len: 52, blade: '#9a9fa8', hilt: '#4a2a1a' },
  scythe: { name: 'Falce del Becchino', desc: 'Fendente ampio, anche in alto', mult: 1.65, cd: .55, dur: .28, reach: 32, hh: 36, kb: 120, type: 'arc', len: 20, blade: '#b8c2cc', hilt: '#3a2a1e' },
  hammer: { name: 'Martello Consacrato', desc: 'Devastante, sacro contro gli spettri', mult: 2.2, cd: .7, dur: .3, reach: 28, hh: 28, kb: 240, type: 'heavy', len: 16, blade: '#d8c070', hilt: '#6a4a2a', holy: 1 },
  dusk: { name: 'Lama del Crepuscolo', desc: 'Rapida, scaglia onde di luce', mult: 2.35, cd: .28, dur: .18, reach: 30, hh: 20, kb: 110, type: 'slash', len: 19, blade: '#ffd98a', hilt: '#4a2a5a', wave: 1, holy: 1 },
};
const WORDER = ['sword', 'axe', 'spear', 'xbow', 'whip', 'scythe', 'hammer', 'dusk'];

const ITEMS = {
  w_axe: { title: 'Ascia del Boia', lines: ['Una pesante ascia annerita dal sangue.', 'Colpi lenti ma devastanti.', 'Cambia arma con Q / E.'], weapon: 'axe' },
  w_spear: { title: 'Lancia di Frassino', lines: ['Lunga portata: colpisci i nemici', 'prima che ti raggiungano.'], weapon: 'spear' },
  w_xbow: { title: "Balestra d'Argento", lines: ["Scaglia dardi d'argento a distanza.", 'I dardi incrinano anche i muri fragili.'], weapon: 'xbow' },
  w_scythe: { title: 'Falce del Becchino', lines: ['Un ampio fendente che colpisce', 'anche i nemici sopra di te.'], weapon: 'scythe' },
  hpup: { title: 'Cuore di Ferro', lines: ['I tuoi PV massimi aumentano di 15.'] },
  forup: { title: 'Elisir del Sangue', lines: ['La tua Forza aumenta di 3.'] },
  difup: { title: 'Pelle di Gargoyle', lines: ['La tua Difesa aumenta di 3.'] },
  flask: { title: 'Ampolla Benedetta', lines: ['Puoi portare una pozione in più.', 'Bevi una pozione con F.'] },
};

const EN = {
  skel: { hp: 14, atk: 5, w: 10, h: 22, spd: 32, xp: 4 },
  zomb: { hp: 24, atk: 7, w: 12, h: 22, spd: 16, xp: 5 },
  bat: { hp: 8, atk: 4, w: 12, h: 8, spd: 62, xp: 3, fly: 1 },
  ghost: { hp: 13, atk: 6, w: 12, h: 16, spd: 30, xp: 5, fly: 1, ghost: 1 },
  archer: { hp: 12, atk: 5, w: 10, h: 22, spd: 0, xp: 5 },
  armor: { hp: 36, atk: 9, w: 14, h: 24, spd: 22, xp: 8, def: .3 },
  // Mummia: compare dopo la sconfitta del primo custode. Attacca a pugni; quando cade,
  // si affloscia a terra e dopo un secondo ne rinasce uno scheletro che lancia ossa.
  mummy: { hp: 30, atk: 8, w: 12, h: 24, spd: 24, xp: 9 },
};

const BOSSES = {
  1: { name: 'Ossian, il Maggiordomo Scheletrico', hp: 170, atk: 9, w: 24, h: 44, xp: 120 },
  2: { name: 'Morwen, la Strega dei Libri', hp: 330, atk: 13, w: 24, h: 36, xp: 320, fly: 1 },
  3: { name: "Gorvath, il Ghoul dell'Ossario", hp: 560, atk: 17, w: 42, h: 34, xp: 650 },
  4: { name: 'Isolde, la Sposa Spettrale', hp: 720, atk: 21, w: 24, h: 40, xp: 1000, fly: 1, ghost: 1 },
  5: { name: 'Sir Aldric, il Cavaliere Decaduto', hp: 980, atk: 25, w: 24, h: 44, xp: 1500 },
  6: { name: 'Conte Malachia, il Necromante', hp: 1700, atk: 29, w: 26, h: 46, xp: 0, fly: 1 },
};

// ----- Salvataggio -----
function newSave() {
  return { lvl: 1, xp: 0, maxhp: 40, hp: 40, str: 6, def: 2, luck: 3, potions: 2, maxPot: 2, weapons: ['sword'], weapon: 'sword', dash: false, dj: false, sigils: 0, bosses: {}, items: {}, broken: {}, visited: {}, saveRoom: '4,3', time: 0, kills: 0, secrets: 0 };
}
let S = newSave();
const SAVE_KEY = 'villa_morgrave_v1';
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
function loadSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
const xpNeed = l => Math.floor(12 * Math.pow(l, 1.55));

// ----- Costruzione stanza -----
const ALT_X = 64;
const isSolidT = t => t === 1 || t === 3 || t === 4 || t === 5 || t === 6;

function openingCells(dir) {
  const c = [];
  if (dir === 'L') for (let y = 12; y <= 14; y++) c.push([0, y]);
  if (dir === 'R') for (let y = 12; y <= 14; y++) c.push([CW - 1, y]);
  if (dir === 'U') for (let x = 13; x <= 16; x++) c.push([x, 0]);
  if (dir === 'D') for (let x = 13; x <= 16; x++) { c.push([x, 15]); c.push([x, 16]); }
  return c;
}

function buildRoom(key) {
  const def = ROOMS[key];
  const rng = mulberry32(hashStr(key));
  const t = new Array(CW * CH).fill(0);
  const set = (x, y, v) => { if (x >= 0 && x < CW && y >= 0 && y < CH) t[y * CW + x] = v; };
  const get = (x, y) => t[y * CW + x];
  for (let x = 0; x < CW; x++) { set(x, 0, 1); set(x, 15, 1); set(x, 16, 1); }
  for (let y = 0; y < CH; y++) { set(0, y, 1); set(CW - 1, y, 1); }
  const L = def.links;
  if (def.secret) {
    for (let y = 1; y <= 8; y++) for (let x = 1; x < CW - 1; x++) set(x, y, 1);
    for (let y = 9; y <= 14; y++) {
      for (let x = 1; x <= 6; x++) if (!(L.L && y >= 12)) set(x, y, 1);
      for (let x = CW - 7; x < CW - 1; x++) if (!(L.R && y >= 12)) set(x, y, 1);
    }
    for (let x = 7; x < CW - 7; x++) if (x < 10 || x > CW - 11) set(x, 9, 1);
  }
  const plat = (x0, x1, y) => { for (let x = x0; x <= x1; x++) if (get(x, y) === 0) set(x, y, 2); };
  if (L.U) {
    const m = rng() < .5;
    const A = m ? [18, 23] : [6, 11], B = m ? [11, 16] : [13, 18];
    plat(A[0], A[1], 12);
    if (L.U.type !== 'dj') plat(B[0], B[1], 9);
    plat(A[0], A[1], 6);
    plat(10, 19, 3);
  } else if (!def.boss && !def.secret) {
    const n = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i++) { const y = 10 + Math.floor(rng() * 3); const x0 = 3 + Math.floor(rng() * 20); plat(x0, Math.min(x0 + 2 + Math.floor(rng() * 4), CW - 3), y); }
  }
  if (!def.boss && !def.secret && !def.altar && !def.item && !def.start && rng() < .5) {
    const bx = 7 + Math.floor(rng() * 14), bw = 2 + Math.floor(rng() * 3);
    for (let x = bx; x < bx + bw; x++) if (!(L.D && x >= 12 && x <= 17)) set(x, 14, 1);
  }
  const ot = lk => {
    if (lk.type === 'secret') return S.broken[lk.id] ? 0 : 3;
    if (lk.type === 'ghost') return 5;
    if (lk.type === 'lock') return S.sigils >= lk.need ? 0 : 4;
    return 0;
  };
  for (const d of ['L', 'R', 'U', 'D']) {
    if (!L[d]) continue;
    const v = ot(L[d]);
    for (const [x, y] of openingCells(d)) set(x, y, (d === 'D' && y === 15 && v === 0) ? 2 : v);
  }
  const r = { key, def, tiles: t, lights: [], windows: [], decor: [], chains: [], cob: [false, false] };
  genDecor(r);
  return r;
}

function groundYT(r, x) {
  const tx = clamp(Math.floor(x / TS), 1, CW - 2);
  let ty = 14;
  while (ty > 0 && isSolidT(r.tiles[ty * CW + tx])) ty--;
  return (ty + 1) * TS;
}

function itemX(def) { return (def.links.D ? 22 : 15) * TS; }

function genDecor(r) {
  const rng = mulberry32(hashStr(r.key) * 3 + 11), a = r.def.a;
  if (!r.def.secret) {
    for (let i = 0; i < 5; i++) {
      const x0 = i * 96 + 18, x1 = i * 96 + 78, q = rng();
      let k = 'none';
      if (a === 'B') k = q < .75 ? 'shelf' : 'portrait';
      else if (a === 'K') k = q < .45 ? 'niche' : q < .8 ? 'coffin' : 'none';
      else if (a === 'C') k = q < .65 ? 'stained' : 'none';
      else if (a === 'S') k = q < .5 ? 'rune' : 'banner';
      else k = q < .45 ? 'window' : q < .75 ? 'portrait' : (a === 'T' ? 'banner' : 'none');
      r.decor.push({ k, x0, x1, seed: rng() });
      if (k === 'window' || k === 'stained') r.windows.push({ x0: x0 + 8, x1: x1 - 8, y0: 52, y1: 150, k });
    }
    for (let i = 1; i < 5; i++) if (rng() < .5) r.lights.push({ x: i * 96, y: 108, r: 72, kind: 'sconce', fl: [[i * 96, 110]] });
    if (rng() < .65) {
      let x = 48 + Math.floor(rng() * 380);
      if (x > 196 && x < 284) x += 100;
      if (r.def.altar && x < 120) x += 140;
      const gy = groundYT(r, x);
      r.lights.push({ x, y: gy - 30, r: 66, kind: 'cand', gy, fl: [[x - 7, gy - 29], [x, gy - 32], [x + 7, gy - 29]] });
    }
    const nc = Math.floor(rng() * 3);
    for (let i = 0; i < nc; i++) r.chains.push({ x: 40 + Math.floor(rng() * 400), len: 30 + Math.floor(rng() * 50) });
  } else {
    r.lights.push({ x: 240, y: 190, r: 70, kind: 'none', fl: [] });
  }
  if (r.def.altar) r.lights.push({ x: ALT_X + 10, y: 212, r: 95, kind: 'altar', fl: [] });
  if (r.def.item) r.lights.push({ x: itemX(r.def) + 6, y: 200, r: 50, kind: 'item', fl: [] });
  r.cob = [rng() < .6, rng() < .6];
}
