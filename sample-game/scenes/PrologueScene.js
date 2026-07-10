import gsap from 'gsap';
import { BaseScene } from './BaseScene.js';

/**
 * PrologueScene - Journal cover opening → Restaurant first visit
 * Shows the initial journal entry and transitions to restaurant
 */
export class PrologueScene extends BaseScene {
  constructor(gameCtx) {
    super(gameCtx);
  }

  async enter(container, context) {
    await super.enter(container, context);

    // Create restaurant background (DOM only)
    this.createBackground({
      image: 'prologue-restaurant.webp',
      gradient: 'linear-gradient(to bottom, rgba(20,12,8,0.1) 0%, rgba(20,12,8,0.15) 100%)',
      atmosphere: null,
      skipVignette: true
    });

    // Start ambient particles
    this.gameCtx.particleCanvas.setTheme('dust');
  }

  async run() {
    // Prologue dialog sequence
    await this.runDialog([
      { type: 'narrator', text: '今天是一个特别的日子。', speed: 70 },
      { type: 'narrator', text: '我提前到了餐厅，坐在我们常坐的靠窗位置。', speed: 55 },
      { type: 'narrator', text: '你还没来。', speed: 80 },
      { type: 'silence', duration: 2000 },
      { type: 'narrator', text: '趁等你的时候，随手翻开了这本旧日记本……', speed: 55 }
    ]);

    // Transition to restaurant hub (safe — transitioning is false in run())
    await this.context.sceneManager.goto('restaurant', 'ink-wash');
  }
}
