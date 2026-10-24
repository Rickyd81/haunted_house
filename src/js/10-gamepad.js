// ===== CONTROLLER (Gamepad API) con tasti configurabili =====
// Le azioni del controller diventano tasti virtuali "GP_<azione>" letti da hit()/down().
// Le direzioni (croce direzionale e levetta sinistra) sono fisse; le azioni si rimappano dal Diario.
// Predefiniti pensati per lo Switch Pro: B salta, Y attacca, A scatto, X pozione, L/R armi, − mappa, + diario.
const PAD_ACTIONS = [
  ['jump', 'Salta / conferma'],
  ['attack', 'Attacca'],
  ['dash', 'Scatto'],
  ['potion', 'Pozione'],
  ['prev', 'Arma precedente'],
  ['next', 'Arma successiva'],
  ['map', 'Mappa'],
  ['pause', 'Diario / pausa'],
];
const PAD_DEFAULT = { jump: 0, attack: 2, dash: 1, potion: 3, prev: 4, next: 5, map: 8, pause: 9 };
const PAD_KEY = 'villa_morgrave_pad';
let padMap = loadPadMap();
let padPrev = [], padName = '', padIdx = -1, padHeld = [];
let padWait = null;          // azione in attesa di un nuovo pulsante
let pauseTab = 0, padSel = 0; // scheda del Diario: 0 diario, 1 controller

function loadPadMap() {
  try { const s = JSON.parse(localStorage.getItem(PAD_KEY) || 'null'); if (s) return Object.assign({}, PAD_DEFAULT, s); } catch (e) { }
  return Object.assign({}, PAD_DEFAULT);
}
function savePadMap() { try { localStorage.setItem(PAD_KEY, JSON.stringify(padMap)); } catch (e) { } }

// Nomi dei pulsanti secondo il Nintendo Switch Pro Controller (mappatura standard del browser, per posizione):
// 0 = pulsante in basso (B), 1 = a destra (A), 2 = a sinistra (Y), 3 = in alto (X)
const SWITCH_NAMES = ['B', 'A', 'Y', 'X', 'L', 'R', 'ZL', 'ZR', '−', '+', 'Levetta L', 'Levetta R', 'Su', 'Giù', 'Sinistra', 'Destra', 'Home', 'Cattura'];
function buttonName(i) { return SWITCH_NAMES[i] || 'Pulsante ' + i; }

function getPad() {
  let pads = [];
  try { pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { return null; }
  if (padIdx >= 0 && pads[padIdx] && pads[padIdx].connected) return pads[padIdx];
  const p = pads.find(g => g && g.connected);
  if (p) { padIdx = p.index; padName = p.id; }
  return p || null;
}

// chiamata una volta per frame, prima degli aggiornamenti
function pollPad() {
  const gp = getPad();
  if (!gp) { for (const a of ['GP_left', 'GP_right', 'GP_up', 'GP_down', ...PAD_ACTIONS.map(x => 'GP_' + x[0])]) keys[a] = false; padPrev = []; padHeld = []; return; }
  const btn = i => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > .5));
  const now = gp.buttons.map((_, i) => btn(i));
  const fresh = now.map((v, i) => v && !padPrev[i]);
  padHeld = now;
  if (fresh.some(Boolean)) initAudio();
  // configurazione: il primo pulsante nuovo diventa il comando dell'azione scelta
  if (padWait) {
    const i = fresh.findIndex(Boolean);
    if (i >= 0 && !(i >= 12 && i <= 15)) {
      const other = Object.keys(padMap).find(k => padMap[k] === i && k !== padWait);
      if (other) padMap[other] = padMap[padWait]; // scambio se il pulsante era già usato
      padMap[padWait] = i; savePadMap(); sfx.pick();
      showToast(`${PAD_ACTIONS.find(a => a[0] === padWait)[1]}: ${buttonName(i)}`, 2);
      padWait = null; padPrev = now;
      return;
    }
    padPrev = now;
    return;
  }
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, dz = .5;
  const dirs = { GP_left: btn(14) || ax < -dz, GP_right: btn(15) || ax > dz, GP_up: btn(12) || ay < -dz, GP_down: btn(13) || ay > dz };
  for (const k in dirs) { if (dirs[k] && !keys[k]) pressed[k] = true; keys[k] = dirs[k]; }
  for (const [a] of PAD_ACTIONS) {
    const i = padMap[a], k = 'GP_' + a;
    if (fresh[i]) pressed[k] = true;
    keys[k] = now[i];
  }
  padPrev = now;
}

