/* Pantalla del jugador (móvil). */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const ls = {
    get: k => { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} }
  };
  const qs = new URLSearchParams(location.search);
  const lang = 'eu';
  let pid = ls.get('ark_pid');
  if (!pid) { pid = Math.random().toString(36).slice(2, 10); ls.set('ark_pid', pid); }
  let name = ls.get('ark_name') || '';
  let room = (qs.get('room') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
  let peer = null, conn = null, gen = 0, joined = false, st = null, sel = null, lastR = -1, retryT = 0, failT = 0;
  const tt = () => T[lang];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function show(id) { document.querySelectorAll('.scr').forEach(s => { s.hidden = s.id !== id; }); }
  function setMsg(t) { const m = $('#msg'); m.hidden = !t; m.textContent = t || ''; }
  function texts() {
    const t = tt();
    document.documentElement.lang = lang;
    $('#brand').textContent = t.title; $('#lName').textContent = t.yourName; $('#lCode').textContent = t.code; $('#bJoin').textContent = t.join;
    $('#rQ').textContent = t.pick; $('#bLock').textContent = t.lock; $('#rLook').textContent = t.look;
  }

  /* ---------- conexión ---------- */
  function connect() {
    clearTimeout(retryT); clearTimeout(failT);
    const my = ++gen;
    try { if (peer) peer.destroy(); } catch (_) {}
    if (typeof Peer === 'undefined') { fail(); return; }
    setMsg(tt().connecting);
    peer = new Peer();
    peer.on('open', () => {
      if (my !== gen) return;
      conn = peer.connect(ROOM_PREFIX + room.toLowerCase(), { reliable: true });
      conn.on('open', () => { if (my === gen) conn.send({ t: 'join', pid, name }); });
      conn.on('data', m => { if (my === gen) onData(m); });
      conn.on('close', () => { if (my === gen) lost(); });
      conn.on('error', () => { if (my === gen) lost(); });
    });
    peer.on('error', e => { if (my !== gen) return; if (e.type === 'peer-unavailable' && !joined) fail(); else lost(); });
    peer.on('disconnected', () => { if (my === gen && !joined) { try { peer.reconnect(); } catch (_) {} } });
    failT = setTimeout(() => { if (my === gen && !joined) fail(); }, 15000);
  }
  function lost() {
    if (!joined) return fail();
    setMsg(tt().connecting);
    clearTimeout(retryT); retryT = setTimeout(connect, 2000);
  }
  function fail() {
    gen++; clearTimeout(failT); clearTimeout(retryT);
    try { if (peer) peer.destroy(); } catch (_) {}
    setMsg(''); joined = false; show('join'); $('#err').textContent = tt().fail; $('#bJoin').disabled = false;
  }
  function onData(m) {
    if (!m || m.t !== 's') return;
    joined = true; clearTimeout(failT); setMsg('');
    if (m.r !== lastR) { sel = null; lastR = m.r; }
    st = m;
    if (m.locked && m.pick) sel = m.pick;
    render();
  }
  function sendAnswer() {
    if (!sel || !st || st.locked) return;
    try { conn.send({ t: 'a', r: st.r, pick: sel }); st.locked = true; render(); } catch (_) {}
  }

  /* ---------- pantallas ---------- */
  function render() {
    const t = tt();
    if (!st) return;
    if (st.phase === 'lobby') {
      show('wait'); $('#wTitle').textContent = t.inside; $('#wSub').textContent = `${st.name} · ${t.wait}`;
    } else if (st.phase === 'round') {
      show('round');
      $('#rNum').textContent = `${t.round} ${st.r}/${st.total}`;
      $('#rPts').textContent = st.idx >= 0 ? `${PTS[st.idx]} ${t.pts}` : '';
      const look = st.idx < 0;
      $('#rLook').hidden = !look; $('#rPick').hidden = look;
      $('#rClues').innerHTML = st.clues.map((c, i) => [i, c]).reverse().map(([i, c]) => `<div class="pclue c${i}"><small>${esc(t.clueLbl[i])}</small><p>${esc(c)}</p></div>`).join('');
      if (!look) {
        const o = $('#opts');
        if (!o.children.length || o.dataset.lang !== lang) {
          o.dataset.lang = lang;
          o.innerHTML = sortedArch(lang).map(a => `<button type="button" class="opt" data-id="${a.id}">${esc(a[lang])}</button>`).join('');
        }
        o.querySelectorAll('.opt').forEach(b => { b.classList.toggle('sel', b.dataset.id === sel); b.disabled = !!st.locked; });
        const bl = $('#bLock'); bl.disabled = !sel || !!st.locked; bl.textContent = st.locked ? t.locked : t.lock;
      }
    } else if (st.phase === 'reveal') {
      show('reveal');
      const r = st.res || {}, box = $('#resBox');
      box.classList.toggle('ok', !!r.ok); box.classList.toggle('ko', !r.ok);
      $('#resTitle').textContent = r.pick ? (r.ok ? t.right : t.wrong) : t.noAnswer;
      $('#resIt').textContent = `${t.itWasP} ${archName(r.correct, lang)}`;
      $('#resGain').textContent = `+${r.gain || 0} ${t.pts}`;
      $('#resRank').textContent = `${t.place}: ${r.rank} · ${r.score} ${t.pts}`;
    } else {
      show('end');
      const r = st.res || {};
      $('#eTitle').textContent = t.end; $('#eRank').textContent = `${t.place}: ${r.rank} · ${r.score} ${t.pts}`; $('#eSub').textContent = t.endSub;
    }
  }

  /* ---------- eventos ---------- */
  $('#join').addEventListener('submit', e => {
    e.preventDefault();
    name = $('#fName').value.trim(); room = $('#fCode').value.toUpperCase().replace(/[^A-Z]/g, '');
    if (!name || room.length !== 4) return;
    ls.set('ark_name', name);
    $('#err').textContent = ''; $('#bJoin').disabled = true;
    connect();
  });
  $('#opts').addEventListener('click', e => {
    const b = e.target.closest('.opt'); if (!b || (st && st.locked)) return;
    sel = b.dataset.id; render();
  });
  $('#bLock').addEventListener('click', sendAnswer);

  texts(); show('join');
  $('#fName').value = name; $('#fCode').value = room;
  if (name && room.length === 4 && qs.get('room')) { /* viene del QR: el nombre se pide igualmente la primera vez */ }
})();
