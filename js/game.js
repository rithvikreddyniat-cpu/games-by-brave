import { GAME_STATES, CONFIG } from './config.js';
import { Snake } from './snake.js';
import { InputHandler } from './input.js';
import { Renderer } from './renderer.js';
import { ClueSystem } from './clueSystem.js';
import { ReconstructionSystem } from './reconstructionSystem.js';
import { CASES } from './cases.js';
import { sfx } from './audio.js';

export class Game {
  constructor() {
    this.state = GAME_STATES.TITLE;
    this.currentCaseIndex = 0;

    // DOM Elements
    this.canvas = document.getElementById('game-canvas');
    this.panelFrame = document.getElementById('panel-frame');
    this.panelTag = document.getElementById('panel-tag');
    this.screenTitle = document.getElementById('screen-title');
    this.screenGameOver = document.getElementById('screen-game-over');
    this.btnStart = document.getElementById('btn-start');
    this.btnRestart = document.getElementById('btn-restart');
    this.hudStatus = document.getElementById('hud-status');
    this.hudSteps = document.getElementById('hud-steps');
    this.hudCaseNum = document.getElementById('hud-case-num');

    // Case Intro & Solved DOM Elements
    this.screenCaseIntro = document.getElementById('screen-case-intro');
    this.caseIntroTag = document.getElementById('case-intro-tag');
    this.caseIntroTitle = document.getElementById('case-intro-title');
    this.caseIntroNarration = document.getElementById('case-intro-narration');
    this.btnBeginCase = document.getElementById('btn-begin-case');

    this.screenCaseSolved = document.getElementById('screen-case-solved');
    this.caseSolvedTitle = document.getElementById('case-solved-title');
    this.caseSolvedNarration = document.getElementById('case-solved-narration');
    this.btnNextCase = document.getElementById('btn-next-case');

    // M3 Evidence & Case Board DOM Elements
    this.evidenceToast = document.getElementById('evidence-toast');
    this.toastBadge = document.getElementById('toast-badge');
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

    // M5 Rule Reversal Twist DOM Elements
    this.screenTwist = document.getElementById('screen-twist');
    this.btnAcceptTwist = document.getElementById('btn-accept-twist');

    // M6 Second Reconstruction DOM Elements
    this.modalSecondReconstruction = document.getElementById('modal-second-reconstruction');
    this.secondReconstructEvidenceBadges = document.getElementById('second-reconstruct-evidence-badges');
    this.secondReconstructQuestions = document.getElementById('second-reconstruct-questions');
    this.btnConfirmSecondTheory = document.getElementById('btn-confirm-second-theory');

    // M7 Final Comic Revelation DOM Elements
    this.screenRevelation = document.getElementById('screen-revelation');
    this.btnNextPanel = document.getElementById('btn-next-panel');
    this.btnPlayAgain = document.getElementById('btn-play-again');
    this.revSlides = [
      document.getElementById('rev-panel-1'),
      document.getElementById('rev-panel-2'),
      document.getElementById('rev-panel-3'),
      document.getElementById('rev-panel-4')
    ];
    this.currentRevSlide = 0;

    // Modules
    this.renderer = new Renderer(this.canvas);
    this.snake = new Snake(CONFIG.GRID_COLS, CONFIG.GRID_ROWS);
    this.clueSystem = new ClueSystem(CONFIG.GRID_COLS, CONFIG.GRID_ROWS);
    this.reconstructionSystem = new ReconstructionSystem();
    this.inputHandler = new InputHandler(() => this.handleActionTrigger());

    // Game loop timing & state variables
    this.lastFrameTime = 0;
    this.accumulator = 0;
    this.inkStepsCount = 0;
    this.deathWasInkPhase = false;
    this.inkCheckpoint = null;
    this.retriesCount = 0;
    this.gameStartTime = null;
    this.gameEndTime = null;

    this.btnMute = document.getElementById('btn-mute');
    this.updateMuteUI();

    if (import.meta.env && import.meta.env.DEV) {
      console.log('[DEV] F1=Case 1, F2=Case 2, F3=Case 3');
    }

    this.initEventListeners();
    this.setState(GAME_STATES.TITLE);
  }

  updateMuteUI() {
    if (this.btnMute) {
      this.btnMute.textContent = sfx.isMuted ? '🔇 [M]' : '🔊 [M]';
    }
  }

  getFreeCellsCount() {
    const currentCase = CASES[this.currentCaseIndex];
    if (!currentCase || !currentCase.walls) return 400;
    let wallCount = 0;
    for (let r = 0; r < currentCase.walls.length; r++) {
      const rowStr = currentCase.walls[r];
      for (let c = 0; c < rowStr.length; c++) {
        if (rowStr[c] === '#') wallCount++;
      }
    }
    return 400 - wallCount;
  }

