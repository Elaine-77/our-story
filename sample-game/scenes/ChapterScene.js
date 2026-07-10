import gsap from 'gsap';
import { BaseScene } from './BaseScene.js';

/**
 * ChapterScene - Generic chapter handler
 * Loads chapter data dynamically and runs scene sequences
 */
export class ChapterScene extends BaseScene {
  constructor(gameCtx, chapterNum) {
    super(gameCtx);
    this.chapterNum = chapterNum;
    this.chapterData = null;
    this.currentSceneIndex = 0;
  }

  async preload() {
    // Dynamic import chapter data
    try {
      const module = await import(`@sample/data/chapter${this.chapterNum}.js`);
      this.chapterData = module.default || module.chapterData;
    } catch (err) {
      console.error(`Failed to load chapter ${this.chapterNum} data:`, err);
    }

    // Preload all scene background images
    if (this.chapterData?.scenes) {
      const imagePromises = this.chapterData.scenes
        .filter(s => s.background?.image)
        .map(s => BaseScene.preloadImage(`/images/scenes/${s.background.image}`));
      await Promise.allSettled(imagePromises);
    }
  }

  async enter(container, context) {
    await super.enter(container, context);

    if (!this.chapterData) {
      console.error(`No data for chapter ${this.chapterNum}`);
      return;
    }

    // Set chapter accent color
    container.classList.add(`scene--ch${this.chapterNum}`);

    // Build initial scene background (first scene's background)
    const firstScene = this.chapterData.scenes[0];
    if (firstScene && firstScene.background) {
      this.createBackground(firstScene.background);
    }
  }

  async run() {
    if (!this.chapterData) return;

    const meta = this.gameCtx.config.chapters[this.chapterNum - 1];

    // Show title card
    await this.showTitleCard(meta.title, meta.subtitle);

    // Run through all chapter scenes sequentially
    for (let i = 0; i < this.chapterData.scenes.length; i++) {
      if (this.destroyed) break;
      this.currentSceneIndex = i;
      await this._runChapterScene(this.chapterData.scenes[i]);
    }

    // Chapter complete
    this.context.sceneManager.completeChapter();

    // Pop back to restaurant with transition (safe — transitioning is false in run())
    // If jumped directly via chapter jumper, stack may only have this scene — go to restaurant instead
    if (this.context.sceneManager.sceneStack.length > 1) {
      await this.context.sceneManager.popScene('ink-wash');
    } else {
      await this.context.sceneManager.goto('restaurant', 'ink-wash');
    }
  }

  async _runChapterScene(sceneData) {
    // Scene divider between sub-scenes (not before the first one)
    if (this.currentSceneIndex > 0) {
      await this._showSceneDivider();
    }

    // Clear previous scene content
    this.container.innerHTML = '';
    this.gameCtx.interactionLayer.clear();

    // Create background
    if (sceneData.background) {
      this.createBackground(sceneData.background);
    }

    // Set particle theme if specified
    if (sceneData.particles) {
      this.gameCtx.particleCanvas.setTheme(sceneData.particles);
    }

    // Apply per-scene particle config overrides
    if (sceneData.particleConfig) {
      this.gameCtx.particleCanvas.start(sceneData.particleConfig);
    }

    // Fade in
    gsap.fromTo(this.container.children, { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.1 });

    // Set up background change callback for bg-change dialog nodes
    this.gameCtx.dialogEngine.onBgChange = (image) => {
      const bgImageEl = this.container.querySelector('.scene-bg-image');
      if (bgImageEl) {
        gsap.to(bgImageEl, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => {
            bgImageEl.style.backgroundImage = `url('/images/scenes/${image}')`;
            gsap.to(bgImageEl, { opacity: 1, duration: 0.6 });
          }
        });
      }
    };

    // Run intro dialog (scene introduction, before exploration)
    if (sceneData.introDialog && sceneData.introDialog.length > 0) {
      await this.runDialog(sceneData.introDialog, (actionId, params) => {
        return this._handleAction(actionId, params);
      });
    }

