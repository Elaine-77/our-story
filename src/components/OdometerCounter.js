import gsap from 'gsap';

/**
 * OdometerCounter - Animated rolling number display
 * Used for the 100km drive counter in Chapter 1
 */
export class OdometerCounter {
  constructor(container) {
    this.container = container;
    this.digits = [];
    this.currentValue = 0;
    this.element = null;
  }

  /**
   * Initialize with display parameters
   * @param {Object} options
   * @param {number} options.numDigits - Number of digit positions
   * @param {string} options.suffix - Text after number (e.g., 'km')
   */
  init({ numDigits = 3, suffix = '' } = {}) {
    this.element = document.createElement('div');
    this.element.className = 'odometer-display';

    for (let i = 0; i < numDigits; i++) {
      const digitWrap = document.createElement('div');
      digitWrap.className = 'odometer-digit';

      const inner = document.createElement('div');
      inner.className = 'odometer-digit-inner';
      // Create all 10 digits vertically
      for (let n = 0; n <= 9; n++) {
        const span = document.createElement('span');
        span.className = 'odometer-digit-num';
        span.textContent = n;
        span.style.display = 'block';
        span.style.height = '1.2em';
        span.style.lineHeight = '1.2em';
        inner.appendChild(span);
      }

      digitWrap.appendChild(inner);
      this.element.appendChild(digitWrap);
      this.digits.push(inner);
    }

    if (suffix) {
      const suffixEl = document.createElement('span');
      suffixEl.className = 'odometer-suffix';
      suffixEl.textContent = suffix;
      this.element.appendChild(suffixEl);
    }

    this.container.appendChild(this.element);
    this.setValue(0, false);
  }

  /**
   * Set counter value with optional animation
   * @param {number} value
   * @param {boolean} animate
   */
  setValue(value, animate = true) {
    const str = String(Math.floor(value)).padStart(this.digits.length, '0');
    this.currentValue = value;

    for (let i = 0; i < this.digits.length; i++) {
      const digit = parseInt(str[i], 10);
      const inner = this.digits[i];
      const targetY = -(digit * 1.2);

      if (animate) {
        gsap.to(inner, {
          y: `${targetY}em`,
          duration: 0.5 + (i * 0.1),
          ease: 'power2.out'
        });
      } else {
        inner.style.transform = `translateY(${targetY}em)`;
      }
    }
  }

  /**
   * Animate from startVal to endVal over duration
   * @param {number} startVal
   * @param {number} endVal
   * @param {number} duration - seconds
   * @returns {Promise}
   */
  animateTo(startVal, endVal, duration = 3) {
    return new Promise(resolve => {
      const obj = { val: startVal };
      this.setValue(startVal, false);

      gsap.to(obj, {
        val: endVal,
        duration,
        ease: 'power1.inOut',
        onUpdate: () => {
          this.setValue(Math.floor(obj.val));
        },
        onComplete: () => {
          this.setValue(endVal);
          resolve();
        }
      });
    });
  }

  getElement() {
    return this.element;
  }
}
