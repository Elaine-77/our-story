import gsap from 'gsap';

/**
 * LoadingScreen - Journal cover opening sequence
 * Doubles as first-interaction handler for audio unlock
 */
export class LoadingScreen {
  constructor() {
    this.element = null;
    this.onStart = null;
    this._build();
  }

  _build() {
    this.element = document.createElement('div');
    this.element.className = 'loading-screen';
    this.element.setAttribute('role', 'button');
    this.element.setAttribute('aria-label', '开始阅读');

    this.element.innerHTML = `
      <div class="journal-cover">
        <div class="journal-cover-texture"></div>
        <div class="journal-cover-frame">
          <div class="journal-cover-ornament top-left"></div>
          <div class="journal-cover-ornament top-right"></div>
          <div class="journal-cover-ornament bottom-left"></div>
          <div class="journal-cover-ornament bottom-right"></div>
        </div>
        <div class="journal-cover-content">
          <h1 class="journal-title">我们的故事</h1>
          <div class="journal-divider"></div>
          <p class="journal-subtitle">翻开这本旧日记</p>
        </div>
        <div class="journal-clasp">
          <div class="clasp-body"></div>
          <span class="clasp-text">轻触打开</span>
        </div>
      </div>
      <div class="loading-progress" style="display:none">
        <div class="loading-bar"></div>
      </div>
    `;

    document.getElementById('game-root').appendChild(this.element);
  }

  /**
   * Show loading screen and wait for tap to start
   * @param {Function} onStart - Called when user taps to begin
   */
  async waitForStart(onStart) {
    this.onStart = onStart;

    // Entrance animation
    const cover = this.element.querySelector('.journal-cover');
    const title = this.element.querySelector('.journal-title');
    const subtitle = this.element.querySelector('.journal-subtitle');
    const clasp = this.element.querySelector('.journal-clasp');
    const divider = this.element.querySelector('.journal-divider');

    const tl = gsap.timeline();

    tl.fromTo(cover,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }
    );

    tl.fromTo(title,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.4'
    );

    tl.fromTo(divider,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: 'power2.inOut' },
      '-=0.3'
    );

    tl.fromTo(subtitle,
      { opacity: 0 },
      { opacity: 0.7, duration: 0.6 },
      '-=0.2'
    );

    tl.fromTo(clasp,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      '-=0.2'
    );

    // Pulse clasp to attract tap
    gsap.to(clasp, {
      scale: 1.05,
      duration: 1.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    // Wait for click/tap
    return new Promise(resolve => {
      const handler = async (e) => {
        e.preventDefault();
        this.element.removeEventListener('click', handler);
        this.element.removeEventListener('touchend', handler);

        // Stop pulse
        gsap.killTweensOf(clasp);

        // Clasp open animation
        await this._openAnimation();

        if (this.onStart) {
          await this.onStart();
        }

        resolve();
      };

      this.element.addEventListener('click', handler);
      this.element.addEventListener('touchend', handler);
    });
  }

  async _openAnimation() {
    const clasp = this.element.querySelector('.journal-clasp');
    const cover = this.element.querySelector('.journal-cover');

    const tl = gsap.timeline();

    // Clasp clicks open
    tl.to(clasp, {
      y: 10,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    });

    // Cover lifts and fades
    tl.to(cover, {
      rotateX: -15,
      y: -30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.in'
    }, '-=0.1');

    // Entire loading screen fades out
    tl.to(this.element, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        this.element.style.display = 'none';
      }
    });

    return tl;
  }

  /**
   * Show a progress bar (for asset preloading)
   * @param {number} progress - 0 to 1
   */
  setProgress(progress) {
    const bar = this.element.querySelector('.loading-bar');
    const container = this.element.querySelector('.loading-progress');
    if (bar && container) {
      container.style.display = 'block';
      bar.style.width = `${Math.min(progress * 100, 100)}%`;
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
