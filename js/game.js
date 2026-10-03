// Main Game Controller Module
import { GAME_STATES, CONFIG } from './config.js';
import { Snake } from './snake.js';
import { InputHandler } from './input.js';
import { Renderer } from './renderer.js';

export class Game {
  constructor() {
    this.state = GAME_STATES.TITLE;

    // DOM Elements
    this.canvas = document.getElementById('game-canvas');
    this.screenTitle = document.getElementById('screen-title');
    this.screenGameOver = document.getElementById('screen-game-over');
    this.btnStart = document.getElementById('btn-start');
    this.btnRestart = document.getElementById('btn-restart');
    this.hudStatus = document.getElementById('hud-status');
    this.hudSteps = document.getElementById('hud-steps');
    this.finalScoreVal = document.getElementById('final-score-val');

    // Modules
    this.renderer = new Renderer(this.canvas);
    this.snake = new Snake(CONFIG.GRID_COLS, CONFIG.GRID_ROWS);
    this.inputHandler = new InputHandler(() => this.handleActionTrigger());

    // Game loop timing variables
    this.lastFrameTime = 0;
    this.accumulator = 0;

    this.initEventListeners();
    this.setState(GAME_STATES.TITLE);
  }

  initEventListeners() {
    this.btnStart.addEventListener('click', () => this.handleActionTrigger());
    this.btnRestart.addEventListener('click', () => this.handleActionTrigger());

    // Window Resize handling for canvas scaling
    window.addEventListener('resize', () => {
      this.renderer.resizeCanvas();
    });
  }

  handleActionTrigger() {
    if (this.state === GAME_STATES.TITLE) {
      this.startGame();
    } else if (this.state === GAME_STATES.GAME_OVER) {
      this.restartGame();
    }
  }

  setState(newState) {
    this.state = newState;

    switch (newState) {
      case GAME_STATES.TITLE:
        this.screenTitle.classList.remove('hidden');
        this.screenTitle.classList.add('active');
        this.screenGameOver.classList.add('hidden');
        this.screenGameOver.classList.remove('active');
        this.hudStatus.textContent = 'STANDBY';
        break;

      case GAME_STATES.PLAYING:
        this.screenTitle.classList.add('hidden');
        this.screenTitle.classList.remove('active');
        this.screenGameOver.classList.add('hidden');
        this.screenGameOver.classList.remove('active');
        this.hudStatus.textContent = 'INVESTIGATING';
        break;

      case GAME_STATES.GAME_OVER:
        this.screenGameOver.classList.remove('hidden');
        this.screenGameOver.classList.add('active');
        this.screenTitle.classList.add('hidden');
        this.screenTitle.classList.remove('active');
        this.hudStatus.textContent = 'CASE CLOSED';
        this.finalScoreVal.textContent = this.snake.stepsCount;
        break;
    }
  }

  startGame() {
    this.snake.reset();
    this.inputHandler.reset();
    this.accumulator = 0;
    this.setState(GAME_STATES.PLAYING);
  }

  restartGame() {
    this.startGame();
  }

  startLoop() {
    this.lastFrameTime = performance.now();
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    if (this.state === GAME_STATES.PLAYING) {
      this.accumulator += deltaTime;

      // Update grid step when accumulator reaches tick interval
      while (this.accumulator >= CONFIG.TICK_INTERVAL_MS) {
        this.tick();
        this.accumulator -= CONFIG.TICK_INTERVAL_MS;
      }
    }

    // Render frame
    this.renderer.render(this.snake, this.state);

    requestAnimationFrame((ts) => this.loop(ts));
  }

  tick() {
    // Get next direction from input queue
    const nextDir = this.inputHandler.popNextDirection();
    
    // Advance snake 1 step
    this.snake.update(nextDir);

    // Update HUD steps
    this.hudSteps.textContent = this.snake.stepsCount;

    // Check collisions
    if (this.snake.checkWallCollision() || this.snake.checkSelfCollision()) {
      this.snake.isDead = true;
      this.setState(GAME_STATES.GAME_OVER);
    }
  }
}
