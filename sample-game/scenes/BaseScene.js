import gsap from 'gsap';

/**
 * BaseScene - Common scene lifecycle and utilities
 * All scenes extend this class
 */
export class BaseScene {
  constructor(gameCtx) {
    this.gameCtx = gameCtx;
    this.container = null;
    this.context = null;
    this.destroyed = false;
  }

  /**
   * Preload assets (override in subclass)
   */
  async preload() {}

  /**
   * Enter scene — BUILD DOM ONLY (backgrounds, static elements)
   * Do NOT run dialog or trigger navigation here!
   * @param {HTMLElement} container - The scene-layer div
   * @param {Object} context - { sceneManager, choiceEcho, audioManager, ... }
   */
  async enter(container, context) {
    this.container = container;
    this.context = context;
    this.destroyed = false;
  }

  /**
   * Run interactive content — called AFTER transition completes
   * and transitioning = false. Safe to call goto/pushScene/popScene here.
   * Override in subclass for dialog, navigation, etc.
   */
  async run() {}

  /**
   * Frame update (optional override)
   */
  update(dt) {}

  /**
   * Exit scene — cleanup
   */
  async exit() {
    this.destroyed = true;
  }

  // --- Utility methods ---

  /**
   * Create a DOM element with class and optional HTML
   */
  createElement(tag, className, innerHTML) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  }

  /**
   * Run a dialog sequence using the DialogEngine
   */
  async runDialog(nodes, onAction) {
    return this.gameCtx.dialogEngine.runSequence(nodes, onAction);
  }

  /**
   * Setup hotspots on current container
   */
  setupHotspots(hotspots, handlers) {
    this.gameCtx.interactionLayer.setup(this.container, hotspots, handlers);
  }

  /**
   * Show chapter title card with animation
   */
  showTitleCard(title, subtitle) {
    return new Promise(resolve => {
      const card = this.createElement('div', 'chapter-title-card');
      card.innerHTML = `
        <h2>${title}</h2>
        <p class="chapter-subtitle">${subtitle}</p>
      `;
      this.container.appendChild(card);

      // Auto-dismiss after animation
      setTimeout(() => {
        gsap.to(card, {
          opacity: 0,
          duration: 0.8,
          delay: 0.5,
          onComplete: () => {
            card.remove();
            resolve();
          }
        });
      }, 2000);
    });
  }

  /**
   * Preload an image and resolve when ready (or on error, for graceful fallback)
   */
  static preloadImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = src;
    });
  }

  /**
   * Create a layered scene background:
   *   1. Background image (AI-generated, if provided)
   *   2. Gradient overlay (semi-transparent when image present)
   *   3. Atmosphere overlay (warm/cool/dim)
   *   4. Paper grain texture
   *   5. Vignette
   *   6. Art Nouveau decorative frame
   *
   * Supports both old signature (gradientCSS, atmosphere) and new object format.
   */
  createBackground(bgConfigOrGradient, atmosphere) {
    let bgConfig;
    if (typeof bgConfigOrGradient === 'string') {
      bgConfig = { gradient: bgConfigOrGradient, atmosphere };
    } else {
      bgConfig = bgConfigOrGradient;
    }

    // Layer 1: Background image
    if (bgConfig.image) {
      const imgDiv = this.createElement('div', 'scene-bg-image');
      imgDiv.style.backgroundImage = `url('/images/scenes/${bgConfig.image}')`;
      if (bgConfig.imagePosition) {
        imgDiv.style.backgroundPosition = bgConfig.imagePosition;
      }
      this.container.appendChild(imgDiv);
    }

    // Layer 2: Gradient overlay
    const bg = this.createElement('div', 'scene-bg');
    bg.style.background = bgConfig.gradient;
    this.container.appendChild(bg);

    // Layer 3: Atmosphere
    if (bgConfig.atmosphere) {
      const atmos = this.createElement('div', `scene-atmosphere scene-atmosphere--${bgConfig.atmosphere}`);
      this.container.appendChild(atmos);
    }

    // Layer 4: Paper texture
    const paper = this.createElement('div', 'scene-paper-texture');
    this.container.appendChild(paper);

    // Layer 5: Vignette (skippable for bright scenes)
    if (!bgConfig.skipVignette) {
      const vignette = this.createElement('div', 'scene-vignette');
      this.container.appendChild(vignette);
    }

    // Layer 6: Decorative frame
    const frame = this.createElement('div', 'scene-frame');
    frame.innerHTML =
      '<div class="frame-corner frame-corner--tl"></div>' +
      '<div class="frame-corner frame-corner--tr"></div>' +
      '<div class="frame-corner frame-corner--bl"></div>' +
      '<div class="frame-corner frame-corner--br"></div>' +
      '<div class="frame-border frame-border--top"></div>' +
      '<div class="frame-border frame-border--bottom"></div>' +
      '<div class="frame-border frame-border--left"></div>' +
      '<div class="frame-border frame-border--right"></div>';
    this.container.appendChild(frame);

    return bg;
  }
}
