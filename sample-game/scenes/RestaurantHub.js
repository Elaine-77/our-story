import gsap from 'gsap';
import { BaseScene } from './BaseScene.js';

/**
 * RestaurantHub - Central hub scene
 * Players return here between chapters, with new trigger items appearing
 */
export class RestaurantHub extends BaseScene {
  constructor(gameCtx) {
    super(gameCtx);
    this.currentState = 0; // Which chapter to trigger next (0-3)
  }

  async enter(container, context) {
    await super.enter(container, context);
    this.currentState = context.chapterProgress;

    // Restaurant background
    this.createBackground({
      image: 'restaurant-hub.jpg',
      gradient: 'linear-gradient(to bottom, rgba(20,12,8,0.1) 0%, rgba(20,12,8,0.15) 100%)',
      atmosphere: null,
      skipVignette: true
    });

    // Restaurant scene content
    const scene = this.createElement('div', 'restaurant-scene');
    scene.style.cssText = 'position:absolute;inset:0;';

    // Table area
    const tableArea = this.createElement('div', 'restaurant-table');
    scene.appendChild(tableArea);
    container.appendChild(scene);
  }

  async run() {
    // Interactive content — runs AFTER transition completes
    await this._setupState();
  }

  async _setupState() {
    const state = this.currentState;

    // Show chapter-specific return dialog and trigger
    if (state === 0) {
      // Before any chapter — describe the restaurant atmosphere
      await this.runDialog([
        { type: 'narrator', text: '餐厅里很安静。烛光在桌面上投下摇曳的影子。', speed: 55 },
        { type: 'narrator', text: '目光不经意间望向窗外……', speed: 55 }
      ]);
      // Trigger Chapter 1
      await this._triggerChapter(1, '看到那栋楼，想起我刚换工作的那天……');

    } else if (state === 1) {
      // After Chapter 1 — return from window
      await this.runDialog([
        { type: 'narrator', text: '视线从窗外收回。', speed: 60 },
        { type: 'silence', duration: 1500 },
        { type: 'narrator', text: '邻桌传来孩子的笑声。你微微一笑。', speed: 50 },
        { type: 'silence', duration: 2000 }
      ]);
      // Trigger Chapter 2
      await this._triggerChapter(2, '那个声音，真像我们家那个小家伙……');

    } else if (state === 2) {
      // After Chapter 2
      await this.runDialog([
        { type: 'narrator', text: '回忆结束。邻桌的孩子跑过去找妈妈了。', speed: 55 },
        { type: 'silence', duration: 1500 },
        { type: 'narrator', text: '目光扫过墙面，看到一幅骑行装饰画。', speed: 55 }
      ]);
      await this._showStamp(1);
      // Trigger Chapter 3
      await this._triggerChapter(3, '说起来，好久没一起去海鸥岛了……');

    } else if (state === 3) {
      // After Chapter 3
      await this.runDialog([
        { type: 'narrator', text: '视线从装饰画收回。', speed: 60 },
        { type: 'narrator', text: '看了一眼手机。已经等了一会儿了。', speed: 55 },
        { type: 'silence', duration: 1500 }
      ]);
      await this._showStamp(2);
      await this.runDialog([
        { type: 'narrator', text: '服务员走过来——', speed: 60 },
        { type: 'dialog', speaker: '服务员', text: '这位客人，有人留了一样东西给您。', speed: 45 },
        { type: 'narrator', text: '递上一个小信封。', speed: 60 }
      ]);
      // Trigger Chapter 4
      await this.context.sceneManager.pushScene('chapter4', 'page-turn');

    } else if (state >= 4) {
      // After Chapter 4 — go to epilogue
      await this._showStamp(3);
      await this.runDialog([
        { type: 'silence', duration: 1000 }
      ]);
      await this.context.sceneManager.goto('epilogue', 'fade');
    }
  }

  async _triggerChapter(chapterNum, transitionText) {
    await this.runDialog([
      { type: 'silence', duration: 800 },
      { type: 'narrator', text: transitionText, speed: 55 }
    ]);
    await this.context.sceneManager.pushScene(`chapter${chapterNum}`, 'ink-wash');
  }

  async _showStamp(chapterIndex) {
    const chapterMeta = this.gameCtx.config.chapters[chapterIndex];
    if (!chapterMeta) return;

    return new Promise(resolve => {
      this.gameCtx.journalStamp.show({
        text: chapterMeta.stampText,
        chapterNum: String(chapterIndex + 1),
        onComplete: () => {
          this.gameCtx.journalStamp.hide();
          resolve();
        }
      });
    });
  }

  async exit() {
    this.gameCtx.interactionLayer.clear();
    await super.exit();
  }
}
