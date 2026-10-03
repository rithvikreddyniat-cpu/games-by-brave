// Clue System Module for Investigation Mechanics
export class ClueSystem {
  constructor(cols = 20, rows = 20) {
    this.cols = cols;
    this.rows = rows;

    // Define 5 handcrafted clues across the grid
    this.initialClues = [
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
    ];

    this.reset();
  }

  reset() {
    // Clone initial clue data with initial state
    this.clues = this.initialClues.map(c => ({
      ...c,
      isDiscovered: false,
      isCollected: false
    }));
  }

  /**
   * Update discovery and collection state based on snake position and light system
   * @param {Object} snake - Snake instance
   * @param {Object} lightSystem - LightSystem instance
   * @returns {Object|null} Returns newly collected clue object if collected this step
   */
  update(snake, lightSystem) {
    if (!snake || !snake.head || !lightSystem) return null;

    let newlyCollected = null;

    for (const clue of this.clues) {
      if (clue.isCollected) continue;

      // 1. Check if illuminated by light system
      if (!clue.isDiscovered) {
        if (lightSystem.isCellIlluminated(clue.col, clue.row, snake)) {
          clue.isDiscovered = true;
        }
      }

      // 2. Check if Snake head steps on clue cell
      if (snake.head.x === clue.col && snake.head.y === clue.row) {
        clue.isCollected = true;
        clue.isDiscovered = true;
        newlyCollected = clue;
      }
    }

    return newlyCollected;
  }

  getStats() {
    const total = this.clues.length;
    const collected = this.clues.filter(c => c.isCollected).length;
    const discovered = this.clues.filter(c => c.isDiscovered).length;

    return { total, collected, discovered };
  }

  /**
   * Render revealed clues onto the canvas
   */
  render(ctx, cellSize) {
    ctx.save();

    for (const clue of this.clues) {
      // Only render if discovered (illuminated or collected)
      if (!clue.isDiscovered && !clue.isCollected) continue;

      const x = clue.col * cellSize;
      const y = clue.row * cellSize;
      const pad = 3;
      const size = cellSize - pad * 2;

      if (clue.isCollected) {
        // Collected clue marker (subtle pulse ring / check mark)
        ctx.strokeStyle = 'rgba(245, 243, 235, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x + pad, y + pad, size, size);
        ctx.setLineDash([]);
      } else {
        // Uncollected revealed clue (glowing noir evidence marker)
        ctx.fillStyle = '#f5f3eb';
        ctx.fillRect(x + pad, y + pad, size, size);

        ctx.strokeStyle = '#08080a';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + pad, y + pad, size, size);

        // Evidence marker badge symbol
        ctx.fillStyle = '#08080a';
        ctx.font = `bold ${Math.floor(cellSize * 0.55)}px var(--font-headline), monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', x + cellSize / 2, y + cellSize / 2 + 1);
      }
    }

    ctx.restore();
  }
}