    // Setup hotspots if any
    if (sceneData.hotspots && sceneData.hotspots.length > 0) {
      await this._handleExploration(sceneData);
      // Clear remaining hotspots before scene dialog to prevent conflicts
      this.gameCtx.interactionLayer.clear();
    }

    // Run dialog sequence
    if (sceneData.dialog && sceneData.dialog.length > 0) {
      await this.runDialog(sceneData.dialog, (actionId, params) => {
        return this._handleAction(actionId, params);
      });
    }

    // Silence moment
    if (sceneData.silenceDuration) {
      await new Promise(resolve => setTimeout(resolve, sceneData.silenceDuration));
    }
  }

  async _handleExploration(sceneData) {
    // Create exploration prompts
    const requiredHotspots = sceneData.hotspots.filter(h => h.required);
    const optionalHotspots = sceneData.hotspots.filter(h => !h.required);
    let requiredCollected = 0;
    let dialogLock = false;
    let explorationDone = false;
    const exploredIds = new Set();

    return new Promise(resolve => {
      const markExplored = (id) => {
        exploredIds.add(id);
        const entry = this.gameCtx.interactionLayer.activeHotspots.get(id);
        if (entry) {
          entry.el.classList.add('hotspot--collected');
          gsap.to(entry.el, { opacity: 0.3, duration: 0.5 });
        }
      };

      const checkComplete = () => {
        if (requiredCollected >= requiredHotspots.length && !explorationDone) {
          // Delay before closing exploration 鈥?let player explore optional hotspots
          setTimeout(() => {
            explorationDone = true;
            // Wait for any in-progress hotspot dialog to finish before resolving
            const waitForDialog = () => {
              if (dialogLock) {
                setTimeout(waitForDialog, 100);
              } else {
                resolve();
              }
            };
            waitForDialog();
          }, 2500);
        }
      };

      this.setupHotspots(sceneData.hotspots, {
        onTrigger: (targetScene, def) => {
          if (def.required) {
            requiredCollected++;
            checkComplete();
          }
        },
        onDialog: async (dialogNodes, def) => {
          // Prevent concurrent dialog runs, re-clicking explored hotspots, or new dialogs after done
          if (dialogLock || explorationDone || exploredIds.has(def.id)) return;
          dialogLock = true;
          try {
            await this.runDialog(dialogNodes);
          } catch (err) {
            console.error('Hotspot dialog error:', err);
          }
          dialogLock = false;
          markExplored(def.id);
          if (def.required) {
            requiredCollected++;
            checkComplete();
          }
        },
        onFragment: (fragmentId, def) => {
          if (exploredIds.has(def.id)) return;
          exploredIds.add(def.id);
          this.gameCtx.memoryFragment.collect(def.label || fragmentId);
          // Also run fragment dialog if present
          if (def.dialogNodes && def.dialogNodes.length > 0 && !dialogLock && !explorationDone) {
            dialogLock = true;
            this.runDialog(def.dialogNodes).then(() => {
              dialogLock = false;
            }).catch(err => {
              console.error('Fragment dialog error:', err);
              dialogLock = false;
            });
          }
        },
        onAction: (actionId, params) => {
          this._handleAction(actionId, params);
        }
      });

      // If no required hotspots, auto-proceed after optional dialog
      if (requiredHotspots.length === 0) {
        resolve();
      }
    });
  }

  async _handleAction(actionId, params) {
    switch (actionId) {
      case 'show-odometer':
        // Handled by chapter-specific scene data
        break;
      case 'scene-transition':
        // Internal scene transition
        break;
      default:
        console.log(`Action: ${actionId}`, params);
    }
  }

  async _showSceneDivider() {
    const divider = this.createElement('div', 'scene-divider');
    this.container.appendChild(divider);

    await new Promise(resolve => {
      gsap.to(divider, {
        scaleX: 1,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(divider, {
            opacity: 0,
            duration: 0.4,
            delay: 0.3,
            onComplete: () => {
              divider.remove();
              resolve();
            }
          });
        }
      });
    });
  }

  async exit() {
    this.gameCtx.interactionLayer.clear();
    this.container.classList.remove(`scene--ch${this.chapterNum}`);
    await super.exit();
  }
}
