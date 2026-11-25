/* Vane House — synthesised sound. No audio files: everything is generated with the Web Audio API,
   so it works offline and adds nothing to the download. Browsers require a user gesture before audio
   can start, so unlock() is called from the first tap. */
(function (root) {
  'use strict';
  const AC = root.AudioContext || root.webkitAudioContext;
  const A = { ctx: null, master: null, enabled: true, muffle: false, rainOn: true, _rain: null, _breath: null };

  function ensure() {
    if (!AC || !A.unlocked) return null;
    if (!A.ctx) {
      try {
        A.ctx = new AC();
        A.master = A.ctx.createGain();
        A.master.gain.value = A.enabled ? 0.9 : 0;
        A.master.connect(A.ctx.destination);
      } catch (e) { A.ctx = null; return null; }
    }
    if (A.ctx.state === 'suspended') A.ctx.resume().catch(() => {});
    return A.ctx;
  }
  function noiseBuffer(ctx, seconds) {
    const n = Math.floor(ctx.sampleRate * seconds), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2 + w * 0.25; }
    return b;
  }

  /* ----- settings ----- */
  A.setEnabled = function (on) {
    A.enabled = !!on;
    if (A.master && A.ctx) A.master.gain.setTargetAtTime(A.enabled ? 0.9 : 0, A.ctx.currentTime, 0.05);
    if (A.enabled) A.rain(A.rainOn); else A._stopRain();
  };
  A.setMuffle = function (on) { A.muffle = !!on; };
  A.unlock = function () { A.unlocked = true; if (ensure() && A.enabled) A.rain(A.rainOn); };

  /* ----- rain (looping filtered noise, with a slow swell) ----- */
  A.rain = function (on) {
    A.rainOn = !!on;
    if (!on || !A.enabled) { A._stopRain(); return; }
    if (!A.unlocked) return;
    const ctx = ensure(); if (!ctx || A._rain) return;
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 4); src.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    const g = ctx.createGain(); g.gain.value = 0;
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.09; lfoG.gain.value = 0.02;
    lfo.connect(lfoG); lfoG.connect(g.gain);
    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(A.master);
    src.start(); lfo.start();
    g.gain.setTargetAtTime(0.1, ctx.currentTime, 1.2);
    A._rain = { src, lfo, g };
  };
  A._stopRain = function () {
    const r = A._rain; if (!r) return; A._rain = null;
    try { r.g.gain.setTargetAtTime(0, A.ctx.currentTime, 0.2); setTimeout(() => { try { r.src.stop(); r.lfo.stop(); } catch (e) {} }, 900); } catch (e) {}
  };

  /* ----- one bell stroke. Muffled: darker, quieter, shorter (kinder for sound-sensitive players). ----- */
  A.stroke = function (opts) {
    const ctx = ensure(); if (!ctx || !A.enabled) return;
    const muff = opts && opts.muffled != null ? opts.muffled : A.muffle;
    const f0 = (opts && opts.freq) || 196, t = ctx.currentTime + ((opts && opts.delay) || 0);
    const out = ctx.createGain(); out.gain.value = muff ? 0.12 : 0.3;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = muff ? 520 : 3600;
    out.connect(lp); lp.connect(A.master);
    const dec = muff ? 1.1 : 3.2;
    [[1, 1], [2.01, 0.5], [2.76, 0.32], [4.07, 0.18], [5.4, 0.1]].forEach(([m, a]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f0 * m;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec / (m > 2 ? 1.8 : 1));
      o.connect(g); g.connect(out); o.start(t); o.stop(t + dec + 0.1);
    });
  };
  /* A run of strokes; returns a cancel function. onStroke(i) is called as each one sounds (for the visual pulse). */
  A.strokes = function (count, gapMs, onStroke, onDone) {
    const timers = [];
    for (let i = 0; i < count; i++) {
      timers.push(setTimeout(() => { A.stroke(); if (onStroke) onStroke(i + 1); }, 700 + i * gapMs));
    }
    timers.push(setTimeout(() => { if (onDone) onDone(); }, 700 + count * gapMs + 500));
    return () => timers.forEach(clearTimeout);
  };

  /* ----- one-shots ----- */
  A.ring = function () {                     // the hall telephone: two double-rings
    const ctx = ensure(); if (!ctx || !A.enabled) return;
    const base = ctx.currentTime + 0.05;
    [0, 0.5, 2.2, 2.7].forEach((d) => {
      [440, 480].forEach((f) => {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = f;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = A.muffle ? 700 : 1800;
        g.gain.setValueAtTime(0.0001, base + d); g.gain.linearRampToValueAtTime(A.muffle ? 0.015 : 0.04, base + d + 0.02);
        g.gain.setValueAtTime(A.muffle ? 0.015 : 0.04, base + d + 0.38); g.gain.linearRampToValueAtTime(0.0001, base + d + 0.42);
        o.connect(lp); lp.connect(g); g.connect(A.master); o.start(base + d); o.stop(base + d + 0.45);
      });
    });
  };
  A.knock = function (n) {
    const ctx = ensure(); if (!ctx || !A.enabled) return;
    for (let i = 0; i < (n || 3); i++) {
      const t = ctx.currentTime + 0.05 + i * 0.28 + (i === 2 ? 0.1 : 0);
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.2);
    }
  };
  A.thunder = function () {
    const ctx = ensure(); if (!ctx || !A.enabled) return;
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 3);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(260, ctx.currentTime); lp.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 2.6);
    const g = ctx.createGain(); const t = ctx.currentTime + 0.1;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(A.muffle ? 0.35 : 0.9, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
    src.connect(lp); lp.connect(g); g.connect(A.master); src.start(t); src.stop(t + 3);
  };
  A.tick = function (good) {
    const ctx = ensure(); if (!ctx || !A.enabled) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
    o.frequency.value = good === false ? 220 : 660;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.25);
  };
  /* Soft breathing pad: rises while holding, falls on release. */
  A.breathIn = function () {
    const ctx = ensure(); if (!ctx || !A.enabled) return; A.breathOut(true);
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = 130;
    g.gain.value = 0.0001; o.connect(g); g.connect(A.master); o.start();
    o.frequency.linearRampToValueAtTime(196, ctx.currentTime + 4); g.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 1.2);
    A._breath = { o, g };
  };
  A.breathOut = function (quick) {
    const b = A._breath; if (!b) return; A._breath = null; const ctx = A.ctx, t = ctx.currentTime, d = quick ? 0.05 : 6;
    try { b.o.frequency.cancelScheduledValues(t); b.o.frequency.linearRampToValueAtTime(110, t + d); b.g.gain.cancelScheduledValues(t); b.g.gain.setTargetAtTime(0.0001, t, d / 3); b.o.stop(t + d + 0.5); } catch (e) {}
  };

  root.VaneAudio = A;
})(typeof self !== 'undefined' ? self : this);
