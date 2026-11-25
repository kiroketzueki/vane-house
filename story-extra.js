/* Vane House — expansion content: new dramatic events, timed "moments", Lady Eleanor's Record,
   the twist, touch-interaction (ritual) hooks, and the hidden Mrs. Pell arc.
   Extends the object exported by story.js in place. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./story.js'));
  else root.VaneStory = factory(root.VaneStory);
})(typeof self !== 'undefined' ? self : this, function (S) {
  'use strict';
  if (S.__extended) return S;
  S.__extended = true;

  /* ---------- Rituals: gentle touch interactions. Quality 0-2; never punishing. ---------- */
  const RITUAL = {
    breath: { type: 'breath', sib: 'victor', cycles: 3, title: 'Count with him', intro: 'In for four, out for six. Hold the button as you breathe in; let go to breathe out. There is no wrong way to be steady.' },
    chimeKlara: { type: 'chime', sib: 'clara', count: 11, title: 'Count with Clara', intro: 'Count the strokes with her. Tap once each time the clock strikes.' },
    chimeMidnight: { type: 'chime', sib: 'clara', count: 12, title: 'Count with her', intro: 'Twelve strokes. Count them with her, one tap for each.' },
    groundLibrary: {
      type: 'ground', sib: 'julian', title: 'Name what is here', intro: 'Say it quietly, one thing at a time. Tap five things that are here and real.',
      items: [
        { t: 'The clock, ticking by the window', good: 1 }, { t: 'The green of the fern', good: 1 }, { t: 'The cold of the glass', good: 1 },
        { t: 'The warm cup in his hands', good: 1 }, { t: 'Your own steady voice', good: 1 },
        { t: 'Tell him to snap out of it' }, { t: 'Shake his shoulder' }, { t: 'Talk louder than the shouting' }
      ]
    },
    groundCliff: {
      type: 'ground', sib: 'julian', title: 'Name what is here', intro: 'Stand beside him, out of the wind. Tap five things that are here and real.',
      items: [
        { t: 'The cold iron of the gate latch', good: 1 }, { t: 'Rain on your hands', good: 1 }, { t: 'The surf, far below', good: 1 },
        { t: 'The lamp in the window of the house', good: 1 }, { t: 'The weight of the shawl on his shoulders', good: 1 },
        { t: 'Tell him he is being foolish' }, { t: 'Pull him by the arm' }, { t: 'Ask him why he left' }
      ]
    }
  };
  S.RITUALS = RITUAL;

  // Hooks onto existing scenes
  const enc = (id) => S.ENCOUNTERS.find((e) => e.id === id);
  enc('v3').ritual = Object.assign({ keys: ['direct', 'quiet', 'gate'] }, RITUAL.breath);
  enc('k2').ritual = Object.assign({ keys: ['direct', 'quiet', 'gate'] }, RITUAL.chimeKlara);
  enc('j3').ritual = Object.assign({ keys: ['quiet', 'warm', 'gate'] }, RITUAL.groundLibrary);
  S.EVENTS.clock.choices[3].ritual = RITUAL.chimeMidnight;
  // Phone-call consequences in existing scenes
  S.EVENTS.clock.paraIf = [{ flag: 'phone_clara', text: 'Clara has not slept properly since the night she took the doctor’s call. She is counting more softly tonight, as if she has been given permission to be afraid.' }];
  S.EVENTS.clock.choices.push({
    label: 'Say, “Miss Clara, the doctor’s three questions: you wrote the answers down. Read them to me.” Give her a task that is also a comfort.', tag: 'Informed', need: ['flag:phone_clara'],
    fx: { trust: { clara: 12 }, mask: { clara: -10 }, flag: 'clockSteady' },
    react: 'She stops. She reads her own handwriting aloud, in order, and the numbers in her voice slow until they are only words. The last stroke dies unheard. “Thank you,” she says. “That was a good question.”'
  });

  /* ---------- New scripted events ---------- */
  S.EVENTS.phone = {
    id: 'phone', day: 2, slot: 3, title: 'Three in the Morning — The Hall', noAP: true,
    paras: [
      'The telephone in the hall rings once, a thin electric scream in the sleeping house. Twice. You reach it before the third, with your heart in your mouth and your hair in a plait.',
      '“Marlowe Sanatorium, Cornwall exchange,” says a tired man’s voice. “Dr. Pryce. I am sorry for the hour. Lady Eleanor has had a restless night and asked for her children by name. I should speak to one of the family before Saturday, and I should much prefer it were not a servant.”',
      'The line crackles. Upstairs, four doors. Who do you wake?'
    ],
    choices: [
      {
        label: 'Wake Victor. He is the eldest, and the house is his responsibility.', tag: 'Victor', fx: { trust: { victor: 8 }, mask: { victor: -6 }, flag: 'phone_victor' },
        react: 'He takes the receiver in his study voice, clipped and formal. “Yes. I see. Yes.” He hangs up and sits very still with the cord wrapped round two fingers. “I will manage this,” he says, and does not tell you what “this” is.'
      },
      {
        label: 'Wake Camille. A mother’s voice should hear a daughter’s.', tag: 'Camille', fx: { trust: { camille: 8 }, mask: { camille: -8 }, flag: 'phone_camille' },
        react: 'She comes down in a silk wrapper, no powder, no smile. “I know, Doctor,” she says, before he has finished. “I have known since October.” She puts the receiver down and holds the edge of the table, trembling, relieved.'
      },
      {
        label: 'Wake Julian. He is the one who listens.', tag: 'Julian', fx: { trust: { julian: 8 }, mask: { julian: -6 }, flag: 'phone_julian' },
        react: 'He is already on the stair, dressed, a boiler-rag in one hand. He listens a long time. “Yes, Doctor. Thank you for telling us the truth.” When he hangs up you realise he was not surprised, and that he has been awake all night waiting for this.'
      },
      {
        label: 'Wake Clara. She will want the facts exactly.', tag: 'Clara', fx: { trust: { clara: 10 }, mask: { clara: -8 }, flag: 'phone_clara' },
        react: 'Clara arrives fully dressed with her notebook, and writes the time: 3:07. She asks the doctor three questions in a level voice and writes down the answers. When she hangs up she says, “Thank you for waking me. Nobody ever does.”'
      },
      {
        label: 'Take a message. Wake no one. It is not your place to carry this into their sleep.', tag: 'Deferential', fx: { scrutiny: 2, flag: 'phone_none' },
        react: 'You write it all down in your best hand and fold it small. The message sits in your apron like a stone. In the morning you will have to decide whether to give it to anyone, and the longer you wait the heavier it grows.'
      }
    ]
  };

  S.EVENTS.pawn = {
    id: 'pawn', day: 4, slot: 0, free: true, noAP: true, timer: 9, timeoutChoice: 3, title: 'The Back Door',
    paras: [
      'Someone is knocking at the kitchen door. Not Mrs. Pell’s kind of knock, not the coalman’s. A neat, patient, businesslike rap. Through the frosted glass you see a bowler hat and a small leather case.',
      'You know before you see his face what he is. And you can hear, from the corridor, Camille’s quick slippers coming down to see who it is, and Julian’s slower tread from the conservatory. You have seconds.'
    ],
    choices: [
      {
        label: 'Get to the door first. Step out and pull it shut behind you.', tag: 'Direct / Practical', fx: { trust: { victor: 5 }, scrutiny: 4, clue: 'r_pawn', flag: 'pawnIntercepted' },
        react: '“Mr. Linwood, of Linwood & Son, Penzance,” he says, tipping the bowler. “Lady Eleanor’s pearls. Redeemable by Friday, else sold, on the heir’s signature. He knows.” He gives you the ticket. You give him the doorstep and a very straight back. The door clicks shut on the whole conversation.'
      },
      {
        label: 'Open the door a hand’s breadth, take his card, and promise Mr. Victor will call at the shop.', tag: 'Deferential', fx: { trust: { victor: 2 }, scrutiny: 2, flag: 'pawnCard' },
        react: 'He raises an eyebrow, hands over a card, and goes. Behind you, Camille is leaning in the passage doorway with her head tilted. “Who was that?” “The man about the coal, miss.” She does not believe you, and she lets you off.'
      },
      {
        label: 'Call down the corridor for Victor, loudly, so he arrives before anyone else.', tag: 'Warm / Playful', fx: { trust: { victor: -3 }, mask: { victor: -9 }, flag: 'pawnVictorFaced' },
        react: 'Victor arrives in four strides, and to his credit he does not break step. Linwood says the word “pearls” in the doorway. Julian, behind you, says nothing at all. Victor deals with it in under a minute and is white to the lips afterward. “You should not have called me in front of the others.”'
      },
      {
        hidden: true, label: 'You hesitate.', tag: '',
        fx: { trust: { camille: -4 }, mask: { camille: -12 }, flag: 'camilleSawPawn' },
        react: 'The knock comes twice more. Then Camille’s bright voice: “Oh, good morning!” Then a long silence, and a small sound that is not a word. She has seen the pawn ticket, with her mother’s pearls written in a stranger’s hand. When you reach the doorway she is standing quite still, smiling, and the smile is very wrong.'
      }
    ]
  };

  S.EVENTS.bailiff = {
    id: 'bailiff', day: 5, slot: 1, title: 'Mr. Pruett’s Inventory — The Drawing Room', noAP: true,
    paras: [
      'A thin man in a rain-spotted mackintosh arrives at three with a clipboard. Mr. Pruett, of Aldermere & Hartwell. “A formality,” he says, and does not smile. He is here to value the contents for Saturday.',
      'You see the room as he will. A pale rectangle on the wallpaper where the Constable hung. A ring in the dust where the Meissen cabinet stood. An empty velvet hollow in the glass case in the shape of a rope of pearls. Victor stands in the doorway in perfect posture, pocket watch clicking, his left hand folded behind him. Clara has appeared with her notebook. She, too, has been counting.'
    ],
    choices: [
      {
        label: 'Move a lamp, a fern-stand and the piano shawl over each pale patch before Mr. Pruett reaches them. You know exactly what stood where.', tag: 'Informed', need: ['clue:r_pawn'],
        fx: { trust: { victor: 10 }, mask: { victor: -6 }, scrutiny: 6, flag: 'coveredGaps' },
        react: 'It takes four minutes and a great deal of calm. Mr. Pruett frowns at the rug, writes something, and moves on. When he has gone, Victor stands in the middle of the drawing room with his watch closed. “How did you know?” “I looked, sir.” “…Thank you.”'
      },
      {
        label: 'Hurry ahead with the tea trolley and shield what you can with it.', tag: 'Deferential', fx: { trust: { victor: 4 }, scrutiny: 8, flag: 'partCover' },
        react: 'You hide the worst of it and miss the rest. Mr. Pruett’s pencil moves. Victor’s jaw tightens at every stroke, but he does not stop you, and afterwards he says, curtly, “That was brave. Do not do it again.”'
      },
      {
        label: 'Take Mr. Pruett to the dining room for tea and plain talk about the weather while Victor steadies himself.', tag: 'Quiet / Grounding', fx: { trust: { victor: 6, julian: 2 }, mask: { victor: -4 }, scrutiny: 3, flag: 'bailiffDelayed' },
        react: 'Mr. Pruett is not a fool, but he is a man who has not been offered tea in a week. You gain eleven minutes. When Victor comes in, he has combed his hair and found his voice.'
      },
      {
        label: 'Send Camille in to charm him. She is better at it than anyone alive.', tag: 'Warm / Playful', fx: { trust: { camille: 6, victor: 2 }, mask: { camille: 6 }, scrutiny: -2, flag: 'camilleCharmed' },
        react: 'She is magnificent. Mr. Pruett blushes to his collar and forgets two rooms. When he leaves, Camille’s smile drops so fast you can hear it. “Don’t let me do that again,” she says, to nobody, and takes the stairs two at a time.'
      },
      {
        label: 'Let Clara answer his questions. She has the inventory in her notebook, to the shilling.', tag: 'Direct / Practical', fx: { trust: { clara: 8, victor: -6 }, mask: { clara: -8, victor: -8 }, flag: 'bailiffExposed' },
        react: '“The pearls were pledged on the third of October for one hundred and forty pounds,” says Clara, perfectly levelly. “The Meissen on the ninth. The Constable on the twenty-first.” Mr. Pruett writes it all down. Victor does not move. You have never seen a man listen to his own secrets so quietly.'
      },
      {
        label: 'Step back. Victor has had two nights to prepare for this, and he holds the room.', tag: 'Informed', need: ['flag:phone_victor'],
        fx: { trust: { victor: 6 }, mask: { victor: -8 }, flag: 'victorHeldRoom' },
        react: 'He walks Mr. Pruett through every room like a man giving a tour of a house he loves, and does not once look at the gaps. It is the finest performance you have ever seen. When the door closes he leans his forehead on it for exactly five seconds.'
      }
    ]
  };

  S.EVENTS.stormwalk = {
    id: 'stormwalk', day: 6, slot: 1, title: 'Dusk — The Cliff Path', noAP: true,
    paras: [
      'The quarrel in the hall began before lunch and never properly ended. Victor’s voice, Camille’s answer, doors. At four Mrs. Pell finds you in the scullery. “Mr. Julian’s gone out. Took the lamp. Said he’d see to the gate.” His coat is still on its peg.',
      'You find him a quarter-mile along the cliff path in the rain, standing quite still in the middle of the track with the lamp guttering in his hand. He is nowhere near the edge. That is not the danger. The danger is the cold, and the fact that he is looking at the sea as though it were a painting of the sea. His lips are blue. He is not here.'
    ],
    paraIf: [{ flag: 'phone_julian', text: 'He has not slept since the night of the telephone. He has been mending things, gates and hinges and fences, as though enough repairs might add up to a mother.' }],
    choices: [
      {
        label: 'Take hold of his arm and haul him back toward the house.', tag: 'Direct / Practical', fx: { trust: { julian: -4 }, mask: { julian: 6 }, flag: 'julianStartled' },
        react: 'He flinches as if struck, and the polite, empty smile returns. “Of course. I’m so sorry.” You get him home, but you have taught him that someone will drag him wherever he is meant to be. He says “Thank you” at the door in a voice with nobody in it.'
      },
      {
        label: 'Put your shawl round his shoulders and walk him home, talking about nothing, the weather, the soup, Mrs. Pell’s temper.', tag: 'Warm / Playful', fx: { trust: { julian: 6 }, mask: { julian: -6 }, flag: 'julianHome' },
        react: 'He walks. His hand finds the lamp-handle again. Somewhere around the second gate he says, “Is it very late?” and you know part of him has come back. By the kitchen door he is shivering in a way that is entirely, healthily his own.'
      },
      {
        label: 'Stand beside him, out of the wind, and quietly name the things that are here, one at a time.', tag: 'Quiet / Grounding',
        ritual: RITUAL.groundCliff, fx: { trust: { julian: 10 }, mask: { julian: -10 }, flag: 'julianHome' },
        react: 'The latch. The rain. The surf. The window-light of the house. The weight of the shawl. By the fourth thing his eyes have turned to follow your hand. By the fifth he is looking at you. “I went away, didn’t I,” he says. “Yes. You’re back.” “It’s very cold,” says Julian, with great surprise, and the two of you laugh like fools in the rain.'
      },
      {
        label: 'Say, gently, “Dr. Pryce said your mother asked for you by name, Julian.”', tag: 'Informed', need: ['flag:phone_julian'],
        fx: { trust: { julian: 8 }, mask: { julian: -12 }, flag: 'julianHome' },
        react: 'It is as if the words go in through some door the cold had left open. Julian’s face crumples, wholly, like a child’s. He cries into the wet wool of your shoulder for a long, long time, and when he is finished he says, “I should like to go home now,” and means it.'
      },
      {
        label: 'Run back and fetch Victor.', tag: 'Deferential', fx: { trust: { victor: 4, julian: 2 }, mask: { victor: -8, julian: -2 }, flag: 'victorRan' },
        react: 'Victor goes down the path with no hat, no watch, and no composure, and arrives at his brother’s side at a dead run. He does not say anything clever. He takes off his own coat. The two of them walk back with the lamp between them, and you are three paces behind, unnecessary and glad.'
      }
    ]
  };

  S.EVENTS.reference = {
    id: 'reference', day: 7, slot: 0, free: true, noAP: true, title: 'A Letter in Your Name — The Service Corridor',
    paras: [
      'Mrs. Pell stops you at the foot of the back stairs with her floury hands held out in front of her like a surgeon’s. “This came for you by the early post. I’ve not opened it. I’ve a notion I know whose hand it is.” The envelope says only: To the girl Reverend Ashby sent.',
      'It is the first time you have wondered why a vicar who barely knew you wrote you such a handsome reference. You read it standing up, in the cold, beside the coal-scuttle. It is from Lady Eleanor Vane. Not long. Not signed with a title.',
      '“Dear Miss Harrow. By now you will have noticed a great deal. I asked Mr. Ashby to find me a girl with sharp eyes and a kind face, and to say nothing of why. My children love one another so well they have forgotten how to say so; each is guarding the others from a truth they all already hold. I could not stay to tell them. I am not well enough, and I was never brave enough. I hoped that someone might notice what I could not mend. Please give Camille the record in the blue sleeve. It is the only thing I managed to say. Yours, in gratitude and in some shame, E. V.”'
    ],
    always: { realize: 'hired_to_notice', flag: 'readMotherLetter' },
    choices: [
      {
        label: 'Fold it small and keep it close until the right moment.', tag: 'Quiet / Grounding', fx: { flag: 'motherLetter' },
        react: 'You put it inside your sleeve, against your wrist. So that is what you were for. Not a maid. A witness. All week you thought you were stealing glances through keyholes. You were doing the one thing she asked.'
      },
      {
        label: 'Take it to Clara. She will want the handwriting and the postmark checked.', tag: 'Direct / Practical', fx: { trust: { clara: 8 }, mask: { clara: -6 }, flag: 'motherLetter' },
        react: 'Clara examines the paper, the ink, the stamp. “The handwriting matches the Christmas card of 1926. The postmark is Marlowe, Thursday.” A pause. “She chose you for accuracy. I approve.” For Clara, this is the warmest thing in the English language.'
      },
      {
        label: 'Read it aloud to all four of them at breakfast.', tag: 'Direct / Practical', check: { allTrustMin: 40 },
        fx: { trust: { victor: 8, camille: 8, julian: 8, clara: 8 }, mask: { victor: -12, camille: -12, julian: -12, clara: -12 }, flag: 'motherLetter', },
        failFx: { trust: { victor: -5, camille: -5, julian: -5, clara: -5 }, mask: { victor: -8, camille: -8, julian: -8, clara: -8 }, overreach: 1, flag: 'motherLetter' },
        react: 'Nobody speaks until you finish. Then Camille says, in a very small voice, “A record in a blue sleeve?” and Victor says, “She knew,” and Julian puts down his cup, and Clara says, “That is consistent.” For the first time that week they look at one another instead of past one another.',
        failReact: 'You read it, and the room goes cold. They have not forgiven you yet for knowing, and they are not ready to be known. “How dare she send a servant,” says Victor, which is not what he means. The words are true, and the timing is cruel.'
      }
    ]
  };

  /* A gated final-night choice for those who hold the mother's letter / Mrs. Pell's trust. */
  S.EVENTS.last.choices.unshift({
    label: 'Give them Lady Eleanor’s letter at the door, as the light comes.', tag: 'The Letter', need: ['flag:motherLetter'],
    fx: { trust: { victor: 4, camille: 4, julian: 4, clara: 4 }, mask: { victor: -6, camille: -6, julian: -6, clara: -6 }, flag: 'letterGiven' },
    react: 'You put it in Victor’s hand. He reads it, passes it to Camille, who passes it to Julian, who passes it to Clara, who reads it twice, squares it to the edge of the hall table, and says, “She was right about the postmark.” Nobody laughs. Everybody does.'
  });
  S.EVENTS.last.choices.splice(S.EVENTS.last.choices.length - 1, 0, {
    label: 'Slip down to the kitchen, where Mrs. Pell has the kettle on and a plan.', tag: 'Mrs. Pell', need: ['flag:arc_pell'],
    fx: { flag: 'final_pell' }, react: 'She is at the table with her sleeves rolled, two cups out, and a ledger of her own. “Sit down, girl,” says Mrs. Pell. “We have until six.”'
  });

  /* ---------- Lady Eleanor's Record (Camille, tier 4) ---------- */
  const c5 = {
    id: 'c5', sib: 'camille', tier: 4, slots: [3], title: 'Lady Eleanor’s Record', arc: 'camille',
    cond: { seen: ['c3'], minTrust: 45, maxMask: 55, minDay: 5 },
    fxOverride: { defer: [8, -14, 0], direct: [-4, -6, 2], warm: [-2, -4, 3], quiet: [10, -16, 0] },
    paras: [
      'There is light under the parlour door, and a sound you have not heard in that room all week: nothing. No gramophone-trumpets, no laugh. Then the soft crackle of a needle settling into a groove.',
      'A woman’s voice, speaking, not singing, a little hoarse, from very far away: “My darling girl. I recorded this in Penzance in the spring, in a booth with a curtain, for a shilling. I wanted you to hear that I am not angry. I was never angry. I was tired, and you were so bright, and I did not know how to say I could see the cost.” The record crackles. Camille is on the other side of the door, listening alone.'
    ],
    paraIf: [{ flag: 'phone_camille', text: 'She told you, the night of the telephone, that she had known since October. You wonder how long she has been carrying this disc without playing it.' }],
    choices: {
      defer:  { label: 'Stay in the passage. Do not knock. Let her have it alone.', react: 'You stand in the dark with your back to the wall for the whole of the record. At the end there is a long silence, then the sound of a chair, then Camille’s voice, small and clear and entirely unperformed: “Thank you for not coming in.”' },
      direct: { label: 'Knock and ask whether she would like company.', react: 'The record stops dead. “No,” says Camille, brightly, from behind the door. “I’m quite all right. Do go to bed.” The brightness is back like a shutter. You have interrupted a mother in the middle of a sentence.' },
      warm:   { label: 'Open the door with a cheerful “Whatever is that, miss?”', react: 'The needle skips. Camille’s head turns, and her face is a blur of wet powder and fury. “How dare you,” she whispers. The record is lifted from the turntable, and the voice goes out of the room like a candle.' },
      quiet:  { label: 'Sit down on the floor outside the door, back against it, and listen to what you can.', react: 'You can hear every word through the oak. At the end of the record you hear the needle lift, and then a long, shuddering breath. Through the wood, you feel her slide down and lean against it too. Back to back, with a door between you, you stay there until the lamp gutters.' }
    },
    gate: {
      need: ['real:the_party_is_a_wound'],
      label: 'Say softly through the door, “You do not have to be bright for her, miss. I am here, if you would like to hear it again.”',
      react: 'A long pause. Then the door opens a crack. Camille’s eyes are swollen. “Would you?” she says. “Not alone. Not again.” She plays it a second time with you on the sofa beside her, and this time she lets herself say the last line along with the record.'
    }
  };
  const c4i = S.ENCOUNTERS.findIndex((e) => e.id === 'c4');
  S.ENCOUNTERS.splice(c4i + 1, 0, c5);

  /* ---------- Moments: scenes that expire if you are elsewhere ---------- */
  S.OPPORTUNITIES = [
    {
      id: 'o_cup', day: 1, slot: 1, sib: 'camille', title: 'The Tea She Does Not Drink',
      paras: ['Camille has laid the parlour table for six, with the good cups, and sits at the head of it with a bright expectant face. Nobody has been invited. She pours the tea anyway, and it steams, and she does not lift her own cup.'],
      choices: [
        { label: 'Take the chair at the foot and drink a cup with her.', tag: 'Warm / Playful', fx: { trust: { camille: 6 }, mask: { camille: -6 } }, react: 'She beams, and for the length of one cup she is only a girl having tea. When you stand, she says, “Same time tomorrow?” You are not sure whether she is joking.' },
        { label: 'Clear the extra places quietly and leave her one cup.', tag: 'Quiet / Grounding', fx: { trust: { camille: 4 }, mask: { camille: -4 } }, react: 'She watches you lift each cup away without comment, and when only hers is left she says, “Thank you,” very softly. It is as if she had wanted someone else to say the room was empty.' }
      ],
      missFx: { mask: { camille: 4 } }, missNote: 'Camille poured tea for guests who never came, and nobody sat down.'
    },
    {
      id: 'o_vase', day: 2, slot: 1, sib: 'clara', title: 'The Vase Moved an Inch',
      paras: ['Clara is standing absolutely still in the doorway, staring at the hall-table. The vase is an inch to the left of where it was this morning. She has not said a word. Her hands have gone to her sides in fists. Behind her eyes, a very loud thing is happening.'],
      choices: [
        { label: 'Fetch her ruler. Measure the inch back together.', tag: 'Direct / Practical', fx: { trust: { clara: 8 }, mask: { clara: -6 } }, react: 'You slide it back with the ruler between you, and she watches the gap close to exactly zero. Her fists unclench. “Thank you,” she says. “It was Camille. She does not do it to be unkind.”' },
        { label: 'Tell her cheerfully it hardly matters.', tag: 'Warm / Playful', fx: { trust: { clara: -4 }, mask: { clara: 4 } }, react: '“It matters,” says Clara. She goes away with her shoulders very straight and does not speak to you at tea.' }
      ],
      missFx: { trust: { clara: -3 }, mask: { clara: 4 } }, missNote: 'The vase stayed an inch wrong all afternoon, and Clara stood guard over it.'
    },
    {
      id: 'o_boiler', day: 3, slot: 2, sib: 'julian', title: 'The Boiler Groans',
      paras: ['Somewhere beneath you the boiler is making a noise like a very old man being sat upon. Julian has gone down with a lamp and a spanner, and has not said where. You find him in the dark, on his knees, his hand against hot iron, with a scald opening across his palm and no sign he has noticed.'],
      choices: [
        { label: 'Take the lamp and hold it steady while he works.', tag: 'Quiet / Grounding', fx: { trust: { julian: 8 }, mask: { julian: -8 } }, react: 'He works a minute in silence, and then says, without looking round: “Nobody has ever held the lamp.” The boiler settles. You do not say anything clever.' },
        { label: 'Wrap his hand in the cold rag and make him let go of the pipe.', tag: 'Direct / Practical', fx: { trust: { julian: 5 }, mask: { julian: -5 }, scrutiny: 2 }, react: 'He lets you. He is as docile as a lamb, and you realise this is not a good sign. “It’s only a little burn,” he says. You do not let go of the rag.' }
      ],
      missFx: { trust: { julian: -2 }, mask: { julian: 3 } }, missNote: 'Julian fixed the boiler alone in the dark and burned his hand.'
    },
    {
      id: 'o_lamp', day: 3, slot: 3, sib: 'victor', title: 'A Light Under the Door',
      paras: ['It is past one and the grate in Victor’s study is full of burning paper. He is feeding it a page at a time, ledger leaves, closely ruled, with a face like a man closing eyes. The pile on the desk is smaller than the pile on the fire.'],
      choices: [
        { label: 'Open the flue so the chimney draws, and rescue the half-burnt corner of a page that falls into the hearth.', tag: 'Direct / Practical', fx: { trust: { victor: 6 }, mask: { victor: -8 }, scrutiny: 3, clue: 'r_pawn' }, react: '“The chimney will draw better with the flue open, sir.” He stares, then nods. When he turns away to the window you slide the curled brown corner into your apron. It is the slip: a pawn ticket, with the date and the pearls.' },
        { label: 'Say nothing. Set a candle on the desk and leave.', tag: 'Deferential', fx: { trust: { victor: 4 } }, react: 'He does not look up. At the door he says, “Thank you for the candle.” You will never know what else he burned.' }
      ],
      missFx: {}, missNote: 'Victor burned his false ledger pages in the grate. Whatever they said is ash.'
    },
    {
      id: 'o_shards', day: 4, slot: 1, sib: 'camille', title: 'The Broken Cup',
      paras: ['A crash, and then Camille’s laugh, bright and high, a split-second late. She is standing over the shards of a Spode cup, still laughing, and the laugh goes on a little too long and then stops, as if someone had put a hand over it.'],
      choices: [
        { label: 'Kneel and gather the pieces with her, saying nothing.', tag: 'Quiet / Grounding', fx: { trust: { camille: 10 }, mask: { camille: -12 } }, react: 'You pick up the pieces together. Halfway through, she says, “It was Mother’s.” That is all. You put the last shard in the palm of her hand and fold her fingers over it.' },
        { label: 'Make a joke: “Well, that’s the end of Spode.”', tag: 'Warm / Playful', fx: { trust: { camille: 4 }, mask: { camille: -2 } }, react: 'She laughs, a real laugh. But it is short, and when she looks back at the shards her eyes are somewhere else.' },
        { label: 'Fetch the dustpan and leave her a minute alone.', tag: 'Deferential', fx: { trust: { camille: 1 }, mask: { camille: 3 } }, react: 'When you come back she has swept it up herself and is humming something with trumpets in it. The shards are gone.' }
      ],
      missFx: { trust: { camille: -2 }, mask: { camille: 6 } }, missNote: 'Camille swept up the broken cup herself and hid the pieces.'
    },
    {
      id: 'o_clock', day: 6, slot: 0, sib: 'clara', title: 'Eleven Strokes',
      paras: ['The hall clock begins to strike a quarter before it should. Clara is already at the thread, one hand flat on the floorboard. “It has been losing four minutes a week,” she says, to nobody, and her breath begins to speed. The strokes are coming now, deep and slow, and she is counting them aloud.'],
      choices: [
        { label: 'Kneel beside her and count with her.', tag: 'Quiet / Grounding', ritual: RITUAL.chimeKlara, fx: { trust: { clara: 8 }, mask: { clara: -8 } }, react: 'Eleven. When the last stroke is gone she says, “Eleven.” You say, “Eleven.” She lets out a breath you did not know she was holding. “That was correct,” says Clara. “Thank you for being correct with me.”' },
        { label: 'Stop the pendulum with your hand.', tag: 'Direct / Practical', fx: { trust: { clara: 6 }, mask: { clara: -4 }, scrutiny: 6 }, react: 'The clock stops mid-stroke. Silence. Clara stares at you. “That is not permitted,” she says. After a pause, “It is helpful.” It is the first time you have heard her break a rule.' }
      ],
      missFx: { trust: { clara: -3 } }, missNote: 'The clock struck early, and Clara counted through it alone.'
    },
    {
      id: 'o_letter', day: 6, slot: 3, sib: 'victor', title: 'The Unsent Letter',
      paras: ['Victor is writing to the bank. You can see it from the doorway: not the cold formal letters he writes by day, but a plain page with a tremor in the handwriting. The first line says Dear Sir, I am writing to ask for a little more time. He has crossed it out three times.'],
      choices: [
        { label: 'Sit on the low stool by the door while he writes.', tag: 'Quiet / Grounding', fx: { trust: { victor: 8 }, mask: { victor: -12 } }, react: 'He writes. He crosses it out. He writes again. By the fourth draft he has stopped hiding his left hand. When he finishes he says, “I should like it posted before they can tell me no,” and then, “I should like someone to have read it.” You nod.' },
        { label: 'Offer to carry the letter to the first post at dawn.', tag: 'Deferential', fx: { trust: { victor: 4 } }, react: '“Thank you.” He seals it without reading it over. It is, you think, the bravest thing he has done all week, and he does not know it.' }
      ],
      missFx: {}, missNote: 'Victor wrote to the bank alone and posted it himself.'
    }
  ];

  /* ---------- Mrs. Pell: hidden arc, unlocked in New Game+ ---------- */
  S.PELL = [
    {
      id: 'p1', minDay: 2, title: 'The Kettle That Is Never Cold',
      paras: ['You have known Mrs. Pell for four days and she has said, by your count, eleven kind things and eleven sharp ones. Tonight she is at the scrubbed table with her sleeves rolled, watching you with the faint amused look of someone who has been waiting for the second act.', '“You’ve noticed things,” she says. “You think I haven’t.”'],
      choices: [
        { label: 'Take the coal-scuttle from her and fill the range without being asked.', tag: 'Deferential', fx: { pell: 5 }, react: 'She grunts. It is, you gather, approval. “Hm. Where were you brought up?” You tell her. “Hm,” she says again, and slides a mug of cocoa across the table.' },
        { label: '“I have noticed you are the only one who never lies in this house.”', tag: 'Direct / Practical', fx: { pell: 3, scrutiny: 2 }, react: '“Oh, I lie,” says Mrs. Pell. “I only do it with a straight face. That is different.” But she looks rather pleased.' },
        { label: 'Say nothing. Rinse the cups.', tag: 'Quiet / Grounding', fx: { pell: 4 }, react: 'She watches you wash all seven. “Parallel to the edge,” she says, and nods at the draining-board, and you realise you have put them exactly where Miss Clara would.' }
      ]
    },
    {
      id: 'p2', minDay: 4, needSeen: 'p1', needPell: 5, title: 'The Telegram Boy',
      paras: ['“I’ll tell you something for nothing,” says Mrs. Pell, not looking up from the dough. “You think you’re the only one who reads other people’s post?”', 'She turns, floury to the elbow. “The telegram boy comes to the back door, girl. He has done for years. Somebody has to read them before the family does. Somebody who’s old enough to bear it.”'],
      choices: [
        { label: '“You have been carrying this alone.”', tag: 'Warm / Playful', fx: { pell: 6 }, react: '“Don’t you start,” says Mrs. Pell, and blows her nose very firmly. “Yes. All right. Yes.”' },
        { label: '“Who else knows?”', tag: 'Direct / Practical', fx: { pell: 3 }, react: '“Dr. Pryce. The Reverend. Me. And, I suspect, every single one of them, God help them, each in a locked room of their own.”' },
        { label: 'Offer to burn the next one yourself, so she need not.', tag: 'Deferential', fx: { pell: 2, scrutiny: 3 }, react: '“Certainly not. We’ll have none of that.” But the corner of her mouth moves.' }
      ]
    },
    {
      id: 'p3', minDay: 6, needSeen: 'p2', needPell: 10, title: 'The Pantry Ledger',
      paras: ['She takes you into the pantry, shuts the door, and takes down a tin from behind the flour. Inside is a ledger, a small plain one, and under it a roll of notes. “Thirty-one years of wages,” says Mrs. Pell. “Less what I sent my sister.”', 'She has been paying the pawnbroker’s interest. She has had a cottage in Bath on a six-month lease since October. It has four bedrooms, and a kitchen big enough for six. “I wrote to Dr. Pryce myself. I wanted her to know someone was minding the children.” She straightens. “Now. Will you tell them, or shall I?”'],
      choices: [
        { label: '“Tell them together, at the table. All of it. Together.”', tag: 'Direct / Practical', success: true, fx: { pell: 6, flag: 'arc_pell' }, react: '“Together.” She tastes the word. “Yes. That’s what I couldn’t manage.” She puts the lid on the tin, with a snap. “Saturday, then. I’ll warm the pot.”' },
        { label: '“Let me tell Victor first. He’ll need to hear it from someone steady.”', tag: 'Quiet / Grounding', success: true, fx: { pell: 5, flag: 'arc_pell' }, react: '“Good girl.” She lets out the breath she has held for six weeks. “You do it. I’ll stand behind you with a mug.”' },
        { label: '“It isn’t my place, Mrs. Pell.”', tag: 'Deferential', fx: { pell: -4 }, react: '“No,” she says, tucking the tin back behind the flour. “It never is.” She holds the door open for you. The pantry is colder than it was.' },
        { label: 'Show her Lady Eleanor’s letter.', tag: 'Informed', need: ['flag:motherLetter'], success: true, fx: { pell: 8, flag: 'arc_pell' }, react: 'She reads it standing, twice, and her face goes through four expressions in a very short time. “Well,” says Mrs. Pell, at last. “She said she’d send someone.” She folds it, and kisses it, and hands it back. “Tell them together.”' }
      ]
    }
  ];
  S.PELL_INFO = { name: 'Mrs. Pell', role: 'The Housekeeper', css: 'gold' };

  /* ---------- New realization (granted automatically), ending, achievements, extras ---------- */
  S.REALIZATIONS.hired_to_notice = {
    id: 'hired_to_notice', auto: true, title: 'Why You Were Hired',
    text: 'A vicar’s handsome reference for a girl he barely knew. A mother who could not speak to her children and so sent someone who could watch them. You were never an accident of the agency. You were an instrument of love, left on the doorstep with one instruction: notice.',
    looksBack: 'Every keyhole you thought you were stealing through had been left open for you.'
  };
  S.ENDINGS.pell = {
    id: 'pell', title: 'The Housekeeper’s Kept Promise', kind: 'Mrs. Pell’s Arc',
    paras: [
      'Mrs. Pell tells them at the kitchen table at six, with the kettle on and the tin open. Thirty-one years of wages, a lease in Bath, four bedrooms. Nobody speaks. Then Victor, who has never once cried in front of anyone, takes out his pocket watch and puts it face-down on the table.',
      'The cart comes at dawn and finds no one on the step. They are all in the kitchen, eating Mrs. Pell’s bread. The house is lost. But there is a cottage, and a stove, and a woman who has been waiting thirty years for someone to ask what she wanted.'
    ]
  };
  Object.assign(S.ACHIEVEMENTS, {
    phone_call:   { title: 'Three in the Morning', desc: 'Answer the telephone at Marlowe’s call.' },
    breath_great: { title: 'Count With Me', desc: 'Steady Victor’s breathing in the Breath ritual.' },
    chime_great:  { title: 'Eleven Strokes, Correct', desc: 'Count every chime with Clara.' },
    ground_great: { title: 'Five Real Things', desc: 'Ground Julian without a single startle.' },
    right_place:  { title: 'Right Place, Right Hour', desc: 'Take four Moments in a single season.' },
    julian_home:  { title: 'Home Before Dark', desc: 'Bring Julian home from the cliff path.' },
    pawn_stopped: { title: 'Wrong Door, Right Hands', desc: 'Intercept the pawnbroker before anyone else answers.' },
    hired_notice: { title: 'Why You Were Hired', desc: 'Read Lady Eleanor’s letter.' },
    record_played:{ title: 'A Voice in a Blue Sleeve', desc: 'Be there when Camille plays her mother’s record.' },
    ng_plus:      { title: 'The House Remembers', desc: 'Begin a season with the Ledger’s memory.' },
    end_pell:     { title: 'The Housekeeper’s Kept Promise', desc: 'Reach Mrs. Pell’s ending.' }
  });
  S.HINTS.push('“Funny thing, that reference you came with. The Reverend’s never written a handsome word for a girl in thirty years.”');

  /* Extra paragraphs appended to endings depending on flags. */
  S.ENDING_EXTRAS = [
    { flag: 'letterGiven', ends: ['true', 'victor', 'camille', 'julian', 'clara', 'neutral', 'pell'], text: 'In the carriage, Clara asks to read Lady Eleanor’s letter again. She reads it aloud. Nobody interrupts. When she finishes she says, “I should like to visit her on Tuesday,” and then, because she is Clara, “At eleven.”' },
    { flag: 'recordPlayed', ends: ['true', 'camille', 'victor', 'julian', 'clara', 'pell', 'neutral'], text: 'The record in the blue sleeve goes in Camille’s trunk, wrapped in a silk scarf. She plays it once more in the spring, with her brothers and sister in the room.' },
    { flag: 'arc_pell', ends: ['true'], text: 'Mrs. Pell, it turns out, has been saving for six weeks, and the cottage in Bath has four bedrooms. “Nothing grand,” she says, “but there is always a kettle.”' },
    { flag: 'julianHome', ends: ['true', 'julian', 'victor', 'camille', 'clara', 'neutral', 'pell'], text: 'On the road Julian wears Victor’s coat, and no one remarks on it. At the first junction, when Camille asks which road to take, he says, “Left,” without apologising.' }
  ];

  return S;
});
