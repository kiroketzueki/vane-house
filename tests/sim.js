/* Headless playthrough simulator: verifies invariants and that every ending is reachable.
   Run:  node tests/sim.js            (summary)
         node tests/sim.js --verbose  (print the optimal run) */
'use strict';
const E = require('../engine.js');
const S = E.S;
const VERBOSE = process.argv.includes('--verbose');

let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];

const BEST = { victor: ['direct', 'quiet'], camille: ['quiet', 'warm'], julian: ['quiet', 'warm'], clara: ['direct', 'quiet'] };

function invariants(st) {
  E.SIBS.forEach(s => {
    if (!(st.trust[s] >= 0 && st.trust[s] <= 100)) throw new Error('trust out of range ' + s + ' ' + st.trust[s]);
    if (!(st.mask[s] >= 0 && st.mask[s] <= 100)) throw new Error('mask out of range ' + s + ' ' + st.mask[s]);
  });
  if (!(st.scrutiny >= 0 && st.scrutiny <= 100)) throw new Error('scrutiny out of range ' + st.scrutiny);
  if (st.ap < 0) throw new Error('negative AP');
}

function tryConnect(st, log) {
  let again = true;
  while (again) {
    again = false;
    for (const a of st.clues) for (const b of st.clues) {
      if (a >= b) continue;
      const r = E.connect(st, a, b);
      if (r.ok) { again = true; if (log) log('  ✦ Realization: ' + r.real.title); }
    }
  }
}

const LAST_TAGS = ['Victor', 'Camille', 'Julian', 'Clara'];
function pickScripted(st, sc, strat) {
  const open = sc.choices.filter(c => !c.locked);
  if (strat === 'random') return pick(open).key;
  if (strat === 'reckless') return open[open.length - 1].key;
  const byTag = (t) => { const i = S.EVENTS.last.choices.findIndex(c => c.tag === t); return i < 0 ? null : 'e' + i; };
  if (sc.id === 'last') {
    if (strat.startsWith('focus:')) {
      const sib = strat.split(':')[1];
      return byTag(sib[0].toUpperCase() + sib.slice(1));
    }
    if (strat === 'pell') return open.find(c => c.tag === 'Mrs. Pell') ? byTag('Mrs. Pell') : byTag('Victor');
    const letter = open.find(c => c.tag === 'The Letter');
    return letter ? letter.key : byTag('Victor');
  }
  if (sc.id === 'reference') {
    const minT = Math.min(...E.SIBS.map(x => st.trust[x]));
    return minT >= 40 ? 'e2' : 'e0';
  }
  const pref = { tea: [0, 1, 2, 3], party: [4, 2, 0], post: [2, 0], storm: [0, 3, 1], clock: [4, 3, 2, 0], table: [2, 1, 0],
    phone: [2, 3, 0], pawn: [0], bailiff: [0, 5, 2], stormwalk: [3, 2, 1] };
  const prefs = pref[sc.id] || [0];
  const hit = prefs.map(i => 'e' + i).find(k => open.some(c => c.key === k));
  if (hit) return hit;
  // Moments and Pell scenes: prefer informed/success, else first.
  if (sc.kind === 'pell') {
    const g = open.find(c => c.gated); if (g) return g.key;
    return open[0].key;
  }
  const g = open.find(c => c.gated);
  return g ? g.key : open[0].key;
}

function playScene(st, strat, log) {
  const sc = E.describe(st);
  let key;
  const q = strat === 'random' ? Math.floor(rnd() * 3) : 2;
  if (sc.kind === 'event' || sc.kind === 'opp' || sc.kind === 'pell') {
    key = pickScripted(st, sc, strat);
  } else {
    const sib = sc.sib;
    const open = sc.choices.filter(c => !c.locked);
    if (strat === 'random') key = pick(open).key;
    else if (strat === 'reckless') key = 'pry';
    else {
      const gate = open.find(c => c.key === 'gate');
      key = gate ? 'gate' : BEST[sib][0];
    }
  }
  const res = E.resolve(st, key, { quality: q });
  if (!res) throw new Error('resolve returned null for ' + key + ' in ' + JSON.stringify(sc.title));
  if (log) log('  [' + (sc.sib || 'event') + ' ' + sc.title + '] ' + key + '  trust/mask: ' + JSON.stringify(res.sibs) + (res.success === false ? ' FAIL' : '') + (res.newClues.length ? ' +clue ' + res.newClues.join(',') : '') + (res.ritual ? ' ritual q' + res.ritual.q : ''));
  return res;
}

