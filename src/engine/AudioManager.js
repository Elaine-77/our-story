/**
 * AudioManager - Howler.js wrapper for BGM, ambience, and SFX
 * Handles iOS AudioContext unlock, crossfade, sprites
 */
export class AudioManager {
  constructor() {
    this.bgmTracks = new Map();  // id → Howl instance
    this.ambienceTracks = new Map();
    this.sfxSprites = new Map();
    this.currentBGM = null;
    this.currentBGMId = null;
    this.currentAmbience = null;
    this.currentAmbienceId = null;
    this.masterVolume = 1;
    this.bgmVolume = 0.3;
    this.ambienceVolume = 0.15;
    this.sfxVolume = 0.6;
    this.unlocked = false;
    this.enabled = true;
  }

  /**
   * Unlock audio on first user interaction (required for iOS)
   */
  async unlock() {
    if (this.unlocked) return;
    try {
      // Dynamic import to avoid loading Howler if not needed
      const { Howl, Howler } = await import('howler');
      this.Howl = Howl;
      this.Howler = Howler;

      // Play a silent sound to unlock AudioContext
      const silent = new Howl({
        src: ['data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRBqpAAAAAAD/+1DEAAAHAAGf9AAAIAAANZAAAAABN3JyD5BAEBMQhP/EIf8u67oSghCH/5cEP/E3WdEP/EIf+XBCH/h/4hD/y4If+XBD/xCH/lwAAAPJeU1FTUlNSY1FR'],
        volume: 0,
        onend: () => silent.unload()
      });
      silent.play();
      this.unlocked = true;
    } catch (err) {
      console.warn('Audio unlock failed:', err);
      this.enabled = false;
    }
  }

  /**
   * Play background music with crossfade
   */
  async playBGM(trackId, src, options = {}) {
    if (!this.enabled || !this.Howl) return;
    if (this.currentBGMId === trackId) return;

    const { volume = this.bgmVolume, loop = true, fadeIn = 500 } = options;
    const oldBGM = this.currentBGM;

    // Create new track if not cached
    if (!this.bgmTracks.has(trackId)) {
      const howl = new this.Howl({
        src: [src],
        loop,
        volume: 0,
        html5: true, // Stream for large files
        onloaderror: (id, err) => console.warn(`BGM load error [${trackId}]:`, err)
      });
      this.bgmTracks.set(trackId, howl);
    }

    const newBGM = this.bgmTracks.get(trackId);
    this.currentBGM = newBGM;
    this.currentBGMId = trackId;

    // Crossfade
    if (oldBGM && oldBGM !== newBGM) {
      oldBGM.fade(oldBGM.volume(), 0, fadeIn);
      setTimeout(() => oldBGM.stop(), fadeIn);
    }

    newBGM.play();
    newBGM.fade(0, volume * this.masterVolume, fadeIn);
  }

  /**
   * Play ambient sound loop
   */
  async playAmbience(trackId, src, options = {}) {
    if (!this.enabled || !this.Howl) return;
    if (this.currentAmbienceId === trackId) return;

    const { volume = this.ambienceVolume, fadeIn = 800 } = options;

    if (this.currentAmbience) {
      this.currentAmbience.fade(this.currentAmbience.volume(), 0, fadeIn);
      const old = this.currentAmbience;
      setTimeout(() => old.stop(), fadeIn);
    }

    if (!this.ambienceTracks.has(trackId)) {
      const howl = new this.Howl({
        src: [src],
        loop: true,
        volume: 0,
        html5: true,
        onloaderror: (id, err) => console.warn(`Ambience load error [${trackId}]:`, err)
      });
      this.ambienceTracks.set(trackId, howl);
    }

    const track = this.ambienceTracks.get(trackId);
    this.currentAmbience = track;
    this.currentAmbienceId = trackId;
    track.play();
    track.fade(0, volume * this.masterVolume, fadeIn);
  }

  /**
   * Play a one-shot SFX
   */
  playSFX(sfxId) {
    if (!this.enabled || !this.Howl) return;
    // For now, SFX are simple one-shots. In production, use sprites.
    // This is a simplified implementation that works without pre-packed sprites.
    // Individual SFX files can be registered via registerSFX()
    const howl = this.sfxSprites.get(sfxId);
    if (howl) {
      howl.volume(this.sfxVolume * this.masterVolume);
      howl.play();
    }
  }

  /**
   * Stop a looping SFX (like ink-write)
   */
  stopSFX(sfxId) {
    const howl = this.sfxSprites.get(sfxId);
    if (howl) {
      howl.fade(howl.volume(), 0, 200);
      setTimeout(() => howl.stop(), 200);
    }
  }

  /**
   * Register a SFX for later playback
   */
  registerSFX(sfxId, src, options = {}) {
    if (!this.Howl) return;
    const howl = new this.Howl({
      src: [src],
      volume: this.sfxVolume * this.masterVolume,
      loop: options.loop || false,
      onloaderror: (id, err) => console.warn(`SFX load error [${sfxId}]:`, err)
    });
    this.sfxSprites.set(sfxId, howl);
  }

  /**
   * Fade all audio to silence
   */
  fadeOut(duration = 1000) {
    if (this.currentBGM) {
      this.currentBGM.fade(this.currentBGM.volume(), 0, duration);
    }
    if (this.currentAmbience) {
      this.currentAmbience.fade(this.currentAmbience.volume(), 0, duration);
    }
  }

  /**
   * Resume audio after fadeOut
   */
  fadeIn(duration = 1000) {
    if (this.currentBGM) {
      this.currentBGM.fade(0, this.bgmVolume * this.masterVolume, duration);
    }
    if (this.currentAmbience) {
      this.currentAmbience.fade(0, this.ambienceVolume * this.masterVolume, duration);
    }
  }

  /**
   * Stop all audio
   */
  stopAll() {
    this.bgmTracks.forEach(h => h.stop());
    this.ambienceTracks.forEach(h => h.stop());
    this.sfxSprites.forEach(h => h.stop());
    this.currentBGM = null;
    this.currentBGMId = null;
    this.currentAmbience = null;
    this.currentAmbienceId = null;
  }

  /**
   * Handle visibility change - pause/resume
   */
  setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.Howler) this.Howler.mute(true);
      } else {
        if (this.Howler) this.Howler.mute(false);
      }
    });
  }
}
