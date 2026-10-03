// Input Handler Module
import { DIRECTIONS, OPPOSITE_DIRECTIONS } from './config.js';

export class InputHandler {
  constructor(onActionTrigger) {
    this.onActionTrigger = onActionTrigger; // Callback for Space/Enter/Start action
    this.inputQueue = [];
    this.currentDirection = DIRECTIONS.RIGHT;

    this.initKeyboard();
    this.initTouchControls();
    this.initSwipe();
  }

  reset(defaultDirection = DIRECTIONS.RIGHT) {
    this.inputQueue = [];
    this.currentDirection = defaultDirection;
  }

  enqueueDirection(newDirName) {
    if (!DIRECTIONS[newDirName]) return;

    // Last direction in queue or current direction
    const lastDirName = this.inputQueue.length > 0
      ? this.inputQueue[this.inputQueue.length - 1]
      : this.currentDirection.name;

    // Prevent immediate 180-degree reversal
    if (OPPOSITE_DIRECTIONS[lastDirName] !== newDirName && lastDirName !== newDirName) {
      if (this.inputQueue.length < 2) {
        this.inputQueue.push(newDirName);
      }
    }
  }

  popNextDirection() {
    if (this.inputQueue.length > 0) {
      const nextDirName = this.inputQueue.shift();
      this.currentDirection = DIRECTIONS[nextDirName];
    }
    return this.currentDirection;
  }

  initKeyboard() {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', (e) => {
      // Prevent default page scrolling for game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space', 'Enter', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code) || ['Space', ' '].includes(e.key)) {
        if (e.target && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
        }
      }

      switch (e.code) {
        // Up
        case 'ArrowUp':
        case 'KeyW':
          this.enqueueDirection('UP');
          break;
        // Down
        case 'ArrowDown':
        case 'KeyS':
          this.enqueueDirection('DOWN');
          break;
        // Left
        case 'ArrowLeft':
        case 'KeyA':
          this.enqueueDirection('LEFT');
          break;
        // Right
        case 'ArrowRight':
        case 'KeyD':
          this.enqueueDirection('RIGHT');
          break;
        // Action / Start / Restart
        case 'Space':
        case 'Enter':
          if (this.onActionTrigger) this.onActionTrigger();
          break;
      }
    });
  }

  initTouchControls() {
    if (typeof document === 'undefined') return;
    // Touch D-Pad buttons with clean single event handling
    const dpadButtons = document.querySelectorAll('.dpad-btn');
    if (dpadButtons) {
      dpadButtons.forEach((btn) => {
        const dir = btn.getAttribute('data-dir');
        if (dir) {
          const handleTrigger = (e) => {
            e.preventDefault();
            this.enqueueDirection(dir);
          };

          btn.addEventListener('pointerdown', handleTrigger);
        }
      });
    }
  }

  initSwipe() {
    if (typeof document === 'undefined') return;
    let touchStartX = 0;
    let touchStartY = 0;
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        const minSwipeDistance = 24;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) this.enqueueDirection('RIGHT');
            else this.enqueueDirection('LEFT');
          }
        } else {
          if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) this.enqueueDirection('DOWN');
            else this.enqueueDirection('UP');
          }
        }
      }
    }, { passive: true });
  }
}
