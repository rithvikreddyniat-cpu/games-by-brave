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
    hasTwist: false
  },
  {
    id: 'case2',
    title: 'THE OFFICE',
    panelTag: 'PANEL #02: THE OFFICE',
    intro: 'The victim’s study smelled of old paper and stale tobacco. Interior partitions formed a maze of shadows...',
    walls: [
      '....................',
      '....................',
      '....####....####....',
      '....#..#....#..#....',
      '....#..#....#..#....',
      '....................',
      '....................',
      '....####....####....',
      '....#..........#....',
      '....#..........#....',
      '....................',
      '....................',
      '....####....####....',
      '....#..#....#..#....',
      '....#..#....#..#....',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................'
    ],
    snakeStart: { x: 2, y: 2, dir: 'RIGHT' },
    clues: [
      {
        id: 'office_key',
        name: 'Brass Key',
        col: 2,
        row: 5,
        icon: '🔑',
        description: 'A heavy brass key tucked beneath a desk drawer.'
      },
      {
        id: 'safe_code',
        name: 'Cipher Note',
        col: 8,
        row: 3,
        icon: '📜',
        description: 'Scrawled numbers matching the wall safe dial.'
      },
      {
        id: 'poison_vial',
        name: 'Empty Vial',
        col: 17,
        row: 4,
        icon: '🧪',
        description: 'A glass vial smelling of bitter almonds.'
      },
      {
        id: 'shredded_memo',
        name: 'Shredded Document',
        col: 2,
        row: 15,
        icon: '📄',
        description: 'Strips of paper referencing a financial audit.'
      },
      {
        id: 'bloody_dagger',
        name: 'Letter Opener',
        col: 10,
        row: 9,
        icon: '🗡️',
        description: 'An ornamental dagger stained near the hilt.'
      },
      {
        id: 'gold_watch',
        name: 'Stopped Pocketwatch',
        col: 17,
        row: 14,
        icon: '⏱️',
        description: 'Hands frozen at precisely 11:42 PM.'
      },
      {
        id: 'burnt_letter',
        name: 'Ashen Letter',
        col: 10,
        row: 17,
        icon: '✉️',
        description: 'Half-burnt correspondence signed by an unknown blackmailer.'
      }
    ],
    requiredClues: 4,
    hasTwist: false
  },
  {
    id: 'case3',
    title: 'THE UNPRINTED PANEL',
    panelTag: 'PANEL #03: THE UNPRINTED PANEL',
    intro: 'Something is wrong... The final panel is incomplete. The investigation and the crime are converging...',
    walls: [
      '....................',
      '....................',
      '......######........',
      '......#....#........',
      '......#....#........',
      '......#....#........',
      '....................',
      '....................',
      '....####....####....',
      '....#..........#....',
      '....#..........#....',
      '....................',
      '....................',
      '......#....#........',
      '......#....#........',
      '......######........',
      '....................',
      '....................',
      '....................',
      '....................'
    ],
    snakeStart: { x: 2, y: 10, dir: 'RIGHT' },
    clues: [
      {
        id: 'ink_bottle',
        name: 'Spilled Inkwell',
        col: 4,
        row: 3,
        icon: '🖋️',
        description: 'Thick black drawing ink pooling across the panel margin.'
      },
      {
        id: 'detective_badge',
        name: 'Silver Shield',
        col: 15,
        row: 4,
        icon: '🛡️',
        description: 'Badge #404 stamped Detective Snake.'
      },
      {
        id: 'torn_sketch',
        name: 'Panel Layout Sketch',
        col: 10,
        row: 9,
        icon: '🎨',
        description: 'A rough storyboard showing the crime before it was drawn.'
      },
      {
        id: 'revolver_casing',
        name: 'Spent Casing',
        col: 3,
        row: 16,
        icon: '🔫',
        description: '.38 caliber shell matching the detective’s sidearm.'
      },
      {
        id: 'fingerprint_card',
        name: 'Smudged Dossier',
        col: 15,
        row: 15,
        icon: '📁',
        description: 'Fingerprint card with Detective Snake’s own prints.'
      },
      {
        id: 'blackmail_note',
        name: 'Threatening Note',
        col: 9,
        row: 4,
        icon: '📩',
        description: '"We know what you drew in the unprinted panel."'
      },
      {
        id: 'stolen_ledger',
        name: 'Evidence Logbook',
        col: 10,
        row: 17,
        icon: '📖',
        description: 'The official casebook with pages ripped from tonight’s entry.'
      }
    ],
    requiredClues: 3,
    hasTwist: true
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
