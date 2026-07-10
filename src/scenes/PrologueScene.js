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
      gradient: 'linear-gradient(to bottom, rgba(42,26,18,0.5) 0%, rgba(26,15,10,0.55) 30%, rgba(42,24,18,0.5) 80%, rgba(26,15,10,0.6) 100%)',
      atmosphere: 'warm'
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
