import gsap from 'gsap';

/**
 * MemoryFragment - Collectible item UI with golden glow
 * Shows collected fragment notification and tracks count
 */
export class MemoryFragment {
  constructor() {
    this.notificationEl = null;
    this.counterEl = null;
    this.collected = 0;
    this.total = 0;
    this._build();
  }

  _build() {
    // Notification toast for fragment collection
    this.notificationEl = document.createElement('div');
    this.notificationEl.className = 'fragment-notification';
    this.notificationEl.setAttribute('role', 'status');
    this.notificationEl.style.display = 'none';

    const icon = document.createElement('span');
    icon.className = 'fragment-icon';
    icon.textContent = '✦';

    const text = document.createElement('span');
    text.className = 'fragment-text';

    this.notificationEl.appendChild(icon);
    this.notificationEl.appendChild(text);

    // Counter display (top-right)
    this.counterEl = document.createElement('div');
    this.counterEl.className = 'fragment-counter';
    this.counterEl.style.display = 'none';

    const uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
      uiLayer.appendChild(this.notificationEl);
      uiLayer.appendChild(this.counterEl);
    }
  }

  setTotal(total) {
    this.total = total;
    this._updateCounter();
  }

  /**
   * Show collection notification
   * @param {string} name - Fragment name to display
   */
  collect(name) {
    this.collected++;
    this._updateCounter();
    // Show counter on first collection
    if (this.collected === 1) {
      this.showCounter();
    }
    this._showNotification(name);
  }

  _updateCounter() {
    this.counterEl.textContent = `✦ ${this.collected}/${this.total}`;
    // Don't auto-show; only show after first collect or explicit showCounter()
  }

  _showNotification(name) {
    const textEl = this.notificationEl.querySelector('.fragment-text');
    textEl.textContent = `记忆碎片：${name}`;

    this.notificationEl.style.display = 'flex';

    const tl = gsap.timeline();

    tl.fromTo(this.notificationEl,
      { opacity: 0, y: -20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
    );

    // Golden flash
    tl.to(this.notificationEl, {
      boxShadow: '0 0 20px rgba(201, 169, 89, 0.6)',
      duration: 0.3,
      yoyo: true,
      repeat: 1
    }, '-=0.2');

    // Hold and fade
    tl.to(this.notificationEl, {
      opacity: 0,
      y: -10,
      duration: 0.5,
      delay: 1.5,
      onComplete: () => {
        this.notificationEl.style.display = 'none';
      }
    });
  }

  showCounter() {
    this.counterEl.style.display = 'block';
    gsap.fromTo(this.counterEl,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );
  }

  hideCounter() {
    gsap.to(this.counterEl, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        this.counterEl.style.display = 'none';
      }
    });
  }

  isComplete() {
    return this.collected >= this.total && this.total > 0;
  }
}
