// Renderer Module for HTML5 Canvas
import { CONFIG } from './config.js';
import { LightSystem } from './lightSystem.js';

export class Renderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    
    this.cols = CONFIG.GRID_COLS;
    this.rows = CONFIG.GRID_ROWS;
    this.cellSize = CONFIG.CELL_SIZE;

    // Set internal resolution
    this.width = this.cols * this.cellSize;
    this.height = this.rows * this.cellSize;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Initialize reusable Light System instance
    this.lightSystem = new LightSystem(this.cellSize);

    this.resizeCanvas();
  }

  resizeCanvas() {
    // Sharp pixel rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Main render method called every frame
   */
  render(snake, gameState) {
    this.clear();
    this.drawGrid();
    
    if (snake && (gameState === 'PLAYING' || gameState === 'GAME_OVER')) {
      this.drawSnake(snake);
    }

    // Apply Dynamic Light & Darkness System
    this.lightSystem.render(this.ctx, this.width, this.height, snake);
    
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

  drawSnake(snake) {
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
      this.ctx.fillStyle = isDead ? CONFIG.COLORS.INK_LIGHT || '#525260' : CONFIG.COLORS.SNAKE_BODY;
      this.ctx.fillRect(x + pad, y + pad, size, size);

      // Body border outline for comic feel
      this.ctx.strokeStyle = CONFIG.COLORS.SNAKE_OUTLINE;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + pad, y + pad, size, size);
    }

    // 2. Draw Snake Head (Detective Motif)
    if (body.length > 0) {
      const head = body[0];
      // Clamp coordinates for dead head if wall collision occurred
      const clampedX = Math.max(0, Math.min(head.x, this.cols - 1));
      const clampedY = Math.max(0, Math.min(head.y, this.rows - 1));

      const hX = clampedX * this.cellSize;
      const hY = clampedY * this.cellSize;
      const pad = 1;
      const hSize = this.cellSize - pad * 2;

      // Head Base Fill (Paper White)
      this.ctx.fillStyle = isDead ? '#888888' : CONFIG.COLORS.SNAKE_HEAD;
      this.ctx.fillRect(hX + pad, hY + pad, hSize, hSize);

      // Heavy Ink Border
      this.ctx.strokeStyle = CONFIG.COLORS.SNAKE_OUTLINE;
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(hX + pad, hY + pad, hSize, hSize);

      // Detective Eye / Visor detail based on direction
      this.drawHeadDetails(hX, hY, hSize, direction, isDead);
    }

    this.ctx.restore();
  }

  drawHeadDetails(x, y, size, direction, isDead) {
    this.ctx.fillStyle = CONFIG.COLORS.SNAKE_EYE;

    if (isDead) {
      // Draw 'X X' dead eyes
      this.ctx.strokeStyle = CONFIG.COLORS.SNAKE_EYE;
      this.ctx.lineWidth = 2;
      
      const eye1X = x + size * 0.3;
      const eye2X = x + size * 0.7;
      const eyeY = y + size * 0.5;
      const r = 4;

      // Eye 1
      this.ctx.beginPath();
      this.ctx.moveTo(eye1X - r, eyeY - r); this.ctx.lineTo(eye1X + r, eyeY + r);
      this.ctx.moveTo(eye1X + r, eyeY - r); this.ctx.lineTo(eye1X - r, eyeY + r);
      // Eye 2
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
