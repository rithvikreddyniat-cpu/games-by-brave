// Snake Module
import { DIRECTIONS, CONFIG } from './config.js';

export class Snake {
  constructor(gridCols = CONFIG.GRID_COLS, gridRows = CONFIG.GRID_ROWS) {
    this.gridCols = gridCols;
    this.gridRows = gridRows;
    this.reset();
  }

  reset() {
    const startX = Math.floor(this.gridCols / 2);
    const startY = Math.floor(this.gridRows / 2);

    this.direction = DIRECTIONS.RIGHT;
    
    // Create initial snake body segments extending to the left
    this.body = [];
    for (let i = 0; i < CONFIG.INITIAL_SNAKE_LENGTH; i++) {
      this.body.push({
        x: startX - i,
        y: startY
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
   */
  update(nextDirection) {
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

    // For foundation snake movement (without food/growing yet), pop the tail segment to keep length constant
    this.body.pop();

    this.stepsCount++;
  }

  /**
   * Check if the snake head collided with grid walls.
   */
  checkWallCollision() {
    const { x, y } = this.head;
    return x < 0 || x >= this.gridCols || y < 0 || y >= this.gridRows;
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
