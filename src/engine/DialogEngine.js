import gsap from 'gsap';

/**
 * DialogEngine - Data-driven dialog sequencer
 * Processes arrays of dialog nodes: narrator, dialog, choice, echo, silence, action
 */
export class DialogEngine {
  constructor() {
    this.dialogBox = null;
    this.choicePanel = null;
    this.choiceEcho = null;
    this.audioManager = null;
    this.currentNodes = [];
    this.currentIndex = 0;
    this.isTyping = false;
    this.typeTimeline = null;
    this.resolveAdvance = null;
    this.onAction = null; // callback for 'action' nodes
    this.skipRequested = false;
  }

  init({ dialogBox, choicePanel, choiceEcho, audioManager }) {
    this.dialogBox = dialogBox;
    this.choicePanel = choicePanel;
    this.choiceEcho = choiceEcho;
    this.audioManager = audioManager;
  }

  /**
   * Run a sequence of dialog nodes. Returns when all nodes are processed.
   * @param {Array} nodes - Array of dialog node objects
   * @param {Function} onAction - Callback for action nodes: (actionId, params) => void
   */
  async runSequence(nodes, onAction = null) {
    this.currentNodes = nodes;
    this.currentIndex = 0;
    this.onAction = onAction;

    while (this.currentIndex < this.currentNodes.length) {
      await this.processNode(this.currentNodes[this.currentIndex]);
      this.currentIndex++;
    }

    this.dialogBox.hide();
    this.currentNodes = [];
    this.onAction = null;
  }

  async processNode(node) {
    switch (node.type) {
      case 'narrator':
        return this.showText(node.text, {
          isNarrator: true,
          speed: node.speed || 50,
          delay: node.delay || 0
        });

      case 'dialog':
        return this.showText(node.text, {
          isNarrator: false,
          speaker: node.speaker || '',
          speed: node.speed || 40,
          delay: node.delay || 0
        });

      case 'choice':
        return this.showChoice(node);

      case 'echo': {
        const text = this.choiceEcho ? this.choiceEcho.getEcho(node.echoId, node.variants, node.default) : node.default;
        return this.showText(text, {
          isNarrator: true,
          speed: node.speed || 50,
          delay: node.delay || 0
        });
      }

      case 'silence':
        this.dialogBox.hide();
        return new Promise(resolve => setTimeout(resolve, node.duration || 3000));

      case 'action':
        if (this.onAction) {
          return this.onAction(node.actionId, node.params || {});
        }
        return;

      default:
        console.warn(`Unknown dialog node type: ${node.type}`);
    }
  }

  showText(text, options = {}) {
    return new Promise(resolve => {
      const { isNarrator, speaker, speed, delay } = options;
      this.resolveAdvance = resolve;
      this.skipRequested = false;

      if (delay > 0) {
        setTimeout(() => {
          this._startTypewriter(text, isNarrator, speaker, speed);
        }, delay);
      } else {
        this._startTypewriter(text, isNarrator, speaker, speed);
      }
    });
  }

  _startTypewriter(text, isNarrator, speaker, speed) {
    this.isTyping = true;
    this.dialogBox.show({ isNarrator, speaker });

    const chars = [...text]; // Handle multi-byte chars
    let revealed = 0;

    if (this.audioManager) {
      this.audioManager.playSFX('ink-write');
    }

    this.typeTimeline = gsap.timeline({
      onComplete: () => {
        this.isTyping = false;
        if (this.audioManager) {
          this.audioManager.stopSFX('ink-write');
        }
        this.dialogBox.showContinueIndicator();
      }
    });

    chars.forEach((char, i) => {
      this.typeTimeline.to({}, {
        duration: speed / 1000,
        onComplete: () => {
          revealed++;
          this.dialogBox.setText(chars.slice(0, revealed).join(''));
        }
      });
    });
  }

  advance() {
    if (this.isTyping) {
      // Skip typewriter — show full text
      if (this.typeTimeline) {
        this.typeTimeline.progress(1);
      }
      this.isTyping = false;
      if (this.audioManager) {
        this.audioManager.stopSFX('ink-write');
      }
      this.dialogBox.showContinueIndicator();
    } else if (this.resolveAdvance) {
      // Advance to next node
      this.dialogBox.hideContinueIndicator();
      const resolve = this.resolveAdvance;
      this.resolveAdvance = null;
      resolve();
    }
  }

  async showChoice(node) {
    return new Promise(resolve => {
      this.dialogBox.hide();
      this.choicePanel.show(node.options, (selectedIndex) => {
        const option = node.options[selectedIndex];
        if (this.choiceEcho && node.id) {
          this.choiceEcho.recordChoice(node.chapter || '', node.id, selectedIndex, option.text);
        }
        if (this.audioManager) {
          this.audioManager.playSFX('select');
        }
        this.choicePanel.hide();
        resolve(selectedIndex);
      });
    });
  }

  stop() {
    if (this.typeTimeline) {
      this.typeTimeline.kill();
      this.typeTimeline = null;
    }
    this.isTyping = false;
    this.resolveAdvance = null;
    this.dialogBox.hide();
    this.choicePanel.hide();
  }
}
