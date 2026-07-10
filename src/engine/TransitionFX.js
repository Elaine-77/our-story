import gsap from 'gsap';

/**
 * TransitionFX - Scene transition effects
 * Ink-wash (SVG filter), page-turn (CSS 3D), fade
 */
export class TransitionFX {
  constructor() {
    this.overlay = document.getElementById('transition-overlay');
    this.isActive = false;
    this._setupSVGFilter();
    this._setupElements();
  }

  _setupSVGFilter() {
    // SVG filter for ink-wash effect
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML = `
      <defs>
        <filter id="ink-wash-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence id="ink-turbulence" type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="42" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="ink-displacement"/>
          <feColorMatrix type="matrix" values="0.3 0.3 0.3 0 0.05  0.2 0.15 0.1 0 0.02  0.1 0.08 0.05 0 0.01  0 0 0 1 0"/>
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
  }

  _setupElements() {
    // Ink overlay element
    this.inkOverlay = document.createElement('div');
    this.inkOverlay.className = 'transition-ink';
    this.inkOverlay.style.cssText = `
      position: absolute; inset: 0;
      background: #1a0f0a;
      opacity: 0;
      pointer-events: none;
    `;
    this.overlay.appendChild(this.inkOverlay);

    // Page turn element
    this.pageEl = document.createElement('div');
    this.pageEl.className = 'transition-page';
    this.pageEl.style.cssText = `
      position: absolute; inset: 0;
      background: linear-gradient(to left, #d4c5a9, #e8dcc8 30%, #f5efe0 70%, #e8dcc8);
      transform-origin: left center;
      transform: rotateY(-180deg);
      backface-visibility: hidden;
      pointer-events: none;
      display: none;
    `;
    this.overlay.appendChild(this.pageEl);
  }

  /**
   * Start transition - covers the screen
   * @returns {Promise} resolves when screen is fully covered
   */
  async start(type = 'fade') {
    this.isActive = true;
    this.overlay.style.pointerEvents = 'all';

    switch (type) {
      case 'ink-wash':
      case 'ink-reverse':
        return this._inkWashIn();
      case 'page-turn':
        return this._pageTurnIn();
      case 'fade':
      default:
        return this._fadeIn();
    }
  }

  /**
   * End transition - reveals new scene
   * @returns {Promise} resolves when fully revealed
   */
  async end(type = 'fade') {
    let promise;
    switch (type) {
      case 'ink-wash':
      case 'ink-reverse':
        promise = this._inkWashOut();
        break;
      case 'page-turn':
        promise = this._pageTurnOut();
        break;
      case 'fade':
      default:
        promise = this._fadeOut();
    }

    await promise;
    this.isActive = false;
    this.overlay.style.pointerEvents = 'none';
  }

  // --- Ink Wash ---
  _inkWashIn() {
    return new Promise(resolve => {
      const displacement = document.getElementById('ink-displacement');
      this.inkOverlay.style.display = 'block';

      gsap.timeline({ onComplete: resolve })
        .to(this.inkOverlay, { opacity: 1, duration: 0.6, ease: 'power2.in' })
        .to(displacement, { attr: { scale: 30 }, duration: 0.6, ease: 'power2.in' }, 0);
    });
  }

  _inkWashOut() {
    return new Promise(resolve => {
      const displacement = document.getElementById('ink-displacement');

      gsap.timeline({
        onComplete: () => {
          this.inkOverlay.style.display = 'none';
          resolve();
        }
      })
        .to(displacement, { attr: { scale: 0 }, duration: 0.6, ease: 'power2.out' })
        .to(this.inkOverlay, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0);
    });
  }

  // --- Page Turn ---
  _pageTurnIn() {
    return new Promise(resolve => {
      this.pageEl.style.display = 'block';
      gsap.to(this.pageEl, {
        rotateY: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: resolve
      });
    });
  }

  _pageTurnOut() {
    return new Promise(resolve => {
      gsap.to(this.pageEl, {
        rotateY: 180,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          this.pageEl.style.display = 'none';
          gsap.set(this.pageEl, { rotateY: -180 });
          resolve();
        }
      });
    });
  }

  // --- Fade ---
  _fadeIn() {
    return new Promise(resolve => {
      this.inkOverlay.style.display = 'block';
      gsap.to(this.inkOverlay, { opacity: 1, duration: 0.5, ease: 'power2.in', onComplete: resolve });
    });
  }

  _fadeOut() {
    return new Promise(resolve => {
      gsap.to(this.inkOverlay, {
        opacity: 0, duration: 0.5, ease: 'power2.out',
        onComplete: () => {
          this.inkOverlay.style.display = 'none';
          resolve();
        }
      });
    });
  }
}