function hubAction(st, strat, log) {
  const h = E.hub(st);
  if (strat === 'search') {
    const l = h.locs.find(x => x.canSearch);
    if (l) { E.search(st, l.id); if (log) log('  search ' + l.id); return; }
    E.tidy(st); return;
  }
  if (strat === 'random') {
    const opts = [];
    h.opps.forEach(o => opts.push(['opp', o.id])); if (h.pell) opts.push(['pell']);
    h.locs.forEach(l => { l.present.forEach(s => opts.push(['att', s])); if (l.canSearch) opts.push(['search', l.id]); });
    opts.push(['tidy']); opts.push(['pass']);
    const o = pick(opts);
    if (o[0] === 'opp') E.attendOpp(st, o[1]); else if (o[0] === 'pell') E.attendPell(st); else if (o[0] === 'att') E.attend(st, o[1]); else if (o[0] === 'search') E.search(st, o[1]); else if (o[0] === 'tidy') E.tidy(st); else E.passHour(st);
    return;
  }
  if (strat === 'reckless') {
    const l = h.locs.find(x => x.present.length);
    if (l) E.attend(st, l.present[0]); else E.passHour(st);
    return;
  }
  // optimal / focus
  const focus = strat.startsWith('focus:') ? strat.split(':')[1] : null;
  // Moments expire at slot end: take the ones that matter.
  if (h.opps && h.opps.length && st.ap > 0) {
    const o = h.opps.find(x => !focus || x.sib === focus || st.ap > 1) || null;
    if (o && (!focus || o.sib === focus || st.ap > 1)) { E.attendOpp(st, o.id); if (log) log('  moment ' + o.id); return; }
  }
  if (h.pell && st.ap > 0) { E.attendPell(st); if (log) log('  pell ' + h.pell.id); return; }
  const needClues = st.clues.length < 16;
  // 1) Quiet searches when scrutiny is safe
  const sLoc = h.locs.find(l => l.canSearch);
  const enc = E.SIBS.map(s => ({ s, loc: h.locs.find(l => l.present.includes(s)) }))
    .filter(x => x.loc && (!focus || x.s === focus || st.day >= 6 ? true : true))
    .map(x => ({ ...x, e: E.eligibleEncounter(st, x.s) }));
  const real = enc.filter(x => x.e && (!focus || x.s === focus)).sort((a, b) => b.e.tier - a.e.tier)[0];
  const realAny = enc.filter(x => x.e).sort((a, b) => b.e.tier - a.e.tier)[0];
  if (real && real.e.tier >= 3) { E.attend(st, real.s); if (log) log('  attend ' + real.s + ' (' + real.e.id + ')'); return; }
  if (st.scrutiny > 55) { E.tidy(st); if (log) log('  tidy'); return; }
  if (sLoc && needClues && (st.scrutiny < 45)) { const r = E.search(st, sLoc.id); if (log) log('  search ' + sLoc.id + ' → ' + r.newClues); return; }
  if (real) { E.attend(st, real.s); if (log) log('  attend ' + real.s + ' (' + real.e.id + ')'); return; }
  if (realAny && !focus) { E.attend(st, realAny.s); if (log) log('  attend ' + realAny.s + ' (' + realAny.e.id + ')'); return; }
  // ambient: lowest-trust present sibling (or focus)
  const present = enc.filter(x => !focus || x.s === focus).sort((a, b) => st.trust[a.s] - st.trust[b.s]);
  if (present.length) { E.attend(st, present[0].s); if (log) log('  ambient ' + present[0].s); return; }
  const present2 = enc.sort((a, b) => st.trust[a.s] - st.trust[b.s]);
  if (present2.length) { E.attend(st, present2[0].s); if (log) log('  ambient* ' + present2[0].s); return; }
  if (st.scrutiny > 15) { E.tidy(st); return; }
  E.passHour(st);
}

