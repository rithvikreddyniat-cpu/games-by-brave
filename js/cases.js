// Cases Module for Snake Noir — 3 Playable Case Panels

export const CASES = [
  {
    id: 'case1',
    title: 'THE ALLEY',
    panelTag: 'PANEL #01: THE ALLEY',
    intro: 'The rain glistened on the slick cobblestones. A damp alleyway held the first whispers of a crime...',
    walls: [
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................'
    ],
    snakeStart: { x: 10, y: 10, dir: 'RIGHT' },
    clues: [
      {
        id: 'footprint',
        name: 'Muddy Footprint',
        col: 4,
        row: 5,
        icon: '👣',
        description: 'A heavy boot imprint smeared across the tile floor. Heading east.'
      },
      {
        id: 'shattered_glass',
        name: 'Shattered Window',
        col: 15,
        row: 3,
        icon: '💥',
        description: 'Jagged glass fragments. Forced entry from the fire escape outside.'
      },
      {
        id: 'torn_photo',
        name: 'Torn Photograph',
        col: 16,
        row: 14,
        icon: '🖼️',
        description: 'A black-and-white portrait with the victim’s face torn cleanly away.'
      },
      {
        id: 'blood_evidence',
        name: 'Bloodstain',
        col: 5,
        row: 16,
        icon: '🩸',
        description: 'Dark, dried drops leading behind the desk. Someone was wounded.'
      },
      {
        id: 'engraved_lighter',
        name: 'Engraved Lighter',
        col: 11,
        row: 8,
        icon: '🔥',
        description: 'A silver lighter stamped with initials "D.S." — Detective Snake?'
      }
    ],
    requiredClues: 3,
    lightScale: 1.0,
    tickMs: 130,
    hasTwist: false,
    questions: [
      {
        id: 'entry',
        title: 'I. POINT OF ENTRY',
        evidenceRef: 'Shattered Window & Muddy Footprints',
        options: [
          { id: 'window', label: 'THROUGH THE FIRE ESCAPE WINDOW', desc: 'Shattered glass indicates forced entry from outside.' },
          { id: 'door', label: 'THROUGH THE MAIN DOORWAY', desc: 'The intruder had a key or walked right past security.' }
        ]
      },
      {
        id: 'struggle',
        title: 'II. NATURE OF THE CONFRONTATION',
        evidenceRef: 'Bloodstain & Torn Photograph',
        options: [
          { id: 'ambush', label: 'THE VICTIM WAS AMBUSHED FROM BEHIND', desc: 'No defensive wounds. Surprised at the desk.' },
          { id: 'argument', label: 'A FIERCE ARGUMENT BROKE OUT', desc: 'Personal confrontation that escalated to violence.' }
        ]
      },
      {
        id: 'suspect',
        title: 'III. PRIMARY SUSPECT PROFILE',
        evidenceRef: 'Engraved Lighter ("D.S.")',
        options: [
          { id: 'intruder', label: 'AN UNKNOWN BURGLAR IN HEAVY BOOTS', desc: 'A lone intruder seeking valuables.' },
          { id: 'insider', label: 'AN INSIDER CONNECTED TO THE POLICE', desc: 'Someone who knew the victim and left a personal item.' }
        ]
      }
    ]
  },
  {
    id: 'case2',
    title: 'THE OFFICE',
    panelTag: 'PANEL #02: THE OFFICE',
    intro: "The victim's office. Every drawer pulled, every light off. Whoever did this knew the building.",
    walls: [
      '....................',
      '....................',
      '....................',
      '...####......####...',
      '...####......####...',
      '....................',
      '....................',
      '........####........',
      '....................',
      '....................',
      '..####........####..',
      '..####........####..',
      '.........##.........',
      '.........##.........',
      '.........##.........',
      '.........##..####...',
      '.............####...',
      '....................',
      '....................',
      '....................'
    ],
    snakeStart: { x: 6, y: 18, dir: 'RIGHT' },
    clues: [
      {
        id: 'back_door',
        name: 'Back Door Ajar',
        col: 1,
        row: 1,
        icon: '🚪',
        description: 'Unlocked from the inside. The killer left in a hurry.'
      },
      {
        id: 'torn_ledger',
        name: 'Torn Ledger',
        col: 18,
        row: 1,
        icon: '📒',
        description: 'Pages ripped out. The missing entries were payments to the precinct.'
      },
      {
        id: 'office_phone',
        name: 'Phone Off The Hook',
        col: 10,
        row: 5,
        icon: '📞',
        description: 'The last call went to a number inside Grid City Police.'
      },
      {
        id: 'open_safe',
        name: 'Open Safe',
        col: 1,
        row: 12,
        icon: '🔐',
        description: 'No scratches on the lock. Someone knew the combination.'
      },
      {
        id: 'warm_coffee',
        name: 'Warm Coffee',
        col: 18,
        row: 13,
        icon: '☕',
        description: 'Still warm. The victim had company, and trusted them.'
      },
      {
        id: 'typed_note',
        name: 'Unfinished Note',
        col: 7,
        row: 13,
        icon: '📝',
        description: 'A typed confession that stops mid-sentence.'
      },
      {
        id: 'broken_watch',
        name: 'Broken Watch',
        col: 17,
        row: 17,
        icon: '⌚',
        description: 'Stopped at 11:47. Whoever wore it fought back.'
      }
    ],
    requiredClues: 7,
    lightScale: 0.85,
    tickMs: 125,
    hasTwist: false,
    questions: [
      {
        id: 'office_taken',
        title: 'I. WHAT WAS TAKEN?',
        evidenceRef: 'Open Safe & Torn Ledger',
        options: [
          { id: 'money', label: 'CASH FROM THE SAFE', desc: 'A simple robbery that went wrong.' },
          { id: 'secrets', label: 'THE LEDGER PAGES', desc: 'Someone needed the payments to disappear.' }
        ]
      },
      {
        id: 'office_access',
        title: 'II. WHO HAD ACCESS?',
        evidenceRef: 'No Forced Entry & Call To The Precinct',
        options: [
          { id: 'stranger', label: 'A STRANGER PICKED THE LOCK', desc: 'A professional burglar with time to spare.' },
          { id: 'insider', label: 'SOMEONE FROM THE PRECINCT', desc: 'Someone with a key, a badge and a reason.' }
        ]
      }
    ]
  },
  {
    id: 'case3',
    title: 'THE UNPRINTED PANEL',
    panelTag: 'PANEL #03: THE UNPRINTED PANEL',
    intro: 'The last panel. It was never printed. Whatever happened here, the page is still waiting for an ending.',
    walls: [
      '....................',
      '....................',
      '....................',
      '....................',
      '....##........##....',
      '....##........##....',
      '....................',
      '....................',
      '....................',
      '.........##.........',
      '.........##.........',
      '....................',
      '....................',
      '....................',
      '....##........##....',
      '....##........##....',
      '....................',
      '....................',
      '....................',
      '....................'
    ],
    snakeStart: { x: 5, y: 18, dir: 'RIGHT' },
    clues: [
      {
        id: 'wet_inkwell',
        name: 'Wet Inkwell',
        col: 1,
        row: 1,
        icon: '✒️',
        description: 'The ink is still wet. This panel was being drawn when it happened.'
      },
      {
        id: 'pencil_sketch',
        name: 'Pencil Sketch',
        col: 18,
        row: 2,
        icon: '✏️',
        description: 'A rough outline of a figure in a trench coat. The face is blank.'
      },
      {
        id: 'bootprint_trail',
        name: 'Bootprint Trail',
        col: 10,
        row: 6,
        icon: '👣',
        description: 'The same boots as the alley. They stop exactly where you started.'
      },
      {
        id: 'ds_lighter',
        name: 'Engraved Lighter',
        col: 7,
        row: 10,
        icon: '🔥',
        description: 'A silver lighter stamped "D.S." It is still warm.',
        key: true
      },
      {
        id: 'torn_edge',
        name: 'Torn Panel Edge',
        col: 18,
        row: 10,
        icon: '📰',
        description: 'The border is torn from the inside. Something wanted out.'
      },
      {
        id: 'smashed_lamp',
        name: 'Smashed Lamp',
        col: 2,
        row: 12,
        icon: '💡',
        description: 'The only light in the panel, destroyed on purpose.'
      },
      {
        id: 'fedora',
        name: 'Left-Behind Fedora',
        col: 12,
        row: 17,
        icon: '🎩',
        description: "Not the victim's. It fits a detective's head."
      },
      {
        id: 'detective_badge',
        name: 'Detective Badge',
        col: 13,
        row: 12,
        icon: '⭐',
        description: 'Number scratched out, but the case file says D. Snake.',
        key: true
      }
    ],
    requiredClues: 6,
    lightScale: 0.75,
    tickMs: 120,
    hasTwist: true,
    inkGoal: 0.5,
    questions: [
      {
        id: 'panel_when',
        title: 'I. WHEN WAS THE PANEL DRAWN?',
        evidenceRef: 'Wet Inkwell & Pencil Sketch',
        options: [
          { id: 'during', label: 'WHILE THE CRIME HAPPENED', desc: 'The artist was a witness.' },
          { id: 'after', label: 'AFTER, TO COVER IT UP', desc: 'Someone redrew the scene.' }
        ]
      },
      {
        id: 'panel_who',
        title: 'II. WHO IS IN THE SKETCH?',
        evidenceRef: 'Trench-Coat Figure & Bootprint Trail',
        options: [
          { id: 'killer', label: 'THE KILLER', desc: 'A stranger who left the boots behind.' },
          { id: 'detective', label: 'THE DETECTIVE', desc: 'The boots stop exactly where the detective began.' }
        ]
      },
      {
        id: 'panel_lamp',
        title: 'III. WHY WAS THE LAMP SMASHED?',
        evidenceRef: 'Smashed Lamp & Torn Panel Edge',
        options: [
          { id: 'darkness', label: 'THE KILLER NEEDED DARKNESS', desc: 'Light would have exposed the face.' },
          { id: 'unprinted', label: 'SOMEONE WANTED THE PANEL UNPRINTED', desc: 'The scene was never meant to be seen.' }
        ]
      }
    ]
  }
];

