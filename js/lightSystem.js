// Light System Module for Dynamic Noir Illumination
import { CONFIG } from './config.js';

export class LightSystem {
  constructor(cellSize = CONFIG.CELL_SIZE) {
    this.cellSize = cellSize;
    this.headRadius = cellSize * 3.6;
    this.trailRadius = cellSize * 2.4;
    this.darknessOpacity = 0.96;
    this.maskCanvas = null;
    this.maskCtx = null;
  }

  setScale(scale = 1.0) {
    this.headRadius = this.cellSize * 3.6 * scale;
    this.trailRadius = this.cellSize * 2.4 * scale;
  }

  /**
   * Check if a grid cell (col, row) is currently illuminated by the snake head or trail.
   * Reusable for future clue/evidence visibility queries.
   * @param {number} col - Grid column index
   * @param {number} row - Grid row index
   * @param {Object} snake - Snake instance
   * @returns {boolean}
   */
  isCellIlluminated(col, row, snake) {
    if (!snake || !snake.body || snake.body.length === 0) return false;

    // Convert cell coordinates to center pixel position
    const cellPx = (col + 0.5) * this.cellSize;
    const cellPy = (row + 0.5) * this.cellSize;

    return this.isPositionIlluminated(cellPx, cellPy, snake);
  }

  /**
   * Check if a pixel position (x, y) is currently illuminated by the snake head or trail.
   * Reusable for future object/clue visibility checks.
   * @param {number} x - Pixel X position on canvas
   * @param {number} y - Pixel Y position on canvas
   * @param {Object} snake - Snake instance
   * @returns {boolean}
   */
  isPositionIlluminated(x, y, snake) {
    if (!snake || !snake.body || snake.body.length === 0) return false;

    // 1. Check distance to snake head
    const head = snake.body[0];
    const headPx = (head.x + 0.5) * this.cellSize;
    const headPy = (head.y + 0.5) * this.cellSize;
    const distToHead = Math.hypot(x - headPx, y - headPy);

    if (distToHead <= this.headRadius) {
      return true;
    }

    // 2. Check distance to each body/trail segment
    for (let i = 1; i < snake.body.length; i++) {
      const seg = snake.body[i];
      const segPx = (seg.x + 0.5) * this.cellSize;
      const segPy = (seg.y + 0.5) * this.cellSize;
      const distToSeg = Math.hypot(x - segPx, y - segPy);

      if (distToSeg <= this.trailRadius) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate exact illumination intensity (0.0 to 1.0) at a specific pixel position.
   * @param {number} x - Pixel X position on canvas
   * @param {number} y - Pixel Y position on canvas
   * @param {Object} snake - Snake instance
   * @returns {number} Intensity from 0.0 (pitch black) to 1.0 (fully lit)
   */
  getIlluminationIntensity(x, y, snake) {
    if (!snake || !snake.body || snake.body.length === 0) return 0;

    let maxIntensity = 0;

    // Head intensity calculation
    const head = snake.body[0];
    const headPx = (head.x + 0.5) * this.cellSize;
    const headPy = (head.y + 0.5) * this.cellSize;
    const distHead = Math.hypot(x - headPx, y - headPy);

    if (distHead < this.headRadius) {
      const intensity = 1 - (distHead / this.headRadius);
      maxIntensity = Math.max(maxIntensity, intensity);
    }

    // Trail intensity calculation
    for (let i = 1; i < snake.body.length; i++) {
      const seg = snake.body[i];
      const segPx = (seg.x + 0.5) * this.cellSize;
      const segPy = (seg.y + 0.5) * this.cellSize;
      const distSeg = Math.hypot(x - segPx, y - segPy);

      if (distSeg < this.trailRadius) {
        const fadeFactor = 1 - (i / snake.body.length) * 0.3;
        const intensity = (1 - (distSeg / this.trailRadius)) * fadeFactor;
        maxIntensity = Math.max(maxIntensity, intensity);
      }
    }

    return Math.min(1, Math.max(0, maxIntensity));
  }

  /**
   * Render the darkness mask and radial light sources onto the canvas context.
   * Builds darkness mask on an offscreen canvas and overlays it onto main canvas.
   */
  render(ctx, width, height, snake) {
    if (!snake || !snake.body || snake.body.length === 0) return;

    // 1. Lazy creation or resize of offscreen mask canvas
    if (!this.maskCanvas) {
      this.maskCanvas = document.createElement('canvas');
      this.maskCanvas.width = width;
      this.maskCanvas.height = height;
      this.maskCtx = this.maskCanvas.getContext('2d');
    } else if (this.maskCanvas.width !== width || this.maskCanvas.height !== height) {
      this.maskCanvas.width = width;
      this.maskCanvas.height = height;
    }

    const maskCtx = this.maskCtx;
    if (!maskCtx) return;

    // 2. Clear offscreen canvas & fill with dark background mask
    maskCtx.clearRect(0, 0, width, height);
    maskCtx.fillStyle = `rgba(5, 5, 8, ${this.darknessOpacity})`;
    maskCtx.fillRect(0, 0, width, height);

    // 3. Carve out illuminated pools using 'destination-out' blending on offscreen canvas
    maskCtx.globalCompositeOperation = 'destination-out';

    // A. Carve trail segments light (from tail to index 1)
    for (let i = snake.body.length - 1; i >= 1; i--) {
      const seg = snake.body[i];
      const cx = (seg.x + 0.5) * this.cellSize;
      const cy = (seg.y + 0.5) * this.cellSize;
      
      const tailFade = 1 - (i / snake.body.length) * 0.25;
      const radius = this.trailRadius * tailFade;

      const grad = maskCtx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      maskCtx.fillStyle = grad;
      maskCtx.beginPath();
      maskCtx.arc(cx, cy, radius, 0, Math.PI * 2);
      maskCtx.fill();
    }

    // B. Carve head light pool
    const head = snake.body[0];
    const headCx = (head.x + 0.5) * this.cellSize;
    const headCy = (head.y + 0.5) * this.cellSize;

    const headGrad = maskCtx.createRadialGradient(
      headCx, headCy, this.headRadius * 0.25,
      headCx, headCy, this.headRadius
    );
    headGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    headGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.9)');
    headGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    maskCtx.fillStyle = headGrad;
    maskCtx.beginPath();
    maskCtx.arc(headCx, headCy, this.headRadius, 0, Math.PI * 2);
    maskCtx.fill();

    // Reset composite operation back to default
    maskCtx.globalCompositeOperation = 'source-over';

    // 4. Draw the carved darkness mask over the main canvas
    ctx.drawImage(this.maskCanvas, 0, 0);
  }
}