function play(strat, log, ng, metaIn) {
  const meta = metaIn || { achievements: [], endings: [] };
  const st = E.newRun(ng ? { ng: true, memory: meta.styleMemory } : {});
  let guard = 0;
  while (!st.ended) {
    if (++guard > 2000) throw new Error('infinite loop');
    if (st.scene) { playScene(st, strat, log); }
    else if (st.ap > 0) { hubAction(st, strat, log); }
    tryConnect(st, log);
    invariants(st);
    E.checkAchievements(st, meta);
    const p = E.proceed(st);
    if (log && p.type === 'slot') log('— Day ' + st.day + ' ' + S.SLOT_NAMES[st.slot] + '  scrut ' + st.scrutiny + '  trust ' + E.SIBS.map(s => st.trust[s]).join('/') + '  mask ' + E.SIBS.map(s => st.mask[s]).join('/') + '  clues ' + st.clues.length + ' reals ' + st.reals.length);
  }
  E.checkAchievements(st, meta);
  E.updateStyleMemory(meta, st);
  return { st, meta };
}

const results = {};
function record(name, r) {
  results[name] = results[name] || {};
  results[name][r.st.ended] = (results[name][r.st.ended] || 0) + 1;
}

// 1) Optimal bot (verbose optionally)
const opt = play('optimal', VERBOSE ? console.log : null);
console.log('OPTIMAL →', opt.st.ended, '| trust', E.SIBS.map(s => s + ':' + opt.st.trust[s]).join(' '), '| avgMask', E.avgMask(opt.st).toFixed(0), '| clues', opt.st.clues.length, '| reals', opt.st.reals.length, '| scrut', opt.st.scrutiny, '| flags', Object.keys(opt.st.flags).join(','));

// 2) Focus bots (each sibling)
['victor', 'camille', 'julian', 'clara'].forEach(s => {
  const r = play('focus:' + s);
  console.log('FOCUS ' + s.padEnd(8), '→', r.st.ended, '| trust', E.SIBS.map(x => x[0] + ':' + r.st.trust[x]).join(' '), '| clues', r.st.clues.length, '| reals', r.st.reals.length, '| arcs', E.SIBS.filter(x => r.st.flags['arc_' + x]).join(','));
});

// 3) Reckless and search-spam bots
const rk = play('reckless'); console.log('RECKLESS →', rk.st.ended, '| day', rk.st.day);
const sp = play('search'); console.log('SEARCH-SPAM →', sp.st.ended, '| day', sp.st.day, '| scrut', sp.st.scrutiny);

// 4) Many random runs: invariants + ending distribution
const N = 4000;
const dist = {};
const ach = new Set();
for (let i = 0; i < N; i++) {
  const r = play('random');
  dist[r.st.ended] = (dist[r.st.ended] || 0) + 1;
  r.meta.achievements.forEach(a => ach.add(a));
}
console.log('RANDOM x' + N + ' endings:', dist);

