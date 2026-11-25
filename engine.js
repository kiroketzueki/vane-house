/* Vane House — game engine. Pure logic (no DOM) so it can be simulated in Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./story-extra.js'));
  else root.VaneEngine = factory(root.VaneStory);
})(typeof self !== 'undefined' ? self : this, function (S) {
  'use strict';

  const SIBS = Object.keys(S.SIBLINGS);
  const STYLE_KEYS = Object.keys(S.STYLES);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const LAST_DAY = 7;

  /* ---------- state ---------- */
  function blankLog() {
    const o = {};
    SIBS.forEach(s => { o[s] = {}; STYLE_KEYS.forEach(k => { o[s][k] = { n: 0, t: 0, m: 0 }; }); });
    return o;
  }
  function newRun(opts) {
    opts = opts || {};
    const st = {
      v: 2, ng: !!opts.ng, memory: opts.memory ? JSON.parse(JSON.stringify(opts.memory)) : {},
      oppDone: [], moments: 0, missed: [], rituals: [], pellPts: 0, pellSeen: [], day: 1, slot: 0, g: 0, ap: 0, scrutiny: 0,
      trust: {}, mask: {}, clues: [], reals: [], seen: [], cool: {}, flags: {},
      searched: { study: 0, parlor: 0, conservatory: 0, library: 0 },
      tidies: 0, overreach: 0, gates: 0, lateDone: 0, understood: [],
      styleLog: blankLog(), eventsDone: [], scene: null, ended: null, quietFeetOk: false
    };
    SIBS.forEach(s => { st.trust[s] = 10; st.mask[s] = 100; });
    beginSlot(st);
    return st;
  }
  function sanitize(raw) {
    // Defensive load: fall back to a new run if shape is off.
    if (!raw || raw.v !== 2 || typeof raw.day !== 'number') return null;
    const base = newRun();
    const st = Object.assign(base, raw);
    SIBS.forEach(s => {
      st.trust[s] = clamp(Number(st.trust[s]) || 0, 0, 100);
      st.mask[s] = clamp(Number.isFinite(st.mask[s]) ? st.mask[s] : 100, 0, 100);
    });
    st.styleLog = Object.assign(blankLog(), st.styleLog || {});
    return st;
  }

  /* ---------- helpers ---------- */
  function has(st, token) {
    const [type, id] = token.split(':');
    return type === 'clue' ? st.clues.includes(id) : type === 'real' ? st.reals.includes(id) : type === 'flag' ? !!st.flags[id] : false;
  }
  function realCount(st) { return st.reals.filter(r => !(S.REALIZATIONS[r] || {}).auto).length; }
  function needMet(st, need) {
    if (!need || !need.length) return true;
    const head = need[0];
    if (head === 'any') return need.slice(1).some(t => has(st, t));
    if (head === 'all') return need.slice(1).every(t => has(st, t));
    if (head === 'reals') return realCount(st) >= need[1];
    return need.every(t => has(st, t));
  }
  function needLabel(need) {
    if (!need) return '';
    const name = t => {
      const [type, id] = t.split(':');
      if (type === 'flag') return 'a choice you made earlier this week';
      return type === 'clue' ? (S.CLUES[id] || {}).title : (S.REALIZATIONS[id] || {}).title;
    };
    const head = need[0];
    if (head === 'reals') return 'Requires ' + need[1] + ' Realizations';
    if (head === 'any') return 'Requires one of: ' + need.slice(1).map(name).join(' / ');
    if (head === 'all') return 'Requires: ' + need.slice(1).map(name).join(' + ');
    return 'Requires: ' + need.map(name).join(' + ');
  }
  function addClue(st, id) {
    if (!id || !S.CLUES[id] || st.clues.includes(id)) return false;
    st.clues.push(id);
    return true;
  }

  /* ---------- schedule ---------- */
  function where(sib, day, slot) {
    const odd = day % 2 === 1;
    const T = {
      victor:  [odd ? 'dining' : 'study', 'study', odd ? 'dining' : 'parlor', 'study'],
      camille: [odd ? 'parlor' : 'dining', odd ? 'hall' : 'parlor', odd ? 'parlor' : 'dining', 'parlor'],
      julian:  ['conservatory', odd ? 'conservatory' : 'library', 'dining', 'conservatory'],
      clara:   ['dining', 'library', odd ? 'library' : 'dining', 'hall']
    };
    // Clara keeps vigil by the clock only after midnight; library otherwise on afternoons.
    return T[sib][slot];
  }
  function presentAt(st, loc) {
    return SIBS.filter(s => where(s, st.day, st.slot) === loc);
  }

  /* ---------- slot flow ---------- */
  function beginSlot(st) {
    st.scene = null;
    if (st.slot === 0 && st.day > 1) {
      st.scrutiny = Math.max(0, st.scrutiny - 3);
      SIBS.forEach(s => {
        const re = st.trust[s] < 40 ? 4 : st.trust[s] < 60 ? 2 : 0;
        st.mask[s] = Math.min(100, st.mask[s] + re);
      });
    }
    if (st.slot === 0 && st.day === 4) st.quietFeetOk = st.scrutiny <= 15;
    const ev = Object.values(S.EVENTS).find(e => e.day === st.day && e.slot === st.slot && !st.eventsDone.includes(e.id));
    // Late nights allow one action; other slots two. Scripted events are free but use up one action.
    const dflt = st.slot <= 1 ? 2 : 1; // 2+2+1+1 = 42 actions a season; Moments make every hour count
    st.ap = ev && !ev.free ? 1 : dflt;
    if (ev) st.scene = { kind: 'event', id: ev.id };
  }
  function oppsNow(st) {
    return (S.OPPORTUNITIES || []).filter(o => o.day === st.day && o.slot === st.slot && !st.oppDone.includes(o.id));
  }
  function expireMoments(st) {
    const missed = [];
    oppsNow(st).forEach(o => {
      const out = emptyOut();
      applyFx(st, o.missFx, out);
      st.oppDone.push(o.id);
      st.missed.push(o.id);
      missed.push({ id: o.id, title: o.title, sib: o.sib, note: o.missNote });
    });
    return missed;
  }
  function advance(st) {
    const missed = expireMoments(st);
    st.slot += 1; st.g += 1;
    if (st.slot > 3) { st.slot = 0; st.day += 1; }
    if (st.day > LAST_DAY) { finalize(st); return { type: 'end', missed }; }
    const newDay = st.slot === 0;
    beginSlot(st);
    return { type: 'slot', newDay, missed };
  }
  /* Call after any action resolves. Returns {type:'continue'|'slot'|'end'}. */
  function proceed(st) {
    if (st.ended) return { type: 'end' };
    if (st.scrutiny >= 100) { st.ended = 'dismissed'; return { type: 'end' }; }
    if (st.scene) return { type: 'continue' };
    if (st.ap <= 0) return advance(st);
    return { type: 'continue' };
  }
  function resume(st) { return proceed(st); }
  function passHour(st) { st.ap = 0; return proceed(st); }

  /* ---------- hub ---------- */
  function hub(st) {
    const locs = Object.values(S.LOCATIONS).map(loc => {
      const present = presentAt(st, loc.id);
      const pool = S.SEARCH[loc.id];
      const found = st.searched[loc.id] || 0;
      return {
        id: loc.id, name: loc.name, desc: loc.desc, present,
        canSearch: !!pool && present.length === 0 && found < pool.length,
        searchDone: !!pool && found >= pool.length,
        isService: loc.id === 'service'
      };
    });
    const opps = oppsNow(st).map(o => ({ id: o.id, title: o.title, sib: o.sib, loc: where(o.sib, st.day, st.slot) }));
    const pell = pellNext(st);
    return { day: st.day, dayName: S.DAYS[st.day - 1], slot: st.slot, slotName: S.SLOT_NAMES[st.slot], clock: S.SLOT_CLOCK[st.slot], ap: st.ap, locs, opps, pell: pell ? { id: pell.id, title: pell.title } : null, ng: st.ng, weather: S.WEATHER[(st.day + st.slot) % S.WEATHER.length] };
  }

  /* ---------- encounters ---------- */
  function ownClueCount(st, sib) {
    const color = S.SIBLINGS[sib].color;
    return st.clues.filter(c => S.CLUES[c].color === color).length;
  }
  function condOk(st, enc) {
    const c = enc.cond || {};
    if (c.seen && !c.seen.every(id => st.seen.includes(id))) return false;
    if (c.minTrust != null && st.trust[enc.sib] < c.minTrust) return false;
    if (c.maxMask != null && st.mask[enc.sib] > c.maxMask) return false;
    if (c.ownClues != null && ownClueCount(st, enc.sib) < c.ownClues) return false;
    if (c.minDay != null && st.day < c.minDay) return false;
    if (c.anyReal && !c.anyReal.some(r => st.reals.includes(r))) return false;
    return true;
  }
  function eligibleEncounter(st, sib) {
    for (const enc of S.ENCOUNTERS) {
      if (enc.sib !== sib || st.seen.includes(enc.id)) continue;
      if (!enc.slots.includes(st.slot)) continue;
      if (st.cool[enc.id] != null && st.g < st.cool[enc.id]) continue;
      if (!condOk(st, enc)) continue;
      return enc;
    }
    return null;
  }
  function attend(st, sib) {
    if (st.scene || st.ap <= 0 || st.ended) return null;
    if (!presentAt(st, where(sib, st.day, st.slot)).includes(sib)) return null;
    const enc = eligibleEncounter(st, sib);
    st.scene = enc
      ? { kind: 'enc', sib, id: enc.id }
      : { kind: 'enc', sib, id: null, amb: (st.g + SIBS.indexOf(sib)) % S.SIBLINGS[sib].amb.length };
    return describe(st);
  }

  const AMB_LABELS = {
    defer: 'Keep your eyes down, your voice low, and ask if anything is needed.',
    direct: 'Ask plainly whether there is anything you can do.',
    warm: 'Offer a smile and a light word.',
    quiet: 'Say nothing. Stay close, and be useful.'
  };

  /* ---------- Moments & Mrs. Pell ---------- */
  function attendOpp(st, id) {
    if (st.scene || st.ap <= 0 || st.ended) return null;
    if (!oppsNow(st).some(o => o.id === id)) return null;
    st.scene = { kind: 'opp', id };
    return describe(st);
  }
  function pellNext(st) {
    if (!st.ng || st.flags.arc_pell) return null;
    const pts = st.pellPts;
    return (S.PELL || []).find(p =>
      !st.pellSeen.includes(p.id) && st.day >= p.minDay &&
      (!p.needSeen || st.pellSeen.includes(p.needSeen)) && (p.needPell == null || pts >= p.needPell)) || null;
  }
  function attendPell(st) {
    if (st.scene || st.ap <= 0 || st.ended) return null;
    const p = pellNext(st);
    if (!p) return null;
    st.scene = { kind: 'pell', id: p.id };
    return describe(st);
  }

  /* A scripted scene (event / moment / Pell) described as a list of keyed choices. */
  function scriptedDescribe(st, def, kind) {
    const paras = def.paras.slice();
    (def.paraIf || []).forEach(x => { if (st.flags[x.flag]) paras.push(x.text); });
    const choices = [];
    def.choices.forEach((c, i) => {
      if (c.hidden) return;
      const ok = needMet(st, c.need);
      const o = ok
        ? { key: 'e' + i, label: c.label, tag: c.tag || '', gated: !!c.need }
        : { key: 'e' + i, locked: true, requires: needLabel(c.need), tag: c.tag || '' };
      if (ok && c.ritual) o.ritual = c.ritual;
      choices.push(o);
    });
    const sibName = def.sib ? S.SIBLINGS[def.sib].name : null;
    return {
      kind, id: def.id, title: def.title, paras, choices, sib: def.sib || null, sibName,
      timer: def.timer || 0, timeoutKey: def.timeoutChoice != null ? 'e' + def.timeoutChoice : null,
      pell: kind === 'pell', moment: kind === 'opp'
    };
  }

  function describe(st) {
    const sc = st.scene;
    if (!sc) return null;
    if (sc.kind === 'event') return scriptedDescribe(st, S.EVENTS[sc.id], 'event');
    if (sc.kind === 'opp') return scriptedDescribe(st, S.OPPORTUNITIES.find(o => o.id === sc.id), 'opp');
    if (sc.kind === 'pell') return scriptedDescribe(st, S.PELL.find(p => p.id === sc.id), 'pell');
    const sib = S.SIBLINGS[sc.sib];
    const enc = sc.id ? S.ENCOUNTERS.find(e => e.id === sc.id) : null;
    const mem = (st.memory || {})[sc.sib];
    const choices = STYLE_KEYS.map(k => {
      const c = { key: k, style: k, label: enc ? enc.choices[k].label : AMB_LABELS[k], tag: S.STYLES[k].name };
      if (mem && mem.best === k) c.remembered = true;
      if (enc && enc.ritual && enc.ritual.keys.includes(k)) c.ritual = enc.ritual;
      return c;
    });
    if (enc && enc.gate) {
      const g = needMet(st, enc.gate.need)
        ? { key: 'gate', gated: true, label: enc.gate.label, tag: '✦ Ledger' }
        : { key: 'gate', locked: true, requires: needLabel(enc.gate.need), tag: '✦ Ledger' };
      if (!g.locked && enc.ritual && enc.ritual.keys.includes('gate')) g.ritual = enc.ritual;
      choices.push(g);
    }
    choices.push({ key: 'pry', pry: true, label: sib.pry.label, tag: 'Press the matter' });
    const paras = (enc ? enc.paras : [sib.amb[sc.amb]]).slice();
    if (enc) (enc.paraIf || []).forEach(x => { if (st.flags[x.flag]) paras.push(x.text); });
    return {
      kind: 'enc', id: enc ? enc.id : null, sib: sc.sib, tier: enc ? enc.tier : 0,
      title: enc ? enc.title : sib.name + ' — a quiet moment',
      paras, choices, ambient: !enc, late: st.slot === 3,
      memoryNote: mem && mem.best && st.ng ? 'Last season: ' + sib.name + ' answered best to ' + S.STYLES[mem.best].name + '.' : ''
    };
  }

  /* ---------- effects ---------- */
  function applyFx(st, fx, out, ritualBonus) {
    if (!fx) return;
    const bump = (who, dt, dm) => {
      out.sibs[who] = out.sibs[who] || { t: 0, m: 0 };
      const t0 = st.trust[who], m0 = st.mask[who];
      st.trust[who] = clamp(t0 + dt, 0, 100);
      st.mask[who] = clamp(m0 + dm, 0, 100);
      out.sibs[who].t += st.trust[who] - t0;
      out.sibs[who].m += st.mask[who] - m0;
    };
    const tr = Object.assign({}, fx.trust || {}), mk = Object.assign({}, fx.mask || {});
    if (ritualBonus && ritualBonus.sib) {
      tr[ritualBonus.sib] = (tr[ritualBonus.sib] || 0) + ritualBonus.t;
      mk[ritualBonus.sib] = (mk[ritualBonus.sib] || 0) - ritualBonus.m;
    }
    const who = new Set([...Object.keys(tr), ...Object.keys(mk)]);
    who.forEach(w => bump(w, tr[w] || 0, mk[w] || 0));
    if (typeof fx.scrutiny === 'number') {
      const s0 = st.scrutiny;
      st.scrutiny = clamp(s0 + fx.scrutiny, 0, 100);
      out.scrutiny += st.scrutiny - s0;
    }
    if (fx.overreach) st.overreach += fx.overreach;
    if (fx.flag) st.flags[fx.flag] = true;
    if (fx.pell) st.pellPts = Math.max(0, st.pellPts + fx.pell);
    if (fx.clue && addClue(st, fx.clue)) out.newClues.push(fx.clue);
    if (fx.realize) grantReal(st, fx.realize, out);
  }
  function grantReal(st, id, out) {
    if (!S.REALIZATIONS[id] || st.reals.includes(id)) return;
    st.reals.push(id);
    (out.newReals = out.newReals || []).push(id);
  }
  function emptyOut() { return { sibs: {}, scrutiny: 0, newClues: [], newReals: [], notes: [], success: null, react: '', after: '' }; }

  // Ritual quality 0-2 (never punishing). Absent = 1 (e.g. skipped or assist mode).
  const RB = [{ t: 0, m: 0 }, { t: 2, m: 2 }, { t: 4, m: 4 }];
  function ritualBonus(q, sib) {
    const b = RB[clamp(q == null ? 1 : q, 0, 2)];
    return { sib, t: b.t, m: b.m };
  }

  function resolve(st, key, opts) {
    const sc = st.scene;
    if (!sc) return null;
    opts = opts || {};
    const out = emptyOut();

    if (sc.kind === 'event' || sc.kind === 'opp' || sc.kind === 'pell') {
      const def = sc.kind === 'event' ? S.EVENTS[sc.id] : sc.kind === 'opp' ? S.OPPORTUNITIES.find(o => o.id === sc.id) : S.PELL.find(p => p.id === sc.id);
      const i = Number(String(key).slice(1));
      const ch = def.choices[i];
      if (!ch || !needMet(st, ch.need)) return null;
      let fx = ch.fx, react = ch.react;
      if (ch.check && ch.check.allTrustMin != null) {
        const ok = SIBS.every(s => st.trust[s] >= ch.check.allTrustMin);
        if (!ok) { fx = ch.failFx; react = ch.failReact; out.success = false; } else out.success = true;
      }
      if (ch.need) st.gates += 1;
      let rb = null;
      if (ch.ritual) {
        rb = ritualBonus(opts.quality, ch.ritual.sib);
        st.rituals.push({ type: ch.ritual.type, q: clamp(opts.quality == null ? 1 : opts.quality, 0, 2) });
        out.ritual = { type: ch.ritual.type, q: st.rituals[st.rituals.length - 1].q };
      }
      applyFx(st, fx, out, rb);
      if (def.always) applyFx(st, def.always, out);
      out.react = react; out.after = def.after || '';
      if (sc.kind === 'event') {
        st.eventsDone.push(def.id);
        if (def.free) { /* no action spent */ } 
      } else if (sc.kind === 'opp') {
        st.oppDone.push(def.id); st.moments += 1; st.ap -= 1; out.moment = def.id;
      } else {
        st.pellSeen.push(def.id); st.ap -= 1; out.pell = true;
        if (ch.success) st.flags.arc_pell = true;
      }
      st.scene = null;
      out.who = def.sib || null; out.eventId = sc.kind === 'event' ? def.id : null;
      out.kind = sc.kind; out.title = def.title;
      return out;
    }

    const sib = sc.sib;
    const sibData = S.SIBLINGS[sib];
    const enc = sc.id ? S.ENCOUNTERS.find(e => e.id === sc.id) : null;
    const tier = enc ? enc.tier : 0;
    let dt, dm, ds, react, overreach = 0;
    const ritual = enc && enc.ritual && enc.ritual.keys.includes(key) ? enc.ritual : null;

    if (key === 'gate' && enc && enc.gate && needMet(st, enc.gate.need)) {
      dt = 10; dm = -16; ds = 2; react = enc.gate.react; st.gates += 1;
    } else if (key === 'pry') {
      dt = -6; dm = -12; ds = 16; overreach = 1;
      react = sibData.pry.react[st.overreach % sibData.pry.react.length];
    } else if (STYLE_KEYS.includes(key)) {
      const base = (enc && enc.fxOverride && enc.fxOverride[key]) || S.FX[sib][key];
      const tm = S.TIER_MASK[tier];
      dt = tier === 0 ? Math.round(base[0] * 0.4) : (base[0] > 0 ? Math.round(base[0] * 0.7) : base[0]);
      dm = base[1] < 0 ? Math.round(base[1] * tm) : (tier === 0 ? Math.round(base[1] * 0.6) : base[1]);
      ds = base[2];
      react = enc ? enc.choices[key].react : sibData.gen[key];
    } else return null;

    // Touch interaction: a little extra warmth when the coping tool is done well.
    if (ritual) {
      const q = clamp(opts.quality == null ? 1 : opts.quality, 0, 2);
      if (dt >= 0) { dt += RB[q].t; dm -= RB[q].m; }
      st.rituals.push({ type: ritual.type, q });
      out.ritual = { type: ritual.type, q };
    }

    // Late-night: the masks come off more easily, but staff notice a maid up past midnight.
    if (st.slot === 3 && dm < 0 && key !== 'pry') { dm -= 3; if (st.trust[sib] < 40) ds += 2; }

    // High-tier moments can fail: the sibling retreats behind the mask.
    let success = true;
    if (tier >= 3) {
      success = key === 'gate' || (dt >= 5 && dm <= -8);
      if (!success) { dt = Math.min(dt, 0) - 2; dm = 6; }
    }
    out.success = success;
    if (!success && tier >= 3) out.notes.push('The moment passes. ' + sibData.name + ' retreats behind the mask.');

    out.sibs[sib] = { t: 0, m: 0 };
    const t0 = st.trust[sib], m0 = st.mask[sib];
    st.trust[sib] = clamp(t0 + dt, 0, 100);
    st.mask[sib] = clamp(m0 + dm, 0, 100);
    out.sibs[sib].t = st.trust[sib] - t0; out.sibs[sib].m = st.mask[sib] - m0;
    const s0 = st.scrutiny; st.scrutiny = clamp(s0 + ds, 0, 100); out.scrutiny = st.scrutiny - s0;
    st.overreach += overreach;

    if (STYLE_KEYS.includes(key)) {
      const L = st.styleLog[sib][key]; L.n += 1; L.t += out.sibs[sib].t; L.m += out.sibs[sib].m;
    }
    if (enc) {
      if (enc.notice && addClue(st, enc.notice)) out.newClues.push(enc.notice);
      if (tier <= 2 || success) {
        st.seen.push(enc.id);
        if (success && tier >= 3) {
          if (enc.grantsUnderstanding && !st.understood.includes(sib)) { st.understood.push(sib); out.notes.push('Understanding unlocked: ' + sibData.gloss.title); }
          if (enc.arc) { st.flags['arc_' + sib] = true; out.notes.push(sibData.name + ' has opened a door that does not easily close.'); }
          if (enc.id === 'c5') st.flags.recordPlayed = true;
        }
      } else {
        st.cool[enc.id] = st.g + 2;
      }
    }
    if (st.slot === 3) st.lateDone += 1;
    st.ap -= 1;
    st.scene = null;
    out.react = react; out.sib = sib; out.eventId = null; out.kind = 'enc';
    return out;
  }

  /* ---------- quiet actions ---------- */
  function search(st, loc) {
    const pool = S.SEARCH[loc];
    if (!pool || st.ap <= 0 || st.scene) return null;
    if (presentAt(st, loc).length) return null;
    const n = st.searched[loc] || 0;
    if (n >= pool.length) return null;
    const clueId = pool[n];
    st.searched[loc] = n + 1;
    const out = emptyOut();
    addClue(st, clueId) && out.newClues.push(clueId);
    const s0 = st.scrutiny; st.scrutiny = clamp(s0 + 7, 0, 100); out.scrutiny = st.scrutiny - s0;
    st.ap -= 1;
    out.react = S.SEARCH_TEXT[clueId];
    out.search = true;
    return out;
  }
  function tidy(st) {
    if (st.ap <= 0 || st.scene) return null;
    const out = emptyOut();
    const s0 = st.scrutiny; st.scrutiny = clamp(s0 - 10, 0, 100); out.scrutiny = st.scrutiny - s0;
    out.react = 'You take your tea in the kitchen with Mrs. Pell and let her see you working. The household’s eyes slide off you.';
    out.hint = S.HINTS[st.tidies % S.HINTS.length];
    st.tidies += 1; st.ap -= 1;
    if (st.ng && !st.flags.arc_pell) {
      st.pellPts += 1;
      out.react += ' Mrs. Pell slides a second biscuit across the table without a word.';
    }
    out.tidy = true;
    return out;
  }

  /* ---------- ledger: pinning clues together ---------- */
  function connect(st, a, b) {
    if (!a || !b || a === b || !st.clues.includes(a) || !st.clues.includes(b)) return { ok: false, msg: 'Choose two different clues from your Ledger.' };
    const r = Object.values(S.REALIZATIONS).find(x => x.pair && x.pair.includes(a) && x.pair.includes(b));
    if (!r) return { ok: false, msg: 'These two do not speak to each other, yet.' };
    if (st.reals.includes(r.id)) return { ok: false, msg: 'You have already drawn that line.' };
    if ((r.needReals && realCount(st) < r.needReals) || (r.minDay && st.day < r.minDay)) return { ok: false, msg: 'The pieces fit, but the picture is not yet whole. Understand more of this household first.' };
    st.reals.push(r.id);
    return { ok: true, real: r };
  }

  /* ---------- endings ---------- */
  function avgMask(st) { return SIBS.reduce((a, s) => a + st.mask[s], 0) / SIBS.length; }
  function computeEnding(st) {
    if (st.scrutiny >= 100) return 'dismissed';
    if (st.overreach >= 3 || st.flags.letterRead) return 'tragic';
    if (st.reals.includes('conspiracy') && st.flags.openTable && SIBS.every(s => st.trust[s] >= 50) && avgMask(st) <= 50) return 'true';
    if (st.flags.final_pell && st.flags.arc_pell) return 'pell';
    const arcs = SIBS.filter(s => st.flags['arc_' + s]);
    if (arcs.length) {
      const focus = arcs.find(s => st.flags['final_' + s]);
      if (focus) return focus;
      return arcs.slice().sort((a, b) => st.trust[b] - st.trust[a])[0];
    }
    return 'neutral';
  }
  function finalize(st) { if (!st.ended) st.ended = computeEnding(st); return st.ended; }
  function endingExtras(st) {
    return (S.ENDING_EXTRAS || []).filter(x => st.flags[x.flag] && x.ends.includes(st.ended)).map(x => x.text);
  }
  /* New Game+: remember which style worked best (trust gained plus mask lowered) with each sibling. */
  function updateStyleMemory(meta, st) {
    meta.styleMemory = meta.styleMemory || {};
    SIBS.forEach(sb => {
      let best = null, bestScore = 0;
      STYLE_KEYS.forEach(k => {
        const L = st.styleLog[sb][k];
        if (!L || L.n < 1) return;
        const score = (L.t - L.m) / L.n;
        if (score > bestScore) { bestScore = score; best = k; }
      });
      if (best) meta.styleMemory[sb] = { best };
    });
    return meta.styleMemory;
  }
  function ngAvailable(meta) { return !!(meta && meta.endings && meta.endings.length >= 1); }

  /* ---------- achievements ---------- */
  function checkAchievements(st, meta) {
    const got = [];
    const give = id => { if (S.ACHIEVEMENTS[id] && !meta.achievements.includes(id)) { meta.achievements.push(id); got.push(id); } };
    const colorAll = c => Object.values(S.CLUES).filter(x => x.color === c).every(x => st.clues.includes(x.id));
    if (st.clues.length >= 1) give('first_clue');
    if (st.reals.length >= 1) give('first_real');
    if (realCount(st) >= Object.values(S.REALIZATIONS).filter(r => !r.auto).length) give('all_reals');
    if (st.clues.length >= Object.keys(S.CLUES).length) give('sixteen');
    if (colorAll('Red')) give('red_thread');
    if (colorAll('Yellow')) give('yellow_thread');
    if (colorAll('Green')) give('green_thread');
    if (colorAll('Blue')) give('blue_thread');
    if (st.gates >= 1) give('read_between');
    if (st.day >= 4 && st.quietFeetOk) give('quiet_feet');
    if (st.tidies >= 4) give('tidy_hands');
    if (SIBS.some(s => st.mask[s] <= 20 && st.trust[s] >= 40)) give('mask_slips');
    if (SIBS.every(s => st.trust[s] >= 60)) give('four_hearts');
    if (st.lateDone >= 3) give('night_watch');
    if (st.understood.length >= 4) give('understood_all');
    if (st.flags.phoneAnswered || ['phone_victor', 'phone_camille', 'phone_julian', 'phone_clara', 'phone_none'].some(f => st.flags[f])) give('phone_call');
    const rq = (t) => st.rituals.some(r => r.type === t && r.q === 2);
    if (rq('breath')) give('breath_great');
    if (rq('chime')) give('chime_great');
    if (rq('ground')) give('ground_great');
    if (st.moments >= 4) give('right_place');
    if (st.flags.julianHome) give('julian_home');
    if (st.flags.pawnIntercepted) give('pawn_stopped');
    if (st.reals.includes('hired_to_notice')) give('hired_notice');
    if (st.flags.recordPlayed) give('record_played');
    if (st.ng) give('ng_plus');
    if (st.ended) {
      give('end_' + st.ended);
      if (!meta.endings.includes(st.ended)) meta.endings.push(st.ended);
      if (meta.endings.length >= Object.keys(S.ENDINGS).length) give('all_endings');
    }
    return got;
  }

  return {
    S, SIBS, STYLE_KEYS, LAST_DAY,
    newRun, sanitize, where, presentAt, beginSlot, advance, proceed, resume, passHour,
    hub, attend, attendOpp, attendPell, pellNext, oppsNow, describe, resolve, search, tidy, connect, endingExtras, updateStyleMemory, ngAvailable, realCount,
    computeEnding, finalize, checkAchievements, needMet, needLabel, eligibleEncounter, ownClueCount, avgMask
  };
});
