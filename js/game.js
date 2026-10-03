// Main Game Controller Module
import { GAME_STATES, CONFIG } from './config.js';
import { Snake } from './snake.js';
import { InputHandler } from './input.js';
import { Renderer } from './renderer.js';
import { ClueSystem } from './clueSystem.js';
import { ReconstructionSystem } from './reconstructionSystem.js';

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

    // M3 Evidence & Case Board DOM Elements
    this.evidenceToast = document.getElementById('evidence-toast');
    this.toastTitle = document.getElementById('toast-title');
    this.toastDesc = document.getElementById('toast-desc');
    this.btnToastDismiss = document.getElementById('btn-toast-dismiss');
    
    this.modalCaseboard = document.getElementById('modal-caseboard');
    this.caseboardSummary = document.getElementById('caseboard-summary');
    this.caseboardList = document.getElementById('caseboard-list');
    this.btnCloseCaseboard = document.getElementById('btn-close-caseboard');
    this.btnOpenCaseboard = document.getElementById('btn-open-caseboard');
    this.hudClues = document.getElementById('hud-clues');
    this.finalCluesVal = document.getElementById('final-clues-val');

    // M4 Reconstruction DOM Elements
    this.modalReconstruction = document.getElementById('modal-reconstruction');
    this.reconstructEvidenceBadges = document.getElementById('reconstruct-evidence-badges');
    this.reconstructQuestions = document.getElementById('reconstruct-questions');
    this.btnConfirmTheory = document.getElementById('btn-confirm-theory');
    this.btnOpenReconstruct = document.getElementById('btn-open-reconstruct');
    this.caseboardTheoryBox = document.getElementById('caseboard-theory-box');
    this.caseboardTheoryText = document.getElementById('caseboard-theory-text');
    this.finalTheoryBox = document.getElementById('final-theory-box');
    this.finalTheoryText = document.getElementById('final-theory-text');

    // Modules
    this.renderer = new Renderer(this.canvas);
    this.snake = new Snake(CONFIG.GRID_COLS, CONFIG.GRID_ROWS);
    this.clueSystem = new ClueSystem(CONFIG.GRID_COLS, CONFIG.GRID_ROWS);
    this.reconstructionSystem = new ReconstructionSystem();
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
    
    // Case Board Modal controls
    if (this.btnOpenCaseboard) {
      this.btnOpenCaseboard.addEventListener('click', () => this.toggleCaseBoard());
    }
    if (this.btnCloseCaseboard) {
      this.btnCloseCaseboard.addEventListener('click', () => this.toggleCaseBoard(false));
    }
    if (this.btnToastDismiss) {
      this.btnToastDismiss.addEventListener('click', () => this.dismissToast());
    }

    // M4 Reconstruction Modal controls
    if (this.btnOpenReconstruct) {
      this.btnOpenReconstruct.addEventListener('click', () => this.toggleReconstructionModal());
    }
    if (this.btnConfirmTheory) {
      this.btnConfirmTheory.addEventListener('click', () => this.confirmTheorySelection());
    }

    // Keyboard listener for shortcuts [KeyC] Caseboard, [KeyR] Reconstruct, [Space/Enter] Actions
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyC') {
        e.preventDefault();
        this.toggleCaseBoard();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        const stats = this.clueSystem.getStats();
        if (this.reconstructionSystem.isUnlocked(stats.collected)) {
          this.toggleReconstructionModal();
        }
      } else if ((e.code === 'Enter' || e.code === 'Space') && this.evidenceToast && !this.evidenceToast.classList.contains('hidden')) {
        this.dismissToast();
      } else if (e.code === 'Enter' && this.modalReconstruction && !this.modalReconstruction.classList.contains('hidden')) {
        this.confirmTheorySelection();
      }
    });

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
        this.hudStatus.textContent = this.reconstructionSystem.isSubmitted ? 'THEORY BUILT' : 'INVESTIGATING';
        break;

      case GAME_STATES.GAME_OVER:
        this.screenGameOver.classList.remove('hidden');
        this.screenGameOver.classList.add('active');
        this.screenTitle.classList.add('hidden');
        this.screenTitle.classList.remove('active');
        this.hudStatus.textContent = 'CASE CLOSED';
        
        const stats = this.clueSystem.getStats();
        if (this.finalCluesVal) {
          this.finalCluesVal.textContent = `${stats.collected} / ${stats.total}`;
        }
        if (this.finalTheoryBox) {
          if (this.reconstructionSystem.isSubmitted) {
            const summary = this.reconstructionSystem.getSummary();
            this.finalTheoryText.textContent = `${summary.entry} | ${summary.suspect}`;
            this.finalTheoryBox.classList.remove('hidden');
          } else {
            this.finalTheoryBox.classList.add('hidden');
          }
        }
        break;
    }
  }

  startGame() {
    this.snake.reset();
    this.clueSystem.reset();
    this.reconstructionSystem.reset();
    this.inputHandler.reset();
    this.accumulator = 0;

    this.dismissToast();
    this.toggleCaseBoard(false);
    this.toggleReconstructionModal(false);
    
    if (this.btnOpenReconstruct) {
      this.btnOpenReconstruct.classList.add('hidden');
    }
    this.updateHUDClues();

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
    this.renderer.render(this.snake, this.renderer.lightSystem, this.clueSystem, this.state);

    requestAnimationFrame((ts) => this.loop(ts));
  }

  tick() {
    // Get next direction from input queue
    const nextDir = this.inputHandler.popNextDirection();
    
    // Advance snake 1 step
    this.snake.update(nextDir);

    // Update HUD steps
    this.hudSteps.textContent = this.snake.stepsCount;

    // Check & update clue discovery/collection
    const newlyCollected = this.clueSystem.update(this.snake, this.renderer.lightSystem);
    if (newlyCollected) {
      this.showToast(newlyCollected);
      this.updateHUDClues();
    } else {
      this.updateHUDClues();
    }

    // M4 Reconstruction Trigger Check
    const stats = this.clueSystem.getStats();
    if (this.reconstructionSystem.isUnlocked(stats.collected)) {
      if (this.btnOpenReconstruct) {
        this.btnOpenReconstruct.classList.remove('hidden');
      }
      if (!this.reconstructionSystem.autoPromptTriggered) {
        this.reconstructionSystem.autoPromptTriggered = true;
        this.toggleReconstructionModal(true);
      }
    }

    // Check collisions
    if (this.snake.checkWallCollision() || this.snake.checkSelfCollision()) {
      this.snake.isDead = true;
      this.setState(GAME_STATES.GAME_OVER);
    }
  }

  showToast(clue) {
    if (!this.evidenceToast) return;
    this.toastTitle.textContent = clue.name.toUpperCase();
    this.toastDesc.textContent = `"${clue.description}"`;
    this.evidenceToast.classList.remove('hidden');
  }

  dismissToast() {
    if (!this.evidenceToast) return;
    this.evidenceToast.classList.add('hidden');
  }

  toggleCaseBoard(forceState = null) {
    if (!this.modalCaseboard) return;

    const shouldShow = (forceState !== null) 
      ? forceState 
      : this.modalCaseboard.classList.contains('hidden');

    if (shouldShow) {
      this.updateCaseBoardUI();
      this.modalCaseboard.classList.remove('hidden');
      this.modalCaseboard.classList.add('active');
    } else {
      this.modalCaseboard.classList.add('hidden');
      this.modalCaseboard.classList.remove('active');
    }
  }

  toggleReconstructionModal(forceState = null) {
    if (!this.modalReconstruction) return;

    const shouldShow = (forceState !== null)
      ? forceState
      : this.modalReconstruction.classList.contains('hidden');

    if (shouldShow) {
      this.renderReconstructionUI();
      this.modalReconstruction.classList.remove('hidden');
      this.modalReconstruction.classList.add('active');
    } else {
      this.modalReconstruction.classList.add('hidden');
      this.modalReconstruction.classList.remove('active');
    }
  }

  renderReconstructionUI() {
    if (!this.reconstructEvidenceBadges || !this.reconstructQuestions) return;

    // 1. Render Collected Evidence Badges
    this.reconstructEvidenceBadges.innerHTML = '';
    const collectedClues = this.clueSystem.clues.filter(c => c.isCollected);
    collectedClues.forEach(c => {
      const badge = document.createElement('div');
      badge.className = 'evidence-badge';
      badge.textContent = `${c.icon} ${c.name}`;
      this.reconstructEvidenceBadges.appendChild(badge);
    });

    // 2. Render Reconstruction Questions & Options
    this.reconstructQuestions.innerHTML = '';
    this.reconstructionSystem.questions.forEach((q) => {
      const card = document.createElement('div');
      card.className = 'question-card';

      const currentSelected = this.reconstructionSystem.selectedChoices[q.id];

      let optionsHTML = '';
      q.options.forEach(opt => {
        const isSel = (opt.id === currentSelected);
        optionsHTML += `
          <button class="option-btn ${isSel ? 'selected' : ''}" data-qid="${q.id}" data-optid="${opt.id}">
            ${isSel ? '✓ ' : ''}${opt.label}
            <div style="font-size:0.75rem; font-weight:normal; margin-top:2px; opacity:0.8;">${opt.desc}</div>
          </button>
        `;
      });

      card.innerHTML = `
        <div class="question-title">${q.title}</div>
        <div class="question-ref">SUPPORTING EVIDENCE: ${q.evidenceRef}</div>
        <div class="options-group">${optionsHTML}</div>
      `;

      this.reconstructQuestions.appendChild(card);
    });

    // Event Delegation for option buttons
    const optButtons = this.reconstructQuestions.querySelectorAll('.option-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const qId = target.getAttribute('data-qid');
        const optId = target.getAttribute('data-optid');
        if (qId && optId) {
          this.reconstructionSystem.selectOption(qId, optId);
          this.renderReconstructionUI();
        }
      });
    });
  }

  confirmTheorySelection() {
    this.reconstructionSystem.confirmTheory();
    this.toggleReconstructionModal(false);
    this.hudStatus.textContent = 'THEORY BUILT';
    this.updateCaseBoardUI();
  }

  updateHUDClues() {
    const stats = this.clueSystem.getStats();
    if (this.hudClues) {
      this.hudClues.textContent = `${stats.collected}/${stats.total}`;
    }
  }

  updateCaseBoardUI() {
    const stats = this.clueSystem.getStats();
    if (this.caseboardSummary) {
      this.caseboardSummary.textContent = `CLUES COLLECTED: ${stats.collected} / ${stats.total}`;
    }

    if (this.caseboardTheoryBox) {
      if (this.reconstructionSystem.isSubmitted) {
        const summary = this.reconstructionSystem.getSummary();
        this.caseboardTheoryText.textContent = `${summary.entry} | ${summary.suspect}`;
        this.caseboardTheoryBox.classList.remove('hidden');
      } else {
        this.caseboardTheoryBox.classList.add('hidden');
      }
    }

    if (!this.caseboardList) return;
    this.caseboardList.innerHTML = '';

    this.clueSystem.clues.forEach((clue) => {
      const li = document.createElement('li');
      let statusClass = 'undiscovered';
      let statusText = '? UNDISCOVERED';

      if (clue.isCollected) {
        statusClass = 'collected';
        statusText = '✓ COLLECTED';
      } else if (clue.isDiscovered) {
        statusClass = 'discovered';
        statusText = '🔍 DISCOVERED';
      }

      li.className = `caseboard-item ${statusClass}`;
      li.innerHTML = `
        <div class="case-info">
          <strong>${clue.isDiscovered || clue.isCollected ? clue.name : 'Unknown Evidence'}</strong>
          <div class="case-desc">${clue.isCollected ? clue.description : (clue.isDiscovered ? 'Discovered in panel. Reach it to collect.' : 'Hidden in darkness.')}</div>
        </div>
        <div class="case-status-tag">${statusText}</div>
      `;
      this.caseboardList.appendChild(li);
    });
  }

  /**
   * Reusable Light System Query for pixel position.
   */
  isPositionIlluminated(x, y) {
    return this.renderer.lightSystem.isPositionIlluminated(x, y, this.snake);
  }

  /**
   * Reusable Light System Query for grid cell coordinates.
   */
  isCellIlluminated(col, row) {
    return this.renderer.lightSystem.isCellIlluminated(col, row, this.snake);
  }
}
