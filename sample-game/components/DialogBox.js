import gsap from 'gsap';

/**
 * DialogBox - Bottom-screen dialog UI with parchment styling
 * Shows narrator text, character dialog, and continue indicators
 */
export class DialogBox {
  constructor() {
    this.element = null;
    this.textEl = null;
    this.speakerEl = null;
    this.continueEl = null;
    this.visible = false;
    this._build();
  }

  _build() {
    this.element = document.createElement('div');
    this.element.className = 'dialog-box';
    this.element.setAttribute('role', 'log');
    this.element.setAttribute('aria-live', 'polite');

    this.speakerEl = document.createElement('div');
    this.speakerEl.className = 'dialog-speaker';

    this.textEl = document.createElement('div');
    this.textEl.className = 'dialog-text';

    this.continueEl = document.createElement('div');
    this.continueEl.className = 'dialog-continue';
    this.continueEl.innerHTML = '<span class="continue-arrow">▼</span>';

    this.element.appendChild(this.speakerEl);
    this.element.appendChild(this.textEl);
    this.element.appendChild(this.continueEl);

    // Mount to UI layer
    const uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
      uiLayer.appendChild(this.element);
    }

    // Initially hidden
    this.element.style.display = 'none';
  }

  show({ isNarrator = true, speaker = '' } = {}) {
    // Kill any pending hide/show animations to prevent state conflicts
    gsap.killTweensOf(this.element);

    this.visible = true;
    this.textEl.textContent = '';
    this.continueEl.style.opacity = '0';

    if (isNarrator) {
      this.element.classList.add('dialog-box--narrator');
      this.element.classList.remove('dialog-box--character');
      this.speakerEl.style.display = 'none';
    } else {
      this.element.classList.remove('dialog-box--narrator');
      this.element.classList.add('dialog-box--character');
      this.speakerEl.style.display = speaker ? 'block' : 'none';
      this.speakerEl.textContent = speaker;
    }

    this.element.style.display = 'block';
    gsap.fromTo(this.element,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }

  hide() {
    if (!this.visible) return;
    this.visible = false;
    // Kill any pending animations before starting hide
    gsap.killTweensOf(this.element);
    gsap.to(this.element, {
      opacity: 0,
      y: 10,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.element.style.display = 'none';
      }
    });
  }

  setText(text) {
    this.textEl.textContent = text;
  }

  showContinueIndicator() {
    gsap.to(this.continueEl, {
      opacity: 1,
      duration: 0.3
    });
  }

  hideContinueIndicator() {
    this.continueEl.style.opacity = '0';
  }

  getElement() {
    return this.element;
  }
}
