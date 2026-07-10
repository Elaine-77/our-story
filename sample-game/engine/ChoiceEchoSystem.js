/**
 * ChoiceEchoSystem - Records player choices and fragments,
 * resolves echo text in later chapters
 */
export class ChoiceEchoSystem {
  constructor() {
    // { "chapter:choiceId": { index: number, text: string } }
    this.choices = new Map();
    // Set of collected fragment IDs
    this.fragments = new Set();
    // Master list of all fragment IDs (loaded from config)
    this.allFragmentIds = [];
  }

  init(allFragmentIds = []) {
    this.allFragmentIds = allFragmentIds;
  }

  /**
   * Record a player choice
   */
  recordChoice(chapter, choiceId, optionIndex, optionText) {
    const key = `${chapter}:${choiceId}`;
    this.choices.set(key, { index: optionIndex, text: optionText });
  }

  /**
   * Get a recorded choice
   */
  getChoice(chapter, choiceId) {
    return this.choices.get(`${chapter}:${choiceId}`) || null;
  }

  /**
   * Collect a memory fragment
   */
  collectFragment(fragmentId) {
    this.fragments.add(fragmentId);
  }

  /**
   * Check if a fragment was collected
   */
  hasFragment(fragmentId) {
    return this.fragments.has(fragmentId);
  }

  /**
   * Get echo text based on a previous choice
   * @param {string} echoId - Format: "chapter:choiceId"
   * @param {Object} variants - { optionIndex: text } mapping
   * @param {string} defaultText - Fallback text
   * @returns {string}
   */
  getEcho(echoId, variants = {}, defaultText = '') {
    const choice = this.choices.get(echoId);
    if (choice && variants[choice.index] !== undefined) {
      return variants[choice.index];
    }
    return defaultText;
  }

  /**
   * Get all collected fragments
   */
  getAllFragments() {
    return new Set(this.fragments);
  }

  /**
   * Check if ALL fragments in the game were collected
   */
  isAllFragmentsCollected() {
    if (this.allFragmentIds.length === 0) return false;
    return this.allFragmentIds.every(id => this.fragments.has(id));
  }

  /**
   * Get collection stats
   */
  getStats() {
    return {
      collected: this.fragments.size,
      total: this.allFragmentIds.length,
      choices: this.choices.size
    };
  }
}
