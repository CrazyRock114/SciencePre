// ==========================================================================
// SciencePre Audio Engine: Web Audio SFX + Web Speech TTS + Strict Mute Control
// ==========================================================================

class AudioEngine {
  constructor() {
    this.muted = false; // 全局静音状态 (true 则音效与TTS均静音)
    this.speechRate = 1.0; // 默认语速 1.0x (可切为 0.72x 慢速)
    this.audioCtx = null;
    this.voices = [];
    this.voicesLoaded = false;
    this._initSpeechVoices();
  }

  _getAudioContext() {
    if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new Ctx();
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  _initSpeechVoices() {
    if (!("speechSynthesis" in window)) return;
    const load = () => {
      this.voices = window.speechSynthesis.getVoices();
      if (this.voices && this.voices.length > 0) {
        this.voicesLoaded = true;
      }
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load, { once: true });
  }

  setMuted(isMuted) {
    this.muted = isMuted;
    if (this.muted && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  isMuted() {
    return this.muted;
  }

  setSpeechRate(rate) {
    this.speechRate = rate;
  }

  getSpeechRate() {
    return this.speechRate;
  }

  // 播放温和的单音频点缀
  playTone(freq = 600, type = "sine", duration = 0.12, gainLevel = 0.15) {
    if (this.muted) return;
    try {
      const ctx = this._getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioEngine tone error:", e);
    }
  }

  // 水泡清脆声
  playPop() {
    if (this.muted) return;
    this.playTone(480, "sine", 0.08, 0.12);
    setTimeout(() => this.playTone(680, "sine", 0.08, 0.1), 50);
  }

  // 正确提示音
  playCorrect() {
    if (this.muted) return;
    this.playTone(523.25, "triangle", 0.1, 0.15); // C5
    setTimeout(() => this.playTone(659.25, "triangle", 0.1, 0.15), 90); // E5
    setTimeout(() => this.playTone(783.99, "triangle", 0.18, 0.18), 180); // G5
  }

  // 错误轻提示音
  playWrong() {
    if (this.muted) return;
    this.playTone(260, "sawtooth", 0.18, 0.12);
  }

  // 通关胜利庆祝音效
  playVictory() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, "triangle", 0.22, 0.2), idx * 110);
    });
  }

  // 朗读英文 (严格遵从静音状态)
  speak(text, customRate = null, onEnd = null) {
    if (this.muted) {
      if (onEnd) onEnd();
      return;
    }
    if (!("speechSynthesis" in window) || !text) {
      if (onEnd) onEnd();
      return;
    }

    this._getAudioContext();
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = customRate !== null ? customRate : this.speechRate;
    utter.pitch = 1.05; // 稍微童趣清脆

    // 选择标准自然声
    if (this.voices && this.voices.length > 0) {
      const preferred = ["Google US English", "Alex", "Samantha", "Daniel", "Karen"];
      for (const p of preferred) {
        const found = this.voices.find(v => v.name.includes(p));
        if (found) {
          utter.voice = found;
          break;
        }
      }
    }

    if (onEnd) {
      utter.onend = () => onEnd();
      utter.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utter);
  }

  stopAllSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audio = new AudioEngine();
