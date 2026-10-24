// ===== CORE: costanti, utilità, input =====
const W = 480, H = 272, TS = 16, CW = 30, CH = 17;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
const PF = '"Silkscreen","Courier New",monospace';
const DF = '"Pirata One",Georgia,serif';

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const approach = (v, t, a) => v < t ? Math.min(v + a, t) : Math.max(v - a, t);

// ----- Input -----
const keys = {}, pressed = {};
const BIND = {
  left: ['ArrowLeft', 'KeyA', 'GP_left'], right: ['ArrowRight', 'KeyD', 'GP_right'],
  up: ['ArrowUp', 'KeyW', 'GP_up'], down: ['ArrowDown', 'KeyS', 'GP_down'],
  jump: ['Space', 'KeyZ', 'ArrowUp', 'KeyW', 'GP_jump'],
  attack: ['KeyX', 'KeyJ', 'GP_attack'],
  dash: ['KeyC', 'KeyK', 'ShiftLeft', 'ShiftRight', 'GP_dash'],
  prev: ['KeyQ', 'GP_prev'], next: ['KeyE', 'GP_next'],
  potion: ['KeyF', 'KeyV', 'GP_potion'],
  map: ['KeyM', 'Tab', 'GP_map'],
  pause: ['Enter', 'Escape', 'KeyP', 'GP_pause'],
  mute: ['KeyN'],
};
const CONFIRM = ['Enter', 'Space', 'KeyX', 'KeyJ', 'KeyZ', 'GP_jump', 'GP_attack'];
const down = a => BIND[a].some(k => keys[k]);
const hit = a => BIND[a].some(k => pressed[k]);
const hitConfirm = () => CONFIRM.some(k => pressed[k]);

addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  if (!keys[e.code]) pressed[e.code] = true;
  keys[e.code] = true;
  initAudio();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

// Comandi touch
document.querySelectorAll('[data-k]').forEach(b => {
  const k = b.dataset.k;
  const on = e => { e.preventDefault(); if (!keys[k]) pressed[k] = true; keys[k] = true; b.classList.add('on'); initAudio(); try { b.setPointerCapture(e.pointerId); } catch (_) { } };
  const off = e => { e.preventDefault(); keys[k] = false; b.classList.remove('on'); };
  b.addEventListener('pointerdown', on);
  b.addEventListener('pointerup', off);
  b.addEventListener('pointercancel', off);
  b.addEventListener('contextmenu', e => e.preventDefault());
});
cv.addEventListener('pointerdown', () => { initAudio(); if (state !== 'play') pressed['KeyX'] = true; });
