/* Pantalla del anfitrión (la que se proyecta). Lleva toda la lógica del juego. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const qs = new URLSearchParams(location.search);
  const TEST = qs.has('test');
  const lang = 'eu';
  const tt = () => T[lang];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ORDER = ['rebel', 'magician', 'caregiver', 'jester'];
  const G = { slide: 0, phase: 'lobby', order: [], r: -1, idx: -1, timers: [], stats: {}, rank: {}, ending: false };
  const players = new Map();
  let peer = null, room = '';

  const later = (ms, fn) => G.timers.push(setTimeout(fn, ms));
  const clearTimers = () => { G.timers.forEach(clearTimeout); G.timers = []; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const arch = () => G.order[G.r];
  const active = () => [...players.values()].filter(p => p.connected || p.bot);
  const ranking = () => [...players.values()].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  /* ---------- red (PeerJS) ---------- */
  function randCode() { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; let s = ''; for (let i = 0; i < 4; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }
  function setNet(ok) { const n = $('#net'); n.className = ok ? 'ok' : 'err'; n.textContent = ok ? tt().netOk : tt().netErr; }
  function initPeer() {
    room = randCode();
    renderLobby();
    if (typeof Peer === 'undefined') { setNet(false); return; }
    try { peer = new Peer(ROOM_PREFIX + room.toLowerCase()); } catch (e) { setNet(false); return; }
    peer.on('open', () => setNet(true));
    peer.on('connection', c => {
      c.on('data', m => onMsg(c, m));
      c.on('close', () => onClose(c));
      c.on('error', () => onClose(c));
    });
    peer.on('error', e => { if (e.type === 'unavailable-id') { try { peer.destroy(); } catch (_) {} initPeer(); } else if (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error') setNet(false); });
    peer.on('disconnected', () => { setNet(false); try { peer.reconnect(); } catch (_) {} });
  }
  function onMsg(c, m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'join') {
      const pid = String(m.pid || '').slice(0, 20); if (!pid) return;
      let p = players.get(pid);
      if (!p) {
        let nm = String(m.name || '?').trim().slice(0, 14) || '?', base = nm, i = 2;
        while ([...players.values()].some(x => x.name === nm)) nm = base + i++;
        p = { pid, name: nm, score: 0, pick: null, pickClue: -1, gain: 0, bot: false };
        players.set(pid, p);
      }
      p.conn = c; p.connected = true; c.pid = pid;
      send(p); renderPlayers(); if (G.phase === 'round') renderCount();
    } else if (m.t === 'a') {
      const p = players.get(c.pid); if (p) answer(p, m.r, m.pick);
    }
  }
  function onClose(c) {
    const p = players.get(c.pid);
    if (p && p.conn === c) { p.connected = false; renderPlayers(); if (G.phase === 'round') { renderCount(); checkAll(); } }
  }
  function stateFor(p) {
    const a = G.r >= 0 ? G.order[G.r] : null;
    const s = { t: 's', phase: G.phase, lang, r: G.r + 1, total: ORDER.length, idx: G.idx, clues: [], name: p.name };
    if (G.phase === 'round' && G.idx >= 0) s.clues = CONTENT[a].clues[lang].slice(0, G.idx + 1);
    if (G.phase === 'round') { s.locked = p.pick != null; s.pick = p.pick; }
    if (G.phase === 'reveal') s.res = { pick: p.pick, correct: a, gain: p.gain, score: p.score, rank: G.rank[p.pid], ok: p.pick === a };
    if (G.phase === 'final' || G.phase === 'slides') s.res = { score: p.score, rank: G.rank[p.pid] };
    return s;
  }
  function send(p) { try { if (p.conn && p.conn.open) p.conn.send(stateFor(p)); } catch (_) {} }
  function broadcast() { players.forEach(send); }

  /* ---------- juego ---------- */
  const MEMES = { jester: 'meme-jester.mp4', magician: 'meme-magician.mp4', caregiver: 'meme-caregiver.jpg', rebel: 'meme-rebel.jpg' };
  const LEVELS = { lobby: 0.9, round: 0.28, reveal: 0.9, final: 1, slides: 0.5 };
  function setPhase(ph) {
    G.phase = ph; document.body.dataset.phase = ph; setGo();
    Music.setLevel(LEVELS[ph] || 0.8);
    if (ph !== 'round' && ph !== 'reveal') $('#meme').innerHTML = '';
  }
  function showMeme(id) {
    const src = MEMES[id], m = $('#meme');
    m.innerHTML = /\.mp4$/.test(src) ? `<video src="${src}" autoplay muted loop playsinline></video>` : `<img src="${src}" alt="">`;
    const v = m.querySelector('video'); if (v) { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
  }
  function syncMus() { $('#mus').textContent = (Music.started && !Music.muted) ? '♪ Musika: ON' : '♪ Musika: OFF'; }
  function setGo() {
    const t = tt(); let k = 'start';
    if (G.phase === 'round') k = G.idx < 4 ? 'nextClue' : 'seeAnswer';
    else if (G.phase === 'reveal') k = G.r < ORDER.length - 1 ? 'nextRound' : 'seeRank';
    else if (G.phase === 'final') k = 'seeRecap';
    else if (G.phase === 'slides') k = G.slide < SLIDE_ORDER.length - 1 ? 'nextSlide' : 'again';
    $('#go').textContent = t[k];
  }
  function startGame() {
    clearTimers();
    G.order = shuffle(ORDER); G.r = -1; G.stats = {};
    players.forEach(p => { p.score = 0; });
    nextRound();
  }
  function nextRound() {
    clearTimers();
    G.r++;
    if (G.r >= G.order.length) return showFinal();
    G.idx = -1; G.ending = false;
    players.forEach(p => { p.pick = null; p.pickClue = -1; p.gain = 0; });
    setPhase('round');
    $('#badge').textContent = `${tt().round} ${G.r + 1}/${G.order.length}`;
    $('#bar i').style.transition = 'none'; $('#bar i').style.width = '0';
    renderRound(); broadcast();
    showMeme(arch());
    later(2500, revealClue);
  }
  function revealClue() {
    clearTimers();
    if (G.phase !== 'round') return;
    G.idx++;
    renderRound(); setGo(); broadcast(); botsAct(); startBar();
    later(CLUE_SECS * 1000, G.idx < 4 ? revealClue : endRound);
  }
  function answer(p, r, pick) {
    if (G.phase !== 'round' || G.idx < 0 || r !== G.r + 1 || p.pick != null || !ARCH.some(a => a.id === pick)) return;
    p.pick = pick; p.pickClue = G.idx;
    send(p); renderCount(); checkAll();
  }
  function checkAll() {
    if (G.phase !== 'round' || G.idx < 0 || G.ending) return;
    const act = active();
    if (act.length && act.every(p => p.pick != null)) { G.ending = true; clearTimers(); later(900, endRound); }
  }
  function endRound() {
    if (G.phase !== 'round') return;
    clearTimers();
    const a = arch(), hist = {}; let ok = 0, n = 0;
    players.forEach(p => {
      if (p.pick) { n++; hist[p.pick] = (hist[p.pick] || 0) + 1; }
      p.gain = p.pick === a ? PTS[p.pickClue] : 0;
      if (p.gain) ok++;
      p.score += p.gain;
    });
    G.stats[a] = { n, ok, hist };
    G.rank = {}; ranking().forEach((p, i) => G.rank[p.pid] = i + 1);
    setPhase('reveal');
    renderReveal(); broadcast();
  }
  function showFinal() {
    G.rank = {}; ranking().forEach((p, i) => G.rank[p.pid] = i + 1);
    setPhase('final'); renderFinal(); broadcast();
  }
  function showSlides() { G.slide = 0; setPhase('slides'); renderSlide(); broadcast(); }
  function gotoSlide(n) {
    if (G.phase !== 'slides') return;
    G.slide = Math.max(0, Math.min(SLIDE_ORDER.length - 1, n));
    renderSlide(); setGo();
  }
  function advance(fromKey) {
    switch (G.phase) {
      case 'lobby': return startGame();
      case 'round': return G.idx < 4 ? revealClue() : endRound();
      case 'reveal': return nextRound();
      case 'final': return showSlides();
      case 'slides':
        if (G.slide < SLIDE_ORDER.length - 1) return gotoSlide(G.slide + 1);
        if (fromKey === true) return;          // al final, solo el botón reinicia (no una tecla suelta)
        return location.reload();
    }
  }

  /* bots de prueba (solo con ?test) */
  const BOTN = ['Ane', 'Jon', 'Maialen', 'Iker', 'Uxue', 'Mikel', 'Leire', 'Aitor', 'Nerea', 'Gorka'];
  function addBots() {
    for (let i = 0; i < 5; i++) {
      const pid = 'bot' + Math.random().toString(36).slice(2, 7);
      let nm = BOTN[Math.floor(Math.random() * BOTN.length)] + Math.floor(Math.random() * 90 + 10);
      players.set(pid, { pid, name: nm, score: 0, pick: null, pickClue: -1, gain: 0, bot: true, connected: true });
    }
    renderPlayers();
  }
  function botsAct() {
    if (G.phase !== 'round') return;
    players.forEach(p => {
      if (p.bot && p.pick == null && Math.random() < 0.3) {
        p.pick = Math.random() < 0.45 ? arch() : ARCH[Math.floor(Math.random() * ARCH.length)].id; p.pickClue = G.idx;
      }
    });
    renderCount(); checkAll();
  }

  /* ---------- render ---------- */
  function renderPlayers() {
    const all = [...players.values()];
    $('#meta').textContent = `${active().length} ${tt().players}`;
    const c = $('#chips');
    c.innerHTML = all.length ? all.map(p => `<span class="chip ${p.connected || p.bot ? '' : 'off'}">${esc(p.name)}</span>`).join('') : '';
  }
  function renderLobby() {
    $('#code').textContent = room;
    const u = new URL('index.html', location.href); u.search = ''; u.searchParams.set('room', room);
    $('#url').textContent = (u.host + u.pathname.replace(/index\.html$/, '')) || u.href;
    const q = $('#qr'); q.innerHTML = '';
    try { const qr = qrcode(0, 'M'); qr.addData(u.href); qr.make(); q.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0 }); } catch (e) { q.style.display = 'none'; }
    renderPlayers();
  }
  function renderRound() {
    const t = tt(), a = arch();
    $('#rlabel').textContent = `${t.round} ${G.r + 1}/${G.order.length}`;
    const box = $('#clues');
    if (G.idx < 0) { box.innerHTML = `<div class="panel card watch">${esc(t.watch)}</div>`; $('#ptsNow').textContent = ''; }
    else {
      const cl = CONTENT[a].clues[lang];
      let h = '';
      for (let i = G.idx; i >= 0; i--) h += `<div class="clue c${i}"><small>${esc(t.clueLbl[i])}</small><p>${esc(cl[i])}</p></div>`;
      box.innerHTML = h;
      $('#ptsNow').textContent = `${t.now}: ${PTS[G.idx]} ${t.pts}`;
    }
    renderCount();
  }
  function renderCount() {
    const act = active();
    $('#cnt').textContent = G.idx < 0 ? '' : `${act.filter(p => p.pick != null).length}/${act.length} ${tt().answered}`;
  }
  function startBar() {
    const b = $('#bar i'); b.style.transition = 'none'; b.style.width = '0'; void b.offsetWidth;
    b.style.transition = `width ${CLUE_SECS}s linear`; b.style.width = '100%';
  }
  function renderReveal() {
    const a = arch(), t = tt(), h = G.stats[a].hist;
    $('#stamp').textContent = archName(a, lang);
    const rows = ARCH.map(x => ({ id: x.id, n: h[x.id] || 0 })).filter(x => x.n > 0 || x.id === a).sort((x, y) => y.n - x.n);
    const max = Math.max(1, ...rows.map(r => r.n));
    $('#bars').innerHTML = rows.map(r => `<div class="bar ${r.id === a ? 'ok' : ''}"><span>${esc(archName(r.id, lang))}</span><i style="width:${(r.n / max) * 60}%"></i><b>${r.n}</b></div>`).join('');
    $('#lb').innerHTML = ranking().slice(0, 5).map(p => `<li>${esc(p.name)}<em>${p.score}${p.gain ? ` <b>+${p.gain}</b>` : ''}</em></li>`).join('');
  }
  function renderFinal() {
    const t = tt(), r = ranking(), pod = (p, i) => p ? `<div class="pod p${i + 1}"><div class="n">${['🥇', '🥈', '🥉'][i]}</div><div class="nm">${esc(p.name)}</div><div class="sc">${p.score} ${t.pts}</div></div>` : '';
    $('#final').innerHTML = `<h2>${esc(t.podium)}</h2><div class="podium">${pod(r[1], 1)}${pod(r[0], 0)}${pod(r[2], 2)}</div>` +
      `<div class="rest">${r.slice(3, 9).map((p, i) => `${i + 4}. ${esc(p.name)} (${p.score})`).join(' &nbsp;·&nbsp; ')}</div>`;
  }
  function mediaHTML(id) {
    const src = MEMES[id];
    return /\.mp4$/.test(src) ? `<video src="${src}" autoplay muted loop playsinline></video>` : `<img src="${src}" alt="">`;
  }
  function renderSlide() {
    const t = tt(), id = SLIDE_ORDER[G.slide], S = SLIDES[id];
    const s = G.stats[id];
    let stat = '';
    if (s && s.n) {
      const pct = Math.round((s.ok / s.n) * 100);
      const wrong = Object.entries(s.hist).filter(e => e[0] !== id).sort((a, b) => b[1] - a[1])[0];
      stat = `${pct}% ${t.hit}` + (wrong ? ` · ${t.confused}: ${archName(wrong[0], lang)}` : '');
    }
    $('#slides').innerHTML = `
      <div class="sl-text">
        <div class="lbl">${esc(t.sGroup)} · ${esc(S.group)}</div>
        <h2>${esc(archName(id, lang))}</h2>
        <div class="tag">${esc(S.tag)}</div>
        <dl>
          <div><dt>${esc(t.sWant)}</dt><dd>${esc(S.want)}</dd></div>
          <div><dt>${esc(t.sFear)}</dt><dd>${esc(S.fear)}</dd></div>
          <div><dt>${esc(t.sVoice)}</dt><dd>${esc(S.voice)}</dd></div>
          <div><dt>${esc(t.sLook)}</dt><dd>${esc(S.look)}</dd></div>
        </dl>
        <div class="brands"><span>${esc(t.sBrands)}</span> ${esc(S.brands)}</div>
      </div>
      <div class="sl-meme">
        <div class="mm">${mediaHTML(id)}</div>
        <div class="cap">${esc(S.memeCap)}${stat ? ` <b>· ${esc(stat)}</b>` : ''}</div>
        <div class="why">
          <div class="lbl">${esc(t.sWhy)}</div>
          <ul>${S.why.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="sl-n">${G.slide + 1}/${SLIDE_ORDER.length}</div>`;
    const v = $('#slides video'); if (v) { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    $('#prev').hidden = G.slide === 0;
  }
  function renderAll() {
    renderPlayers();
    if (G.phase === 'lobby') renderLobby();
    if (G.phase === 'round') renderRound();
    if (G.phase === 'reveal') renderReveal();
    if (G.phase === 'final') renderFinal();
    if (G.phase === 'slides') renderSlide();
  }
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = tt()[e.dataset.i18n]; });
    document.title = tt().title;
    if (G.r >= 0) $('#badge').textContent = `${tt().round} ${G.r + 1}/${G.order.length}`;
    if (G.phase === 'reveal') $('#stamp').textContent = archName(arch(), lang);
    setGo(); renderAll(); setNet($('#net').className === 'ok'); broadcast();
  }

  /* ---------- eventos ---------- */
  $('#go').addEventListener('click', () => advance());
  $('#prev').addEventListener('click', () => gotoSlide(G.slide - 1));
  function musClick() { if (!Music.started) Music.start(); else Music.toggle(); syncMus(); }
  $('#mus').addEventListener('click', e => { e.stopPropagation(); musClick(); $('#mus').blur(); });
  // el navegador solo deja sonar el audio tras un gesto: arranca con el primer clic o tecla
  const firstGesture = e => { if (!Music.started && !(e.target && e.target.id === 'mus')) { Music.start(); syncMus(); } };
  document.addEventListener('pointerdown', firstGesture);
  document.addEventListener('keydown', firstGesture);
  document.addEventListener('keydown', e => {
    if (e.code === 'KeyM') { musClick(); return; }
    if (e.code === 'ArrowLeft') { e.preventDefault(); gotoSlide(G.slide - 1); return; }
    if (['Space', 'Enter', 'ArrowRight', 'PageDown'].includes(e.code)) { e.preventDefault(); advance(true); }
  });
  if (TEST) { $('#bots').hidden = false; $('#bots').addEventListener('click', addBots); }

  applyLang();
  syncMus();
  initPeer();
})();
