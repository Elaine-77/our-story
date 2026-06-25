import gsap from 'gsap';

/**
 * JournalStamp - Wax-seal stamp that appears after chapter completion
 * Visual confirmation of memory collection, with press animation
 */
export class JournalStamp {
  constructor() {
    this.container = null;
    this._build();
  }

  _build() {
    this.container = document.createElement('div');
    this.container.className = 'stamp-container';
    this.container.style.display = 'none';

    const uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
      uiLayer.appendChild(this.container);
    }
  }

  /**
   * Show a wax-seal stamp with animation
   * @param {Object} options
   * @param {string} options.text - Stamp text (e.g., chapter name)
   * @param {string} options.chapterNum - Chapter number for color
   * @param {Function} options.onComplete - Called when animation finishes
   */
  show({ text = '', chapterNum = '1', onComplete = null } = {}) {
    this.container.innerHTML = '';

    const stamp = document.createElement('div');
    stamp.className = `journal-stamp stamp--ch${chapterNum}`;

    const stampText = document.createElement('span');
    stampText.className = 'stamp-text';
    stampText.textContent = text;

    const stampRing = document.createElement('div');
    stampRing.className = 'stamp-ring';

    stamp.appendChild(stampRing);
    stamp.appendChild(stampText);
    this.container.appendChild(stamp);
    this.container.style.display = 'flex';

    // Stamp press animation
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) {
          setTimeout(onComplete, 800);
        }
      }
    });

    tl.fromTo(stamp,
      {
        scale: 2.5,
        rotation: -20,
        opacity: 0
      },
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(2)'
      }
    );

    // Subtle bounce
    tl.to(stamp, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    // Ink splatter effect via box-shadow pulse
    tl.to(stamp, {
      boxShadow: '0 0 30px rgba(114, 47, 55, 0.6), 0 0 60px rgba(114, 47, 55, 0.2)',
      duration: 0.3,
      yoyo: true,
      repeat: 1
    }, '-=0.15');
  }

  hide() {
    gsap.to(this.container, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        this.container.style.display = 'none';
        this.container.innerHTML = '';
      }
    });
  }
}
