// ===== CICLO PRINCIPALE =====
let titleRoom = null;
function titleOpts() { return loadSave() ? ['Continua', 'Nuova partita'] : ['Nuova partita']; }

function newGame() {
  S = newSave(); persist();
  P = makePlayer(150, 218);
  curArea = null; enterRoom('4,3');
  state = 'play';
  showMsg('Villa Morgrave', [
    'Da tre notti le campane della villa suonano da sole.',
    'Il Conte Malachia ha risvegliato i morti della sua stirpe.',
    'Tu, Cavaliere della Veglia, devi porre fine all\'incubo:',
    'sconfiggi i cinque custodi, prendi i loro Emblemi',
    'e spezza il sigillo del Santuario.',
    'Gli altari dalla fiamma blu curano e salvano.',
  ]);
  showMsg('Un fedele compagno', [
    'Prima di entrare, il vecchio custode del cancello',
    'ti affida il suo cane: "Non combatte, ma non ti',
    'lascerà mai solo. E abbaia se sente i morti."',
    'Puoi lasciarlo a casa dal Diario, scheda Opzioni.',
  ]);
}
function continueGame() {
  const s = loadSave(); if (!s) return newGame();
  S = Object.assign(newSave(), s);
  curArea = null;
  respawn();
}

function update(dt) {
  gameT += dt;
  if (hit('mute')) toggleMute();
  if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
  if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
  if (lvlFx > 0) lvlFx -= dt;
  if (flashScreen > 0) flashScreen -= dt * 2;
  updateAmbient(dt);
  if (fade > 0 && state !== 'play') fade -= dt * 4;
  switch (state) {
    case 'title': {
      const opts = titleOpts();
      if (titleSel >= opts.length) titleSel = 0;
      if (hit('up')) titleSel = (titleSel + opts.length - 1) % opts.length;
      if (hit('down')) titleSel = (titleSel + 1) % opts.length;
      if (hitConfirm()) { initAudio(); opts[titleSel] === 'Continua' ? continueGame() : newGame(); }
      return;
    }
    case 'msg':
      msg.t += dt;
      if (msg.t > .4 && hitConfirm()) {
        const m = msg; msg = msgQueue.shift() || null;
        if (msg) { msg.prev = m.prev; }
        else { state = m.next || (m.prev === 'msg' ? 'play' : m.prev) || 'play'; if (state === 'victory') victoryT = 0; }
      }
      return;
    case 'map': if (hit('map') || hit('pause')) state = 'play'; return;
    case 'pause': {
      if (padWait) { updatePadMenu(); return; }
      if (hit('left') || hit('right')) { pauseTab = (pauseTab + (hit('right') ? 1 : 2)) % 3; sfx.throw(); }
      else if (pauseTab === 1) updatePadMenu();
      else if (pauseTab === 2) updateOptMenu();
      else {
        const list = WORDER.filter(k => S.weapons.includes(k));
        if (hit('up')) pauseSel = (pauseSel + list.length - 1) % list.length;
        if (hit('down')) pauseSel = (pauseSel + 1) % list.length;
        if (['KeyX', 'KeyJ', 'KeyZ', 'Space', 'GP_jump', 'GP_attack'].some(k => pressed[k])) { S.weapon = list[pauseSel]; sfx.pick(); }
      }
      if (!padWait && hit('pause')) state = 'play';
      return;
    }
    case 'dead': deadT += dt; updateParticles(dt); if (deadT > 1.5 && hitConfirm()) respawn(); return;
    case 'victory': victoryT += dt; if (victoryT > 2 && hitConfirm()) { state = 'title'; titleSel = 0; } return;
  }
  // gioco
  S.time += dt;
  if (hit('map')) { state = 'map'; return; }
  if (hit('pause')) { state = 'pause'; pauseSel = Math.max(0, WORDER.filter(k => S.weapons.includes(k)).indexOf(S.weapon)); return; }
  if (shake > 0) shake -= dt;
  if (fade > 0) fade -= dt * 4;
  if (hitstop > 0) { hitstop -= dt; return; }
  const before = room;
  updatePlayer(dt);
  if (room !== before || state !== 'play') return;
  updateDog(dt);
  for (const e of enemies.slice()) e.isBoss ? updateBoss(e, dt) : updateEnemy(e, dt);
  enemies = enemies.filter(e => !e.dead && e.y < H + 40 && e.x > -40 && e.x < W + 40);
  updateProjs(dt); updatePickups(dt); updateParticles(dt);
  checkAltar();
  if (pendingReward) { pendingReward.t -= dt; if (pendingReward.t <= 0) { const id = pendingReward.id; pendingReward = null; giveReward(id); } }
}