  initEventListeners() {
    if (this.btnMute) {
      this.btnMute.addEventListener('click', () => {
        sfx.unlock();
        sfx.click();
        sfx.toggleMute();
        this.updateMuteUI();
      });
    }

    if (this.btnStart) {
      this.btnStart.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.handleActionTrigger(); });
    }
    if (this.btnRestart) {
      this.btnRestart.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.handleActionTrigger(); });
    }
    
    // Case Intro & Solved controls
    if (this.btnBeginCase) {
      this.btnBeginCase.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.startCase(this.currentCaseIndex); });
    }
    if (this.btnNextCase) {
      this.btnNextCase.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.nextCase(); });
    }

    // Case Board Modal controls
    if (this.btnOpenCaseboard) {
      this.btnOpenCaseboard.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.toggleCaseBoard(); });
    }
    if (this.btnCloseCaseboard) {
      this.btnCloseCaseboard.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.toggleCaseBoard(false); });
    }
    if (this.btnToastDismiss) {
      this.btnToastDismiss.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.dismissToast(); });
    }

    // M4 & M6 Reconstruction Modal controls
    if (this.btnOpenReconstruct) {
      this.btnOpenReconstruct.addEventListener('click', () => {
        sfx.unlock();
        sfx.click();
        const currentCase = CASES[this.currentCaseIndex];
        if (this.state === GAME_STATES.INK_PHASE) {
          const freeCells = this.getFreeCellsCount();
          const coverage = this.renderer.inkSystem.getCoverage(freeCells);
          const goal = currentCase ? (currentCase.inkGoal || 0.5) : 0.5;
          if (this.reconstructionSystem.isSecondUnlocked(coverage, goal)) {
            this.toggleSecondReconstructionModal();
          }
        } else {
          this.toggleReconstructionModal();
        }
      });
    }
    if (this.btnConfirmTheory) {
      this.btnConfirmTheory.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.confirmTheorySelection(); });
    }
    if (this.btnConfirmSecondTheory) {
      this.btnConfirmSecondTheory.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.confirmSecondTheorySelection(); });
    }

    // M5 Twist Interruption Modal controls
    if (this.btnAcceptTwist) {
      this.btnAcceptTwist.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.acceptTwist(); });
    }

    // M7 Revelation Sequence controls
    if (this.btnNextPanel) {
      this.btnNextPanel.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.nextRevelationPanel(); });
    }
    if (this.btnPlayAgain) {
      this.btnPlayAgain.addEventListener('click', () => { sfx.unlock(); sfx.click(); this.startGame(); });
    }

    // Keyboard listener for shortcuts and actions
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        sfx.unlock();
        if (import.meta.env && import.meta.env.DEV) {
          if (e.code === 'F1' || e.code === 'F2' || e.code === 'F3') {
            e.preventDefault();
            const targetIndex = e.code === 'F1' ? 0 : (e.code === 'F2' ? 1 : 2);
            sfx.click();
            this.showCaseIntro(targetIndex);
            return;
          }
        }

        if (e.code === 'KeyM') {
          e.preventDefault();
          sfx.click();
          sfx.toggleMute();
          this.updateMuteUI();
          return;
        }
        if (e.code === 'Space' || e.code === 'Enter') {
          if (e.repeat) return;

          let actionTriggered = false;

          if (this.state === GAME_STATES.TITLE) {
            this.startGame();
            actionTriggered = true;
          } else if (this.screenCaseIntro && !this.screenCaseIntro.classList.contains('hidden')) {
            this.startCase(this.currentCaseIndex);
            actionTriggered = true;
          } else if (this.screenCaseSolved && !this.screenCaseSolved.classList.contains('hidden')) {
            this.nextCase();
            actionTriggered = true;
          } else if (this.screenRevelation && !this.screenRevelation.classList.contains('hidden')) {
            if (this.currentRevSlide < this.revSlides.length - 1) {
              this.nextRevelationPanel();
            } else {
              this.startGame();
            }
            actionTriggered = true;
          } else if (this.screenTwist && !this.screenTwist.classList.contains('hidden')) {
            this.acceptTwist();
            actionTriggered = true;
          } else if (this.state === GAME_STATES.GAME_OVER) {
            this.restartGame();
            actionTriggered = true;
          } else if (this.evidenceToast && !this.evidenceToast.classList.contains('hidden')) {
            this.dismissToast();
            actionTriggered = true;
          } else if (e.code === 'Enter' && this.modalReconstruction && !this.modalReconstruction.classList.contains('hidden')) {
            this.confirmTheorySelection();
            actionTriggered = true;
          } else if (e.code === 'Enter' && this.modalSecondReconstruction && !this.modalSecondReconstruction.classList.contains('hidden')) {
            this.confirmSecondTheorySelection();
            actionTriggered = true;
          }

          if (actionTriggered) {
            e.preventDefault();
            sfx.click();
          } else {
            e.preventDefault();
          }
        } else if (e.code === 'KeyC') {
          e.preventDefault();
          sfx.click();
          if (this.state !== GAME_STATES.TITLE && this.state !== GAME_STATES.GAME_OVER && this.state !== GAME_STATES.REVELATION) {
            this.toggleCaseBoard();
          }
        } else if (e.code === 'KeyR') {
          e.preventDefault();
          sfx.click();
          if (this.state !== GAME_STATES.TITLE && this.state !== GAME_STATES.GAME_OVER && this.state !== GAME_STATES.REVELATION) {
            const currentCase = CASES[this.currentCaseIndex];
            const stats = this.clueSystem.getStats();
            if (this.state === GAME_STATES.INK_PHASE) {
              const freeCells = this.getFreeCellsCount();
              const coverage = this.renderer.inkSystem.getCoverage(freeCells);
              const goal = currentCase ? (currentCase.inkGoal || 0.5) : 0.5;
              if (this.reconstructionSystem.isSecondUnlocked(coverage, goal)) {
                this.toggleSecondReconstructionModal();
              }
            } else if (this.reconstructionSystem.isUnlocked(stats.collected)) {
              this.toggleReconstructionModal();
            }
          }
        }
      });

      // Window Resize handling for canvas scaling
      window.addEventListener('resize', () => {
        this.renderer.resizeCanvas();
      });
    }
  }

  handleActionTrigger() {
    if (this.state === GAME_STATES.TITLE) {
      this.startGame();
    } else if (this.state === GAME_STATES.GAME_OVER) {
      this.restartGame();
    }
  }

  showScreen(targetId) {
    const screens = [
      { id: 'screen-title', el: this.screenTitle },
      { id: 'screen-case-intro', el: this.screenCaseIntro },
      { id: 'screen-case-solved', el: this.screenCaseSolved },
      { id: 'screen-twist', el: this.screenTwist },
      { id: 'screen-revelation', el: this.screenRevelation },
      { id: 'screen-game-over', el: this.screenGameOver }
    ];

    screens.forEach(({ id, el }) => {
      if (!el) return;
      if (id === targetId) {
        el.classList.remove('hidden');
        el.classList.add('active');
      } else {
        el.classList.add('hidden');
        el.classList.remove('active');
      }
    });
  }

  setState(newState) {
    this.state = newState;
    const currentCase = CASES[this.currentCaseIndex];

    const frameEl = this.panelFrame || document.getElementById('panel-frame');
    if (frameEl) {
      frameEl.scrollTop = 0;
    }

    switch (newState) {
      case GAME_STATES.TITLE:
        this.showScreen('screen-title');
        if (this.hudStatus) this.hudStatus.textContent = 'STANDBY';
        if (this.panelTag) this.panelTag.textContent = 'PANEL #01: THE ALLEY';
        break;

      case GAME_STATES.CASE_INTRO:
        this.showScreen('screen-case-intro');
        if (this.hudStatus) this.hudStatus.textContent = 'CASE BRIEFING';
        if (this.panelTag && currentCase) this.panelTag.textContent = currentCase.panelTag;
        break;

      case GAME_STATES.PLAYING:
        this.showScreen(null);
        if (this.hudStatus) this.hudStatus.textContent = this.reconstructionSystem.isSubmitted ? 'THEORY BUILT' : 'INVESTIGATING';
        if (this.panelTag && currentCase) this.panelTag.textContent = currentCase.panelTag;
        break;

      case GAME_STATES.CASE_SOLVED:
        this.showScreen('screen-case-solved');
        if (this.hudStatus) this.hudStatus.textContent = 'CASE SOLVED';
        if (this.panelTag && currentCase) this.panelTag.textContent = currentCase.panelTag;
        break;

      case GAME_STATES.INK_PHASE:
        this.showScreen(null);
        if (this.hudStatus) this.hudStatus.textContent = this.reconstructionSystem.isSecondSubmitted ? 'RECONSTRUCTION COMPLETE' : 'INK ERASURE';
        if (this.panelTag) this.panelTag.textContent = 'PANEL #03: THE REVERSAL';
        this.updateHUDClues();
        break;

      case GAME_STATES.REVELATION:
        this.showScreen('screen-revelation');
        if (this.hudStatus) this.hudStatus.textContent = 'CASE REVEALED';
        if (this.panelTag) this.panelTag.textContent = 'FINAL PANEL: THE REVELATION';
        break;

      case GAME_STATES.GAME_OVER:
        this.showScreen('screen-game-over');
        if (this.hudStatus) this.hudStatus.textContent = 'CASE CLOSED';
        
        const gameOverNarration = this.screenGameOver ? this.screenGameOver.querySelector('.narration-box') : null;
        if (gameOverNarration) {
          if (this.deathWasInkPhase) {
            gameOverNarration.textContent = '"THE PANEL RAN OUT OF ROOM. THE INK STARTS AGAIN."';
          } else {
            gameOverNarration.textContent = '"A dead end. The panel collapsed before the truth could surface..."';
          }
        }

        const stats = this.clueSystem.getStats();
        if (this.finalCluesVal) {
          this.finalCluesVal.textContent = `${stats.collected} / ${stats.total} (ERASED: ${stats.lost})`;
        }
        if (this.finalTheoryBox) {
          if (this.reconstructionSystem.isSecondSubmitted) {
            const secSummary = this.reconstructionSystem.getSecondSummary();
            if (this.finalTheoryText) this.finalTheoryText.textContent = `REVISED THEORY: ${secSummary.revisedEntry} | ${secSummary.revisedSuspect}`;
            this.finalTheoryBox.classList.remove('hidden');
          } else if (this.reconstructionSystem.isSubmitted) {
            const summary = this.reconstructionSystem.getSummary();
            if (this.finalTheoryText) this.finalTheoryText.textContent = `INITIAL THEORY: ${summary.entry} | ${summary.suspect}`;
            this.finalTheoryBox.classList.remove('hidden');
          } else {
            this.finalTheoryBox.classList.add('hidden');
          }
        }
        break;
    }
  }

  startGame() {
    this.currentCaseIndex = 0;
    this.retriesCount = 0;
    this.gameStartTime = null;
    this.gameEndTime = null;
    this.showCaseIntro(0);
  }

  showCaseIntro(caseIndex) {
    this.currentCaseIndex = caseIndex;
    const c = CASES[caseIndex];

    if (this.caseIntroTag) this.caseIntroTag.textContent = c.panelTag;
    if (this.caseIntroTitle) this.caseIntroTitle.textContent = c.title;
    if (this.caseIntroNarration) this.caseIntroNarration.textContent = `"${c.intro}"`;

    if (this.panelTag) this.panelTag.textContent = c.panelTag;
    if (this.hudCaseNum) this.hudCaseNum.textContent = `${caseIndex + 1}/${CASES.length}`;
    if (this.hudClues) this.hudClues.textContent = `0/${c.requiredClues}`;

    this.setState(GAME_STATES.CASE_INTRO);
  }

  startCase(caseIndex) {
    this.currentCaseIndex = caseIndex;
    const c = CASES[caseIndex];

    if (caseIndex === 0 && !this.gameStartTime) {
      this.gameStartTime = performance.now();
    }

    this.snake.reset(c.snakeStart);
    this.clueSystem.reset(c.clues);
    this.reconstructionSystem.reset(c);
    this.renderer.lightSystem.setScale(c.lightScale || 1.0);
    this.renderer.inkSystem.reset();
    this.inputHandler.reset();

    this.accumulator = 0;
    this.inkStepsCount = 0;
    this.currentRevSlide = 0;
    this.deathWasInkPhase = false;
    this.inkCheckpoint = null;

    this.dismissToast();
    this.toggleCaseBoard(false);
    this.toggleReconstructionModal(false);
    this.toggleSecondReconstructionModal(false);

    if (this.btnOpenReconstruct) {
      this.btnOpenReconstruct.classList.add('hidden');
    }
    this.updateHUDClues();

    if (this.state !== GAME_STATES.INK_PHASE) {
      sfx.rainStart();
    }

    this.setState(GAME_STATES.PLAYING);
  }

  restartGame() {
    if (this.deathWasInkPhase && this.inkCheckpoint) {
      // Restore clue states from checkpoint
      this.clueSystem.clues = JSON.parse(JSON.stringify(this.inkCheckpoint.clues));
      // Reset snake to checkpoint start (initial length 5)
      this.snake.reset(this.inkCheckpoint.snakeStart);
      // Clear ink grid and inkedCount
      this.renderer.inkSystem.reset();
      // Reset second reconstruction flags
      this.reconstructionSystem.secondAutoPromptTriggered = false;
      this.reconstructionSystem.isSecondSubmitted = false;
      this.reconstructionSystem.secondSelectedChoices = {};
      if (this.btnOpenReconstruct) {
        this.btnOpenReconstruct.classList.add('hidden');
      }
      this.accumulator = 0;
      this.inkStepsCount = 0;
      this.inputHandler.reset();
      this.dismissToast();
      this.toggleCaseBoard(false);
      this.toggleReconstructionModal(false);
      this.toggleSecondReconstructionModal(false);
      this.updateHUDClues();
      sfx.inkHumStart();
      this.setState(GAME_STATES.INK_PHASE);
    } else {
      this.startCase(this.currentCaseIndex);
    }
  }

  nextCase() {
    this.currentCaseIndex++;
    if (this.currentCaseIndex < CASES.length) {
      this.showCaseIntro(this.currentCaseIndex);
    } else {
      this.startGame();
    }
  }

  showCaseSolved() {
    sfx.rainStop(0.5);
    sfx.caseSolved();
    const c = CASES[this.currentCaseIndex];
    if (this.caseSolvedTitle) {
      this.caseSolvedTitle.textContent = `${c.title} SOLVED!`;
    }
    if (this.caseSolvedNarration) {
      this.caseSolvedNarration.textContent = `"Case #${this.currentCaseIndex + 1} solved! You collected all required evidence and reconstructed the timeline."`;
    }
    this.setState(GAME_STATES.CASE_SOLVED);
  }

  startLoop() {
    this.lastFrameTime = performance.now();
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  isOverlayOpen() {
    const rotateHint = document.getElementById('rotate-hint');
    if (rotateHint && typeof window !== 'undefined' && window.getComputedStyle(rotateHint).display !== 'none') {
      return true;
    }
    return [
      this.modalCaseboard,
      this.modalReconstruction,
      this.modalSecondReconstruction,
      this.screenTwist,
      this.screenCaseIntro,
      this.screenCaseSolved,
      this.evidenceToast
    ].some(el => el && !el.classList.contains('hidden'));
  }

  loop(timestamp) {
    try {
      const deltaTime = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;

      if ((this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.INK_PHASE) && !this.isOverlayOpen()) {
        this.accumulator += deltaTime;
        const currentCase = CASES[this.currentCaseIndex];
        const tickMs = currentCase ? (currentCase.tickMs || CONFIG.TICK_INTERVAL_MS) : CONFIG.TICK_INTERVAL_MS;

        // Update grid step when accumulator reaches tick interval
        while (this.accumulator >= tickMs) {
          this.tick();
          this.accumulator -= tickMs;
          if (this.isOverlayOpen()) {
            this.accumulator = 0;
            break;
          }
        }
      } else if (this.isOverlayOpen()) {
        this.accumulator = 0;
      }

      // Render frame
      const currentCase = CASES[this.currentCaseIndex];
      const freeCells = this.getFreeCellsCount();
      const coverageRatio = this.renderer.inkSystem.getCoverage(freeCells);
      const inkGoal = currentCase ? (currentCase.inkGoal || 0.5) : 0.5;

      this.renderer.render(
        this.snake,
        this.renderer.lightSystem,
        this.clueSystem,
        this.state,
        this.deathWasInkPhase,
        currentCase ? currentCase.walls : null,
        coverageRatio,
        inkGoal
      );
    } catch (err) {
      console.error(err);
    } finally {
      requestAnimationFrame((ts) => this.loop(ts));
    }
  }

  tick() {
    const currentCase = CASES[this.currentCaseIndex];

    // Get next direction from input queue
    const nextDir = this.inputHandler.popNextDirection();
    
    // Advance snake 1 step
    this.snake.update(nextDir);

    // Update HUD steps
    if (this.hudSteps) this.hudSteps.textContent = this.snake.stepsCount;

    const isInkPhase = (this.state === GAME_STATES.INK_PHASE);

    if (isInkPhase) {
      this.inkStepsCount++;

      // Deposit persistent dark ink onto current snake positions (ignoring wall cells)
      this.renderer.inkSystem.depositInk(this.snake, currentCase ? currentCase.walls : null);

      const freeCells = this.getFreeCellsCount();
      const coverage = this.renderer.inkSystem.getCoverage(freeCells);
      const goal = currentCase ? (currentCase.inkGoal || 0.5) : 0.5;

      // Check evidence ink erasure
      const res = this.clueSystem.update(this.snake, null, true);
      const stats = this.clueSystem.getStats();
      const willSecondAutoOpen = this.reconstructionSystem.isSecondUnlocked(coverage, goal) && !this.reconstructionSystem.secondAutoPromptTriggered;

      if (res && res.type === 'ERASED') {
        sfx.erase();
        if (!willSecondAutoOpen) {
          this.showToast(res.clue, true);
        }
        this.updateHUDClues();
      } else {
        this.updateHUDClues();
      }

      // M6 Second Reconstruction Trigger Check
      if (this.reconstructionSystem.isSecondUnlocked(coverage, goal)) {
        if (this.btnOpenReconstruct) {
          this.btnOpenReconstruct.classList.remove('hidden');
        }
        if (!this.reconstructionSystem.secondAutoPromptTriggered) {
          this.reconstructionSystem.secondAutoPromptTriggered = true;
          this.dismissToast();
          this.toggleSecondReconstructionModal(true);
        }
      }
    } else {
      // Light phase discovery/collection
      const res = this.clueSystem.update(this.snake, this.renderer.lightSystem, false);
      const stats = this.clueSystem.getStats();
      const willAutoOpen = this.reconstructionSystem.isUnlocked(stats.collected) && !this.reconstructionSystem.autoPromptTriggered;

      if (res && res.type === 'COLLECTED') {
        // Snake grows by 1 segment each time a clue is collected in light phase
        this.snake.grow();
        sfx.clue();

        if (!willAutoOpen) {
          this.showToast(res.clue, false);
        }
        this.updateHUDClues();
      } else {
        this.updateHUDClues();
      }

      // M4 Reconstruction Trigger Check
      if (this.reconstructionSystem.isUnlocked(stats.collected)) {
        if (this.btnOpenReconstruct) {
          this.btnOpenReconstruct.classList.remove('hidden');
        }
        if (!this.reconstructionSystem.autoPromptTriggered) {
          this.reconstructionSystem.autoPromptTriggered = true;
          this.dismissToast();
          this.toggleReconstructionModal(true);
        }
      }
    }

    // Check collisions against boundary, interior walls, and self
    if (this.snake.checkWallCollision(currentCase ? currentCase.walls : null) || this.snake.checkSelfCollision()) {
      this.snake.isDead = true;
      this.retriesCount++;
      if (this.state === GAME_STATES.INK_PHASE) {
        this.deathWasInkPhase = true;
      }
      sfx.rainStop(0.3);
      sfx.inkHumStop(0.3);
      sfx.death();
      this.setState(GAME_STATES.GAME_OVER);
    }
  }

  showComicImpact(text) {
    const frame = document.getElementById('panel-frame');
    if (!frame) return;

    // Remove any existing impact popups so only one exists at a time
    const existingPopups = frame.querySelectorAll('.action-impact-popup');
    existingPopups.forEach(p => p.remove());

    const popup = document.createElement('div');
    popup.className = 'action-impact-popup';
    popup.textContent = text;
    
    // Random position offset inside panel frame
    const top = 30 + Math.random() * 40;
    const left = 30 + Math.random() * 40;
    popup.style.top = `${top}%`;
    popup.style.left = `${left}%`;

    frame.appendChild(popup);

    setTimeout(() => {
      if (popup.parentNode) popup.parentNode.removeChild(popup);
    }, 600);
  }

  showToast(clue, isErased = false) {
    if (isErased) {
      this.showComicImpact('POW!');
      if (this.toastBadge) {
        this.toastBadge.textContent = 'EVIDENCE ERASED';
        this.toastBadge.className = 'toast-badge erased';
      }
      if (this.toastTitle) this.toastTitle.textContent = clue.name.toUpperCase();
      if (this.toastDesc) this.toastDesc.textContent = `"Dark ink covers ${clue.name}. The evidence has been erased!"`;
    } else {
      this.showComicImpact('CLUE!');
      if (this.toastBadge) {
        this.toastBadge.textContent = 'EVIDENCE FOUND';
        this.toastBadge.className = 'toast-badge';
      }
      if (this.toastTitle) this.toastTitle.textContent = clue.name.toUpperCase();
      if (this.toastDesc) this.toastDesc.textContent = `"${clue.description}"`;
    }
    if (this.evidenceToast) {
      this.evidenceToast.classList.remove('hidden');
    }
  }

  dismissToast() {
    if (!this.evidenceToast) return;
    this.evidenceToast.classList.add('hidden');
    this.accumulator = 0;
    if (typeof window !== 'undefined' && window.performance) {
      this.lastFrameTime = performance.now();
    }
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

  toggleSecondReconstructionModal(forceState = null) {
    if (!this.modalSecondReconstruction) return;

    const shouldShow = (forceState !== null)
      ? forceState
      : this.modalSecondReconstruction.classList.contains('hidden');

    if (shouldShow) {
      this.renderSecondReconstructionUI();
      this.modalSecondReconstruction.classList.remove('hidden');
      this.modalSecondReconstruction.classList.add('active');
    } else {
      this.modalSecondReconstruction.classList.add('hidden');
      this.modalSecondReconstruction.classList.remove('active');
    }
  }

  getQuestionEvidenceText(q, isSecondReconstruct = false) {
    if (!q.evidenceIds || q.evidenceIds.length === 0) {
      return q.evidenceRef || '';
    }

    const items = q.evidenceIds.map(id => {
      const clue = this.clueSystem.clues.find(c => c.id === id);
      if (!clue) return `? Unknown`;

      if (isSecondReconstruct && clue.isLost) {
        return `❌ ${clue.name}`;
      } else if (clue.isCollected) {
        return `✓ ${clue.name}`;
      } else {
        return `? ${clue.name}`;
      }
    });

    return items.join(' · ');
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
        <div class="question-ref">SUPPORTING EVIDENCE: ${this.getQuestionEvidenceText(q, false)}</div>
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

    // Enable / disable confirm theory button based on whether all questions are answered
    if (this.btnConfirmTheory) {
      const allAnswered = this.reconstructionSystem.isAllAnswered();
      this.btnConfirmTheory.disabled = !allAnswered;
      this.btnConfirmTheory.style.opacity = allAnswered ? '1' : '0.4';
      this.btnConfirmTheory.style.cursor = allAnswered ? 'pointer' : 'not-allowed';
    }
  }

  renderSecondReconstructionUI() {
    if (!this.secondReconstructEvidenceBadges || !this.secondReconstructQuestions) return;

    // 1. Render Survived vs Erased Evidence Badges
    this.secondReconstructEvidenceBadges.innerHTML = '';
    this.clueSystem.clues.forEach(c => {
      const badge = document.createElement('div');
      if (c.isLost) {
        badge.className = 'evidence-badge erased';
        badge.textContent = `❌ ${c.name} (ERASED)`;
      } else if (c.isCollected || c.isDiscovered) {
        badge.className = 'evidence-badge';
        badge.textContent = `✓ ${c.name}`;
      } else {
        badge.className = 'evidence-badge';
        badge.style.opacity = '0.5';
        badge.textContent = `? ${c.name}`;
      }
      this.secondReconstructEvidenceBadges.appendChild(badge);
    });

    // 2. Render Second Reconstruction Questions & Options
    this.secondReconstructQuestions.innerHTML = '';
    this.reconstructionSystem.secondQuestions.forEach((q) => {
      const card = document.createElement('div');
      card.className = 'question-card';

      const currentSelected = this.reconstructionSystem.secondSelectedChoices[q.id];

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
        <div class="question-ref">PANEL STATUS: ${this.getQuestionEvidenceText(q, true)}</div>
        <div class="options-group">${optionsHTML}</div>
      `;

      this.secondReconstructQuestions.appendChild(card);
    });

    // Event Delegation for option buttons
    const optButtons = this.secondReconstructQuestions.querySelectorAll('.option-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const qId = target.getAttribute('data-qid');
        const optId = target.getAttribute('data-optid');
        if (qId && optId) {
          this.reconstructionSystem.selectSecondOption(qId, optId);
          this.renderSecondReconstructionUI();
        }
      });
    });

    if (this.btnConfirmSecondTheory) {
      const allAnswered = this.reconstructionSystem.isSecondAllAnswered();
      this.btnConfirmSecondTheory.disabled = !allAnswered;
      this.btnConfirmSecondTheory.style.opacity = allAnswered ? '1' : '0.4';
      this.btnConfirmSecondTheory.style.cursor = allAnswered ? 'pointer' : 'not-allowed';
    }
  }

  confirmTheorySelection() {
    if (!this.reconstructionSystem.isAllAnswered()) return;
    this.reconstructionSystem.confirmTheory();
    this.toggleReconstructionModal(false);
    
    const currentCase = CASES[this.currentCaseIndex];
    if (currentCase && currentCase.hasTwist) {
      // M5 Trigger Rule Reversal Twist Interruption! (Case 3)
      sfx.rainStop(0.5);
      sfx.twist();
      sfx.inkHumStart();
      this.showScreen('screen-twist');
    } else {
      // Cases 1 & 2: Show Case Solved card
      this.showCaseSolved();
    }
  }

  confirmSecondTheorySelection() {
    if (!this.reconstructionSystem.isSecondAllAnswered()) return;
    this.reconstructionSystem.confirmSecondTheory();
    this.toggleSecondReconstructionModal(false);
    
    // M7 Trigger Final Comic Revelation Sequence!
    this.startRevelationSequence();
  }

  formatElapsedTime() {
    const start = this.gameStartTime || performance.now();
    const end = this.gameEndTime || performance.now();
    const totalSec = Math.floor(Math.max(0, end - start) / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  getSeenEndings() {
    try {
      const raw = localStorage.getItem('snakeNoirEndings');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(e);
    }
    return [];
  }

  recordEndingSeen(endingId) {
    try {
      const seen = this.getSeenEndings();
      if (!seen.includes(endingId)) {
        seen.push(endingId);
        localStorage.setItem('snakeNoirEndings', JSON.stringify(seen));
      }
      return seen;
    } catch (e) {
      console.warn(e);
      return [endingId];
    }
  }

  startRevelationSequence() {
    sfx.rainStop(0.5);
    sfx.inkHumStop(0.5);
    this.gameEndTime = performance.now();

    const lighter = this.clueSystem.clues.find(c => c.id === 'ds_lighter');
    const badge = this.clueSystem.clues.find(c => c.id === 'detective_badge');

    const lighterSurvived = lighter && !lighter.isLost;
    const badgeSurvived = badge && !badge.isLost;

    let endingId = 'ending1';
    let endingLabel = 'ENDING 1 OF 3: THE TRUTH';
    let slide1Text = 'The ink missed what mattered. Two pieces of evidence survived the page.';
    let slide2Text = "A silver lighter stamped 'D.S.' and a badge with the number scratched out.";
    let slide3Narration = 'Someone was here... YOU.';
    let slide3Speech = '...Oh.';
    let slide4Narration = 'Detective Snake was the intruder all along. The investigation was the crime.';

    if (lighterSurvived && badgeSurvived) {
      endingId = 'ending1';
      endingLabel = 'ENDING 1 OF 3: THE TRUTH';
      slide1Text = 'The ink missed what mattered. Two pieces of evidence survived the page.';
      slide2Text = "A silver lighter stamped 'D.S.' and a badge with the number scratched out.";
      slide3Narration = 'Someone was here... YOU.';
      slide3Speech = '...Oh.';
      slide4Narration = 'Detective Snake was the intruder all along. The investigation was the crime.';
    } else if (lighterSurvived || badgeSurvived) {
      endingId = 'ending2';
      endingLabel = 'ENDING 2 OF 3: THE DOUBT';
      slide1Text = 'The ink swallowed half the story. One piece of evidence survived.';
      if (lighterSurvived) {
        slide2Text = "Only the lighter stamped 'D.S.' is left. Initials aren't proof.";
      } else {
        slide2Text = "Only the badge is left, its number scratched out. A scratch isn't proof.";
      }
      slide3Narration = 'Someone was here... maybe YOU.';
      slide3Speech = '...Oh?';
      slide4Narration = 'It might have been you. The page will not say.';
    } else {
      endingId = 'ending3';
      endingLabel = 'ENDING 3 OF 3: THE COVER-UP';
      slide1Text = 'The ink erased everything that could name the culprit.';
      slide2Text = 'No lighter. No badge. Only black ink, and the hand that spread it.';
      slide3Narration = 'Someone was here... and covered it up.';
      slide3Speech = '...Me?';
      slide4Narration = 'The case is closed because you closed it. The ink is yours.';
    }

    const seenEndings = this.recordEndingSeen(endingId);

    const slide1Narr = document.querySelector('#rev-panel-1 .narration-box');
    if (slide1Narr) slide1Narr.textContent = `"${slide1Text}"`;

    const slide2Narr = document.querySelector('#rev-panel-2 .narration-box');
    if (slide2Narr) slide2Narr.textContent = `"${slide2Text}"`;
    const slide2NarrBold = document.querySelector('#rev-panel-2 .narration-box.bold-text');
    if (slide2NarrBold) slide2NarrBold.style.display = 'none';

    const slide3Narr = document.querySelector('#rev-panel-3 .narration-box');
    if (slide3Narr) slide3Narr.textContent = `"${slide3Narration}"`;
    const slide3SpeechEl = document.querySelector('#rev-panel-3 .speech-bubble');
    if (slide3SpeechEl) slide3SpeechEl.textContent = slide3Speech;

    const slide4Narr = document.getElementById('rev-narration-4');
    if (slide4Narr) slide4Narr.textContent = `"${slide4Narration}"`;

    const labelEl = document.getElementById('rev-ending-label');
    if (labelEl) labelEl.textContent = endingLabel;

    const choiceLineEl = document.getElementById('rev-choice-line');
    if (choiceLineEl) {
      const choice = this.reconstructionSystem.selectedChoices['panel_who'];
      choiceLineEl.textContent = (choice === 'detective')
        ? 'You suspected yourself from the start.'
        : 'You blamed a stranger. The boots were yours.';
    }

    const stats = this.clueSystem.getStats();
    const statsLineEl = document.getElementById('rev-stats-line');
    if (statsLineEl) {
      statsLineEl.textContent = `EVIDENCE ${stats.collected}/${stats.total} | ERASED ${stats.lost} | RETRIES ${this.retriesCount} | TIME ${this.formatElapsedTime()}`;
    }

    const counterEl = document.getElementById('rev-endings-counter');
    if (counterEl) {
      counterEl.textContent = `ENDINGS FOUND: ${seenEndings.length}/3`;
    }

    this.currentRevSlide = 0;
    this.updateRevelationSlideUI();
    this.setState(GAME_STATES.REVELATION);
  }

  nextRevelationPanel() {
    if (this.currentRevSlide < this.revSlides.length - 1) {
      this.currentRevSlide++;
      this.updateRevelationSlideUI();
    } else {
      this.startGame();
    }
  }

  updateRevelationSlideUI() {
    this.revSlides.forEach((slide, index) => {
      if (slide) {
        if (index === this.currentRevSlide) {
          slide.classList.remove('hidden');
          slide.classList.add('active');
        } else {
          slide.classList.add('hidden');
          slide.classList.remove('active');
        }
      }
    });

    if (this.currentRevSlide === 3) {
      sfx.ending();
    } else {
      sfx.flip();
    }

    if (this.btnNextPanel) {
      if (this.currentRevSlide >= this.revSlides.length - 1) {
        this.btnNextPanel.classList.add('hidden');
      } else {
        this.btnNextPanel.classList.remove('hidden');
      }
    }
  }

  acceptTwist() {
    const currentCase = CASES[this.currentCaseIndex];
    if (currentCase) {
      this.snake.reset(currentCase.snakeStart);
    }
    this.renderer.inkSystem.reset();

    this.inkCheckpoint = {
      clues: JSON.parse(JSON.stringify(this.clueSystem.clues)),
      snakeStart: currentCase ? { ...currentCase.snakeStart } : { x: 5, y: 18, dir: 'RIGHT' }
    };

    this.reconstructionSystem.secondAutoPromptTriggered = false;
    this.reconstructionSystem.isSecondSubmitted = false;
    this.reconstructionSystem.secondSelectedChoices = {};
    if (this.btnOpenReconstruct) {
      this.btnOpenReconstruct.classList.add('hidden');
    }
    this.accumulator = 0;
    this.inkStepsCount = 0;
    this.inputHandler.reset();
    this.dismissToast();
    this.updateHUDClues();

    this.setState(GAME_STATES.INK_PHASE);
  }

  updateHUDClues() {
    const stats = this.clueSystem.getStats();
    const currentCase = CASES[this.currentCaseIndex];
    const required = currentCase ? currentCase.requiredClues : 3;

    if (this.hudCaseNum) {
      this.hudCaseNum.textContent = `${this.currentCaseIndex + 1}/${CASES.length}`;
    }

    if (this.hudClues) {
      if (this.state === GAME_STATES.INK_PHASE) {
        const freeCells = this.getFreeCellsCount();
        const coverage = this.renderer.inkSystem.getCoverage(freeCells);
        const goal = currentCase ? (currentCase.inkGoal || 0.5) : 0.5;
        const inkPct = Math.floor(coverage * 100);
        const goalPct = Math.round(goal * 100);
        this.hudClues.textContent = `INK ${inkPct}% / ${goalPct}%  |  LOST ${stats.lost}`;
      } else {
        this.hudClues.textContent = `${stats.collected}/${required}`;
      }
    }
  }

  updateCaseBoardUI() {
    const stats = this.clueSystem.getStats();
    if (this.caseboardSummary) {
      this.caseboardSummary.textContent = `CLUES COLLECTED: ${stats.collected} / ${stats.total} | ERASED: ${stats.lost}`;
    }

    if (this.caseboardTheoryBox) {
      if (this.reconstructionSystem.isSecondSubmitted) {
        const summary = this.reconstructionSystem.getSummary();
        const secSummary = this.reconstructionSystem.getSecondSummary();
        this.caseboardTheoryText.innerHTML = `
          <div>INITIAL: ${summary.entry} | ${summary.suspect}</div>
          <div style="margin-top:4px; color:#ff8a8a;">REVISED: ${secSummary.revisedEntry} | ${secSummary.revisedSuspect}</div>
        `;
        this.caseboardTheoryBox.classList.remove('hidden');
      } else if (this.reconstructionSystem.isSubmitted) {
        const summary = this.reconstructionSystem.getSummary();
        this.caseboardTheoryText.textContent = `INITIAL: ${summary.entry} | ${summary.suspect}`;
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

      if (clue.isLost) {
        statusClass = 'lost';
        statusText = '❌ ERASED BY INK';
      } else if (clue.isCollected) {
        statusClass = 'collected';
        statusText = '✓ COLLECTED';
      } else if (clue.isDiscovered) {
        statusClass = 'discovered';
        statusText = '🔍 DISCOVERED';
      }

      li.className = `caseboard-item ${statusClass}`;
      li.innerHTML = `
        <div class="case-info">
          <strong>${clue.isDiscovered || clue.isCollected || clue.isLost ? clue.name : 'Unknown Evidence'}</strong>
          <div class="case-desc">${clue.isLost ? 'Covered by dark ink. Evidence erased from the scene.' : (clue.isCollected ? clue.description : (clue.isDiscovered ? 'Discovered in panel. Reach it to collect.' : 'Hidden in darkness.'))}</div>
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
