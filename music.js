/* Música house generada en el navegador con WebAudio (sin archivos, sin derechos de autor). ~124 BPM, bajo en contratiempo, stabs, arpegio. */
const Music = (function () {
  let ctx = null, comp, master, duckG, dly, noiseBuf, timer = 0, step = 0, next = 0;
  let started = false, muted = false, level = 0.9;
  const BPM = 124, S16 = 60 / BPM / 4, BAR = S16 * 16;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]; // Am7 Fmaj7 Cmaj7 G7
  const ROOT = [33, 29, 36, 31];

  function noise(t, dur, type, freq, q, vol, out) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(out || comp);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g); g.connect(comp); o.start(t); o.stop(t + 0.4);
    duckG.gain.cancelScheduledValues(t); duckG.gain.setValueAtTime(0.35, t); duckG.gain.linearRampToValueAtTime(1, t + S16 * 3.2);
  }
  const hat = (t, vol, open) => noise(t, open ? 0.12 : 0.04, 'highpass', 7000, 0.7, vol);
  const clap = t => noise(t, 0.16, 'bandpass', 1500, 0.8, 0.7);
  function bass(t, m, len) {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = mtof(m); f.type = 'lowpass'; f.Q.value = 6;
    f.frequency.setValueAtTime(1200, t); f.frequency.exponentialRampToValueAtTime(220, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.42, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    o.connect(f); f.connect(g); g.connect(duckG); o.start(t); o.stop(t + len + 0.05);
  }
  function stab(t, chord, len) {
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'lowpass'; f.frequency.value = 2400;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.09, t + 0.006); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    chord.forEach(m => [-6, 6].forEach(d => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m + 12); o.detune.value = d;
      o.connect(f); o.start(t); o.stop(t + len + 0.05);
    }));
    f.connect(g); g.connect(duckG); g.connect(dly);
  }
  function arp(t, m) {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = mtof(m); f.type = 'lowpass'; f.frequency.value = 3200;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.004); g.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
    o.connect(f); f.connect(g); g.connect(duckG); g.connect(dly); o.start(t); o.stop(t + 0.2);
  }
  const ARP = [0, 2, 1, 3, 2, 1, 3, 0];
  function tick(s, t) {
    const bar = Math.floor(s / 16), st = s % 16, bi = bar % 16, ch = CH[bar % 4], root = ROOT[bar % 4];
    if (st % 4 === 0) kick(t);
    if (st % 4 === 2) hat(t, 0.26, true); else if (st % 2 === 1 && bi >= 1) hat(t, 0.06, false);
    if (bi === 15 && st >= 8) hat(t, 0.18, false);
    if (bi >= 2 && (st === 4 || st === 12)) clap(t);
    if (st % 4 === 2) bass(t, root + (st === 14 && bar % 2 ? 12 : 0), S16 * 1.7);
    if (bi >= 4 && (st === 3 || st === 6 || st === 10)) stab(t, ch, S16 * 1.6);
    if (bi >= 8 && bi < 15 && st % 2 === 0) arp(t, ch[ARP[st / 2]] + 24);
  }
  function sched() { while (next < ctx.currentTime + 0.35) { tick(step, next); next += S16; step++; } }
  function apply() { if (ctx) master.gain.setTargetAtTime(muted ? 0 : level, ctx.currentTime, 0.25); }

  function start() {
    if (started) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master = ctx.createGain(); master.gain.value = 0;
    comp.connect(master); master.connect(ctx.destination);
    duckG = ctx.createGain(); duckG.connect(comp);
    dly = ctx.createDelay(1); dly.delayTime.value = S16 * 3;
    const fb = ctx.createGain(); fb.gain.value = 0.35;
    const wet = ctx.createGain(); wet.gain.value = 0.35;
    dly.connect(fb); fb.connect(dly); dly.connect(wet); wet.connect(comp);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (ctx.state === 'suspended') ctx.resume();
    next = ctx.currentTime + 0.1; step = 0; timer = setInterval(sched, 50);
    started = true; apply();
  }
  return {
    start,
    toggle() { muted = !muted; apply(); return muted; },
    setLevel(l) { level = l; apply(); },
    get started() { return started; },
    get muted() { return muted; }
  };
})();