function updateAmbient(dt) {
  if (lightning > 0) lightning = Math.max(0, lightning - dt * 3);
  lightningT -= dt;
  const a = state === 'title' ? 'A' : room && room.def.a;
  if (lightningT <= 0) {
    lightningT = rand(7, 15);
    if (a === 'A' || a === 'T') { lightning = 1; setTimeout(() => sfx.thunder(), 300 + Math.random() * 700); }
  }
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (state === 'title') { drawTitle(); return; }
  if (state === 'victory') { drawVictory(); return; }
  if (!room) return;
  ctx.save();
  if (shake > 0 && state === 'play') ctx.translate(Math.round(rand(-2, 2) * Math.min(1, shake * 5)), Math.round(rand(-2, 2) * Math.min(1, shake * 5)));
  ctx.drawImage(room.cache, 0, 0);
  drawRoomDynamic();
  for (const k of pickups) drawPickup(k);
  for (const e of enemies) drawEnemy(e);
  drawDog();
  if (state !== 'dead') drawPlayer();
  for (const p of projs) drawProj(p);
  for (const p of parts) { ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.max * 1.5)); ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); }
  ctx.globalAlpha = 1;
  drawLighting();
  for (const t of texts) { ctx.globalAlpha = Math.min(1, t.life * 2); text(t.s, t.x, t.y, t.c, 'center'); }
  ctx.globalAlpha = 1;
  ctx.restore();
  if (flashScreen > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(.8, flashScreen)})`; ctx.fillRect(0, 0, W, H); }
  if (P && P.inv > .8 && state === 'play') { ctx.fillStyle = 'rgba(160,0,20,.18)'; ctx.fillRect(0, 0, W, H); }
  drawHUD();
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  if (state === 'map') drawMapScreen();
  if (state === 'pause') drawPause();
  if (state === 'msg') drawMsg();
  if (state === 'dead') {
    ctx.fillStyle = `rgba(20,0,4,${Math.min(.85, deadT)})`; ctx.fillRect(0, 0, W, H);
    text('Sei caduto', W / 2, 90, '#d03040', 'center', 44, DF);
    if (deadT > 1.5) text("Premi X per rinascere all'ultimo altare", W / 2, 150, '#c8b8c0', 'center');
  }
}

const STEP = 1 / 60;
let last = performance.now(), acc = 0;
function loop(now) {
  acc += Math.min(.1, (now - last) / 1000); last = now;
  try { pollPad(); } catch (err) { console.error(err); }
  while (acc >= STEP) {
    try { update(STEP); } catch (err) { console.error(err); }
    for (const k in pressed) delete pressed[k];
    acc -= STEP;
  }
  try { draw(); } catch (err) { console.error(err); }
  requestAnimationFrame(loop);
}

function boot(data) {
  titleRoom = buildRoom('4,3'); renderRoom(titleRoom);
  if (data && data.S && data.room && ROOMS[data.room]) {
    S = Object.assign(newSave(), data.S); curArea = null;
    P = makePlayer(data.x || 150, data.y || 200);
    enterRoom(data.room); banner = null; fade = 0;
    state = data.state === 'play' ? 'play' : 'pause';
  }
  last = performance.now();
  requestAnimationFrame(loop);
}
try { window.claude?.hot?.snapshot?.(() => ({ S, room: room && room.key, x: P && P.x, y: P && P.y, state: state === 'play' || state === 'pause' || state === 'map' ? 'play' : 'title' })); } catch (e) { }
if (window.claude?.hot?.ready) window.claude.hot.ready(boot); else boot(window.claude?.hot?.data ?? {});

// accesso per i test
window.__vm = { get S() { return S; }, get state() { return state; }, get room() { return room; }, get P() { return P; }, get enemies() { return enemies; }, enterRoom, newGame, startBoss, giveReward, gainXP, spawnEnemy, hurtEnemy, set state(v) { state = v; } };
