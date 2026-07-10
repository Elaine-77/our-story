/**
 * ChapterJumper - 章节跳转菜单
 * 开发调试用：可快速跳转到任意章节开头
 */
export class ChapterJumper {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.menuVisible = false;
    this.element = null;
    this.button = null;
    this.menu = null;
  }

  init() {
    // 创建容器
    this.element = document.createElement('div');
    this.element.id = 'chapter-jumper';
    this.element.style.cssText = `
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 9999;
      font-family: 'Noto Serif SC', serif;
    `;

    // 跳转按钮
    this.button = document.createElement('button');
    this.button.textContent = '☰ 章节';
    this.button.style.cssText = `
      background: rgba(0,0,0,0.55);
      color: rgba(201, 169, 89, 0.9);
      border: 1px solid rgba(201, 169, 89, 0.35);
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 13px;
      cursor: pointer;
      backdrop-filter: blur(4px);
      font-family: 'Noto Serif SC', serif;
      transition: all 0.3s ease;
    `;
    this.button.onmouseenter = () => {
      this.button.style.background = 'rgba(0,0,0,0.75)';
      this.button.style.borderColor = 'rgba(201, 169, 89, 0.6)';
    };
    this.button.onmouseleave = () => {
      this.button.style.background = 'rgba(0,0,0,0.55)';
      this.button.style.borderColor = 'rgba(201, 169, 89, 0.35)';
    };
    this.button.onclick = (e) => {
      e.stopPropagation();
      this._toggleMenu();
    };

    // 菜单面板
    this.menu = document.createElement('div');
    this.menu.style.cssText = `
      position: absolute;
      top: 40px;
      right: 0;
      background: rgba(26, 15, 10, 0.95);
      border: 1px solid rgba(201, 169, 89, 0.3);
      border-radius: 12px;
      padding: 12px;
      min-width: 180px;
      display: none;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      backdrop-filter: blur(8px);
    `;

    const title = document.createElement('div');
    title.textContent = '跳转到章节';
    title.style.cssText = `
      color: rgba(201, 169, 89, 0.7);
      font-size: 12px;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(201, 169, 89, 0.2);
    `;
    this.menu.appendChild(title);

    // 章节列表
    const chapters = [
      { id: 'prologue', label: '序章 · 翻开日记' },
      { id: 'chapter1', label: '第一章 · 新的开始' },
      { id: 'chapter2', label: '第二章 · 小小的你' },
      { id: 'chapter3', label: '第三章 · 追风的路' },
      { id: 'chapter4', label: '第四章 · 此刻的你' },
      { id: 'epilogue', label: '尾声 · 夜色温柔' },
    ];

    chapters.forEach((ch) => {
      const item = document.createElement('button');
      item.textContent = ch.label;
      item.style.cssText = `
        display: block;
        width: 100%;
        text-align: left;
        background: transparent;
        color: rgba(255, 245, 230, 0.8);
        border: none;
        padding: 8px 12px;
        font-size: 13px;
        cursor: pointer;
        border-radius: 6px;
        font-family: 'Noto Serif SC', serif;
        transition: all 0.2s ease;
      `;
      item.onmouseenter = () => {
        item.style.background = 'rgba(201, 169, 89, 0.15)';
        item.style.color = 'rgba(201, 169, 89, 1)';
      };
      item.onmouseleave = () => {
        item.style.background = 'transparent';
        item.style.color = 'rgba(255, 245, 230, 0.8)';
      };
      item.onclick = (e) => {
        e.stopPropagation();
        this._jumpTo(ch.id);
      };
      this.menu.appendChild(item);
    });

    this.element.appendChild(this.button);
    this.element.appendChild(this.menu);
    document.body.appendChild(this.element);

    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
      if (this.menuVisible && !this.element.contains(e.target)) {
        this._hideMenu();
      }
    });
  }

  _toggleMenu() {
    if (this.menuVisible) {
      this._hideMenu();
    } else {
      this._showMenu();
    }
  }

  _showMenu() {
    this.menu.style.display = 'block';
    this.menuVisible = true;
  }

  _hideMenu() {
    this.menu.style.display = 'none';
    this.menuVisible = false;
  }

  _jumpTo(sceneId) {
    this._hideMenu();

    // 重置场景栈
    this.sceneManager.sceneStack = [];
    this.sceneManager.chapterProgress = 0;

    // 根据跳转的章节设置进度
    const progressMap = {
      'prologue': 0,
      'chapter1': 0,
      'chapter2': 1,
      'chapter3': 2,
      'chapter4': 3,
      'epilogue': 4,
    };
    this.sceneManager.chapterProgress = progressMap[sceneId] || 0;

    // 跳转
    this.sceneManager.goto(sceneId, 'fade');
  }
}
