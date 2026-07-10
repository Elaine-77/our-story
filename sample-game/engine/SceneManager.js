/**
 * SceneManager - Stack-based scene state machine
 * Restaurant hub sits at stack bottom, chapters push/pop on top
 *
 * Scene lifecycle: preload() → enter() → [transition end] → run() → exit()
 * - enter(): Build DOM only (backgrounds, static elements)
 * - run():   Interactive content (dialog, navigation) — called AFTER transition completes
 */
export class SceneManager {
  constructor() {
    this.scenes = new Map();
    this.sceneStack = [];
    this.currentScene = null;
    this.chapterProgress = 0; // 0-4: how many chapters completed
    this.container = document.getElementById('scene-layer');
    this.transitioning = false;
    this.transitionFX = null;
    this.audioManager = null;
    this.choiceEcho = null;
  }

  init({ transitionFX, audioManager, choiceEcho }) {
    this.transitionFX = transitionFX;
    this.audioManager = audioManager;
    this.choiceEcho = choiceEcho;
  }

  register(id, SceneClass) {
    this.scenes.set(id, SceneClass);
  }

  getContext() {
    return {
      sceneManager: this,
      choiceEcho: this.choiceEcho,
      audioManager: this.audioManager,
      transitionFX: this.transitionFX,
      chapterProgress: this.chapterProgress
    };
  }

  async goto(sceneId, transitionType = 'fade') {
    if (this.transitioning) return;
    this.transitioning = true;

    const SceneClass = this.scenes.get(sceneId);
    if (!SceneClass) {
      console.error(`Scene not found: ${sceneId}`);
      this.transitioning = false;
      return;
    }

    try {
      // Start transition overlay
      if (this.transitionFX && this.currentScene) {
        await this.transitionFX.start(transitionType);
      }

      // Exit current scene
      if (this.currentScene) {
        await this.currentScene.exit();
        this.container.innerHTML = '';
      }

      // Create and enter new scene (DOM setup only)
      const scene = new SceneClass();
      this.currentScene = scene;
      this.sceneStack.push({ id: sceneId, scene });

      await scene.preload();
      await scene.enter(this.container, this.getContext());

      // End transition overlay — scene is now visible
      if (this.transitionFX) {
        await this.transitionFX.end(transitionType);
      }
    } catch (err) {
      console.error('Scene transition error:', err);
    }

    // Unlock BEFORE running interactive content
    this.transitioning = false;

    // Run scene's interactive content (dialog, navigation, etc.)
    // This happens AFTER the transition is complete and transitioning = false,
    // so the scene can freely call goto/pushScene/popScene.
    if (this.currentScene && this.currentScene.run) {
      await this.currentScene.run();
    }
  }

  async pushScene(sceneId, transitionType = 'ink-wash') {
    if (this.transitioning) return;
    this.transitioning = true;

    const SceneClass = this.scenes.get(sceneId);
    if (!SceneClass) {
      this.transitioning = false;
      return;
    }

    try {
      if (this.transitionFX) {
        await this.transitionFX.start(transitionType);
      }

      // Hide current scene but don't destroy
      if (this.currentScene) {
        await this.currentScene.exit();
        this.container.innerHTML = '';
      }

      const scene = new SceneClass();
      this.currentScene = scene;
      this.sceneStack.push({ id: sceneId, scene });

      await scene.preload();
      await scene.enter(this.container, this.getContext());

      if (this.transitionFX) {
        await this.transitionFX.end(transitionType);
      }
    } catch (err) {
      console.error('Push scene error:', err);
    }

    this.transitioning = false;

    // Run interactive content after transition
    if (this.currentScene && this.currentScene.run) {
      await this.currentScene.run();
    }
  }

  async popScene(transitionType = 'ink-wash') {
    if (this.transitioning || this.sceneStack.length <= 1) return;
    this.transitioning = true;

    try {
      if (this.transitionFX) {
        await this.transitionFX.start(transitionType);
      }

      // Exit and remove current chapter scene
      if (this.currentScene) {
        await this.currentScene.exit();
        this.container.innerHTML = '';
      }

      this.sceneStack.pop();

      // Restore the scene below (restaurant hub)
      const { scene } = this.sceneStack[this.sceneStack.length - 1];
      this.currentScene = scene;

      await scene.enter(this.container, this.getContext());

      if (this.transitionFX) {
        await this.transitionFX.end(transitionType);
      }
    } catch (err) {
      console.error('Pop scene error:', err);
    }

    this.transitioning = false;

    // Run interactive content after transition
    if (this.currentScene && this.currentScene.run) {
      await this.currentScene.run();
    }
  }

  completeChapter() {
    this.chapterProgress = Math.min(this.chapterProgress + 1, 4);
  }

  update(dt) {
    if (this.currentScene && this.currentScene.update) {
      this.currentScene.update(dt);
    }
  }
}
