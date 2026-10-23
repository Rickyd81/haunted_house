// ===== AUDIO (sintetizzato con WebAudio) =====
let AC = null, master = null, musicGain = null, muted = false, musicTimer = null, mstep = 0, noiseBuf = null;

function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = muted ? 0 : .5; master.connect(AC.destination);
    musicGain = AC.createGain(); musicGain.gain.value = .6; musicGain.connect(master);
    startMusic();
  } catch (e) { AC = null; }
}
function toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : .5; showToast(muted ? 'Audio disattivato' : 'Audio attivo'); }

function tone(f, d, type = 'square', v = .15, slide = 0, delay = 0) {
  if (!AC) return;
  const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g).connect(master); o.start(t); o.stop(t + d + .02);
}
function noise(d, v = .2, freq = 1200, delay = 0, type = 'lowpass') {
  if (!AC) return;
  if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
  const t = AC.currentTime + delay, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = noiseBuf; f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
  s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + d + .02);
}
const sfx = {
  jump: d => tone(d ? 420 : 300, .12, 'square', .05, d ? 300 : 200),
  swing: () => noise(.09, .12, 2500, 0, 'bandpass'),
  heavy: () => noise(.16, .16, 900, 0, 'bandpass'),
  bow: () => { tone(700, .06, 'triangle', .08, -300); noise(.05, .08, 3000); },
  hit: () => { tone(150, .08, 'square', .09, -80); noise(.06, .12, 1500); },
  crit: () => { tone(900, .1, 'square', .06, -400); noise(.08, .14, 2000); },
  hurt: () => { tone(220, .25, 'sawtooth', .13, -150); noise(.12, .12, 600); },
  kill: () => { tone(320, .18, 'square', .06, -250); noise(.18, .1, 800); },
  lvl: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .25, 'square', .06, 0, i * .09)),
  pick: () => [660, 880, 1320].forEach((f, i) => tone(f, .15, 'triangle', .1, 0, i * .06)),
  secret: () => [392, 494, 587, 784].forEach((f, i) => tone(f, .3, 'triangle', .09, 0, i * .12)),
  crack: () => noise(.12, .2, 400),
  save: () => [330, 415, 494, 659].forEach((f, i) => tone(f, .6, 'sine', .08, 0, i * .15)),
  dash: () => noise(.15, .1, 4000, 0, 'highpass'),
  roar: () => { tone(90, .9, 'sawtooth', .14, -40); noise(.9, .12, 300); },
  thud: () => { tone(70, .3, 'square', .14, -30); noise(.25, .2, 200); },
  throw: () => tone(500, .08, 'triangle', .06, 200),
  magic: () => tone(880, .2, 'sine', .06, -500),
  potion: () => [440, 554, 659].forEach((f, i) => tone(f, .2, 'sine', .08, 0, i * .07)),
  thunder: () => noise(1.8, .16, 160),
  die: () => tone(200, 1.2, 'sawtooth', .12, -170),
  locked: () => tone(110, .15, 'square', .07),
};

function pad(f, t, d, v, type = 'triangle') {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 1.2); g.gain.linearRampToValueAtTime(0, t + d);
  o.connect(g).connect(musicGain); o.start(t); o.stop(t + d + .1);
}
function bell(f, t) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.035, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 1.8);
  o.connect(g).connect(musicGain); o.start(t); o.stop(t + 1.9);
}
// Organo cupo + carillon: progressione minore i - VI - VII - V
function startMusic() {
  if (musicTimer) return;
  const prog = [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]];
  const tick = () => {
    if (!AC) return;
    const root = (AREAS[curArea] || AREAS.A).root, t = AC.currentTime + .05, ch = prog[mstep % 4];
    mstep++;
    const bossOn = !!boss && !boss.dying;
    ch.forEach(s => pad(root * 2 * Math.pow(2, s / 12), t, 4.2, .02));
    pad(root / 2 * Math.pow(2, ch[0] / 12), t, 4.2, .05);
    if (bossOn) for (let i = 0; i < 8; i++) tone(root / 2 * Math.pow(2, ch[0] / 12), .25, 'sawtooth', .025, 0, .05 + i * .5);
    const scale = [0, 3, 5, 7, 10, 12, 15];
    for (let i = 0; i < (bossOn ? 6 : 3); i++) if (Math.random() < .7) bell(root * 4 * Math.pow(2, (pick(scale) + ch[0]) / 12), t + i * (bossOn ? .65 : 1.3));
  };
  tick(); musicTimer = setInterval(tick, 4000);
}
