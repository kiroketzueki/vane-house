/* Vane House — UI, persistence and PWA glue. Game rules live in engine.js; text lives in story.js. */
(function () {
  'use strict';
  const E = window.VaneEngine;
  const S = window.VaneStory;
  const RUN_KEY = 'vane_house_run_v2';
  const META_KEY = 'vane_house_meta_v2';
  const SIBS = E.SIBS;

  /* ---------- tiny helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sgn = (n) => (n > 0 ? '+' + n : String(n));
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be unavailable */ } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

  /* ---------- persistent state ---------- */
  const DEFAULT_SETTINGS = { rain: true, large: false, sound: true, muffle: false, relaxed: false, assist: false };
  const defaultMeta = () => ({ achievements: [], endings: [], runs: 0, styleMemory: {}, settings: Object.assign({}, DEFAULT_SETTINGS) });
  let meta = Object.assign(defaultMeta(), lsGet(META_KEY) || {});
  meta.settings = Object.assign({}, DEFAULT_SETTINGS, meta.settings || {});
  meta.styleMemory = meta.styleMemory && typeof meta.styleMemory === 'object' ? meta.styleMemory : {};
  const Au = window.VaneAudio || { setEnabled() {}, setMuffle() {}, unlock() {}, rain() {}, stroke() {}, strokes() { return () => {}; }, ring() {}, knock() {}, thunder() {}, tick() {}, breathIn() {}, breathOut() {} };
  meta.achievements = Array.isArray(meta.achievements) ? meta.achievements : [];
  meta.endings = Array.isArray(meta.endings) ? meta.endings : [];
  let run = E.sanitize(lsGet(RUN_KEY));
  let screen = 'title';           // title | game
  let view = { type: 'hub' };     // hub | scene | result | transition | ending
  let ledgerTab = 'clues';
  let pin = [];
  let pinMsg = null;
  let lastReal = null;
  let deferredInstall = null;
  let swReady = false;
  let selLoc = null;              // room selected in the house cutaway
  let R = null;                   // active touch-ritual state
  let timer = null;               // scripted-scene countdown
  let lastCue = '';

  const saveRun = () => { if (run) lsSet(RUN_KEY, run); };
  const saveMeta = () => lsSet(META_KEY, meta);

  /* ---------- toasts ---------- */
  let toastTimer = null; const toastQ = [];
  function toast(msg) { toastQ.push(msg); if (!toastTimer) nextToast(); }
  function nextToast() {
    const el = $('#toast');
    const m = toastQ.shift();
    if (!m) { el.classList.add('hidden'); toastTimer = null; return; }
    el.textContent = m; el.classList.remove('hidden');
    toastTimer = setTimeout(nextToast, 2600);
  }
  function checkAch() {
    const got = E.checkAchievements(run, meta);
    got.forEach((id) => toast('🏆 ' + S.ACHIEVEMENTS[id].title));
    if (run.ended && !run.memSaved) { E.updateStyleMemory(meta, run); run.memSaved = true; saveMeta(); saveRun(); }
    else if (got.length) saveMeta();
  }

  /* ---------- settings ---------- */
  function applySettings() {
    document.body.classList.toggle('no-rain', !meta.settings.rain);
    document.documentElement.classList.toggle('large', !!meta.settings.large);
    Au.setMuffle(meta.settings.muffle); Au.setEnabled(meta.settings.sound); Au.rain(meta.settings.rain);
  }

  /* ---------- view derivation ---------- */
  function deriveView() {
    if (!run) return { type: 'hub' };
    if (run.ended) return { type: 'ending' };
    const p = E.proceed(run);
    if (p.type === 'end') return { type: 'ending' };
    if (p.type === 'slot') return { type: 'transition', info: p };
    return run.scene ? { type: 'scene' } : { type: 'hub' };
  }

  /* ---------- html pieces ---------- */
  const portrait = (id, cls) => `<img class="${cls}" src="${S.SIBLINGS[id].img}" alt="${esc(S.SIBLINGS[id].name)}" width="92" height="92" loading="lazy" decoding="async" />`;

  function titleHTML() {
    const can = run && !run.ended;
    const four = SIBS.map((s) => `<span class="c-${S.SIBLINGS[s].css}"><img src="${S.SIBLINGS[s].img}" alt="${esc(S.SIBLINGS[s].name)}" width="62" height="62" /></span>`).join('');
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
    return `
      <section class="title-screen">
        <div class="deco title-card">
          <div class="eyebrow">A Narrative Strategy Game · 1928</div>
          <div class="rule"></div>
          <h1>Vane House</h1>
          <div class="sub">Four Colors in the Rain</div>
          <div class="four">${four}</div>
          <p class="muted small">You are the new maid. Seven days, four siblings, and everything they would rather you did not notice.</p>
          <div class="menu">
            ${can ? `<button class="btn" data-act="continue-run">Continue · Day ${run.day}, ${S.SLOT_NAMES[run.slot]}</button>` : ''}
            <button class="btn ${can ? 'ghost' : ''}" data-act="new-run">${can ? 'Begin a New Season' : 'Begin'}</button>
            ${E.ngAvailable(meta) ? '<button class="btn ghost" data-act="new-ng">✦ New Game+ <small>(the Ledger remembers)</small></button>' : ''}
            <button class="btn ghost" data-act="howto">How to Play</button>
            <div class="footbar">
              <button class="btn ghost small" data-act="trophies">Trophies ${meta.achievements.length}/${Object.keys(S.ACHIEVEMENTS).length}</button>
              <button class="btn ghost small" data-act="settings">Settings</button>
              <button class="btn ghost small" data-act="content-note">Content Note</button>
            </div>
            ${deferredInstall ? '<button class="btn ghost" data-act="install">Install as an App</button>' : ''}
          </div>
          <div class="pwa-line" id="pwa-line">${swReady ? 'Offline ready ✓' : ''}${ios && !deferredInstall ? '<br>On iPhone: Share → Add to Home Screen to install.' : ''}</div>
        </div>
        <div class="muted small">Endings found: ${meta.endings.length} of ${Object.keys(S.ENDINGS).length}</div>
      </section>`;
  }

  function hudHTML() {
    const pips = Array.from({ length: Math.max(run.slot <= 1 ? 2 : 1, run.ap) }, (_, i) => `<span class="pip ${i < run.ap ? 'on' : ''}"></span>`).join('');
    const strip = SIBS.map((id) => {
      const s = S.SIBLINGS[id];
      return `<div class="sib-card c-${s.css}" data-act="household" data-sib="${id}" role="button" tabindex="0" aria-label="${esc(s.name)}: trust ${run.trust[id]}, mask ${run.mask[id]} percent">
        <img src="${s.img}" alt="" width="44" height="44" />
        <b>${esc(s.name)}</b>
        <div class="lbl"><span>Trust</span><span>${run.trust[id]}</span></div>
        <div class="meter trust"><i style="width:${run.trust[id]}%"></i></div>
        <div class="lbl"><span>Mask</span><span>${run.mask[id]}</span></div>
        <div class="meter mask"><i style="width:${run.mask[id]}%"></i></div>
      </div>`;
    }).join('');
    const over = run.ended || run.day > 7;
    const eyebrow = over ? '1928 · Vane House · Epilogue' : `1928 · Vane House · Day ${run.day} of 7`;
    const when = over ? 'The notice has expired' : `${esc(S.DAYS[run.day - 1])} · ${S.SLOT_NAMES[run.slot]} <small>${S.SLOT_CLOCK[run.slot]}</small>`;
    return `
      <header class="hud deco">
        <div><div class="eyebrow">${eyebrow}</div>
          <div class="when">${when}</div></div>
        <div class="hud-right"><button class="mute" data-act="mute" aria-label="${meta.settings.sound ? 'Mute sound' : 'Unmute sound'}" aria-pressed="${!meta.settings.sound}">${meta.settings.sound ? '🔊' : '🔇'}</button>
        <div class="pips" title="Actions left this hour" aria-label="${run.ap} actions left">${pips}</div></div>
      </header>
      <div class="meter-row"><span>Scrutiny</span><div class="meter scrutiny" title="Household Scrutiny: reaching 100 means dismissal"><i style="width:${run.scrutiny}%"></i></div><span>${run.scrutiny}</span></div>
      <div class="strip">${strip}</div>`;
  }

  /* House cutaway: each room is a tappable cross-section; windows glow in the siblings' colours. */
  const ROOMS = {
    study: { x: 30, y: 82, w: 150, h: 62 }, library: { x: 180, y: 82, w: 150, h: 62 },
    dining: { x: 30, y: 144, w: 100, h: 66 }, hall: { x: 130, y: 144, w: 100, h: 66 }, parlor: { x: 230, y: 144, w: 100, h: 66 },
    conservatory: { x: 330, y: 154, w: 76, h: 56 }, service: { x: 30, y: 210, w: 300, h: 46 }
  };
  const SKY = ['#4a3f2c', '#3d3a38', '#2d2536', '#0e1119'];
  function cutawayHTML(h) {
    const oppSibs = new Set(h.opps.map((o) => o.sib));
    const rooms = h.locs.map((l) => {
      const r = ROOMS[l.id]; if (!r) return '';
      const sel = l.id === selLoc;
      const wins = l.present.map((id, i) => {
        const c = S.SIBLINGS[id].css, wx = r.x + 12 + i * 26, wy = r.y + 10;
        const star = E.eligibleEncounter(run, id) ? `<text x="${wx + 8}" y="${wy - 2}" class="star" text-anchor="middle">✦</text>` : '';
        return `<rect class="glow w-${c}" x="${wx - 6}" y="${wy - 6}" width="28" height="36" rx="6" filter="url(#blur)"/>
          <rect class="win w-${c} ${oppSibs.has(id) ? 'pulse' : ''}" x="${wx}" y="${wy}" width="16" height="24" rx="2"/>
          <path d="M${wx + 8} ${wy}v24M${wx} ${wy + 12}h16" class="mullion"/>${star}`;
      }).join('');
      const dark = l.present.length ? '' : `<rect class="win dark" x="${r.x + 12}" y="${r.y + 10}" width="16" height="24" rx="2"/>`;
      const label = esc(S.LOCATIONS[l.id].name.replace(/^The /, ''));
      const who = l.present.map((id) => S.SIBLINGS[id].name).join(', ');
      return `<g class="room ${sel ? 'sel' : ''} ${l.present.length ? 'occ' : ''}" data-act="room" data-loc="${l.id}" role="button" tabindex="0" aria-pressed="${sel}" aria-label="${esc(S.LOCATIONS[l.id].name)}${who ? ': ' + esc(who) + ' here' : ': empty'}">
        <rect class="rm" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" ${l.id === 'conservatory' ? 'rx="10"' : ''}/>
        ${wins}${dark}<text class="rl" x="${r.x + r.w - 6}" y="${r.y + r.h - 6}" text-anchor="end">${label}</text></g>`;
    }).join('');
    const night = h.slot === 3;
    return `<svg class="cutaway" viewBox="0 0 420 272" role="group" aria-label="Cutaway of Vane House. Tap a room.">
      <defs><filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY[h.slot]}"/><stop offset="1" stop-color="#150f0c"/></linearGradient></defs>
      <rect x="0" y="0" width="420" height="272" rx="12" fill="url(#sky)"/>
      ${night ? '<circle cx="372" cy="34" r="12" fill="#dfe3ea" opacity=".85"/><circle cx="378" cy="31" r="11" fill="#0e1119"/>' : `<circle cx="372" cy="34" r="${h.slot === 2 ? 10 : 14}" fill="${h.slot === 2 ? '#b0715a' : '#e8c978'}" opacity=".45"/>`}
      <polygon points="22,82 180,24 338,82" class="roof"/><rect x="262" y="34" width="14" height="30" class="chim"/>
      <rect x="22" y="80" width="316" height="180" rx="3" class="shell"/>
      ${rooms}
      <path d="M330 154 L370 128 L406 154" class="roof glass"/>
    </svg>`;
  }
  function hubHTML() {
    const h = E.hub(run);
    if (!selLoc || !h.locs.some((l) => l.id === selLoc)) {
      const withStory = h.locs.find((l) => l.present.some((id) => E.eligibleEncounter(run, id)));
      const occ = h.locs.find((l) => l.present.length);
      selLoc = (withStory || occ || h.locs.find((l) => l.id === 'hall') || h.locs[0]).id;
    }
    const l = h.locs.find((x) => x.id === selLoc);
    const dis = h.ap <= 0 ? 'disabled' : '';
    const sibBtns = l.present.map((id) => {
      const s = S.SIBLINGS[id];
      const story = !!E.eligibleEncounter(run, id);
      return `<button class="sib-btn c-${s.css}" data-act="attend" data-sib="${id}" ${dis}>
        <img src="${s.img}" alt="" width="36" height="36" /><span>${esc(s.name)}</span>${story ? '<span class="flag" title="Something is about to happen">✦</span>' : ''}</button>`;
    }).join('');
    let extra = '';
    if (l.isService) {
      extra = `<button class="chip-btn" data-act="tidy" ${dis}>Take tea with Mrs. Pell <small>(Scrutiny −10)</small></button>`;
      if (h.pell) extra += `<button class="chip-btn gold" data-act="attend-pell" ${dis}>Mrs. Pell wants a word <small>(${esc(h.pell.title)})</small></button>`;
    } else if (l.canSearch) extra = `<button class="chip-btn" data-act="search" data-loc="${l.id}" ${dis}>Search quietly <small>(Scrutiny +7)</small></button>`;
    else if (l.searchDone) extra = '<span class="muted small">You have searched here thoroughly.</span>';
    else if (S.SEARCH[l.id] && l.present.length) extra = '<span class="muted small">Too many eyes to search.</span>';
    if (!sibBtns && !extra) extra = '<span class="muted small">Empty. Rain on the windows.</span>';
    const moments = h.opps.length ? `<div class="moments" role="group" aria-label="Moments happening this hour">${h.opps.map((o) => {
      const s = S.SIBLINGS[o.sib];
      return `<button class="moment c-${s.css}" data-act="attend-opp" data-opp="${o.id}" ${dis}><span class="bolt">⚡</span><span><b>${esc(o.title)}</b><small>${esc(s.name)} · ${esc(S.LOCATIONS[o.loc].name)} · this hour only</small></span></button>`;
    }).join('')}</div>` : '';
    const legend = SIBS.map((id) => {
      const s = S.SIBLINGS[id], at = E.where(id, run.day, run.slot);
      return `<button class="lg c-${s.css}" data-act="room" data-loc="${at}"><i></i>${esc(s.name)} <small>${esc(S.LOCATIONS[at].name.replace(/^The /, ''))}</small></button>`;
    }).join('');
    return `
      <h2>Where will you go?</h2>
      <p class="weather">${esc(h.weather)} ${h.ap > 0 ? `You have ${h.ap} ${h.ap === 1 ? 'action' : 'actions'} this hour.` : ''}</p>
      ${moments}
      ${cutawayHTML(h)}
      <div class="legend">${legend}</div>
      <div class="loc selected"><h3>${esc(l.name)}</h3><div class="desc">${esc(l.desc)}</div><div class="loc-actions">${sibBtns}${extra}</div></div>
      <div class="pass"><button class="btn ghost" data-act="pass">Let the hour pass</button></div>`;
  }

  function choiceHTML(c) {
    if (c.locked) return `<div class="choice locked" aria-disabled="true">🔒 <span class="muted">${esc(c.requires)}</span><span class="tag">${esc(c.tag || '✦ Ledger')}</span></div>`;
    const icon = c.style ? S.STYLES[c.style].icon + ' ' : c.gated ? '✦ ' : c.pry ? '⚠ ' : '';
    const extra = (c.ritual ? ' <span class="rit-badge">✋ touch</span>' : '') + (c.remembered ? ' <span class="rit-badge mem">★ remembered</span>' : '');
    return `<button class="choice ${c.gated ? 'gated' : ''} ${c.pry ? 'pry' : ''}" data-act="choose" data-key="${c.key}">${icon}${esc(c.label)}${c.tag ? `<span class="tag">${esc(c.tag)}${extra}</span>` : ''}</button>`;
  }

  const mpHead = (title) => `<div class="scene-head c-gold"><div class="portrait mp" aria-hidden="true">MP</div><div><div class="who">Mrs. Pell · The Housekeeper</div><h2>${esc(title)}</h2></div></div>`;
  function sceneHTML() {
    const d = E.describe(run);
    if (!d) return hubHTML();
    const paras = d.paras.map((p) => `<p>${esc(p)}</p>`).join('');
    let head;
    if (d.kind === 'event') {
      head = `<div class="eyebrow">Day ${run.day} · ${S.SLOT_NAMES[run.slot]}</div><h2>${esc(d.title)}</h2>
        <div class="four small">${SIBS.map((s) => `<span class="c-${S.SIBLINGS[s].css}"><img src="${S.SIBLINGS[s].img}" alt="${esc(S.SIBLINGS[s].name)}" width="40" height="40" /></span>`).join('')}</div>`;
    } else if (d.kind === 'pell') {
      head = mpHead(d.title);
    } else if (d.kind === 'opp') {
      const s = S.SIBLINGS[d.sib];
      head = `<div class="scene-head c-${s.css}">${portrait(d.sib, 'portrait')}<div><div class="who">⚡ A Moment · ${esc(s.name)}</div><h2>${esc(d.title)}</h2><div class="muted small">It will not wait for you. When the hour ends, it is over.</div></div></div>`;
    } else {
      const s = S.SIBLINGS[d.sib];
      head = `<div class="scene-head c-${s.css}">${portrait(d.sib, 'portrait')}<div><div class="who">${esc(s.name)} · ${esc(s.color)} · ${esc(s.role)}</div><h2>${esc(d.title)}</h2>${d.late ? '<div class="muted small">Late at night. The masks come off more easily, and more people notice a maid awake.</div>' : ''}${d.memoryNote ? `<div class="muted small mem-note">★ ${esc(d.memoryNote)}</div>` : ''}</div></div>`;
    }
    const timerBar = d.timer && !meta.settings.relaxed ? `<div class="timer" role="timer" aria-label="Time to act"><i id="timer-bar"></i></div>` : (d.timer ? '<div class="muted small">Relaxed timing is on. Take all the time you need.</div>' : '');
    return `${head}${timerBar}<div class="narr">${paras}</div><div class="choices">${d.choices.map(choiceHTML).join('')}</div>`;
  }

  /* ---------- touch rituals: small, kind coping tools. Never punishing: a skip or a miss still helps. ---------- */
  function ritualHTML() {
    const def = R.def;
    const s = S.SIBLINGS[def.sib];
    const head = `<div class="scene-head c-${s.css}">${portrait(def.sib, 'portrait')}<div><div class="who">${esc(s.name)} · Touch</div><h2>${esc(def.title)}</h2></div></div>`;
    if (meta.settings.assist) {
      return `${head}<div class="narr"><p>${esc(def.intro)}</p><p class="muted small">Assist mode is on. You do it together, quietly, and it goes well.</p></div>
        <button class="btn block" data-act="rit-done" data-q="2">Continue</button>`;
    }
    let body = '';
    if (def.type === 'breath') {
      body = `<div class="breath-wrap"><button id="breath-btn" class="breath" type="button" aria-label="Hold to breathe in, release to breathe out"><span id="breath-label">Hold to breathe in</span></button>
        <div class="muted small" id="breath-count">Breath 1 of ${def.cycles}</div></div>`;
    } else if (def.type === 'chime') {
      body = `<div class="chime-wrap"><div id="chime-ring" class="chime-ring" aria-hidden="true">🕰</div>
        <button class="btn tap" data-act="rit-tap" id="chime-tap" type="button">Count</button>
        <div class="count" id="chime-count" aria-live="polite">0</div>
        <div class="muted small" id="chime-note">Listening…</div>
        <button class="btn ghost small" data-act="rit-muffle" type="button">Muffled chimes: ${meta.settings.muffle ? 'On' : 'Off'}</button></div>`;
    } else {
      body = `<div class="ground"><div class="muted small" id="ground-note">${R.good} of 5 found. Take your time.</div>${R.items.map((it, i) => `<button class="gitem ${R.picked.has(i) ? (it.good ? 'ok' : 'no') : ''}" data-act="rit-pick" data-i="${i}" ${R.done || R.picked.has(i) ? 'disabled' : ''}>${it.good && R.picked.has(i) ? '✓ ' : ''}${esc(it.t)}</button>`).join('')}</div>`;
    }
    const finish = R.done ? `<p class="react">${esc(R.msg)}</p><button class="btn block" data-act="rit-done" data-q="${R.q}">Continue</button>` : '<div id="rit-finish"></div>';
    return `${head}<div class="narr"><p>${esc(def.intro)}</p></div>${body}${finish}
      <div class="rit-foot"><button class="btn ghost small" data-act="rit-skip">Skip. Just be there</button> <button class="btn ghost small" data-act="rit-back">Choose another way</button></div>`;
  }
  function startRitual(key, def) {
    stopRitual();
    R = { key, def, q: 1, good: 0, wrong: 0, cycles: 0, taps: 0, phase: 'ready', done: false, msg: '', picked: new Set(), items: [], cancel: null };
    if (def.type === 'ground') R.items = def.items.slice().sort(() => Math.random() - 0.5);
    view = { type: 'ritual' };
    render({ focus: true });
    if (def.type === 'chime' && !meta.settings.assist) {
      const gap = meta.settings.relaxed ? 2200 : 1500;
      R.cancel = Au.strokes(def.count, gap, (i) => {
        const r = $('#chime-ring'); if (r) { r.classList.remove('hit'); void r.offsetWidth; r.classList.add('hit'); }
        const n = $('#chime-note'); if (n) n.textContent = 'Listening…';
        R.struck = i;
      }, () => {
        const diff = Math.abs(R.taps - def.count);
        R.q = diff === 0 ? 2 : diff === 1 ? 1 : 0;
        R.msg = diff === 0 ? `Eleven, or twelve, or however many there were: you both counted ${R.taps}, and it was correct.` : diff === 1 ? 'Nearly. One stroke slipped by, and it did not matter. You stayed beside her.' : 'The count got away from you both. That is all right. You stayed, and she knew it.';
        if (def.count === 11) R.msg = diff === 0 ? 'Eleven. You both counted eleven, and it was correct.' : R.msg;
        if (def.count === 12) R.msg = diff === 0 ? 'Twelve. You both counted twelve, and it was correct.' : R.msg;
        R.done = true; const st = $('#stage'); if (st) st.innerHTML = ritualHTML();
      });
    }
  }
  function stopRitual() { if (R && R.cancel) R.cancel(); Au.breathOut(true); R = null; }
  function finishRitual(q) {
    if (!R) return;
    const key = R.key; stopRitual();
    afterAction(E.resolve(run, key, { quality: q }));
  }
  /* Breath ritual: hold to breathe in (about 4s), release to breathe out (about 6s). */
  function breathDown() {
    if (!R || R.def.type !== 'breath' || R.phase !== 'ready' || R.done) return;
    R.phase = 'in'; R.t0 = performance.now();
    const b = $('#breath-btn'), lb = $('#breath-label'); if (!b) return;
    b.style.transition = 'transform 4s linear'; b.style.transform = 'scale(1.45)'; lb.textContent = 'In… hold…'; Au.breathIn();
  }
  function breathUp() {
    if (!R || R.def.type !== 'breath' || R.phase !== 'in') return;
    const dur = (performance.now() - R.t0) / 1000, lo = meta.settings.relaxed ? 2.0 : 2.8, hi = meta.settings.relaxed ? 7 : 5.6;
    const good = dur >= lo && dur <= hi;
    R.cycles += 1; if (good) R.good += 1; R.phase = 'out';
    const b = $('#breath-btn'), lb = $('#breath-label'), c = $('#breath-count');
    if (b) { b.style.transition = 'transform 6s ease-in-out'; b.style.transform = 'scale(1)'; }
    if (lb) lb.textContent = good ? 'Out… slowly. Steady.' : 'Out… that is fine. Again.';
    Au.breathOut();
    setTimeout(() => {
      if (!R || R.def.type !== 'breath') return;
      if (R.cycles >= R.def.cycles) {
        R.q = R.good >= R.def.cycles ? 2 : R.good >= 1 ? 1 : 0; R.done = true;
        R.msg = R.q === 2 ? 'Three even breaths. His shoulders come down from his ears.' : R.q === 1 ? 'Not perfectly even, and it did not need to be. He is breathing.' : 'The rhythm would not come tonight. You stayed with him anyway, and that counts.';
        const st = $('#stage'); if (st) st.innerHTML = ritualHTML();
      } else { R.phase = 'ready'; if (lb) lb.textContent = 'Hold to breathe in'; if (c) c.textContent = `Breath ${R.cycles + 1} of ${R.def.cycles}`; }
    }, meta.settings.relaxed ? 3500 : 6000);
  }
  function groundPick(i) {
    if (!R || R.def.type !== 'ground' || R.done || R.picked.has(i)) return;
    const it = R.items[i]; R.picked.add(i);
    if (it.good) { R.good += 1; Au.tick(true); } else { R.wrong += 1; Au.tick(false); }
    if (R.good >= 5) {
      R.q = R.wrong === 0 ? 2 : R.wrong <= 2 ? 1 : 0; R.done = true;
      R.msg = R.q === 2 ? 'Five real things, said gently. By the last one he is looking at you.' : 'It took a few tries, and some of them startled him. By the fifth he was back all the same.';
    }
    const st = $('#stage'); if (st) st.innerHTML = ritualHTML();
    if (!R.done && !it.good) { const n = $('#ground-note'); if (n) n.textContent = 'That is not it. Gently. Something that is here, and real.'; }
  }

  /* ---------- scripted-scene countdown (the back door) ---------- */
  function clearTimer() { if (timer) { clearInterval(timer.id); timer = null; } }
  function startTimer() {
    clearTimer();
    const d = run && run.scene && view.type === 'scene' ? E.describe(run) : null;
    if (!d || !d.timer || meta.settings.relaxed) return;
    timer = { end: Date.now() + d.timer * 1000, total: d.timer * 1000, key: d.timeoutKey };
    timer.id = setInterval(() => {
      if (!timer) return;
      if (modalOpen() || document.hidden) { timer.end += 100; return; }
      const left = timer.end - Date.now(), bar = $('#timer-bar');
      if (bar) bar.style.width = Math.max(0, (left / timer.total) * 100) + '%';
      if (left <= 0) { const k = timer.key; clearTimer(); if (k && run && run.scene) afterAction(E.resolve(run, k)); }
    }, 100);
  }

  function chipsHTML(res) {
    const chips = [];
    Object.entries(res.sibs || {}).forEach(([id, d]) => {
      const n = S.SIBLINGS[id].name;
      if (d.t) chips.push(`<span class="chip ${d.t > 0 ? 'good' : 'bad'}">${n} Trust ${sgn(d.t)}</span>`);
      if (d.m) chips.push(`<span class="chip ${d.m < 0 ? 'good' : 'bad'}">${n} Mask ${sgn(d.m)}</span>`);
    });
    if (res.scrutiny) chips.push(`<span class="chip ${res.scrutiny > 0 ? 'bad' : 'good'}">Scrutiny ${sgn(res.scrutiny)}</span>`);
    return chips.length ? `<div class="chips">${chips.join('')}</div>` : '';
  }

  function resultHTML() {
    const res = view.res;
    const cls = res.kind === 'pell' ? 'c-gold' : res.sib ? 'c-' + S.SIBLINGS[res.sib].css : '';
    const clues = (res.newClues || []).map((id) => `<div class="banner"><b>Clue recorded — [${S.CLUES[id].color}] ${esc(S.CLUES[id].title)}</b><br><span class="muted">${esc(S.CLUES[id].detail)}</span></div>`).join('');
    const notes = (res.notes || []).map((n) => `<div class="banner">${esc(n)}</div>`).join('');
    const reals = (res.newReals || []).map((id) => `<div class="banner real"><b>✦ Realization: ${esc(S.REALIZATIONS[id].title)}</b><br>${esc(S.REALIZATIONS[id].text)}<div class="looks">${esc(S.REALIZATIONS[id].looksBack)}</div></div>`).join('');
    const rq = res.ritual ? `<div class="banner">${['It was hard tonight, but you stayed.', 'Close enough. It helped.', 'Steady. It helped a great deal.'][res.ritual.q]}</div>` : '';
    const hint = res.hint ? `<div class="hint-box">${esc(res.hint)}<div class="muted small">— Mrs. Pell</div></div>` : '';
    const title = res.search ? 'You search the room' : res.tidy ? 'In the kitchen' : res.kind === 'opp' ? '⚡ ' + esc(res.title) : res.kind === 'pell' ? 'Mrs. Pell' : res.eventId ? 'And so…' : '';
    return `
      <div class="result ${cls}">
        ${title ? `<div class="eyebrow">${title}</div>` : ''}
        <p class="react">${esc(res.react)}</p>
        ${res.after ? `<p class="after">${esc(res.after)}</p>` : ''}
        ${chipsHTML(res)}${rq}${clues}${reals}${notes}${hint}
        <button class="btn block" data-act="continue">Continue</button>
      </div>`;
  }

  function transitionHTML() {
    const info = view.info || {};
    const left = 7 - run.day;
    const dayLine = info.newDay
      ? `<div class="eyebrow">Day ${run.day} of 7</div><div class="big">${esc(S.DAYS[run.day - 1].split(' ')[0])}</div><p class="muted">${left > 0 ? `${left} ${left === 1 ? 'day' : 'days'} until the notice expires.` : 'The notice expires at midnight.'}</p>`
      : `<div class="eyebrow">${esc(S.DAYS[run.day - 1])}</div><div class="big">${S.SLOT_NAMES[run.slot]}</div>`;
    const night = info.newDay && SIBS.some((s) => run.trust[s] < 60) ? '<p class="muted small">Overnight, each mask settles a little where it was not shared.</p>' : '';
    const missed = (info.missed || []).map((m) => `<div class="banner missed"><b>You were elsewhere.</b> ${esc(m.note)}</div>`).join('');
    return `<div class="transition">${dayLine}<p>${esc(S.TRANSITIONS[run.slot])}</p>${night}${missed}<button class="btn block" data-act="continue">Continue</button></div>`;
  }

  const EPI = {
    victor: ['He sleeps a whole night through in a rented room, and wakes without the watch in his hand.', 'The watch stays in his hand. He still does not sleep.'],
    camille: ['She plays the gramophone only when she wants to hear it, and lets herself be tired in company.', 'She keeps the sun on. It costs a little more each month.'],
    julian: ['He says no to something small every week, and writes to Edinburgh.', 'He says yes to the next person, and the next.'],
    clara: ['Her notebook fills with questions as well as answers, and she is believed.', 'She counts alone. Nobody asks what.']
  };
  function endingHTML() {
    const e = S.ENDINGS[run.ended] || S.ENDINGS.neutral;
    const epi = run.ended === 'dismissed' ? '' : SIBS.map((id) => {
      const open = run.trust[id] >= 50 && run.mask[id] <= 45;
      return `<div class="epi c-${S.SIBLINGS[id].css}"><b>${esc(S.SIBLINGS[id].name)}.</b> ${esc(EPI[id][open ? 0 : 1])}</div>`;
    }).join('');
    return `
      <div class="ending">
        <div class="eyebrow" style="text-align:center">Ending · ${esc(e.kind)}</div>
        <h2>${esc(e.title)}</h2>
        <div class="rule"></div>
        <div class="narr">${e.paras.concat(E.endingExtras(run)).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        ${epi}
        <div class="stats">
          <div>Clues: ${run.clues.length} / ${Object.keys(S.CLUES).length}</div>
          <div>Realizations: ${run.reals.length} / ${Object.keys(S.REALIZATIONS).length}</div>
          <div>Moments caught: ${run.moments} / ${S.OPPORTUNITIES.length}</div>
          <div>Scrutiny: ${run.scrutiny}</div>
          <div>Endings found: ${meta.endings.length} / ${Object.keys(S.ENDINGS).length}</div>
        </div>
        <div class="menu">
          <button class="btn" data-act="new-run">Begin Another Season</button>
          ${E.ngAvailable(meta) ? '<button class="btn ghost" data-act="new-ng">✦ New Game+: the Ledger remembers</button>' : ''}
          <div class="footbar"><button class="btn ghost small" data-act="ledger">Ledger</button><button class="btn ghost small" data-act="trophies">Trophies</button><button class="btn ghost small" data-act="to-title">Title</button></div>
        </div>
      </div>`;
  }

  const PROLOGUE = [
    'Saturday, 24 November 1928. The omnibus leaves you at the gatehouse with one trunk, one reference written by a vicar who hardly knew you, and rain that has not stopped since Penzance.',
    'Vane House stands on the cliff like a held breath. Sir Alistair and Lady Eleanor are, Mrs. Pell tells you on the step, “away on a medical retreat.” The four young Vanes are keeping house until the solicitors’ business is settled, “by Saturday next, God willing.” She does not look at you when she says it.',
    '“Keep your eyes down and your ears open, girl. And whatever you do, don’t move Miss Clara’s vase.”',
    'You are the new maid. In the rooms where the family does not look, you are very nearly invisible. That is the whole of your power.'
  ];
  function prologueHTML() {
    return `<div class="eyebrow">Prologue</div><h2>The Gatehouse</h2><div class="narr">${PROLOGUE.map((p) => `<p>${esc(p)}</p>`).join('')}</div><button class="btn block" data-act="begin-first-day">Begin the first morning</button>`;
  }

  function gameHTML() {
    let stage;
    if (view.type === 'prologue') stage = prologueHTML();
    else if (view.type === 'scene') stage = sceneHTML();
    else if (view.type === 'ritual' && R) stage = ritualHTML();
    else if (view.type === 'result') stage = resultHTML();
    else if (view.type === 'transition') stage = transitionHTML();
    else if (view.type === 'ending') stage = endingHTML();
    else stage = hubHTML();
    const live = view.type === 'hub' || view.type === 'scene' || view.type === 'ritual';
    return `${hudHTML()}
      <main class="stage deco" id="stage" tabindex="-1">${stage}</main>
      ${(live || view.type === 'result') && view.type !== 'prologue' ? `<div class="footbar"><button class="btn ghost" data-act="ledger">📒 Ledger (${run.clues.length})</button><button class="btn ghost" data-act="trophies">🏆 ${meta.achievements.length}</button><button class="btn ghost" data-act="menu">☰ Menu</button></div>` : ''}`;
  }

  /* ---------- main render ---------- */
  function cue() {
    if (!run || screen !== 'game' || view.type !== 'scene' || !run.scene) return;
    const k = [run.day, run.slot, run.scene.kind, run.scene.id].join('|');
    if (k === lastCue) return; lastCue = k;
    const id = run.scene.id;
    if (id === 'phone') Au.ring(); else if (id === 'pawn') Au.knock(3); else if (id === 'bailiff') Au.knock(2);
    else if (id === 'stormwalk' || id === 'storm') Au.thunder();
  }
  function render(opts) {
    clearTimer();
    applySettings();
    const app = $('#app');
    app.innerHTML = screen === 'title' || !run ? titleHTML() : gameHTML();
    if (!opts || opts.scroll !== false) window.scrollTo(0, 0);
    const st = $('#stage'); if (st && opts && opts.focus) st.focus({ preventScroll: true });
    if (screen === 'game' && run) { cue(); startTimer(); }
  }

  /* ---------- modal ---------- */
  function openModal(title, html) {
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = html;
    $('#modal').classList.remove('hidden');
    $('#modal-close').focus();
  }
  function closeModal() { $('#modal').classList.add('hidden'); }
  const modalOpen = () => !$('#modal').classList.contains('hidden');

  function ledgerHTML() {
    const tabs = [['clues', 'Clues'], ['reals', 'Realizations'], ['house', 'Household']];
    const bar = `<div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button class="tab ${ledgerTab === k ? 'on' : ''}" role="tab" aria-selected="${ledgerTab === k}" data-act="ledger-tab" data-tab="${k}">${n}</button>`).join('')}</div>`;
    let body = '';
    if (ledgerTab === 'clues') {
      const real = lastReal ? `<div class="card real new"><div class="eyebrow">Realization</div><h3>✦ ${esc(lastReal.title)}</h3><p>${esc(lastReal.text)}</p><div class="looks">${esc(lastReal.looksBack)}</div></div>` : '';
      const msg = pinMsg ? `<div class="pin-msg">${esc(pinMsg)}</div>` : '';
      body = real + ['Red', 'Yellow', 'Green', 'Blue'].map((color) => {
        const list = Object.values(S.CLUES).filter((c) => c.color === color);
        const sibId = SIBS.find((s) => S.SIBLINGS[s].color === color);
        const items = list.map((c) => {
          if (run.clues.includes(c.id)) {
            const sel = pin.includes(c.id);
            return `<div class="card clickable ${sel ? 'sel' : ''}" data-act="pin" data-clue="${c.id}" role="button" tabindex="0" aria-pressed="${sel}"><h3><span class="dot ${color}"></span>${esc(c.title)}</h3><div class="muted small">${esc(c.detail)}</div></div>`;
          }
          const hint = c.kind === 'behaviour' ? `Something to notice in ${S.SIBLINGS[sibId].name}’s behaviour.` : `Something is hidden in ${S.LOCATIONS[S.SIBLINGS[sibId].home].name.replace(/^The /, 'the ')}.`;
          return `<div class="card locked"><h3><span class="dot ${color}"></span>Unfound</h3><div class="muted small">${hint}</div></div>`;
        }).join('');
        return `<h3 style="margin:12px 0 6px"><span class="dot ${color}"></span>${color} — ${esc(S.SIBLINGS[sibId].name)}</h3>${items}`;
      }).join('') + `<div class="pinbar">${msg}<button class="btn block" data-act="connect" ${pin.length === 2 ? '' : 'disabled'}>Pin two clues together${pin.length ? ' (' + pin.length + '/2)' : ''}</button></div>`;
    } else if (ledgerTab === 'reals') {
      body = Object.values(S.REALIZATIONS).map((r) => {
        if (run.reals.includes(r.id)) return `<div class="card real"><h3>✦ ${esc(r.title)}</h3><p style="margin-top:6px">${esc(r.text)}</p><div class="looks">${esc(r.looksBack)}</div></div>`;
        if (r.auto) return `<div class="card locked"><h3>Unformed Realization</h3><div class="muted small">This one is not pinned. It arrives when a certain letter does.</div></div>`;
        const cols = r.pair.map((id) => S.CLUES[id].color);
        return `<div class="card locked"><h3>Unformed Realization</h3><div class="muted small"><span class="dot ${cols[0]}"></span>${cols[0]} × <span class="dot ${cols[1]}"></span>${cols[1]}${r.needReals ? ` · needs ${r.needReals} other Realizations and Day ${r.minDay || 1} or later` : ''}</div></div>`;
      }).join('') + `<p class="muted small">Pin two clues together in the Clues tab. Realizations unlock deeper responses, and they change how you read what you have already seen.</p>`;
    } else {
      body = SIBS.map((id) => {
        const s = S.SIBLINGS[id];
        const log = run.styleLog[id];
        const learned = E.STYLE_KEYS.filter((k) => log[k] && log[k].n).map((k) => {
          const L = log[k];
          return `<div>${S.STYLES[k].icon} ${S.STYLES[k].short} ×${L.n}: Trust ${sgn(Math.round(L.t / L.n))}, Mask ${sgn(Math.round(L.m / L.n))} on average</div>`;
        }).join('') || '<div>Nothing learned yet. Try different approaches.</div>';
        const gloss = run.understood.includes(id) ? `<div class="card real" style="margin-top:8px"><h3>${esc(s.gloss.title)}</h3><p class="small" style="margin-top:6px">${esc(s.gloss.text)}</p></div>` : `<div class="muted small" style="margin-top:6px">Earn ${esc(s.name)}’s deeper confidence to unlock an Understanding note.</div>`;
        const mem = run.ng && run.memory && run.memory[id] && run.memory[id].best ? `<div class="mem-note small">★ Remembered from last season: ${esc(s.name)} answered best to ${esc(S.STYLES[run.memory[id].best].name)}.</div>` : '';
        return `<div class="card c-${s.css}" id="hh-${id}"><div class="row">${portrait(id, '')}<div><h3>${esc(s.name)}, ${s.age} · ${esc(s.color)}</h3><div class="muted small">${esc(s.role)}. ${esc(s.blurb)}</div></div></div>
          <div class="tl"><div>Trust ${run.trust[id]} · Mask ${run.mask[id]}</div>${learned}</div>${mem}${gloss}</div>`;
      }).join('') + (run.ng ? `<div class="card c-gold"><h3>Mrs. Pell, the Housekeeper</h3><div class="muted small">${run.flags.arc_pell ? 'She has told you everything. Be at the kitchen table on the last night.' : run.pellSeen.length ? 'She is deciding whether you can be trusted with the rest. Take tea with her. Be kind.' : 'She watches you across the kitchen. Perhaps she has been waiting for someone to ask her a question.'}</div></div>` : '');
    }
    return bar + body;
  }
  function openLedger(tab) { if (tab) ledgerTab = tab; openModal('Maid’s Ledger', ledgerHTML()); }
  function refreshLedger() { $('#modal-body').innerHTML = ledgerHTML(); }

  function trophiesHTML() {
    return Object.entries(S.ACHIEVEMENTS).map(([id, a]) => {
      const done = meta.achievements.includes(id);
      return `<div class="card ${done ? 'real' : 'locked'}"><div class="trophy"><span class="ic">${done ? '🏆' : '🔒'}</span><div><h3>${esc(a.title)}</h3><div class="muted small">${esc(a.desc)}</div></div></div></div>`;
    }).join('');
  }
  function howtoHTML() {
    return `
      <p>You are the new live-in maid at Vane House, November 1928. The parents are “away.” A solicitor’s notice gives the house until midnight on Saturday. Four siblings are holding it together, each in their own colour.</p>
      <div class="card"><h3>Seven days, four hours a day</h3><div class="muted small">Morning, Afternoon, Evening, Late Night. You have two actions in the morning and afternoon, one in the evening and one late at night: 42 a season. Tap a lit window in the house to see who is there. Visit a sibling, search an empty room, or take tea with Mrs. Pell. You cannot see everything in one season.</div></div>
      <div class="card"><h3>⚡ Moments</h3><div class="muted small">Some scenes happen only for one hour. If you are elsewhere, they pass, and something changes without you. Taking one costs an action.</div></div>
      <div class="card"><h3>✋ Touch</h3><div class="muted small">A few scenes put a gentle coping tool in your hands: counting breaths with Victor, counting chimes with Clara, naming five real things for Julian. Doing it well helps; skipping or missing never hurts. Settings has an Assist mode and relaxed timing.</div></div>
      <div class="card"><h3>Trust &amp; Mask</h3><div class="muted small"><b>Trust</b> (0–100) is how much they let you in. <b>Mask</b> (100 → 0) is how much of the performance remains. Lower the Mask <i>without</i> losing Trust and the deeper scenes open. Lower it by prying and they close.</div></div>
      <div class="card"><h3>Four ways to speak</h3><div class="muted small">🕯 Deferential · 🗝 Direct · ☕ Warm · 🌧 Quiet. Each sibling answers to different styles. The Household tab of your Ledger records what you learn.</div></div>
      <div class="card"><h3>Scrutiny</h3><div class="muted small">Searching, prying and breaking etiquette raise it. At 100 you are dismissed. Mrs. Pell’s tea lowers it.</div></div>
      <div class="card"><h3>The Maid’s Ledger</h3><div class="muted small">Notice clues in people and rooms. Use them to unlock ✦ responses. Pin two clues together to form a Realization; some change what you understand about scenes you have already lived through.</div></div>
      <div class="card"><h3>Endings</h3><div class="muted small">Nine in all, from dismissal to a True Ending. Finish one season and New Game+ opens: the Ledger remembers which style each sibling answered to, and someone in the kitchen has been waiting for you to ask. Achievements persist across seasons on this device.</div></div>`;
  }
  function contentHTML() {
    return `
      <p>Vane House is a work of fiction. It touches on anxiety and panic, depression, dissociation, obsessive and sensory difficulties, parental absence and financial ruin. It does not depict self-harm.</p>
      <p>One scene shows Julian in a dissociative state, far away from himself in the cold. He is not in danger of harming himself. The way through is grounding: warmth, company and naming what is real. A few scenes ask you to count breaths or chimes; each can be skipped, and Settings can mute or soften the sound.</p>
      <p>The siblings are written with care, not as case files. The “Understanding” notes you can unlock offer a modern, kind gloss on what each of them lives with. They are not diagnoses.</p>
      <p class="muted small">If anything here feels close to home, consider talking with someone you trust or with a local support service. You do not have to carry it alone.</p>`;
  }
  function settingsHTML() {
    const row = (k, label) => `<div class="switch"><span>${label}</span><button class="btn ghost small" data-act="toggle" data-key="${k}">${meta.settings[k] ? 'On' : 'Off'}</button></div>`;
    return row('sound', 'Sound (rain, chimes, telephone)') + row('muffle', 'Muffled chimes and softer bells') + row('rain', 'Rain animation') + row('large', 'Larger text') +
      row('relaxed', 'Relaxed timing (no countdowns, slower rituals)') + row('assist', 'Assist mode (touch scenes complete gently)') +
      `<div class="switch"><span>Erase all progress and trophies</span><button class="btn ghost small" data-act="wipe">Erase…</button></div>
       <p class="muted small" style="margin-top:12px">Progress is stored only on this device. No account, no tracking.</p>`;
  }
  function menuHTML() {
    return `<div class="menu">
      <button class="btn ghost" data-act="howto">How to Play</button>
      <button class="btn ghost" data-act="settings">Settings</button>
      <button class="btn ghost" data-act="content-note">Content Note</button>
      <button class="btn ghost" data-act="to-title">Save &amp; Return to Title</button>
      <button class="btn ghost" data-act="abandon">Abandon This Season…</button></div>`;
  }

  /* ---------- game actions ---------- */
  function startRun(ng) {
    stopRitual(); selLoc = null; lastCue = '';
    run = E.newRun(ng ? { ng: true, memory: meta.styleMemory } : {});
    meta.runs += 1; saveMeta();
    screen = 'game';
    view = { type: 'prologue' };
    saveRun(); checkAch();
    render({ focus: true });
  }
  function afterAction(res) {
    if (!res) return;
    checkAch();
    saveRun();
    view = { type: 'result', res };
    render({ focus: true });
  }
  function doContinue() { applyProceed(E.proceed(run)); }
  function applyProceed(p) {
    saveRun();
    checkAch();
    if (p.type === 'end') view = { type: 'ending' };
    else if (p.type === 'slot') { selLoc = null; view = { type: 'transition', info: p }; Au.stroke({ freq: 174 }); }
    else view = run.scene ? { type: 'scene' } : { type: 'hub' };
    render({ focus: true });
  }
  function afterTransition() {
    view = run.scene ? { type: 'scene' } : { type: 'hub' };
    render({ focus: true });
  }

  /* ---------- events ---------- */
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    handle(el.dataset.act, el.dataset, ev);
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && modalOpen()) closeModal();
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('[role="button"][data-act]')) {
      ev.preventDefault(); handle(ev.target.dataset.act, ev.target.dataset, ev);
    }
  });
  $('#modal').addEventListener('click', (ev) => { if (ev.target.id === 'modal') closeModal(); });
  // Sound can only start after a tap (browser rule). Unlock on the first one.
  const unlockAudio = () => { Au.unlock(); document.removeEventListener('pointerdown', unlockAudio); document.removeEventListener('keydown', unlockAudio); };
  document.addEventListener('pointerdown', unlockAudio); document.addEventListener('keydown', unlockAudio);
  // Breath ritual: hold to breathe in, release to breathe out.
  document.addEventListener('pointerdown', (ev) => { if (ev.target.closest && ev.target.closest('#breath-btn')) { ev.preventDefault(); breathDown(); } });
  ['pointerup', 'pointercancel'].forEach((t) => document.addEventListener(t, () => breathUp()));
  document.addEventListener('keydown', (ev) => { if (ev.key === ' ' && ev.target.id === 'breath-btn' && !ev.repeat) { ev.preventDefault(); breathDown(); } });
  document.addEventListener('keyup', (ev) => { if (ev.key === ' ' && ev.target.id === 'breath-btn') { ev.preventDefault(); breathUp(); } });

  function handle(act, d) {
    switch (act) {
      case 'close-modal': closeModal(); break;
      case 'new-run':
        if (run && !run.ended && screen === 'title' && !confirmNew()) return;
        closeModal(); startRun(false); break;
      case 'new-ng':
        if (run && !run.ended && screen === 'title' && !confirmNew()) return;
        closeModal(); startRun(true); break;
      case 'continue-run': screen = 'game'; view = deriveView(); render({ focus: true }); break;
      case 'begin-first-day': view = deriveView(); render({ focus: true }); break;
      case 'to-title': closeModal(); stopRitual(); saveRun(); screen = 'title'; render(); break;
      case 'mute': meta.settings.sound = !meta.settings.sound; saveMeta(); applySettings(); render({ scroll: false }); break;
      case 'room': selLoc = d.loc; render({ scroll: false }); break;
      case 'attend-opp': { const sc = E.attendOpp(run, d.opp); if (sc) { saveRun(); view = { type: 'scene' }; render({ focus: true }); } break; }
      case 'attend-pell': { const sc = E.attendPell(run); if (sc) { saveRun(); view = { type: 'scene' }; render({ focus: true }); } break; }
      case 'rit-tap': if (R && R.def.type === 'chime' && !R.done) { R.taps += 1; Au.tick(true); const c = $('#chime-count'); if (c) c.textContent = R.taps; } break;
      case 'rit-muffle': meta.settings.muffle = !meta.settings.muffle; saveMeta(); Au.setMuffle(meta.settings.muffle); { const b = document.querySelector('[data-act="rit-muffle"]'); if (b) b.textContent = 'Muffled chimes: ' + (meta.settings.muffle ? 'On' : 'Off'); } break;
      case 'rit-pick': groundPick(Number(d.i)); break;
      case 'rit-done': finishRitual(Number(d.q)); break;
      case 'rit-skip': finishRitual(1); break;
      case 'rit-back': stopRitual(); view = { type: 'scene' }; render({ focus: true }); break;
      case 'howto': openModal('How to Play', howtoHTML()); break;
      case 'content-note': openModal('Content Note', contentHTML()); break;
      case 'settings': openModal('Settings', settingsHTML()); break;
      case 'menu': openModal('Menu', menuHTML()); break;
      case 'trophies': openModal('Trophies', trophiesHTML()); break;
      case 'ledger': openLedger(); break;
      case 'household': ledgerTab = 'house'; openModal('Maid’s Ledger', ledgerHTML()); { const t = document.getElementById('hh-' + d.sib); if (t) t.scrollIntoView({ block: 'start' }); } break;
      case 'ledger-tab': ledgerTab = d.tab; refreshLedger(); break;
      case 'toggle': meta.settings[d.key] = !meta.settings[d.key]; saveMeta(); applySettings(); openModal('Settings', settingsHTML()); break;
      case 'wipe':
        if (window.confirm('Erase all progress and trophies on this device?')) {
          lsDel(RUN_KEY); lsDel(META_KEY); meta = defaultMeta(); run = null; screen = 'title'; closeModal(); render();
        } break;
      case 'abandon':
        if (window.confirm('Abandon this season? Your trophies are kept.')) { lsDel(RUN_KEY); run = null; screen = 'title'; closeModal(); render(); } break;
      case 'install': promptInstall(); break;

      case 'attend': { const sc = E.attend(run, d.sib); if (sc) { saveRun(); view = { type: 'scene' }; render({ focus: true }); } break; }
      case 'choose': {
        const desc = E.describe(run); const c = desc && desc.choices.find((x) => x.key === d.key);
        if (c && c.ritual) { clearTimer(); startRitual(d.key, c.ritual); break; }
        afterAction(E.resolve(run, d.key)); break;
      }
      case 'search': afterAction(E.search(run, d.loc)); break;
      case 'tidy': afterAction(E.tidy(run)); break;
      case 'pass': applyProceed(E.passHour(run)); break;
      case 'continue':
        if (view.type === 'transition') afterTransition(); else doContinue();
        break;

      case 'pin': {
        pin = pin.includes(d.clue) ? pin.filter((x) => x !== d.clue) : pin.concat(d.clue).slice(-2);
        pinMsg = null; lastReal = null; refreshLedger(); break;
      }
      case 'connect': {
        const r = E.connect(run, pin[0], pin[1]);
        if (r.ok) { lastReal = r.real; pinMsg = null; pin = []; toast('✦ Realization: ' + r.real.title); checkAch(); saveRun(); render({ scroll: false }); }
        else { pinMsg = r.msg; lastReal = null; }
        refreshLedger(); $('#modal-body').scrollTop = 0; break;
      }
      default: break;
    }
  }
  function confirmNew() { return window.confirm('Begin a new season? Your current season will be replaced. Trophies are kept.'); }

  /* ---------- PWA: install + service worker ---------- */
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredInstall = e;
    if (screen === 'title') render({ scroll: false });
  });
  window.addEventListener('appinstalled', () => { deferredInstall = null; toast('Vane House installed'); if (screen === 'title') render({ scroll: false }); });
  async function promptInstall() {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    try { await deferredInstall.userChoice; } catch (e) { /* ignore */ }
    deferredInstall = null;
    if (screen === 'title') render({ scroll: false });
  }
  if ('serviceWorker' in navigator) {
    const hadController = !!navigator.serviceWorker.controller;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => { /* needs HTTPS or localhost */ });
      navigator.serviceWorker.ready.then(() => { swReady = true; const l = $('#pwa-line'); if (l) l.innerHTML = 'Offline ready ✓'; });
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) toast('Vane House updated. Reload for the latest version.'); });
  }

  document.addEventListener('visibilitychange', () => { if (document.hidden) saveRun(); });
  window.addEventListener('pagehide', saveRun);

  /* ---------- boot ---------- */
  render();

  // Test hook (harmless in production): lets automated checks read live state.
  window.__vane = { get run() { return run; }, get meta() { return meta; }, get view() { return view; }, get ritual() { return R; } };
})();
