// Snake Module
import { DIRECTIONS, CONFIG } from './config.js';

export class Snake {
  constructor(gridCols = CONFIG.GRID_COLS, gridRows = CONFIG.GRID_ROWS) {
    this.gridCols = gridCols;
    this.gridRows = gridRows;
    this.reset();
  }

  reset(snakeStart = null) {
    const startX = snakeStart ? snakeStart.x : Math.floor(this.gridCols / 2);
    const startY = snakeStart ? snakeStart.y : Math.floor(this.gridRows / 2);
    const initialDirName = snakeStart ? snakeStart.dir : 'RIGHT';
    this.direction = DIRECTIONS[initialDirName] || DIRECTIONS.RIGHT;

    const dx = this.direction.x;
    const dy = this.direction.y;

    // Create initial snake body segments extending backward from initial direction
    this.body = [];
    for (let i = 0; i < CONFIG.INITIAL_SNAKE_LENGTH; i++) {
      this.body.push({
        x: startX - (dx * i),
        y: startY - (dy * i)
      });
    }

    this.stepsCount = 0;
    this.isDead = false;
  }

  get head() {
    return this.body[0];
  }

  get tail() {
    return this.body.slice(1);
  }

  /**
   * Move the snake forward 1 step in the specified direction.
   * @param {Object} nextDirection - Direction object {x, y, name}
   * @param {boolean} shouldGrow - Whether to grow snake by 1 segment (skip tail pop)
   */
  update(nextDirection, shouldGrow = false) {
    if (this.isDead) return;

    if (nextDirection) {
      this.direction = nextDirection;
    }

    // Calculate new head position
    const newHead = {
      x: this.head.x + this.direction.x,
      y: this.head.y + this.direction.y
    };

    // Unshift new head position onto body array
    this.body.unshift(newHead);

    // If not growing, pop tail segment to keep length constant
    if (!shouldGrow) {
      this.body.pop();
    }

    this.stepsCount++;
  }

  /**
   * Grow the snake by duplicating the tail segment (skips tail removal effect)
   */
  grow() {
    if (this.body.length > 0) {
      const tailSeg = this.body[this.body.length - 1];
      this.body.push({ x: tailSeg.x, y: tailSeg.y });
    }
  }

  /**
   * Check if the snake head collided with grid boundaries or interior walls.
   * @param {Array<string>} walls - Optional 20x20 wall grid array
   */
  checkWallCollision(walls = null) {
    const { x, y } = this.head;
    if (x < 0 || x >= this.gridCols || y < 0 || y >= this.gridRows) {
      return true;
    }
    if (walls && walls[y] && walls[y][x] === '#') {
      return true;
    }
    return false;
  }

  /**
   * Check if the snake head collided with any part of its body.
   */
  checkSelfCollision() {
    const { x, y } = this.head;
    // Compare head position against all body segments starting from index 1
    for (let i = 1; i < this.body.length; i++) {
      if (this.body[i].x === x && this.body[i].y === y) {
        return true;
      }
    }
    return false;
  }
}