/**
 * Flood-fill validation helper to check wall overlaps and reachability at startup
 */
export function validateCasesAccessibility(casesList = CASES) {
  casesList.forEach((c, idx) => {
    const grid = c.walls;
    const rows = grid.length;
    const cols = grid[0].length;

    const startX = c.snakeStart.x;
    const startY = c.snakeStart.y;
    if (grid[startY][startX] === '#') {
      console.warn(`Case #${idx + 1} (${c.title}): snakeStart (${startX}, ${startY}) is on a wall!`);
    }

    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [{ x: startX, y: startY }];
    visited[startY][startX] = true;

    while (queue.length > 0) {
      const { x, y } = queue.shift();
      const neighbors = [
        { x: x + 1, y }, { x: x - 1, y },
        { x, y: y + 1 }, { x, y: y - 1 }
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < cols && n.y >= 0 && n.y < rows) {
          if (!visited[n.y][n.x] && grid[n.y][n.x] !== '#') {
            visited[n.y][n.x] = true;
            queue.push(n);
          }
        }
      }
    }

    c.clues.forEach((clue) => {
      if (grid[clue.row][clue.col] === '#') {
        console.warn(`Case #${idx + 1} (${c.title}): Clue "${clue.name}" (${clue.col}, ${clue.row}) sits on a wall!`);
      } else if (!visited[clue.row][clue.col]) {
        console.warn(`Case #${idx + 1} (${c.title}): Clue "${clue.name}" (${clue.col}, ${clue.row}) cannot be reached from snake start!`);
      }
    });
  });
}

// Run validation at startup
validateCasesAccessibility(CASES);
