import gsap from 'gsap';

/**
 * InteractionLayer - Manages clickable hotspots overlaid on scenes
 */
export class InteractionLayer {
  constructor() {
    this.container = null;
    this.hotspots = [];
    this.activeHotspots = new Map(); // id → DOM element
    this.onTrigger = null;
    this.onDialog = null;
    this.onFragment = null;
    this.onCustomAction = null;
    this.audioManager = null;
    this.choiceEcho = null;
    this._pointerStart = null;
  }

  init({ audioManager, choiceEcho }) {
    this.audioManager = audioManager;
    this.choiceEcho = choiceEcho;
  }

  /**
   * Setup hotspots on a container element
   * @param {HTMLElement} container - The scene container
   * @param {Array} hotspots - Array of hotspot definitions
   * @param {Object} handlers - { onTrigger, onDialog, onFragment, onAction }
   */
  setup(container, hotspots, handlers = {}) {
    this.clear();
    this.container = container;
    this.onTrigger = handlers.onTrigger || null;
    this.onDialog = handlers.onDialog || null;
    this.onFragment = handlers.onFragment || null;
    this.onCustomAction = handlers.onAction || null;

    hotspots.forEach(hs => this.addHotspot(hs));
  }

  addHotspot(def) {
    const el = document.createElement('div');
    el.className = `hotspot hotspot--${def.feedback || 'glow'}`;
    if (def.hidden) el.classList.add('hotspot--hidden');
    if (def.required) el.classList.add('hotspot--required');

    // Position with percentages for responsiveness
    el.style.cssText = `
      position: absolute;
      left: ${def.bounds.x}%;
      top: ${def.bounds.y}%;
      width: ${def.bounds.width}%;
      height: ${def.bounds.height}%;
      min-width: 44px;
      min-height: 44px;
      cursor: pointer;
      touch-action: manipulation;
    `;

    // Visual indicator (glow dot + pulse ring)
    const indicator = document.createElement('div');
    indicator.className = 'hotspot-indicator';
    el.appendChild(indicator);

    // Optional label
    if (def.label) {
      const label = document.createElement('span');
      label.className = 'hotspot-label';
      label.textContent = def.label;
      el.appendChild(label);
    }

    // Touch/click handling
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this._pointerStart = { x: e.clientX, y: e.clientY, time: Date.now() };
    });

    el.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      if (!this._pointerStart) return;
      const dx = e.clientX - this._pointerStart.x;
      const dy = e.clientY - this._pointerStart.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = Date.now() - this._pointerStart.time;
      this._pointerStart = null;

      // Distinguish tap from scroll (< 10px movement and < 500ms)
      if (dist < 10 && elapsed < 500) {
        this.handleTap(def, el);
      }
    });

    // Also handle click as fallback (for browser automation / accessibility)
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      // Only fire if pointerdown/up didn't already handle it
      if (this._clickHandled) {
        this._clickHandled = false;
        return;
      }
      this.handleTap(def, el);
    });

    if (this.container) {
      this.container.appendChild(el);
    }
    this.activeHotspots.set(def.id, { el, def });

    // Entry animation
    gsap.fromTo(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)', delay: def.delay || 0 });
  }

  handleTap(def, el) {
    this._clickHandled = true;

    if (this.audioManager) {
      this.audioManager.playSFX('click');
    }

    // Brief tap feedback
    gsap.fromTo(el, { scale: 0.95 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' });

    switch (def.type) {
      case 'trigger':
        if (this.onTrigger) this.onTrigger(def.targetScene, def);
        break;

      case 'dialog':
        if (this.onDialog) this.onDialog(def.dialogNodes || [], def);
        break;

      case 'fragment':
        if (this.choiceEcho) {
          this.choiceEcho.collectFragment(def.fragmentId);
        }
        el.classList.add('hotspot--collected');
        gsap.to(el, { opacity: 0.3, duration: 0.5 });
        if (this.onFragment) this.onFragment(def.fragmentId, def, el);
        break;

      case 'action':
        if (this.onCustomAction) this.onCustomAction(def.actionId, def.params || {}, def);
        break;
    }
  }

  removeHotspot(id) {
    const entry = this.activeHotspots.get(id);
    if (entry) {
      gsap.to(entry.el, { opacity: 0, duration: 0.3, onComplete: () => entry.el.remove() });
      this.activeHotspots.delete(id);
    }
  }

  clear() {
    this.activeHotspots.forEach(({ el }) => el.remove());
    this.activeHotspots.clear();
    this.onTrigger = null;
    this.onDialog = null;
    this.onFragment = null;
    this.onCustomAction = null;
  }

  /**
   * Update hotspot set (e.g., when restaurant state changes)
   */
  updateHotspots(newHotspots) {
    this.clear();
    if (this.container) {
      newHotspots.forEach(hs => this.addHotspot(hs));
    }
  }
}
