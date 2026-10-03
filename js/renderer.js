// Renderer Module for HTML5 Canvas
import { CONFIG, GAME_STATES } from './config.js';
import { LightSystem } from './lightSystem.js';
import { InkSystem } from './inkSystem.js';

export class Renderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.cols = CONFIG.GRID_COLS;
    this.rows = CONFIG.GRID_ROWS;
    this.cellSize = CONFIG.CELL_SIZE;

    // Set internal resolution
    this.width = this.cols * this.cellSize;
    this.height = this.rows * this.cellSize;

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    } else {
      this.ctx = null;
    }

    // Initialize reusable Light System and Ink System instances
    this.lightSystem = new LightSystem(this.cellSize);
    this.inkSystem = new InkSystem(this.cols, this.rows, this.cellSize);

    this.resizeCanvas();
  }

  resizeCanvas() {
    // Sharp pixel rendering
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }
  }

  /**
   * Main render method called every frame
   */
  render(snake, lightSystem, clueSystem, gameState, deathWasInkPhase = false) {
    if (!this.ctx) return;
    const isInkPhase = (gameState === GAME_STATES.INK_PHASE) || (gameState === GAME_STATES.GAME_OVER && deathWasInkPhase);

    if (isInkPhase) {
      // --- INK PHASE: White Paper Environment & Persistent Ink Trails ---
      this.inkSystem.render(this.ctx, this.width, this.height);

      if (clueSystem) {
        clueSystem.render(this.ctx, this.cellSize, true);
      }

      if (snake) {
        this.drawSnake(snake, true);
      }
    } else {
      // --- LIGHT PHASE: Pitch Darkness & Moving Light Pools ---
      this.clear();
      this.drawGrid();

      if (clueSystem) {
        clueSystem.render(this.ctx, this.cellSize, false);
      }
      
      if (snake && (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.GAME_OVER)) {
        this.drawSnake(snake, false);
      }

      // Apply Dynamic Light & Darkness System
      this.lightSystem.render(this.ctx, this.width, this.height, snake);
    }

    this.drawComicBorder();
  }

  clear() {
    this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
    this.ctx.lineWidth = 1;

    for (let col = 0; col <= this.cols; col++) {
      const x = col * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    for (let row = 0; row <= this.rows; row++) {
      const y = row * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawSnake(snake, isInkPhase = false) {
    const { body, direction, isDead } = snake;

    this.ctx.save();

    // 1. Draw Body/Trail segments
    for (let i = body.length - 1; i >= 1; i--) {
      const seg = body[i];
      const x = seg.x * this.cellSize;
      const y = seg.y * this.cellSize;
      const pad = 2;
      const size = this.cellSize - pad * 2;

      // Body background fill
      if (isInkPhase) {
        this.ctx.fillStyle = '#08080a';
      } else {
        this.ctx.fillStyle = isDead ? CONFIG.COLORS.INK_LIGHT || '#525260' : CONFIG.COLORS.SNAKE_BODY;
      }
      this.ctx.fillRect(x + pad, y + pad, size, size);

      // Body border outline for comic feel
      this.ctx.strokeStyle = isInkPhase ? '#f5f3eb' : CONFIG.COLORS.SNAKE_OUTLINE;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + pad, y + pad, size, size);
    }

    // 2. Draw Snake Head (Detective Motif)
    if (body.length > 0) {
      const head = body[0];
      const clampedX = Math.max(0, Math.min(head.x, this.cols - 1));
      const clampedY = Math.max(0, Math.min(head.y, this.rows - 1));

      const hX = clampedX * this.cellSize;
      const hY = clampedY * this.cellSize;
      const pad = 1;
      const hSize = this.cellSize - pad * 2;

      // Head Base Fill
      if (isInkPhase) {
        this.ctx.fillStyle = '#08080a';
      } else {
        this.ctx.fillStyle = isDead ? '#888888' : CONFIG.COLORS.SNAKE_HEAD;
      }
      this.ctx.fillRect(hX + pad, hY + pad, hSize, hSize);

      // Heavy Ink Border
      this.ctx.strokeStyle = isInkPhase ? '#f5f3eb' : CONFIG.COLORS.SNAKE_OUTLINE;
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(hX + pad, hY + pad, hSize, hSize);

      // Detective Eye / Visor detail
      this.drawHeadDetails(hX, hY, hSize, direction, isDead, isInkPhase);
    }

    this.ctx.restore();
  }

  drawHeadDetails(x, y, size, direction, isDead, isInkPhase = false) {
    this.ctx.fillStyle = isInkPhase ? '#f5f3eb' : CONFIG.COLORS.SNAKE_EYE;

    if (isDead) {
      this.ctx.strokeStyle = isInkPhase ? '#f5f3eb' : CONFIG.COLORS.SNAKE_EYE;
      this.ctx.lineWidth = 2;
      
      const eye1X = x + size * 0.3;
      const eye2X = x + size * 0.7;
      const eyeY = y + size * 0.5;
      const r = 4;

      this.ctx.beginPath();
      this.ctx.moveTo(eye1X - r, eyeY - r); this.ctx.lineTo(eye1X + r, eyeY + r);
      this.ctx.moveTo(eye1X + r, eyeY - r); this.ctx.lineTo(eye1X - r, eyeY + r);
      this.ctx.moveTo(eye2X - r, eyeY - r); this.ctx.lineTo(eye2X + r, eyeY + r);
      this.ctx.moveTo(eye2X + r, eyeY - r); this.ctx.lineTo(eye2X - r, eyeY + r);
      this.ctx.stroke();
      return;
    }

    // Directional Fedora / Eye slit detail
    const cx = x + size / 2;
    const cy = y + size / 2;

    switch (direction.name) {
      case 'RIGHT':
        this.ctx.fillRect(x + size * 0.6, y + size * 0.25, size * 0.25, size * 0.2);
        this.ctx.fillRect(x + size * 0.6, y + size * 0.55, size * 0.25, size * 0.2);
        break;
      case 'LEFT':
        this.ctx.fillRect(x + size * 0.15, y + size * 0.25, size * 0.25, size * 0.2);
        this.ctx.fillRect(x + size * 0.15, y + size * 0.55, size * 0.25, size * 0.2);
        break;
      case 'UP':
        this.ctx.fillRect(x + size * 0.25, y + size * 0.15, size * 0.2, size * 0.25);
        this.ctx.fillRect(x + size * 0.55, y + size * 0.15, size * 0.2, size * 0.25);
        break;
      case 'DOWN':
        this.ctx.fillRect(x + size * 0.25, y + size * 0.6, size * 0.2, size * 0.25);
        this.ctx.fillRect(x + size * 0.55, y + size * 0.6, size * 0.2, size * 0.25);
        break;
    }
  }

  drawComicBorder() {
    this.ctx.save();
    this.ctx.strokeStyle = CONFIG.COLORS.PANEL_BORDER;
    this.ctx.lineWidth = 6;
    this.ctx.strokeRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }
}