// 5) Content integrity checks
const allClues = Object.keys(S.CLUES);
const obtainable = new Set();
S.ENCOUNTERS.forEach(e => e.notice && obtainable.add(e.notice));
Object.values(S.EVENTS).forEach(ev => ev.choices.forEach(c => c.fx && c.fx.clue && obtainable.add(c.fx.clue)));
S.OPPORTUNITIES.forEach(o => o.choices.forEach(c => c.fx && c.fx.clue && obtainable.add(c.fx.clue)));
Object.values(S.SEARCH).forEach(p => p.forEach(c => obtainable.add(c)));
const unobtainable = allClues.filter(c => !obtainable.has(c));
console.log('Clues unobtainable:', unobtainable.length ? unobtainable : 'none');
Object.values(S.REALIZATIONS).forEach(r => (r.pair || []).forEach(c => { if (!S.CLUES[c]) throw new Error('bad clue in realization ' + r.id); }));
S.ENCOUNTERS.forEach(e => {
  ['defer', 'direct', 'warm', 'quiet'].forEach(k => { if (!e.choices[k] || !e.choices[k].label || !e.choices[k].react) throw new Error('missing choice ' + e.id + ' ' + k); });
  if (e.gate) e.gate.need.forEach(t => { const [ty, id] = t.split(':'); if (ty === 'flag') return; if (ty === 'clue' ? !S.CLUES[id] : !S.REALIZATIONS[id]) throw new Error('bad gate ' + e.id + ' ' + t); });
});
Object.values(S.EVENTS).forEach(ev => ev.choices.forEach(c => (c.need || []).forEach(t => { if (typeof t === 'string' && t.includes(':')) { const [ty, id] = t.split(':'); if (ty === 'flag') return; if (ty === 'clue' ? !S.CLUES[id] : !S.REALIZATIONS[id]) throw new Error('bad event need ' + ev.id + ' ' + t); } })));
console.log('Content integrity: OK');
const seenEndings = new Set(Object.keys(dist).concat([opt.st.ended, rk.st.ended, sp.st.ended]));
['victor', 'camille', 'julian', 'clara'].forEach(s => seenEndings.add(play('focus:' + s).st.ended));
console.log('Endings reached by bots:', [...seenEndings].sort().join(', '));


// 6) Extra content integrity (v2.1)
S.OPPORTUNITIES.forEach(o => { if (!o.choices.length || !S.SIBLINGS[o.sib]) throw new Error('bad opp ' + o.id); });
[...Object.values(S.EVENTS), ...S.OPPORTUNITIES, ...S.PELL].forEach(d => d.choices.forEach(c => { if (!c.label && !c.hidden) throw new Error('no label in ' + d.id); if (!c.react) throw new Error('no react in ' + d.id); }));
S.ENDING_EXTRAS.forEach(x => x.ends.forEach(e => { if (!S.ENDINGS[e]) throw new Error('bad extra ending ' + e); }));
Object.keys(S.RITUALS).forEach(k => { const r = S.RITUALS[k]; if (r.type === 'ground' && r.items.filter(i => i.good).length !== 5) throw new Error('ritual ' + k + ' needs 5 good items'); });
console.log('Extra integrity: OK');

// 7) Moments budget: how many can the optimal bot catch, and what is skipped?
console.log('OPTIMAL moments taken:', opt.st.moments, '/', S.OPPORTUNITIES.length, '| missed:', opt.st.missed.join(',') || 'none', '| rituals:', opt.st.rituals.map(r => r.type + r.q).join(','));

// 8) New Game+ and the Mrs. Pell arc
const m1 = { achievements: [], endings: [] };
const r1 = play('optimal', null, false, m1);
console.log('NG+ memory after run 1:', JSON.stringify(m1.styleMemory), '| NG+ available:', E.ngAvailable(m1));
const ng = play('pell', VERBOSE ? console.log : null, true, m1);
console.log('NG+ PELL bot →', ng.st.ended, '| pellPts', ng.st.pellPts, '| pell seen', ng.st.pellSeen.join(','), '| arc_pell', !!ng.st.flags.arc_pell, '| extras', E.endingExtras(ng.st).length);
const ng2 = play('optimal', null, true, m1);
console.log('NG+ OPTIMAL →', ng2.st.ended, '| pellPts', ng2.st.pellPts, '| pell arc', !!ng2.st.flags.arc_pell);
const m0 = play('optimal', null, false, { achievements: [], endings: [] });
if (m0.st.pellSeen.length) throw new Error('Pell arc leaked into a first run');
if (!seenEndings.has('pell') && ng.st.ended !== 'pell') console.log('WARNING: pell ending not reached by the Pell bot');
console.log('Achievements (NG+ bot):', ng.meta.achievements.length);

seenEndings.add(ng.st.ended);
console.log('Missing endings (incl. New Game+):', Object.keys(S.ENDINGS).filter(e => !seenEndings.has(e)).join(', ') || 'none');
