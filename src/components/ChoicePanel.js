import gsap from 'gsap';

/**
 * ChoicePanel - Wax-seal style choice buttons overlay
 * Displays options and returns selected index via callback
 */
export class ChoicePanel {
  constructor() {
    this.element = null;
    this.buttonsContainer = null;
    this.visible = false;
    this._build();
  }

  _build() {
    this.element = document.createElement('div');
    this.element.className = 'choice-panel';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-label', '选择');

    this.buttonsContainer = document.createElement('div');
    this.buttonsContainer.className = 'choice-buttons';

    this.element.appendChild(this.buttonsContainer);

    const uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
      uiLayer.appendChild(this.element);
    }

    this.element.style.display = 'none';
  }

  /**
   * Show choices
   * @param {Array<{text: string}>} options
   * @param {Function} onSelect - called with selected index
   */
  show(options, onSelect) {
    this.visible = true;
    this.buttonsContainer.innerHTML = '';

    options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = option.text;
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-label', option.text);

      btn.addEventListener('click', () => {
        if (!this.visible) return;
        // Tap feedback
        gsap.to(btn, {
          scale: 0.9,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            onSelect(index);
          }
        });
      });

      this.buttonsContainer.appendChild(btn);
    });

    this.element.style.display = 'flex';
    this.element.classList.add('visible');

    // Staggered entrance
    gsap.fromTo(this.element,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );

    const btns = this.buttonsContainer.querySelectorAll('.choice-btn');
    gsap.fromTo(btns,
      { opacity: 0, y: 20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.12,
        ease: 'back.out(1.2)'
      }
    );
  }

  hide() {
    if (!this.visible) return;
    this.visible = false;

    gsap.to(this.element, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        this.element.style.display = 'none';
        this.element.classList.remove('visible');
        this.buttonsContainer.innerHTML = '';
      }
    });
  }

  getElement() {
    return this.element;
  }
}
