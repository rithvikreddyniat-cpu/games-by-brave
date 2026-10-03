// Ink System Module for Rule Reversal & Dark Ink Erasure
import { CONFIG } from './config.js';

export class InkSystem {
  constructor(cols = CONFIG.GRID_COLS, rows = CONFIG.GRID_ROWS, cellSize = CONFIG.CELL_SIZE) {
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;

    this.reset();
  }

  reset() {
    // 2D grid matrix recording persistent ink coverage
    this.inkGrid = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
    this.inkedCount = 0;
  }

  /**
   * Deposit dark ink onto current snake position
   * @param {Object} snake - Snake instance
   * @param {Array<string>} walls - Optional case walls
   */
  depositInk(snake, walls = null) {
    if (!snake || !snake.body) return;

    // Deposit ink under all current snake segments
    for (const seg of snake.body) {
      if (seg.x >= 0 && seg.x < this.cols && seg.y >= 0 && seg.y < this.rows) {
        if (walls && walls[seg.y] && walls[seg.y][seg.x] === '#') {
          continue; // Do not count wall cells
        }
        if (!this.inkGrid[seg.y][seg.x]) {
          this.inkGrid[seg.y][seg.x] = true;
          this.inkedCount++;
        }
      }
    }
  }

  /**
   * Get current ink coverage ratio (0.0 to 1.0)
   * @param {number} freeCells - Total number of non-wall cells
   */
  getCoverage(freeCells) {
    if (!freeCells || freeCells <= 0) return 0;
    return this.inkedCount / freeCells;
  }

  /**
   * Check if a specific grid cell is covered by dark ink
   */
  isCellInked(col, row) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      return this.inkGrid[row][col];
    }
    return false;
  }

  /**
   * Render the Ink Phase environment and dark ink trails
   */
  render(ctx, width, height) {
    ctx.save();

    // 1. Fully illuminate the comic paper background during INK_PHASE
    ctx.fillStyle = '#f5f3eb';
    ctx.fillRect(0, 0, width, height);

    // 2. Render subtle dark ink grid lines for comic panel contrast
    ctx.strokeStyle = 'rgba(8, 8, 10, 0.12)';
    ctx.lineWidth = 1;

    for (let col = 0; col <= this.cols; col++) {
      const x = col * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let row = 0; row <= this.rows; row++) {
      const y = row * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Render persistent dark ink stains deposited by the snake
    ctx.fillStyle = '#08080a';

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.inkGrid[r][c]) {
          const x = c * this.cellSize;
          const y = r * this.cellSize;
          ctx.fillRect(x, y, this.cellSize, this.cellSize);
        }
      }
    }

    ctx.restore();
  }
}
