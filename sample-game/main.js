/**
 * Our Story - 銆婃垜浠殑鏁呬簨銆? * Main entry point 鈥?initializes all engines, UI components, and starts the game
 */

// Styles
import '@sample/styles/base.css';
import '@sample/styles/journal.css';
import '@sample/styles/dialog.css';
import '@sample/styles/transitions.css';
import '@sample/styles/scenes.css';
import '@sample/styles/frame.css';
import '@sample/styles/responsive.css';

// Engine
import { SceneManager } from '@sample/engine/SceneManager.js';
import { DialogEngine } from '@sample/engine/DialogEngine.js';
import { InteractionLayer } from '@sample/engine/InteractionLayer.js';
import { TransitionFX } from '@sample/engine/TransitionFX.js';
import { ChoiceEchoSystem } from '@sample/engine/ChoiceEchoSystem.js';
import { AudioManager } from '@sample/engine/AudioManager.js';

// Components
import { DialogBox } from '@sample/components/DialogBox.js';
import { ChoicePanel } from '@sample/components/ChoicePanel.js';
import { JournalStamp } from '@sample/components/JournalStamp.js';
import { MemoryFragment } from '@sample/components/MemoryFragment.js';
import { ParticleCanvas } from '@sample/components/ParticleCanvas.js';
import { LoadingScreen } from '@sample/components/LoadingScreen.js';
import { ChapterJumper } from '@sample/components/ChapterJumper.js';

// Scene classes (lazy loaded with chapters)
import { PrologueScene } from '@sample/scenes/PrologueScene.js';
import { RestaurantHub } from '@sample/scenes/RestaurantHub.js';
import { ChapterScene } from '@sample/scenes/ChapterScene.js';
import { EpilogueScene } from '@sample/scenes/EpilogueScene.js';

// Game config
import { gameConfig } from '@sample/data/config.js';

class Game {
  constructor() {
    // Engine instances
    this.sceneManager = new SceneManager();
    this.dialogEngine = new DialogEngine();
    this.interactionLayer = new InteractionLayer();
    this.transitionFX = new TransitionFX();
    this.choiceEcho = new ChoiceEchoSystem();
    this.audioManager = new AudioManager();

    // UI components
    this.dialogBox = new DialogBox();
    this.choicePanel = new ChoicePanel();
    this.journalStamp = new JournalStamp();
    this.memoryFragment = new MemoryFragment();
    this.particleCanvas = new ParticleCanvas();
    this.loadingScreen = new LoadingScreen();
    this.chapterJumper = new ChapterJumper(this.sceneManager);

    // Game loop
    this.lastTime = 0;
    this.running = false;
  }

  async init() {
    // Initialize particle canvas
    this.particleCanvas.init();

    // Wire up engines
    this.choiceEcho.init(gameConfig.allFragmentIds || []);

    this.sceneManager.init({
      transitionFX: this.transitionFX,
      audioManager: this.audioManager,
      choiceEcho: this.choiceEcho
    });

    this.dialogEngine.init({
      dialogBox: this.dialogBox,
      choicePanel: this.choicePanel,
      choiceEcho: this.choiceEcho,
      audioManager: this.audioManager
    });

    this.interactionLayer.init({
      audioManager: this.audioManager,
      choiceEcho: this.choiceEcho
    });

    this.audioManager.setupVisibilityHandler();

    // Set fragment total
    this.memoryFragment.setTotal(gameConfig.allFragmentIds ? gameConfig.allFragmentIds.length : 0);

    // Register scenes
    this._registerScenes();

    // Click handler for dialog advance
    document.getElementById('ui-layer').addEventListener('click', (e) => {
      // Don't advance if clicking on a choice button or hotspot
      if (e.target.closest('.choice-panel') || e.target.closest('.hotspot')) return;
      this.dialogEngine.advance();
    });

    // Add landscape warning
    this._addLandscapeWarning();

    // Wait for loading screen interaction (also unlocks audio)
    await this.loadingScreen.waitForStart(async () => {
      await this.audioManager.unlock();
    });

    // Initialize chapter jumper (available after loading screen)
    this.chapterJumper.init();

    // Start the game
    await this._startGame();
  }

  _registerScenes() {
    // Create scene factory functions that pass game context
    const gameCtx = {
      dialogEngine: this.dialogEngine,
      interactionLayer: this.interactionLayer,
      journalStamp: this.journalStamp,
      memoryFragment: this.memoryFragment,
      particleCanvas: this.particleCanvas,
      audioManager: this.audioManager,
      choiceEcho: this.choiceEcho,
      sceneManager: this.sceneManager,
      config: gameConfig
    };

    // Wrap scene classes to inject game context
    this.sceneManager.register('prologue', class extends PrologueScene {
      constructor() { super(gameCtx); }
    });

    this.sceneManager.register('restaurant', class extends RestaurantHub {
      constructor() { super(gameCtx); }
    });

    // Register chapter scenes (1-4)
    for (let i = 1; i <= 4; i++) {
      const chapterNum = i;
      this.sceneManager.register(`chapter${i}`, class extends ChapterScene {
        constructor() { super(gameCtx, chapterNum); }
      });
    }

    this.sceneManager.register('epilogue', class extends EpilogueScene {
      constructor() { super(gameCtx); }
    });
  }

  async _startGame() {
    this.running = true;

    // Start ambient dust particles
    this.particleCanvas.start({ count: 15, speed: 0.15 });

    // Go to prologue
    await this.sceneManager.goto('prologue', 'fade');

    // Start game loop
    this._gameLoop(performance.now());
  }

  _gameLoop(timestamp) {
    if (!this.running) return;

    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.sceneManager.update(dt);

    requestAnimationFrame((t) => this._gameLoop(t));
  }

  _addLandscapeWarning() {
    const warning = document.createElement('div');
    warning.className = 'landscape-warning';
    warning.innerHTML = `
      <div class="landscape-warning-icon"></div>
      <p>璇峰皢鎵嬫満绔栧睆浣跨敤<br>浠ヨ幏寰楁渶浣充綋楠?/p>
    `;
    document.body.appendChild(warning);
  }
}

// Boot
const game = new Game();
game.init().catch(err => {
  console.error('Game initialization failed:', err);
});
