/* Vane House: Four Colors in the Rain — story data (pure data, no DOM). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VaneStory = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DAYS = [
    'Sunday 25 November', 'Monday 26 November', 'Tuesday 27 November', 'Wednesday 28 November',
    'Thursday 29 November', 'Friday 30 November', 'Saturday 1 December'
  ];
  const SLOT_NAMES = ['Morning', 'Afternoon', 'Evening', 'Late Night'];
  const SLOT_CLOCK = ['7:30 a.m.', '3:00 p.m.', '7:00 p.m.', 'Past midnight'];
  const WEATHER = [
    'Rain ticks against the leaded glass.',
    'The sea-fog has crept up the cliff and pressed itself to the windows.',
    'Wind worries the pines; the rain comes sideways.',
    'The house is quiet except for the clock and the sea.'
  ];

  const STYLES = {
    defer:  { name: 'Deferential / Invisible', short: 'Deferential', icon: '🕯' },
    direct: { name: 'Direct / Practical',      short: 'Direct',      icon: '🗝' },
    warm:   { name: 'Warm / Playful',          short: 'Warm',        icon: '☕' },
    quiet:  { name: 'Quiet / Grounding',       short: 'Quiet',       icon: '🌧' }
  };

  const SIBLINGS = {
    victor: {
      id: 'victor', name: 'Victor', age: 26, color: 'Red', role: 'The Commander', css: 'red', img: './img/victor.jpg',
      home: 'study', pron: 'he',
      blurb: 'Waistcoat, pocket watch, immaculate posture. Cedarwood and fountain-pen ink.',
      pry: {
        label: 'Press him: ask outright what he is hiding in the study.',
        react: ['“Out.” One word, very quiet. The watch clicks shut like a door. Whatever you wanted, you have spent it.',
                'His face goes white at the edges and his voice goes cold. “You will not speak of my affairs again.”']
      },
      amb: [
        'Victor is at the window with his watch open, watching the second hand as though it owes him money.',
        'You find him straightening a stack of papers that was already straight.',
        'He is standing very still in the corridor, one hand flat against the wall, as if listening to the house.'
      ],
      gen: {
        defer: 'He accepts it with a curt nod. Order, restored.',
        direct: 'A plain answer to a plain question. His shoulders ease a fraction.',
        warm: 'He looks at you as though you have spoken in a foreign tongue, and steps back.',
        quiet: 'He does not thank you. He does breathe out, slowly, as you stand there.'
      },
      gloss: {
        title: 'Understanding Victor',
        text: 'In 1928 nobody had kind words for what Victor lives with. Today we would recognise something like panic disorder with stress-related insomnia: sudden surges of dread, a racing heart, nights without sleep. His rigid schedules are not arrogance; predictability is how he keeps the surges away. What helps is steadiness, honesty, and not being made to explain himself. (This is fiction, not a diagnosis.)'
      }
    },
    camille: {
      id: 'camille', name: 'Camille', age: 23, color: 'Yellow', role: 'The Sunbeam', css: 'yellow', img: './img/camille.jpg',
      home: 'parlor', pron: 'she',
      blurb: 'Silk drop-waist dresses, bobbed hair, a tortoiseshell cigarette holder. Laughter that fills a room.',
      pry: {
        label: 'Press her: ask what was in the letter she burned.',
        react: ['The smile does not falter. That is the frightening part. “How funny you are,” she says, and rings for Mrs. Pell to have you sent elsewhere.',
                'She laughs, brightly, three notes too high. It is the sound of a door being bolted from the inside.']
      },
      amb: [
        'Camille is arranging chairs for a party nobody has been invited to, humming under her breath.',
        'You find her laying out a hand of patience on the piano lid, cards snapping brightly, eyes somewhere else.',
        'Camille is reading aloud, in several voices, from a novel she is not actually looking at.'
      ],
      gen: {
        defer: 'She fills your silence with chatter, brighter and faster. The curtain thickens.',
        direct: 'She flinches, then covers it with a flourish. A little too much, a little too fast.',
        warm: 'She laughs, truly this time, and for a breath the light in her is real.',
        quiet: 'She stops talking. It is as if she has been handed permission to put something heavy down.'
      },
      gloss: {
        title: 'Understanding Camille',
        text: 'Camille’s brightness is real, and so is what it covers. Today we might call it persistent depressive disorder, sometimes called “smiling depression”, together with a deep fear of being left. People who live this way can be the life of any room and exhausted the moment it empties. What helps is not applause but permission to stop performing. (This is fiction, not a diagnosis.)'
      }
    },
    julian: {
      id: 'julian', name: 'Julian', age: 20, color: 'Green', role: 'The Peacekeeper', css: 'green', img: './img/julian.jpg',
      home: 'conservatory', pron: 'he',
      blurb: 'Soft wool cardigan, ink-smudged cuffs, a book always under one arm. Speaks softly, apologises often.',
      pry: {
        label: 'Press him: ask why he never says no to anyone.',
        react: ['“I’m sorry,” he says at once, and goes on saying it, and you realise you have made him apologise for existing.',
                'His eyes go flat and pleasant. “Of course. Whatever you think best.” He is no longer in the room with you.']
      },
      amb: [
        'Julian is wiping soil from a leaf with the corner of his handkerchief, very gently, as if it might object.',
        'You find him in the doorway of two rooms at once, holding a book he is not reading.',
        'He is sitting on an upturned flowerpot, mending something that was not broken yesterday.'
      ],
      gen: {
        defer: 'He says “Of course,” and you feel him become a little more invisible.',
        direct: 'He blinks. Nobody has asked him a straight question in some time.',
        warm: 'A small, startled smile. It stays a moment longer than the last one.',
        quiet: 'He lets his shoulders drop. It is, you think, the first time today.'
      },
      gloss: {
        title: 'Understanding Julian',
        text: 'Julian gave up his place at university to hold the household together, and he copes by leaving: when voices rise he goes blank, nodding politely while his mind steps out of the room. Today this might be described as dissociation under chronic stress, with the aches and burnout that follow. The person who never complains is the one no one checks on. What helps is being asked, gently, what he wants. (This is fiction, not a diagnosis.)'
      }
    },
    clara: {
      id: 'clara', name: 'Clara', age: 17, color: 'Blue', role: 'The Analyst', css: 'blue', img: './img/clara.jpg',
      home: 'library', pron: 'she',
      blurb: 'Starched pinafore, braids, round wire spectacles, a leather notebook that is never out of reach.',
      pry: {
        label: 'Press her: demand to read her notebook.',
        react: ['“No.” Not angry; absolute. She sets the notebook face-down, square to the table edge, and does not speak again until you leave.',
                'Her hands go to her ears. The whole room has become too loud and it is your doing.']
      },
      amb: [
        'Clara is measuring the gap between two chairs with a wooden ruler, writing the number down.',
        'You find her counting the stair-rods aloud, under her breath, as she goes up.',
        'Clara is lining up four teaspoons by the handle. They were already lined up.'
      ],
      gen: {
        defer: 'She accepts the apology as accurate and files it. Nothing else changes.',
        direct: 'A precise answer. She almost looks at you, which for Clara is an enormous thing.',
        warm: 'Too much, too close, too sudden. She retreats half a step behind her spectacles.',
        quiet: 'Quiet she understands. She lets it sit, and does not count for a whole minute.'
      },
      gloss: {
        title: 'Understanding Clara',
        text: 'Clara’s rules and counting are not coldness. Today we might recognise obsessive-compulsive patterns alongside autistic traits and sensory sensitivity: the world arrives too loud and too unpredictable, and routine is how she keeps it bearable. Her bluntness is honesty, not unkindness. What helps is exactness, advance notice, and being believed. (This is fiction, not a diagnosis.)'
      }
    }
  };

  const LOCATIONS = {
    dining:       { id: 'dining',       name: 'The Dining Room',      desc: 'Mahogany, silver, and four porcelain cups arranged to four tempers.' },
    study:        { id: 'study',        name: 'Victor’s Study',       desc: 'Cedarwood, ledgers, a chair that faces the door.', searchable: true },
    parlor:       { id: 'parlor',       name: 'The Parlour',          desc: 'Gramophone, piano, damask curtains, a grate that is never quite cold.', searchable: true },
    conservatory: { id: 'conservatory', name: 'The Conservatory',     desc: 'Glass and ferns, and a boiler that groans in the night.', searchable: true },
    library:      { id: 'library',      name: 'The Library',          desc: 'Tall shelves, a reading table, chalk marks on the boards.', searchable: true },
    hall:         { id: 'hall',         name: 'The Hall & Clock',     desc: 'The grandfather clock. The staircase. Everything echoes.' },
    service:      { id: 'service',      name: 'The Service Corridor', desc: 'Back stairs, stone flags, and Mrs. Pell’s kitchen warmth.' }
  };

  /* Clues: 16 total, four per colour. kind: 'behaviour' (seen in people) or 'document' (found in rooms). */
  const CLUES = {
    r_chair:   { id: 'r_chair',   color: 'Red',    kind: 'behaviour', title: 'The Chair That Faces the Door', detail: 'Victor always sits where he can see the door. His bed upstairs has not been slept in for days.' },
    r_tremor:  { id: 'r_tremor',  color: 'Red',    kind: 'behaviour', title: 'The Left Hand', detail: 'It trembles only when he thinks no one is watching. He tucks it under the desk and clicks his watch to cover it.' },
    r_vials:   { id: 'r_vials',   color: 'Red',    kind: 'document',  title: 'Empty Bromide Vials', detail: 'Hidden behind the silver hairbrushes in the study washstand. Three of them, all empty.' },
    r_pawn:    { id: 'r_pawn',    color: 'Red',    kind: 'document',  title: 'Pawnbroker’s Slip', detail: 'A Penzance pawnbroker’s slip for Lady Eleanor’s pearls, folded inside the ledger. The ledger entries beside it are in a different ink.' },
    y_trays:   { id: 'y_trays',   color: 'Yellow', kind: 'behaviour', title: 'Trays Behind the Curtain', detail: 'Cold toast and untouched soup, hidden behind the damask. Camille has eaten almost nothing all week.' },
    y_smile:   { id: 'y_smile',   color: 'Yellow', kind: 'behaviour', title: 'The Smile That Clicks Off', detail: 'The instant a door shuts behind a guest, Camille’s whole face goes slack. Then she notices you and it returns.' },
    y_envelope:{ id: 'y_envelope',color: 'Yellow', kind: 'document',  title: 'Scorched Envelope', detail: 'A half-burnt envelope in the parlour grate, return address “Marlowe Sanatorium”. Burnt before breakfast, by the look of it.' },
    y_letter:  { id: 'y_letter',  color: 'Yellow', kind: 'document',  title: 'The Intercepted Letter', detail: 'Dr. Pryce to the family, dated 2 October: Lady Eleanor will not be able to return home; Sir Alistair has left for Buenos Aires; the solicitors will “regularise the property”.' },
    g_yes:     { id: 'g_yes',     color: 'Green',  kind: 'behaviour', title: 'Two Yeses', detail: 'Julian answers “Of course” to Victor and to Camille in the same breath, though they asked for opposite things.' },
    g_hands:   { id: 'g_hands',   color: 'Green',  kind: 'behaviour', title: 'Burned Hands', detail: 'Calluses and a fresh burn on both palms. He fixes things at night so that nobody has to ask.' },
    g_receipt: { id: 'g_receipt', color: 'Green',  kind: 'document',  title: 'The Coal Receipt', detail: 'Paid from Julian’s personal allowance. Someone had been letting the conservatory boiler run on his own money.' },
    g_scholarship:{ id: 'g_scholarship', color: 'Green', kind: 'document', title: 'Edinburgh Scholarship Reply', detail: 'Julian’s letter declining his place, dated 14 September. A pencilled line in the margin of the university’s reply: “the Faculty will gladly reconsider should circumstances change.”' },
    b_thread:  { id: 'b_thread',  color: 'Blue',   kind: 'behaviour', title: 'Thread and Chalk', detail: 'White thread pinned along the floorboards by the grandfather clock; chalk marks, evenly spaced. A map of where the chimes are least loud.' },
    b_ears:    { id: 'b_ears',    color: 'Blue',   kind: 'behaviour', title: 'Hands to Ears', detail: 'When the clock strikes, Clara’s fingers rise to her ears for just a second, and her lips move. She is counting the chimes.' },
    b_notebook:{ id: 'b_notebook',color: 'Blue',   kind: 'document',  title: 'The Leather Notebook', detail: 'Not sums. Observations: “V. light under door 3:10. Do not knock.” “C. four plates in seven eaten.” “J. hands.” Tea at four prevents Victor’s headache.' },
    b_timeline:{ id: 'b_timeline',color: 'Blue',   kind: 'document',  title: 'The Timeline', detail: 'A page of dates in Clara’s hand: telegram, 13 Sept. Letter, 2 Oct. Father’s cheques stop. The date at the bottom, ringed twice, is Saturday, 1 December.' }
  };

  const REALIZATIONS = {
    two_secrets: {
      id: 'two_secrets', pair: ['r_pawn', 'y_envelope'], title: 'The Same Secret, Twice',
      text: 'Victor sells heirlooms and forges ledger entries so the money looks whole. Camille burns a letter so that no one learns their mother will not return. Each believes the other is the fragile one. The house is held up by two people protecting each other from the same collapse.',
      looksBack: 'Morning Tea, reread: Victor’s fierce punctuality and Camille’s extra brightness were never opposites. They were the same shoulder to the same door.'
    },
    agree_with_everyone: {
      id: 'agree_with_everyone', pair: ['g_yes', 'r_chair'], title: 'Nobody Hears the Yes',
      text: 'Victor’s rules push one way, Camille’s plans push another, and Julian says yes to both, again and again, until there is nothing of him left that is not agreement. Because he never objects, both of them believe he is fine.',
      looksBack: 'Every “Of course” you have heard from Julian was a small door closing on himself.'
    },
    order_is_mercy: {
      id: 'order_is_mercy', pair: ['r_tremor', 'b_thread'], title: 'Order Is Mercy',
      text: 'Victor’s strict timetable is not only control. It is a handrail. Clara steadies herself by it, and Victor steadies himself by watching her use it. The rules that suffocate Camille and crush Julian are the same rules that keep two others upright.',
      looksBack: 'The chalk marks and the clicked watch: two people, one handrail, neither knowing they share it.'
    },
    the_party_is_a_wound: {
      id: 'the_party_is_a_wound', pair: ['y_smile', 'b_ears'], title: 'The Party Is a Wound',
      text: 'Camille’s gatherings are meant to hold the household together. To Clara each one is an assault of noise and unpredictability. Camille is not careless; Clara is not cold. They are each trying to love the house in the only way they can, and it hurts the other.',
      looksBack: 'Clara’s cold stare at the gramophone was not disapproval. It was endurance.'
    },
    notebook_love_letter: {
      id: 'notebook_love_letter', pair: ['b_notebook', 'g_hands'], title: 'A Love Letter in Numbers',
      text: 'Clara’s notebook logs Julian’s night repairs, times and all. She has been watching over the one person nobody watches over. It is not surveillance. It is the way Clara loves: accurately, and without being asked.',
      looksBack: 'The “cold” girl who marks tea at four and counts the plates: every figure is a kindness waiting to be noticed.'
    },
    declined_scholarship: {
      id: 'declined_scholarship', pair: ['g_scholarship', 'b_timeline'], title: 'The Day After the Telegram',
      text: 'Julian declined Edinburgh on 14 September. Clara’s timeline puts the first telegram on the 13th. He read it. He has known since the first week that his parents were not coming back, and he gave up his future that very morning without telling anyone.',
      looksBack: 'The patient boy in the conservatory has been grieving in secret for ten weeks, mending boilers instead of speaking.'
    },
    conspiracy: {
      id: 'conspiracy', pair: ['y_letter', 'b_timeline'], needReals: 3, minDay: 4, title: 'Everyone Is Protecting Everyone',
      text: 'Camille’s letter and Clara’s timeline say the same thing in different hands. Each of the four holds one piece: Victor the money, Camille the letter, Julian the date, Clara the proof. Each believes the rest of the house is innocent. They are not siblings keeping secrets from each other. They are four people keeping the same secret, alone.',
      looksBack: 'Every scene you have witnessed was one of them guarding a door that the others were guarding too.'
    }
  };

  /* Search pools: each room hides two documents, found in order. */
  const SEARCH = {
    study: ['r_vials', 'r_pawn'],
    parlor: ['y_envelope', 'y_letter'],
    conservatory: ['g_receipt', 'g_scholarship'],
    library: ['b_notebook', 'b_timeline']
  };
  const SEARCH_TEXT = {
    r_vials: 'Rubbing the washstand mirror, you find three small brown vials tucked behind the silver hairbrushes. All empty.',
    r_pawn: 'Inside the ledger’s back cover, a pawnbroker’s slip. The entries beside it are in a fresher ink than the rest.',
    y_envelope: 'Beneath the grate’s ash lies a half-burnt envelope. You can still make out a printed word: MARLOWE.',
    y_letter: 'Inside the piano stool, under the sheet music, lies a letter that was never quite burned. You read the first lines and wish you had not.',
    g_receipt: 'Between two seed catalogues: a receipt for a ton of coal, paid in Julian’s hand from his own allowance.',
    g_scholarship: 'In a book of pressed ferns, a folded letter from the University of Edinburgh, and a draft of Julian’s reply, written three times and crossed out twice.',
    b_notebook: 'Her notebook is not hidden. It is simply never out of reach, except now. You read two pages and put it back exactly parallel to the table edge.',
    b_timeline: 'Inside the cover of a dictionary, a single sheet ruled in Clara’s hand. A timeline. You read it twice before the cold reaches your fingers.'
  };

  /* Mrs. Pell’s counsel, cycled with each visit to the Service Corridor. */
  const HINTS = [
    '“Mr. Victor likes a plain answer and a clear floor. Give him fuss and you’ll get frost.”',
    '“Miss Camille can’t abide a silence, girl. But sometimes silence is what she needs. Learn which is which.”',
    '“Mr. Julian will say yes to a stone wall if it asks him nicely. Don’t ask him nicely; ask him what he thinks.”',
    '“Miss Clara is the most honest soul in this house. Tell her the truth and tell her the time.”',
    '“The study’s empty at the half-hour. Rooms don’t gossip, but walls do. Mind who’s about before you go rummaging.”',
    '“They all think the others are the fragile ones. Isn’t that a thing?”',
    '“Late nights are when the masks come off. Nobody’s watching them but you. Be worth it.”',
    '“Whatever you find, girl, give it back the way you found it. Parallel to the edge, if it’s Miss Clara’s.”'
  ];

  /* Encounter style effects: [trust, mask, scrutiny] — the strategic matrix. */
  const FX = {
    victor:  { defer: [6, -2, -1],  direct: [10, -10, 2],  warm: [-4, -3, 3],  quiet: [7, -7, 0] },
    camille: { defer: [0, 3, -1],   direct: [-5, -9, 4],   warm: [11, -8, 3],  quiet: [8, -12, 0] },
    julian:  { defer: [1, 3, -2],   direct: [4, -5, 2],    warm: [7, -6, 2],   quiet: [11, -12, 0] },
    clara:   { defer: [3, 0, -1],   direct: [12, -10, 1],  warm: [-6, 4, 3],   quiet: [8, -9, 0] }
  };
  const TIER_MASK = { 1: 1.0, 2: 1.25, 3: 1.5, 4: 1.5, 0: 0.6 };

  /* ---------------- ENCOUNTERS ---------------- */
  const ENCOUNTERS = [
    /* ===== VICTOR (Red) ===== */
    {
      id: 'v1', sib: 'victor', tier: 1, slots: [0, 1, 2], title: 'The Study Door', notice: 'r_chair',
      paras: [
        'Victor does not look up when you enter. “The fire is to be laid at six,” he says, “not five past. The post goes on the left of the blotter. Nothing on the ledgers. Nothing.”',
        'His pocket watch opens and shuts, opens and shuts. The chair behind the desk has been turned so that it faces the door. His bed upstairs, you learned from the housemaid’s gossip, has not been slept in.'
      ],
      choices: {
        defer:  { label: 'Say “Very good, sir,” lay the fire at the stroke of six, and withdraw.', react: 'He nods once, as if the world has ticked back a notch. “Punctual. Good.” The watch clicks shut.' },
        direct: { label: '“Six sharp, sir. Shall I put the post on the left or the right of the blotter?”', react: 'A flicker of surprise, then approval. “Left. You will do.” It is the first sentence he has spoken that was not an order.' },
        warm:   { label: 'Smile, and remark that the weather has everyone in a mood but him.', react: '“I am not in a mood. I am in order.” The temperature in the room drops two degrees.' },
        quiet:  { label: 'Say nothing. Lay the fire slowly and let the room be still.', react: 'The ticking is all there is, for a while. His shoulders come down half an inch. He does not notice. You do.' }
      }
    },
    {
      id: 'v2', sib: 'victor', tier: 2, slots: [0, 1, 2], title: 'Ink and Tremor', notice: 'r_tremor',
      cond: { seen: ['v1'], minTrust: 16 },
      paras: [
        'Victor is signing the household accounts when the pen betrays him. The signature wavers, a small ugly crawl, and he blots it hard, as if the paper had insulted him.',
        'His left hand slides under the desk. A small brown bottle goes into the drawer in the same motion. He thinks you did not see. His eyes find yours in the glass of the bookcase and look away at once.'
      ],
      choices: {
        defer:  { label: 'Bring fresh blotting-paper and say nothing about it.', react: 'He takes it without meeting your eyes. “That will be all.” You can hear him breathing for a long time after the door closes.' },
        direct: { label: '“You’ve not slept, sir. Mrs. Pell has chamomile and I can have it here in five minutes.”', react: 'He opens his mouth to refuse. Then, very slowly: “…Five minutes.” It costs him something to say it.' },
        warm:   { label: 'Joke that you will fetch the biggest cup in the house for the longest night.', react: 'He does not laugh. He does look, for an instant, as though he might have wanted to.' },
        quiet:  { label: 'Set a glass of water at his elbow and stand a little back, unhurried.', react: 'The glass sits there untouched for a minute. Then his right hand reaches for it. The left stays hidden, but it has stopped shaking.' }
      },
      gate: {
        need: ['clue:r_vials'],
        label: 'Mention, gently, that you found something of his while turning out the washstand, and put it back exactly as it was.',
        react: 'Silence. The watch does not click. “…You put it back.” “Yes, sir.” “Why.” “It was yours.” He looks at his hands as if he has only now seen them.'
      }
    },
    {
      id: 'v3', sib: 'victor', tier: 3, slots: [3], title: 'Midnight Accounts',
      cond: { seen: ['v2'], minTrust: 32, maxMask: 68, ownClues: 2 }, grantsUnderstanding: true,
      paras: [
        'It is past one. A line of lamplight under Victor’s door. When you carry in the tray he does not say a word, which is how you know something is wrong.',
        'He is upright in the chair facing the door, hands pressed flat on the blotter, breathing in sharp, short pulls. The watch is open on the desk. He is counting the ticks. His lips move: eleven, twelve, thirteen. A man holding a roof up with his palms.'
      ],
      choices: {
        defer:  { label: 'Set the tray down quietly and leave him his privacy.', react: 'He is relieved to be alone, and he is alone. The door closes. Through it you hear the ticks, counted again from one.' },
        direct: { label: '“Sir, count with me. In for four, out for six. I will stay until your watch says one.”', react: 'He glares. Then he counts. In for four. Out for six. By the third round his hands have unclenched. “…Thank you.” He does not look at you.' },
        warm:   { label: 'Chatter lightly about anything at all to draw him out of it.', react: '“Stop.” The word is a slammed lid. “Please. Not now.” You have made the room louder.' },
        quiet:  { label: 'Sit on the low stool by the door, out of his line of sight, and breathe slowly enough to hear.', react: 'You breathe. The house breathes. After a long while his breaths begin to follow yours. Neither of you says a word, and neither of you needs to.' }
      },
      gate: {
        need: ['real:two_secrets'],
        label: '“I have seen the pawn slip, sir. I will not tell. But the books will be lighter carried by more than one pair of hands.”',
        react: 'Everything in him goes still. Then, hoarsely: “Who else knows?” “No one, sir.” He lets out a breath that sounds like years. “…Sit down.”'
      }
    },
    {
      id: 'v4', sib: 'victor', tier: 4, slots: [0, 1, 2, 3], title: 'The False Ledger',
      cond: { seen: ['v3'], minTrust: 62, maxMask: 40, minDay: 4, anyReal: ['two_secrets', 'order_is_mercy', 'conspiracy'] }, arc: 'victor',
      paras: [
        'Victor has the ledger open when you come in, and for the first time he does not close it. In his other hand he holds a match.',
        '“Father left me the books and a name to hide behind,” he says, quite calmly. “Every figure in here is a lie I told to make a number come out whole. I cannot do it again. I do not know how to stop.”'
      ],
      choices: {
        defer:  { label: '“It is not my place, sir.”', react: 'He nods, almost grateful to be refused. The ledger closes. The match goes back in its box. The moment is gone.' },
        direct: { label: '“Then stop, sir. Tell them. Four people can carry what one cannot.”', react: 'He is silent a long time. Then he sets the match down, unlit. “…Tomorrow. Not tonight. But tomorrow.” It is the most honest thing you have ever heard a Vane say.' },
        warm:   { label: 'Make a wry, kind remark that he looks like a shop that has been closed for a year.', react: '“Do I.” For a moment he almost smiles. Then the shutters come down again. The ledger stays open between you, unaddressed.' },
        quiet:  { label: 'Lay your hand on the desk beside the ledger and wait.', react: 'He looks at your hand for a long time. Then he puts his own beside it, the left one, trembling in the lamplight, and does not hide it.' }
      },
      gate: {
        need: ['real:order_is_mercy'],
        label: '“Miss Clara counts with you, sir. She has done it for months. You are not alone in this room.”',
        react: 'His face does something complicated. “She— Clara knows?” “She keeps the same hours you do, sir.” He puts his head in his hands, and for the first time he lets someone see it.'
      }
    },

    /* ===== CAMILLE (Yellow) ===== */
    {
      id: 'c1', sib: 'camille', tier: 1, slots: [0, 1, 2], title: 'A Little Music', notice: 'y_trays',
      paras: [
        'The gramophone is going before you reach the parlour door, something with trumpets, and Camille is in the middle of the room with her arms out as if the rain were an audience. “Someone has to keep the sun indoors!”',
        'Behind the damask curtain you glimpse a silver tray: cold toast, an untouched bowl of soup, a skin forming on the surface. She sees you see it, and laughs, and turns up the music.'
      ],
      choices: {
        defer:  { label: 'Curtsey, say you have dusting to finish, and back toward the door.', react: 'She waves you off with a flourish, but her chatter doubles in speed behind you. It sounds like someone running to stay in place.' },
        direct: { label: '“Miss, the tray behind the curtain is cold. Shall I take it away?”', react: '“Oh, you darling, I couldn’t eat a thing, I’ve had too much cake!” There has been no cake. The smile does not move.' },
        warm:   { label: 'Take her outstretched hands and attempt a clumsy waltz, laughing at your own feet.', react: 'She shrieks with laughter and, for a moment, the laughter is real. She steps on your toe on purpose.' },
        quiet:  { label: 'Turn the gramophone down a little and offer to sit by the window and hear whatever she likes.', react: 'Her arms drop. “Oh,” she says, to no one. “Yes. All right.” She sits. The performance, briefly, has nowhere to go.' }
      }
    },
    {
      id: 'c2', sib: 'camille', tier: 2, slots: [0, 1, 2], title: 'The Smile Between Doors', notice: 'y_smile',
      cond: { seen: ['c1'], minTrust: 16 },
      paras: [
        'The curate has called with a basket of quinces. For twelve minutes Camille is dazzling: she pours, she laughs, she says something about the weather that makes him blush to his collar.',
        'Then the front door clicks shut behind him and the light goes out of her face as if someone had thrown a switch. She stands in the middle of the Persian rug with her hands hanging. Then her eyes find you at the door, and the smile comes back on, a half-second late.'
      ],
      choices: {
        defer:  { label: 'Stay at the door with your eyes lowered, as though you saw nothing.', react: '“Oh, Nell! Be a dear and fetch the good tea.” The performance resumes at full volume. You have seen the gap; she knows you were there for it.' },
        direct: { label: '“That must be very tiring, miss.”', react: 'Her mouth opens and nothing bright comes out. “…I beg your pardon?” She laughs, a little shrilly. “How funny you are.” But her hand goes to her throat.' },
        warm:   { label: 'Hand her the tortoiseshell holder and say the performance was magnificent, and that the interval may be private.', react: 'She laughs, and this time she lets it shake. “Oh, God. Magnificent. Yes.” She sits on the arm of the sofa and for ten seconds is just tired.' },
        quiet:  { label: 'Close the door gently behind you and stand with her, saying nothing, for a minute.', react: 'She does not know what to do with a minute that no one is watching. She does nothing. It is the first time all week.' }
      },
      gate: {
        need: ['clue:y_envelope'],
        label: '“The grate was swept this morning, miss. Whatever was in it is ash now, and ash keeps a secret very well.”',
        react: 'She goes perfectly still. Then, softly: “You didn’t read it.” “There was nothing left to read, miss.” “…No. There wasn’t.” She laughs, wetly. “Thank you.”'
      }
    },
    {
      id: 'c3', sib: 'camille', tier: 3, slots: [3], title: 'When the Room Empties',
      cond: { seen: ['c2'], minTrust: 32, maxMask: 68, ownClues: 2 }, grantsUnderstanding: true,
      paras: [
        'The record has run out and the needle hisses in the groove. Camille is on the floor of the parlour in her evening dress, her back against the piano, stage powder streaked down one cheek.',
        '“Everyone leaves when the music stops,” she says, as if observing the weather. “Mother left. Father left. I only have to be loud enough, you see. Then no one has time to go.”'
      ],
      choices: {
        defer:  { label: 'Tidy around her in silence and leave her alone.', react: 'She watches you go with the face of someone who has just proved a theory. “Everyone does,” she murmurs.' },
        direct: { label: '“Miss, who are you performing for?”', react: 'Her face crumples, not into tears but into anger. “How dare you.” You have asked the right question at the wrong volume. She will not be speaking to you tomorrow.' },
        warm:   { label: 'Sit on the floor beside her, kick off your shoes, and hum the tune badly.', react: 'A hiccup of laughter. “That’s awful.” “I know.” “It’s not even the right song.” You both look at the ceiling. The needle hisses. Neither of you gets up.' },
        quiet:  { label: 'Lift the needle, set it down again at the start, very low, and sit near her. No performance required.', react: 'The music is so soft it is almost only the idea of music. She puts her head back against the piano and closes her eyes. “…Don’t go,” she says. “I’m not going anywhere, miss.”' }
      },
      gate: {
        need: ['clue:y_trays'],
        label: 'Quietly bring up a fresh tray, with the toast warm, and sit with her while she eats. Not watching.',
        react: 'She eats half a slice, then another. Neither of you speaks. “Nobody’s brought me anything,” she says finally, “since Mother.” Her voice does not break. It does something quieter.'
      }
    },
    {
      id: 'c4', sib: 'camille', tier: 4, slots: [0, 1, 2, 3], title: 'The Letter',
      cond: { seen: ['c3'], minTrust: 62, maxMask: 40, minDay: 4, anyReal: ['two_secrets', 'the_party_is_a_wound', 'conspiracy'] }, arc: 'camille',
      paras: [
        'Camille has taken off her bangles. You have never seen her without them. She sits on the sofa with her hands in her lap, perfectly still, and tells you in a plain voice you have never heard before:',
        '“There was a letter from Dr. Pryce. Mother is not coming home. Father has gone abroad and is not coming back. I burned it. I thought if I could be the sun, no one would have to look at the rest of the sky.”'
      ],
      choices: {
        defer:  { label: '“I will keep it to myself, miss.”', react: 'She nods, grateful, and the smile slides on like a mask over a hole. “Good girl.” You have kept her secret and left her alone inside it.' },
        direct: { label: '“You must tell your brothers and your sister, miss. Tonight.”', react: 'Her face closes. “You have no idea what you’re asking.” She is right. You have asked for the thing she fears most, before she was ready.' },
        warm:   { label: '“Then let me hold the lamp with you, Miss Camille. You have carried the whole sun alone.”', react: 'She laughs, one shaky note, and then she is crying, really crying, with her face in her hands and her shoulders going. You hold the lamp.' },
        quiet:  { label: 'Take her hand and let her cry without any audience at all.', react: 'It takes a long time. When it is over her face is blotched and bare, and she looks ten years younger. “Oh,” she says. “I didn’t know it would be that quiet.”' }
      },
      gate: {
        need: ['clue:y_letter'],
        label: 'Show her you know: take the letter from your pocket and give it back, to burn or to share as she chooses.',
        react: 'She stares at it, then at you. “You had it all this time.” “It is yours, miss.” A long breath. “…I would like to read it again, I think. Not alone.”'
      }
    },

    /* ===== JULIAN (Green) ===== */
    {
      id: 'j1', sib: 'julian', tier: 1, slots: [0, 1, 2], title: 'The Conservatory Draft', notice: 'g_yes',
      paras: [
        'The conservatory smells of wet earth and warm iron. Julian is repotting a fern with a tenderness that makes you stop in the doorway.',
        'Victor’s voice comes down the corridor: the palms are to be moved out of the passage, immediately. Camille’s answers, laughing: the palms must be in the parlour tonight, for atmosphere. Julian says, “Of course,” to the first. Then, “Of course,” to the second. He does not seem to notice that he has agreed to opposites.'
      ],
      choices: {
        defer:  { label: 'Carry the palms wherever whoever spoke last wants them, and ask nothing.', react: 'He thanks you. He thanks you twice. You have just taught him that someone will always do his saying-no for him, and that no one will ask what he meant.' },
        direct: { label: '“Mr. Julian, they asked for opposite things. Which would you like?”', react: 'He blinks. Then, as though translating from a foreign language: “…I hadn’t considered I might have a preference.”' },
        warm:   { label: 'Joke that he is the only man in England who can agree with two people at once.', react: 'A small, startled smile. “It is a gift,” he says, and means it ruefully. It stays a moment longer than the last one.' },
        quiet:  { label: 'Steady the pot for him and say you will move the palms later; he needn’t decide anything now.', react: 'The tension goes out of his shoulders in a way he plainly does not realise is visible. “Thank you,” he says softly. “It has been a long week.”' }
      }
    },
    {
      id: 'j2', sib: 'julian', tier: 2, slots: [0, 1, 2], title: 'Hands', notice: 'g_hands',
      cond: { seen: ['j1'], minTrust: 16 },
      paras: [
        'You find Julian mending the conservatory hinge by lamplight. He is so absorbed that the first time you say his name he does not hear you. The second time, he starts, as if surfacing from deep water.',
        'His palms are rough with calluses and there is a fresh burn across the left, shiny and red. “The boiler,” he says, pleasantly, before you have asked. “My own clumsiness.” It is the kind of clumsiness that happens at night, in the dark, when no one is awake to ask.'
      ],
      choices: {
        defer:  { label: 'Bring a cloth and leave it on the bench without a word.', react: 'You will find it folded and unused in the morning. He cannot accept help he did not ask for.' },
        direct: { label: '“Your hand is burned, sir. Let me see it.”', react: 'He hesitates, then holds it out like a boy at school. You wrap it. Neither of you mentions that no one has ever done this for him.' },
        warm:   { label: 'Tease that he’s put more mending into this house than the Vanes have put in since the war.', react: 'He laughs, softly, startled. “Don’t say that to Victor.” “I wouldn’t dream of it.” “Good.” The laugh lingers.' },
        quiet:  { label: 'Fetch a cold cloth, set it near his hand, and stay by the door while he decides.', react: 'He takes the cloth himself. His eyes are wet and he doesn’t seem to know why. “Thank you,” he says. “I’m fine.” He means it as a question.' }
      },
      gate: {
        need: ['clue:g_receipt'],
        label: '“The coal came on your account, sir. I saw the receipt. Nobody has thanked you.”',
        react: 'He looks at you for a long moment. “It was only coal,” he says. Then, quietly: “No. No one has.” He turns away so you will not see his face, and you let him.'
      }
    },
    {
      id: 'j3', sib: 'julian', tier: 3, slots: [1, 2], title: 'The Quarrel',
      cond: { seen: ['j2'], minTrust: 32, maxMask: 68, ownClues: 2 }, grantsUnderstanding: true,
      paras: [
        'Victor and Camille are quarrelling in the hall, three doors away and carrying through every one of them. Julian sits very straight in the library window-seat with a teacup in his hands.',
        '“Yes,” he says, to no one. “Of course. Yes.” His eyes are open and fixed on the glass. He is smiling, politely. He is not here. The tea is going cold in his hands and he has not noticed that it is shaking.'
      ],
      choices: {
        defer:  { label: 'Close the door against the noise and leave him to it.', react: 'The shouting is muffled. Julian is not. He is still “yes, yes,” to the wall when you look back, and you realise you shut him in with it.' },
        direct: { label: '“Julian. Look at me. Where are you?”', react: 'He flinches, and the polite smile returns with an effort. “Forgive me. I was only thinking.” The door of him swings shut again, not unkindly.' },
        warm:   { label: 'Press a fresh warm cup into his hands and talk about the tea, the cup, the steam.', react: 'The warmth reaches him before the words do. His fingers close around the cup. “…It’s too sweet,” he says, faintly, and you could cry with relief.' },
        quiet:  { label: 'Kneel beside him and name small things in the room, softly: the clock, the fern, the cold of the glass.', react: 'You name five things. By the third his eyes begin to track. By the fifth he is looking at you. “Oh,” he whispers. “I went away, didn’t I.” “Yes. You’re back.”' }
      },
      gate: {
        need: ['real:agree_with_everyone'],
        label: '“You don’t have to say yes, Julian. Not to them, and not to me either.”',
        react: 'The word “yes” stops in his mouth. He turns it over as though it were a foreign coin. “…I don’t know what I’d say instead.” “You have time.” His whole face loosens.'
      }
    },
    {
      id: 'j4', sib: 'julian', tier: 4, slots: [0, 1, 2, 3], title: 'The Green Door',
      cond: { seen: ['j3'], minTrust: 62, maxMask: 40, minDay: 4, anyReal: ['agree_with_everyone', 'declined_scholarship', 'conspiracy'] }, arc: 'julian',
      paras: [
        'Julian shows you the letter himself. It has been folded and unfolded so many times the creases have gone soft. The University of Edinburgh. His name. A place that was his.',
        '“I declined on the fourteenth,” he says, to the letter. “I told myself it was kindness. Someone had to hold it all together. I think I was only afraid that if I left, no one would notice I was gone.”'
      ],
      choices: {
        defer:  { label: '“It was a generous thing to do, sir.”', react: '“Was it?” He nods, as if you have confirmed it. And he folds the letter away, and the door he opened swings shut once more.' },
        direct: { label: '“Then say no to something, sir. Once. Today. And see what happens.”', react: 'He flinches, then laughs, shocked. “That’s terrifying.” “Yes, sir.” “…Let me think about it.” It is not yes. It is not yes, and that is progress.' },
        warm:   { label: '“I noticed,” you say. “The very first day. I noticed.”', react: 'His mouth trembles. “Did you?” “Yes.” He puts his hand over his eyes, and his shoulders shake, and he is smiling and crying at once.' },
        quiet:  { label: 'Sit with him and let the letter lie open between you in the grey light.', react: 'The rain goes on. Julian reads it again, slowly, as if for the first time. “They said they would gladly reconsider,” he murmurs. “It says so. In the margin.”' }
      },
      gate: {
        need: ['clue:g_scholarship'],
        label: '“The Faculty wrote that they would gladly reconsider, sir. In the margin. A place that is deferred is not a place that is lost.”',
        react: 'He stares at the line, the pencilled line, as if somebody else has written it. “I thought it was a courtesy.” “I think it was a door, sir.” He closes his eyes. “…It’s a very small door.” “It is a door.”'
      }
    },

    /* ===== CLARA (Blue) ===== */
    {
      id: 'k1', sib: 'clara', tier: 1, slots: [0, 1, 2], title: 'Exactly Two Minutes', notice: 'b_thread',
      paras: [
        'Clara is waiting with her notebook open when you bring the tea. “It is four minutes and two seconds past four. You were told four o’clock. Also: you have moved the vase.” She does not look at the vase. She knows it has moved by one inch.',
        'Along the floorboards by the window runs a fine white thread, pinned at exact intervals. Beside it, small chalk marks, every eight inches. She stands precisely on the line. You are, you realise, being measured.'
      ],
      choices: {
        defer:  { label: '“I do apologise, Miss Clara. It will not happen again.”', react: 'She notes the apology in her book as accurate and files it. Nothing in her face changes. This was, in its way, correct.' },
        direct: { label: '“You are right, miss: two minutes. I will time the kettle against the hall clock tomorrow.”', react: 'She looks at you for nearly a full second. “That is a satisfactory response.” From Clara it is nearly a bouquet.' },
        warm:   { label: 'Tease her gently about the ruler and the thread, and say she’d make a fine surveyor.', react: '“That is not a joke I understand.” She steps back from your smile as if it were warm air from an oven. The space between you widens by one chalk mark.' },
        quiet:  { label: 'Set the tray exactly where she wants it, straighten the vase, and step back without a word.', react: 'She inspects the tray. The vase. Your hands. And then, almost imperceptibly, her shoulders lower. “Thank you,” she says, to the vase.' }
      }
    },
    {
      id: 'k2', sib: 'clara', tier: 2, slots: [0, 1, 2], title: 'The Chime', notice: 'b_ears',
      cond: { seen: ['k1'], minTrust: 16 },
      paras: [
        'The hall clock begins to strike, slow, and enormous, and it is a quarter of a second before you see what it does to Clara. Her fingers come up to her ears and press, just briefly. Her lips move. She is counting.',
        'When the last stroke dies she lowers her hands as if nothing has happened. “Eleven,” she says, to nobody. “It is a quarter to. It should not be striking eleven.” Her hands have gone to the chalk marks on the floor and are tracing them, one by one.'
      ],
      choices: {
        defer:  { label: 'Pretend not to have noticed and go on with your dusting.', react: 'She stops tracing the marks. You have, by pretending, told her it is shameful. She does not look up for the rest of the hour.' },
        direct: { label: '“Does it hurt, miss, or is it that you can’t tell when it will chime?”', react: 'She considers this with real interest. “The second,” she says. “It is not the loudness. It is the not knowing.” It is the longest explanation she has ever offered.' },
        warm:   { label: 'Cover her ears gently with your hands and laugh, “There! All better.”', react: 'She goes rigid as a plank and steps back. “Do not touch me without warning.” Her voice is very level. You have done a very wrong thing and know it.' },
        quiet:  { label: 'Step between her and the hall door, fold a blanket over the clock’s glass, and stay quiet.', react: 'The muffled chimes are a different animal. She breathes out. “That,” she says, after a pause, “is better. Thank you.”' }
      },
      gate: {
        need: ['clue:b_thread'],
        label: '“The thread by the window, miss. It maps where the chimes are softest, doesn’t it? May I move your chair onto it?”',
        react: 'She stares at you, and her whole body stills. “…Yes,” she says slowly. “That is exactly what it is. Nobody has ever seen that.” You move the chair onto the line together.'
      }
    },
    {
      id: 'k3', sib: 'clara', tier: 3, slots: [0, 1], title: 'The Notebook',
      cond: { seen: ['k2'], minTrust: 32, maxMask: 68, ownClues: 2 }, grantsUnderstanding: true,
      paras: [
        'Clara holds the leather notebook out toward you, a thing she has never done, her arm perfectly straight. “You have not been unkind. Therefore, I have decided to be accurate. You may read one page.”',
        'It is not sums. “V. Light under door 3:10. Do not knock.” “C. Four plates in seven eaten.” “J. Hands.” “Tea at four prevents V.’s headache. Verified.” In the margins, again and again: a small neat arrow, and the word: SAFE?'
      ],
      choices: {
        defer:  { label: '“It is not my place to read it, miss.”', react: 'She takes the notebook back, square to the table edge. “Understood.” The door she opened for one second is closed and correctly filed.' },
        direct: { label: '“This isn’t coldness, miss. It’s observation to keep people safe. Thank you for showing me.”', react: 'She is silent so long you think she will not answer. “That,” she says, “is correct. No one has said so.” Her chin is trembling by one millimetre.' },
        warm:   { label: 'Say it is the sweetest thing you’ve ever read and press the notebook to your heart.', react: '“Please do not be sentimental.” She takes it back with two fingers. The window she opened has been closed for the rest of the day.' },
        quiet:  { label: 'Read it slowly, say nothing, and hand it back with both hands, square.', react: 'She accepts it with both hands. “You read all of it,” she says. “Yes, miss.” “You did not interrupt.” “No, miss.” A very small nod. “Good.”' }
      },
      gate: {
        need: ['clue:b_notebook'],
        label: '“Forgive me, miss. I looked at it once before, in the library. I put it back exactly parallel. I should have asked.”',
        react: 'Clara looks at you for a very long time. “It was parallel,” she says. “I knew someone had read it. I assumed it was Victor.” A pause. “You told me. That was correct.”'
      }
    },
    {
      id: 'k4', sib: 'clara', tier: 4, slots: [0, 1, 2, 3], title: 'What the Clock Knew',
      cond: { seen: ['k3'], minTrust: 62, maxMask: 40, minDay: 4, anyReal: ['order_is_mercy', 'notebook_love_letter', 'conspiracy'] }, arc: 'clara',
      paras: [
        'She has laid the timeline out on the library table, squared to the edge: a telegram, a letter, a stopped cheque, a date. “I have known for fifty-one days,” Clara says. “Mother is not on retreat. Father is not coming back. The house will be taken on Saturday.”',
        '“I have not told them. The data suggest it would increase the probability of harm.” Her hands are flat on the table, exactly parallel. They are not quite still. “I have been wrong about a great many things. I would like very much to be wrong about this.”'
      ],
      choices: {
        defer:  { label: '“It is not for me to say, miss.”', react: 'She nods. It is correct. It is also the loneliest correct thing you have ever said.' },
        direct: { label: '“You are not wrong, miss, and you do not have to carry the numbers alone. We will tell them together.”', react: 'Her breath catches, a single hitch. “…Together is a more efficient arrangement,” she says, very precisely, and begins to cry without changing her face at all.' },
        warm:   { label: 'Hug her and tell her it will all be all right.', react: '“That is not an accurate statement.” She stands rigid in your arms for three seconds and steps out. You have given her kindness in the wrong dialect.' },
        quiet:  { label: 'Sit across from her, hands flat on the table as hers are, and wait.', react: 'After a while her hands move. She does not realign them. “Thank you,” she says, after a very long time. “For not saying it would be fine.”' }
      },
      gate: {
        need: ['clue:b_timeline'],
        label: '“I found your timeline, miss. Forgive me. It matches a letter I found. Between the two, they prove it. You were right. You were never wrong.”',
        react: 'She goes very still. “You have corroborating evidence.” “Yes, miss.” Her eyes close. “…Thank you. I thought I had imagined it.” It is the closest to relief a Clara can come.'
      }
    }
  ];

  /* ---------------- EVENTS (fixed, scripted slots) ---------------- */
  const EVENTS = {
    tea: {
      id: 'tea', day: 1, slot: 0, title: 'Morning Tea — The Dining Room', noAP: true,
      paras: [
        'Rain taps a patient rhythm on the tall leaded glass of Vane House. On the mahogany table stand four porcelain cups, each arranged for a different temper before the siblings have even come down.',
        'Victor checks his pocket watch twice before he sits, jaw tight. Camille drifts in humming, bright as a struck bell, shadowed beneath neat curls. Clara aligns her spoon parallel to the plate edge. Julian pours for everyone before himself. Mrs. Pell’s only advice, as she hands you the pot: “Keep your eyes down and your ears open. Whose cup do you take first?”'
      ],
      choices: [
        {
          label: 'Take Victor’s cup first, eyes lowered, in silence.', tag: 'Deferential', fx: { trust: { victor: 8 }, mask: { victor: -3 }, clue: 'r_tremor' },
          react: 'He accepts it with a nod. As you pour, the cup rattles faintly in its saucer; his left hand has found the edge of the table and is gripping it as if it were a rail on a ship.'
        },
        {
          label: 'Answer Camille’s cheerful banter as you refill her cup.', tag: 'Warm / Playful', fx: { trust: { camille: 9 }, mask: { camille: -3 }, clue: 'y_smile' },
          react: 'She laughs at everything you say, a full second too long. When Julian leaves the room and the door clicks shut, her smile drops like a dropped plate, and rises again when she sees you watching.'
        },
        {
          label: 'Pour for Julian and stay a moment beside him, not hurrying.', tag: 'Quiet / Grounding', fx: { trust: { julian: 9 }, mask: { julian: -5 }, clue: 'g_hands' },
          react: 'He takes the teapot to help you, and you see his palms: calluses over a fresh burn, healing badly. “Don’t trouble about it,” he says, apologising for a wound.'
        },
        {
          label: 'Serve Clara’s cup exactly as she likes it, spoon parallel to the plate.', tag: 'Direct / Practical', fx: { trust: { clara: 10 }, mask: { clara: -4 }, clue: 'b_ears' },
          react: 'The hall clock strikes the half-hour. Clara’s fingers rise to her ears for one second, her lips move, then she lowers them as if nothing happened. “Seven thirty,” she says. “Correct.”'
        }
      ]
    },

    party: {
      id: 'party', day: 2, slot: 2, title: 'The Gramophone Evening — The Parlour', noAP: true,
      paras: [
        'Camille has pulled every lamp, rolled up the rug, and wound the gramophone to the last notch. “A little impromptu!” Her laugh pitches over the trumpets. “It is far too wet to be miserable alone.”',
        'In the middle of it, in order: Victor, one hand to his temple. Julian, refilling glasses and saying yes. And Clara, rigid at the wall, tracking the beat against the clock, with her fingers drifting up toward her ears and down again. What do you do?'
      ],
      choices: [
        {
          label: 'Lower the gramophone half a turn “to save the needle,” and open a window an inch.', tag: 'Quiet / Grounding',
          fx: { trust: { clara: 8, victor: 4 }, mask: { clara: -6, camille: 2 } },
          react: 'The music softens. Clara’s hands stop their climb. Victor’s hand leaves his temple. Camille doesn’t quite notice, but she dances a little smaller.'
        },
        {
          label: 'Join in. Be Camille’s dance-partner and laugh louder than the music.', tag: 'Warm / Playful',
          fx: { trust: { camille: 10, clara: -5, victor: -3 }, mask: { camille: -6 }, scrutiny: 3 },
          react: 'Camille is radiant. For ten minutes the room is full. By the end of the second record Clara has left by the back door and Victor’s watch has clicked twelve times.'
        },
        {
          label: 'Take Clara quietly to the library to “fetch sheet music,” and stay with her.', tag: 'Direct / Practical',
          fx: { trust: { clara: 12, camille: -3 }, mask: { clara: -8 } },
          react: 'The library walls are thick. Clara sits in the corner with her hands pressed to her knees and says, after a while, “Thank you for the excuse.” Down the corridor, the music goes on, a little frantic.'
        },
        {
          label: 'Carry a cool cloth and cold water to Victor in the study, and close the door.', tag: 'Deferential',
          fx: { trust: { victor: 9, camille: -3 }, mask: { victor: -6 }, scrutiny: 2 },
          react: 'He takes the cloth without a word and presses it to his eyes. “How long is she planning to continue?” “I couldn’t say, sir.” “…Stay a moment.” You stay. Behind the wall, the gramophone grows loud and lonely.'
        },
        {
          label: 'Press cotton wool into Clara’s hand and propose a “game of statues”: silence as the prize.', tag: 'Warm, informed',
          need: ['any', 'clue:b_ears', 'real:the_party_is_a_wound'],
          fx: { trust: { camille: 8, clara: 10, victor: 5 }, mask: { camille: -5, clara: -7 }, flag: 'quietParty' },
          react: 'Camille is delighted, game-mad as always. The statues freeze. For three whole minutes the parlour is wrapped in glorious, breathing silence, and nobody is dancing alone. Clara’s lips curl, just slightly.'
        }
      ]
    },

    post: {
      id: 'post', day: 3, slot: 1, title: 'The Afternoon Post — The Hall', noAP: true,
      paras: [
        'Mrs. Pell hands you the silver tray with the afternoon post. On top: a thick cream envelope embossed ALDERMERE & HARTWELL, SOLICITORS, and across the corner in red: FINAL NOTICE.',
        'You read the line beneath before you can stop yourself: …vacant possession of Vane House by midnight on Saturday the first of December. Four doors, four siblings. Camille hovers at the stair-foot with an unlit cigarette holder, watching the letter-slot. Victor’s study door is open one inch. Clara is by the clock with her notebook, timing the postman. Whoever gets this tray first learns the date.'
      ],
      choices: [
        {
          label: 'Take the tray directly to Victor’s study, as always.', tag: 'Deferential',
          fx: { trust: { victor: 6, camille: -2 }, mask: { victor: 3 }, flag: 'postVictor' },
          react: 'He takes the cream envelope without opening it and slides it, unread, into the drawer. “Thank you. That will be all.” His face is a closed shop. He knew; he had only been waiting for it to arrive.'
        },
        {
          label: 'Slow your step so that Camille “happens” to meet you and take the tray.', tag: 'Warm / Playful',
          fx: { trust: { camille: 7 }, mask: { camille: 4, victor: -2 }, flag: 'postCamille' },
          react: 'Camille picks the cream envelope off the tray with a quick, practised flick and slips it into her sleeve. “Oh, how clever you are.” The smile does not reach her eyes. She had done this before.'
        },
        {
          label: 'Take it to Clara and let her see the envelope, since she’ll deduce it anyway.', tag: 'Direct / Practical',
          fx: { trust: { clara: 8 }, mask: { clara: -6 }, flag: 'postClara' },
          react: 'Clara reads the return address, the weight, the ribbon. “It is the first of December,” she says, after a pause. “I had calculated the twenty-ninth. I was wrong by two days.” She seems almost insulted.'
        },
        {
          label: 'Slip the cream envelope under the tray’s lining, and deliver only the ordinary post.', tag: 'Overreach',
          fx: { trust: { victor: -6 }, scrutiny: 10, overreach: 1, flag: 'hidNotice' },
          react: 'You have made a decision for four people who did not ask you to. The envelope sits warm against your wrist all afternoon. Mrs. Pell, passing, says nothing, but her eyebrows say plenty.'
        }
      ],
      after: 'Whatever you chose, the words on that cream envelope stay the same. Vacant possession. Midnight, Saturday. Four people, six days.'
    },

    storm: {
      id: 'storm', day: 4, slot: 2, title: 'The Storm — The Parlour', noAP: true,
      paras: [
        'At half-past seven the lights go out in a long, falling hush. Thunder closes over the house. By the time you have found matches, all four are in the parlour, drawn by the only fire in the east wing.',
        'Victor snaps that candles are not to be wasted. Camille retorts that if they are to be poor they might at least be bright about it. Clara covers her ears at every crack of thunder, her lips moving. Julian’s smile has gone fixed and polite, and he is saying “Yes, of course,” to the wall. Candles and chairs are in your hands. How do you set the room?'
      ],
      choices: [
        {
          label: 'Light only two candles. Seat Victor facing the door, Clara by the thick wall, Julian by the hearth, Camille by the window.', tag: 'Informed', need: ['all', 'clue:r_chair', 'clue:b_thread'],
          fx: { trust: { victor: 6, camille: 4, julian: 6, clara: 6 }, mask: { victor: -6, camille: -4, julian: -6, clara: -6 }, flag: 'seatedWell' },
          react: 'Everyone has what they need and nobody noticed you gave it to them. The storm rages and the room is, astonishingly, calm. Victor’s hand rests on his knee, still.'
        },
        {
          label: 'Light every candle in the house and make a banquet of it: Camille’s way.', tag: 'Warm / Playful',
          fx: { trust: { camille: 8, victor: -3, clara: -3 }, mask: { camille: -4 }, scrutiny: 2 },
          react: 'The parlour blazes. Camille is delighted. Victor clicks his watch twelve times. Clara has gone very quiet and very straight.'
        },
        {
          label: 'Set the candles by rank, serve the tea, and withdraw. It is not your place.', tag: 'Deferential',
          fx: { trust: { julian: -4 }, mask: { julian: 5, victor: 2 }, scrutiny: -2 },
          react: 'You withdraw. From the corridor you hear the quarrel begin and grow. When you look in later, Julian is sitting exactly where you left him, still smiling, still saying yes, a hundred miles away.'
        },
        {
          label: 'Stand beside Julian and murmur the small things in the room as the quarrel flares.', tag: 'Quiet / Grounding', need: ['any', 'clue:g_yes', 'clue:g_hands', 'real:agree_with_everyone'],
          fx: { trust: { julian: 12 }, mask: { julian: -10 }, flag: 'julianHeld' },
          react: 'The candle, the rain, the cold glass, your hand beside his. The shouting goes on over his head, and he comes back to himself inside it. When the quarrel fizzles he says, softly, “Thank you for staying.”'
        }
      ]
    },

    clock: {
      id: 'clock', day: 5, slot: 3, title: 'Midnight — The Hall', noAP: true,
      paras: [
        'The clock begins to strike twelve. In the hall: Clara, in her nightgown, with chalk, on her hands and knees at the thread, counting aloud, losing the count, starting again. Her shoulders are shaking.',
        'One by one the others appear. Victor from the study, shirt-sleeved and grey-faced. Camille from the stairs, her powder gone. Julian from the conservatory, soot on his sleeves. Four people, awake, unmasked, in the same corridor at the same moment, each assuming the others are asleep. Nobody speaks.'
      ],
      choices: [
        {
          label: 'Steady the pendulum with a hand and say, “It is only midnight, Miss Clara. The clock can wait.”', tag: 'Direct / Practical',
          fx: { trust: { clara: 12, victor: 4 }, mask: { clara: -10 }, scrutiny: 10 },
          react: 'The chimes die mid-stroke. Silence, enormous. Clara sits back on her heels and breathes. Victor stares at you, then at the stopped pendulum, and says nothing. You have broken a rule of the house. Nobody objects.'
        },
        {
          label: 'Gently lead Clara to the library; leave the others to find their own words.', tag: 'Quiet / Grounding',
          fx: { trust: { clara: 8 }, mask: { clara: -5 }, flag: 'noConfront' },
          react: 'In the library she says nothing, and neither do you. Behind you, in the hall, three people stand in the dark with each other and still say nothing. The chance passes like a held breath.'
        },
        {
          label: 'Clap softly, brightly: “None of us is sleeping. The kitchen is warm and I have cocoa.”', tag: 'Warm / Playful',
          fx: { trust: { victor: 4, camille: 5, julian: 4, clara: 1 }, mask: { victor: -5, camille: -5, julian: -5, clara: -3 }, flag: 'kitchenNight' },
          react: 'Four chairs round Mrs. Pell’s scrubbed table, four mugs, and a nightlight. Nobody talks about anything. Nobody leaves. For half an hour they are four people drinking cocoa, which is more than they have been all season.'
        },
        {
          label: '“Count with her, sir. You know how.” Say it quietly, to Victor.', tag: 'Informed', need: ['real:order_is_mercy'],
          fx: { trust: { victor: 8, clara: 10 }, mask: { victor: -10, clara: -10 }, flag: 'counting' },
          react: 'Victor’s jaw works. Then, in his clipped voice, he goes down on one knee on the cold boards and begins to count with her: thirteen, fourteen, fifteen. Clara’s breathing evens. Camille and Julian watch, astonished, and nobody says a word.'
        }
      ]
    },

    table: {
      id: 'table', day: 6, slot: 2, title: 'Supper — The Family Table', noAP: true,
      paras: [
        'Tonight Mrs. Pell has made a proper supper, as though it were a feast day. There are twelve candles in the dining room and four places laid. The date on the calendar is the thirtieth of November, and every person at this table knows what tomorrow is, and believes the other three do not.',
        'It is a great deal of weight for a silver tray to carry. What do you do?'
      ],
      choices: [
        {
          label: 'Lay the table as always, serve in silence, and withdraw.', tag: 'Deferential',
          fx: { mask: { victor: 4, camille: 4, julian: 4, clara: 4 }, flag: 'tableSilent' },
          react: 'The supper is eaten in perfect politeness. Nobody says what tomorrow is. By the pudding each has re-fastened their mask, and the night ends with four closed doors.'
        },
        {
          label: 'Seat them as you have learned: Victor facing the door, Clara away from the clock, Julian between Camille and Victor, the lamp low.', tag: 'Informed', need: ['reals', 3],
          fx: { trust: { victor: 6, camille: 6, julian: 6, clara: 6 }, mask: { victor: -10, camille: -10, julian: -10, clara: -10 }, flag: 'tableHeld' },
          react: 'Nobody thanks you. Nobody needs to. For the first time in weeks the meal is eaten slowly, and somebody asks Julian how he is, and he is allowed to answer.'
        },
        {
          label: 'Set the burnt envelope and Clara’s timeline gently at the centre of the cloth and say only: “I think each of you has one piece of the same page.”', tag: 'Informed', need: ['real:conspiracy'],
          check: { allTrustMin: 45 },
          fx: { trust: { victor: 10, camille: 10, julian: 10, clara: 10 }, mask: { victor: -25, camille: -25, julian: -25, clara: -25 }, flag: 'openTable' },
          failFx: { trust: { victor: -8, camille: -8, julian: -8, clara: -8 }, mask: { victor: -20, camille: -20, julian: -20, clara: -20 }, overreach: 2, flag: 'tableBacklash' },
          react: 'There is a very long silence. Then Clara says, evenly, “I have known for fifty-one days.” Victor’s head comes up. Camille’s hand goes to her mouth. Julian says, “Since the thirteenth of September,” and nobody asks him how. One by one, four people lay down their piece of the page.',
          failReact: 'You have not earned this yet. They look at what you have put on the cloth, and then at you, and the room breaks. Voices, thunder, Julian’s blank smile, Clara’s hands at her ears. The truth arrives, and nobody is ready to hold it.'
        },
        {
          label: 'Take the letter you found from your apron and read it aloud, so that there are no more secrets in this house.', tag: 'Direct / Practical', need: ['clue:y_letter'],
          fx: { trust: { victor: -15, camille: -20, julian: -12, clara: -8 }, mask: { victor: -40, camille: -40, julian: -30, clara: -25 }, overreach: 3, scrutiny: 15, flag: 'letterRead' },
          react: 'You read every word. Camille gets as far as “How could you?” and then there are no words left in any of them. The secret is out, and everything it was protecting is in pieces on the cloth.'
        }
      ]
    },

    last: {
      id: 'last', day: 7, slot: 3, title: 'The Last Night — Vane House', noAP: true,
      paras: [
        'The bailiff’s cart comes at dawn. In the hall stand four trunks and the grandfather clock, which no one has been able to move. The rain is thinning. The house is as quiet as a held breath.',
        'There is nothing more you can fix tonight. There is only the question of where you spend the last of the dark.'
      ],
      choices: [
        { label: 'Go to Victor’s study. Sit with him until the sky greys.', tag: 'Victor', fx: { trust: { victor: 6 }, flag: 'final_victor' }, react: 'The watch lies closed on the desk. He does not touch it.' },
        { label: 'Go to the parlour. Keep Camille company.', tag: 'Camille', fx: { trust: { camille: 6 }, flag: 'final_camille' }, react: 'She puts on a record, low. She does not sing. She leans a little against your shoulder.' },
        { label: 'Go to the conservatory. Stay with Julian among the ferns.', tag: 'Julian', fx: { trust: { julian: 6 }, flag: 'final_julian' }, react: 'He is wrapping the smallest plants in newspaper. He hands you one, and you help.' },
        { label: 'Go to the library. Sit with Clara and the notebook.', tag: 'Clara', fx: { trust: { clara: 6 }, flag: 'final_clara' }, react: 'She has written a final line. She does not show you. She leaves the notebook open on the table, square to the edge.' },
        { label: 'Pack your trunk and wait in the hall, in case anyone needs you.', tag: 'The Hall', fx: { flag: 'final_hall' }, react: 'The clock strikes. You do not count. Someone, upstairs, laughs, quietly, at nothing.' }
      ]
    }
  };

  /* ---------------- ENDINGS ---------------- */
  const ENDINGS = {
    dismissed: {
      id: 'dismissed', title: 'A Character, Withheld', kind: 'Early Dismissal',
      paras: [
        'Mrs. Pell finds you at the foot of the back stairs with your trunk already packed. She does not shout. “It’s the questions, girl. The rooms, the drawers, the looks. A house like this keeps its quiet like a purse.”',
        'You leave on the six o’clock omnibus with no reference, and the rain follows you to Penzance. Behind you, four people go on being exactly who they were, and no one ever learns that someone had noticed.'
      ]
    },
    neutral: {
      id: 'neutral', title: 'The Painted Season', kind: 'Illusion',
      paras: [
        'The cart comes at dawn and is polite about it. Victor signs. Camille is dazzling to the very end, and the bailiff’s man blushes. Julian carries the trunks. Clara times the removal against her watch. Nobody speaks of anything at all.',
        'You see them off from the gatehouse. Each has packed a mask and a secret, and each believes the other three are fine. Something might have been said this week. It was not. The rain, at last, is stopping.'
      ]
    },
    tragic: {
      id: 'tragic', title: 'What Was Said Aloud', kind: 'Tragic Overreach',
      paras: [
        'You thought the truth would set them free. It was not yours to speak, and not in that order. By Friday night the siblings are at war with each other in three rooms of the house, and none of them is speaking to you.',
        'When the cart comes at dawn they leave in four directions. Mrs. Pell, handing you your wages, says only: “You meant well, girl. That’s a thing you’ll have to live with.” It is the hardest kind of ending: one where you were right about everything, and wrong about when.'
      ]
    },
    victor: {
      id: 'victor', title: 'The Commander Rests', kind: 'Victor’s Arc',
      paras: [
        'At six, Victor tells his sisters and his brother everything: the pawned pearls, the forged ledger, the bromide, the nights. Nobody gasps. Julian says, “I know about the pearls.” Camille says, “So do I.” Clara says, “Eleven.”',
        'He does not pretend to be commanding when the cart arrives. He sits on a trunk with his watch closed in his hand, and for the first time in a year, he sleeps in the carriage.'
      ]
    },
    camille: {
      id: 'camille', title: 'The Sunbeam Sets Gently', kind: 'Camille’s Arc',
      paras: [
        'Camille reads the letter aloud on the front steps, quietly, in her own voice and nobody else’s. Her brothers and sister listen. When she finishes she does not laugh. She does not apologise. She takes Clara’s hand.',
        'The house is lost. But there is a gramophone in her trunk, and for the first time in months she plays it only when she wants to hear it.'
      ]
    },
    julian: {
      id: 'julian', title: 'The Green Door', kind: 'Julian’s Arc',
      paras: [
        'On the last morning Julian says no. It is a small no, to a small thing: whether to carry the heaviest trunk. The world does not end. Victor says, “Quite right.” Camille says, “Hurrah.” Clara notes the time.',
        'Two weeks later a letter goes to Edinburgh in his own hand, asking whether the Faculty would gladly reconsider. It is a very small door. He knocks on it.'
      ]
    },
    clara: {
      id: 'clara', title: 'The Blue Notebook', kind: 'Clara’s Arc',
      paras: [
        'Clara reads her timeline aloud, in order, with dates, with no embellishment. It is the cleanest account of a family’s ruin that anyone has ever delivered, and when she finishes, the others take their turns correcting nothing.',
        'She writes one last line in the notebook. Years from now someone will read it and find, in the same hand as all the numbers: SAFE. And beneath it, a small neat arrow pointing at the people.'
      ]
    },
    true: {
      id: 'true', title: 'Four Colors, One Table', kind: 'True Ending',
      paras: [
        'At six the cart comes up the drive and finds four people on the front step with their trunks, not scattered, but together. Victor has already told the bailiff’s man precisely what he may and may not touch. Camille hands him a quince. Julian says no to a signed receipt he does not agree with. Clara corrects the inventory, twice.',
        'Nobody is performing. Nobody is guarding a door. The house is lost and the family is not. In the weeks that follow there will be Marlowe to visit, and an aunt in Bath, and a very small door in Edinburgh, and a notebook that is, slowly, more full of questions than of answers.',
        'You carry the last trunk down the steps. The rain has stopped. For the first time since you arrived, you can hear the sea.'
      ]
    }
  };

  const ACHIEVEMENTS = {
    first_clue:   { title: 'Behind the Curtain', desc: 'Record your first clue in the Maid’s Ledger.' },
    first_real:   { title: 'Connect the Threads', desc: 'Form your first Realization.' },
    all_reals:    { title: 'The Whole Page', desc: 'Form all seven Realizations in a single run.' },
    sixteen:      { title: 'Nothing Unseen', desc: 'Record all sixteen clues in a single run.' },
    red_thread:   { title: 'The Red Thread', desc: 'Collect all four Red clues.' },
    yellow_thread:{ title: 'The Yellow Thread', desc: 'Collect all four Yellow clues.' },
    green_thread: { title: 'The Green Thread', desc: 'Collect all four Green clues.' },
    blue_thread:  { title: 'The Blue Thread', desc: 'Collect all four Blue clues.' },
    read_between: { title: 'Read Between the Lines', desc: 'Use a clue or Realization to unlock a special response.' },
    quiet_feet:   { title: 'Quiet Feet', desc: 'Reach Day 4 with Household Scrutiny at 15 or lower.' },
    tidy_hands:   { title: 'Tidy Hands', desc: 'Take tea with Mrs. Pell four times in one run.' },
    mask_slips:   { title: 'The Mask Slips', desc: 'Lower any sibling’s Mask to 20 or below while keeping their Trust at 40 or above.' },
    four_hearts:  { title: 'Four Hearts', desc: 'Raise every sibling’s Trust to 60 or higher.' },
    night_watch:  { title: 'Night Watch', desc: 'Complete three Late Night encounters in one run.' },
    understood_all:{ title: 'Understanding', desc: 'Unlock all four “Understanding” entries.' },
    end_neutral:  { title: 'The Painted Season', desc: 'Reach the Illusion ending.' },
    end_dismissed:{ title: 'A Character, Withheld', desc: 'Be dismissed from Vane House.' },
    end_tragic:   { title: 'What Was Said Aloud', desc: 'Reach the Tragic Overreach ending.' },
    end_victor:   { title: 'The Commander Rests', desc: 'Reach Victor’s ending.' },
    end_camille:  { title: 'The Sunbeam Sets Gently', desc: 'Reach Camille’s ending.' },
    end_julian:   { title: 'The Green Door', desc: 'Reach Julian’s ending.' },
    end_clara:    { title: 'The Blue Notebook', desc: 'Reach Clara’s ending.' },
    end_true:     { title: 'Four Colors, One Table', desc: 'Reach the True Ending.' },
    all_endings:  { title: 'Every Door in Vane House', desc: 'Reach all eight endings.' }
  };

  const TRANSITIONS = [
    'Mrs. Pell’s kettle hums below. The hours slide, grey on grey.',
    'The light changes in the long windows. Somewhere a door closes softly.',
    'The lamps are lit. The rain is the only thing that has not stopped.',
    'Past midnight. The house breathes in its sleep, and you do not.'
  ];

  return { DAYS, SLOT_NAMES, SLOT_CLOCK, WEATHER, STYLES, SIBLINGS, LOCATIONS, CLUES, REALIZATIONS, SEARCH, SEARCH_TEXT, HINTS, FX, TIER_MASK, ENCOUNTERS, EVENTS, ENDINGS, ACHIEVEMENTS, TRANSITIONS };
});
