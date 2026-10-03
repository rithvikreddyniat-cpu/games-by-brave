// Clue System Module for Investigation Mechanics & Ink Erasure
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
      isCollected: false,
      isLost: false
    }));
  }

  /**
   * Update discovery, collection, and ink erasure state based on game phase
   * @param {Object} snake - Snake instance
   * @param {Object} lightSystem - LightSystem instance
   * @param {boolean} isInkPhase - Whether the game is in INK_PHASE rule reversal
   * @returns {Object|null} Returns object with { type: 'COLLECTED'|'ERASED', clue } if triggered this step
   */
  update(snake, lightSystem, isInkPhase = false) {
    if (!snake || !snake.head) return null;

    let result = null;

    for (const clue of this.clues) {
      if (isInkPhase) {
        // --- INK PHASE: Movement -> Dark Ink -> Evidence Erased ---
        if (!clue.isLost && snake.head.x === clue.col && snake.head.y === clue.row) {
          clue.isLost = true;
          result = { type: 'ERASED', clue };
        }
      } else {
        // --- LIGHT PHASE: Movement -> Light -> Evidence Discovered/Collected ---
        if (clue.isCollected) continue;

        // 1. Check if illuminated by light system
        if (!clue.isDiscovered && lightSystem) {
          if (lightSystem.isCellIlluminated(clue.col, clue.row, snake)) {
            clue.isDiscovered = true;
          }
        }

        // 2. Check if Snake head steps on clue cell
        if (snake.head.x === clue.col && snake.head.y === clue.row) {
          clue.isCollected = true;
          clue.isDiscovered = true;
          result = { type: 'COLLECTED', clue };
        }
      }
    }

    return result;
  }

  getStats() {
    const total = this.clues.length;
    const collected = this.clues.filter(c => c.isCollected && !c.isLost).length;
    const discovered = this.clues.filter(c => c.isDiscovered && !c.isLost).length;
    const lost = this.clues.filter(c => c.isLost).length;

    return { total, collected, discovered, lost };
  }

  /**
   * Render revealed / erased clues onto the canvas
   */
  render(ctx, cellSize, isInkPhase = false) {
    ctx.save();

    for (const clue of this.clues) {
      const x = clue.col * cellSize;
      const y = clue.row * cellSize;
      const pad = 3;
      const size = cellSize - pad * 2;

      if (clue.isLost) {
        // Erased Ink Clue Marker (Red/Black slashed evidence marker)
        ctx.fillStyle = '#08080a';
        ctx.fillRect(x + pad, y + pad, size, size);

        ctx.strokeStyle = '#f5f3eb';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + pad, y + pad, size, size);

        // Crossed-out X symbol
        ctx.strokeStyle = '#d32f2f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + pad + 4, y + pad + 4);
        ctx.lineTo(x + pad + size - 4, y + pad + size - 4);
        ctx.moveTo(x + pad + size - 4, y + pad + 4);
        ctx.lineTo(x + pad + 4, y + pad + size - 4);
        ctx.stroke();

      } else if (isInkPhase) {
        // In INK PHASE, all non-erased clues are visible on the paper white map
        ctx.fillStyle = '#08080a';
        ctx.fillRect(x + pad, y + pad, size, size);

        ctx.strokeStyle = '#f5f3eb';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + pad, y + pad, size, size);

        ctx.fillStyle = '#f5f3eb';
        ctx.font = `${Math.floor(cellSize * 0.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(clue.icon, x + cellSize / 2, y + cellSize / 2);

      } else {
        // LIGHT PHASE rendering
        if (!clue.isDiscovered && !clue.isCollected) continue;

        if (clue.isCollected) {
          ctx.strokeStyle = 'rgba(245, 243, 235, 0.4)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(x + pad, y + pad, size, size);
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = '#f5f3eb';
          ctx.fillRect(x + pad, y + pad, size, size);

          ctx.strokeStyle = '#08080a';
          ctx.lineWidth = 3;
          ctx.strokeRect(x + pad, y + pad, size, size);

          ctx.fillStyle = '#08080a';
          ctx.font = `bold ${Math.floor(cellSize * 0.6)}px "Courier New", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', x + cellSize / 2, y + cellSize / 2 + 1);
        }
      }
    }

    ctx.restore();
  }
}