addEventListener('gamepadconnected', e => { padIdx = e.gamepad.index; padName = e.gamepad.id; showToast('Controller collegato', 2.5); });
addEventListener('gamepaddisconnected', e => { if (e.gamepad.index === padIdx) { padIdx = -1; showToast('Controller scollegato', 2.5); } });

// ----- Scheda "Controller" del Diario -----
function updatePadMenu() {
  if (padWait) { if (pressed['Escape'] || pressed['Backspace']) { padWait = null; showToast('Configurazione annullata', 1.5); } return; }
  const n = PAD_ACTIONS.length + 1; // ultima riga: ripristina
  if (hit('up')) padSel = (padSel + n - 1) % n;
  if (hit('down')) padSel = (padSel + 1) % n;
  if (['KeyX', 'KeyJ', 'KeyZ', 'Space', 'GP_jump'].some(k => pressed[k])) {
    if (padSel === PAD_ACTIONS.length) { padMap = Object.assign({}, PAD_DEFAULT); savePadMap(); sfx.pick(); showToast('Comandi predefiniti ripristinati', 2); }
    else if (!getPad()) showToast('Nessun controller rilevato: premi un pulsante del controller', 2.5);
    else { padWait = PAD_ACTIONS[padSel][0]; sfx.throw(); }
  }
}
function drawPadMenu() {
  const gp = getPad();
  panel(16, 40, 448, 168);
  text('CONTROLLER', 26, 48, '#c9a24a');
  const nm = gp ? (gp.id.length > 46 ? gp.id.slice(0, 46) + '…' : gp.id) : 'Nessun controller rilevato';
  text(nm, 454, 48, gp ? '#8ad08a' : '#d07a7a', 'right');
  PAD_ACTIONS.forEach(([a, label], i) => {
    const y = 64 + i * 13, sel = i === padSel, waiting = padWait === a;
    if (sel) { ctx.fillStyle = 'rgba(201,162,74,.18)'; ctx.fillRect(22, y - 2, 436, 12); }
    text(label, 30, y, sel ? '#fff2b0' : '#d8d0e0');
    const live = gp && padHeld[padMap[a]];
    const v = waiting ? (Math.floor(gameT * 3) % 2 ? 'Premi un pulsante…' : '') : buttonName(padMap[a]);
    text(v, 450, y, waiting ? '#ffd34a' : live ? '#8ad08a' : '#c8c0d0', 'right');
  });
  const ry = 64 + PAD_ACTIONS.length * 13 + 4, rs = padSel === PAD_ACTIONS.length;
  if (rs) { ctx.fillStyle = 'rgba(201,162,74,.18)'; ctx.fillRect(22, ry - 2, 436, 12); }
  text('Ripristina comandi predefiniti', 30, ry, rs ? '#fff2b0' : '#a89eb0');
  text('Movimento: croce direzionale o levetta sinistra (Giù + salto per scendere dalle travi)', W / 2, 216, '#a89eb0', 'center');
  text(padWait ? 'Premi il pulsante da assegnare · Esc per annullare' : 'Su/Giù scegli · X o pulsante Salta per cambiare · Sinistra/Destra cambia scheda', W / 2, 232, '#7a7088', 'center');
}
