/**
 * ParticleCanvas - Floating dust motes / ambient particle effects
 * Uses Canvas 2D for performance on mobile
 */
export class ParticleCanvas {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.active = false;
    this.config = {
      count: 25,
      color: 'rgba(201, 169, 89, 0.3)',
      minSize: 1,
      maxSize: 3,
      speed: 0.3
    };
  }

  init() {
    if (!this.canvas) return;

    // Set up canvas as actual <canvas> element
    if (this.canvas.tagName !== 'CANVAS') {
      const actualCanvas = document.createElement('canvas');
      actualCanvas.id = 'particle-canvas';
      actualCanvas.style.cssText = this.canvas.style.cssText;
      actualCanvas.className = this.canvas.className;
      this.canvas.replaceWith(actualCanvas);
      this.canvas = actualCanvas;
    }

    this.ctx = this.canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.ctx.scale(dpr, dpr);
  }

  /**
   * Start particle effect
   * @param {Object} options - Override default config
   */
  start(options = {}) {
    Object.assign(this.config, options);
    this.active = true;
    this.particles = [];

    for (let i = 0; i < this.config.count; i++) {
      this.particles.push(this._createParticle());
    }

    this._animate();
  }

  stop() {
    this.active = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.particles = [];
  }

  _createParticle() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      size: this.config.minSize + Math.random() * (this.config.maxSize - this.config.minSize),
      speedX: (Math.random() - 0.5) * this.config.speed,
      speedY: -Math.random() * this.config.speed - 0.1,
      opacity: Math.random() * 0.5 + 0.2,
      life: Math.random() * 200 + 100,
      age: 0
    };
  }

  _animate() {
    if (!this.active) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    this.ctx.clearRect(0, 0, w, h);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.age++;

      // Fade based on lifecycle
      const lifeRatio = p.age / p.life;
      let alpha = p.opacity;
      if (lifeRatio < 0.1) {
        alpha *= lifeRatio / 0.1;
      } else if (lifeRatio > 0.8) {
        alpha *= (1 - lifeRatio) / 0.2;
      }

      // Recycle dead particles
      if (p.age >= p.life || p.y < -10 || p.x < -10 || p.x > w + 10) {
        this.particles[i] = this._createParticle();
        this.particles[i].y = h + 10;
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.config.color.replace(/[\d.]+\)$/, `${alpha})`);
      this.ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this._animate());
  }

  /**
   * Set preset particle themes
   */
  setTheme(theme) {
    const themes = {
      dust: {
        count: 20,
        color: 'rgba(201, 169, 89, 0.3)',
        minSize: 1,
        maxSize: 2.5,
        speed: 0.2
      },
      firefly: {
        count: 12,
        color: 'rgba(255, 191, 0, 0.5)',
        minSize: 1.5,
        maxSize: 3,
        speed: 0.4
      },
      snow: {
        count: 30,
        color: 'rgba(255, 255, 240, 0.4)',
        minSize: 1,
        maxSize: 3,
        speed: 0.5
      },
      petals: {
        count: 8,
        color: 'rgba(183, 110, 121, 0.4)',
        minSize: 2,
        maxSize: 5,
        speed: 0.3
      }
    };

    if (themes[theme]) {
      this.stop();
      this.start(themes[theme]);
    }
  }
}
