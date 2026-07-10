import gsap from 'gsap';
import { BaseScene } from './BaseScene.js';

/**
 * EpilogueScene - Final chapter: journal closes
 * Recap → hidden content → closing message → journal cover
 */
export class EpilogueScene extends BaseScene {
  constructor(gameCtx) {
    super(gameCtx);
  }

  async enter(container, context) {
    await super.enter(container, context);

    // Dark background fading to deep blue (DOM only)
    this.createBackground({
      image: 'epilogue-night.jpg',
      gradient: 'linear-gradient(to bottom, rgba(10,15,25,0.1) 0%, rgba(10,15,25,0.15) 100%)',
      atmosphere: null,
      skipVignette: true
    });

    this.gameCtx.particleCanvas.setTheme('firefly');
  }

  async run() {
    // --- Part 1: Recap ---
    await this.runDialog([
      { type: 'narrator', text: '翻开这本日记，每一页都是你。', speed: 70 },
      { type: 'silence', duration: 1500 },
      { type: 'narrator', text: '换工作的那天、夜晚的捉迷藏、爆胎的午后、等你的傍晚——', speed: 50 },
      { type: 'narrator', text: '这些不完美的日常，是我最珍贵的宝藏。', speed: 60 },
      { type: 'silence', duration: 2000 }
    ]);

    // --- Part 2: Hidden fragment bonus (if all collected) ---
    const allCollected = this.gameCtx.choiceEcho.isAllFragmentsCollected();
    if (allCollected) {
      await this.runDialog([
        { type: 'silence', duration: 1000 },
        { type: 'narrator', text: '日记本的夹层中，掉出了一张旧照片。', speed: 55 },
        { type: 'silence', duration: 1500 },
        { type: 'narrator', text: '这张照片是什么时候拍的呢？好像已经记不清了。', speed: 50 },
        { type: 'narrator', text: '但是那天的风，我还记得。', speed: 60 },
        { type: 'silence', duration: 2000 }
      ]);
    }

    // --- Part 3: Final page ---
    await this.runDialog([
      { type: 'silence', duration: 1000 },
      { type: 'narrator', text: '未完待续。', speed: 100 },
      { type: 'silence', duration: 2500 },
      { type: 'narrator', text: '生日快乐。', speed: 80 },
      { type: 'silence', duration: 3000 }
    ]);

    // --- Part 4: Journal closing ---
    await this._showClosing(this.container);
  }

  async _showClosing(container) {
    // Clear everything
    container.innerHTML = '';

    const closing = this.createElement('div', 'scene');
    closing.style.cssText = `
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: var(--deep-brown);
    `;

    closing.innerHTML = `
      <div class="journal-cover" style="
        width: 75%; max-width: 320px; aspect-ratio: 3/4;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 30px 20px; opacity: 0;
      ">
        <div class="journal-cover-texture"></div>
        <div class="journal-cover-frame">
          <div class="journal-cover-ornament top-left"></div>
          <div class="journal-cover-ornament top-right"></div>
          <div class="journal-cover-ornament bottom-left"></div>
          <div class="journal-cover-ornament bottom-right"></div>
        </div>
        <div class="journal-cover-content" style="position:relative;z-index:1;text-align:center;">
          <h1 class="journal-title" style="margin-bottom:16px;">我们的故事</h1>
          <p style="font-family:var(--font-handwriting);font-size:0.9rem;color:var(--dark-gold);opacity:0.6;letter-spacing:0.2em;">卷一</p>
        </div>
      </div>
    `;

    container.appendChild(closing);

    const cover = closing.querySelector('.journal-cover');

    // Animate cover appearance
    await new Promise(resolve => {
      gsap.to(cover, {
        opacity: 1,
        duration: 2,
        ease: 'power2.out',
        onComplete: resolve
      });
    });

    // Hold on the cover
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Fade to black
    await new Promise(resolve => {
      gsap.to(closing, {
        opacity: 0,
        duration: 2,
        ease: 'power2.in',
        onComplete: resolve
      });
    });
  }
}
