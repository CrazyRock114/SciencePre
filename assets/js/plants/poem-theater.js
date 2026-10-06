// ==========================================================================
// SciencePre: Poem Theater Engine (Plants)
// 负责诗歌卡拉OK朗诵、单句点读、双向与植物SVG联动、重点词聚焦
// ==========================================================================

import { POEM_DATA } from "../data/plants-data.js";
import { audio } from "../core/audio.js";
import { progressTracker } from "../core/progress.js";

export class PoemTheater {
  constructor({ onOrganSelect, onWordInspect }) {
    this.onOrganSelect = onOrganSelect;
    this.onWordInspect = onWordInspect;
    this.isPlayingAll = false;
    this.currentLineIndex = 0;
    this.playTimer = null;
    this.container = document.getElementById("poem-lines-container");
    this.playAllBtn = document.getElementById("play-poem-btn");
  }

  init() {
    this.render();
    if (this.playAllBtn) {
      this.playAllBtn.addEventListener("click", () => this.togglePlayAll());
    }
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = "";

    POEM_DATA.forEach((stanza, sIdx) => {
      const stanzaEl = document.createElement("div");
      stanzaEl.className = "poem-line-group";
      stanzaEl.id = `poem-stanza-${sIdx}`;
      stanzaEl.dataset.organ = stanza.organ;
      stanzaEl.dataset.stanzaIndex = sIdx;
      stanzaEl.setAttribute("tabindex", "0");
      stanzaEl.setAttribute("role", "button");
      stanzaEl.setAttribute("aria-label", `点击朗读诗节：${stanza.title}`);

      // 标题标签
      const tag = document.createElement("span");
      tag.className = "line-tag";
      tag.innerText = stanza.title;
      stanzaEl.appendChild(tag);

      // 两行英文与中文
      stanza.lines.forEach((line) => {
        const enDiv = document.createElement("div");
        enDiv.className = "line-en";

        const speaker = document.createElement("span");
        speaker.className = "line-speaker";
        speaker.innerText = "🔊";
        enDiv.appendChild(speaker);

        const textSpan = document.createElement("span");
        textSpan.innerHTML = this._buildLineHtmlWithKeywords(line.en, line.highlightWords);
        enDiv.appendChild(textSpan);

        const zhDiv = document.createElement("div");
        zhDiv.className = "line-zh";
        zhDiv.innerText = line.zh;

        stanzaEl.appendChild(enDiv);
        stanzaEl.appendChild(zhDiv);
      });

      // 点击或按键触发本诗节
      const handleTrigger = () => {
        this.selectStanza(sIdx, true);
      };

      stanzaEl.addEventListener("click", handleTrigger);
      stanzaEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTrigger();
        }
      });

      this.container.appendChild(stanzaEl);
    });
  }

  _buildLineHtmlWithKeywords(text, keywords = []) {
    let html = text;
    keywords.forEach((kw) => {
      const reg = new RegExp(`\\b(${kw})\\b`, "gi");
      html = html.replace(reg, (match) => {
        return `<span class="keyword-badge" data-word="${kw}" tabindex="0" role="button" aria-label="查看单词${kw}详情">${match}</span>`;
      });
    });
    return html;
  }

  // 选中诗节：不仅自身高亮，还通知外部植物高亮 (Poem -> Organ)
  selectStanza(sIdx, shouldSpeak = true) {
    const stanza = POEM_DATA[sIdx];
    if (!stanza) return;

    this.currentLineIndex = sIdx;
    this._highlightStanzaDom(sIdx);

    progressTracker.markPoemExplored();

    // 通知外部植物联动高亮
    if (this.onOrganSelect) {
      this.onOrganSelect(stanza.organ, false);
    }

    if (shouldSpeak) {
      const fullEn = stanza.lines.map((l) => l.en).join(" ");
      audio.playPop();
      audio.speak(fullEn);
    }
  }

  // 外部植物器官反向高亮诗节 (Organ -> Poem)
  highlightByOrgan(organKey) {
    const targetIdx = POEM_DATA.findIndex((s) => s.organ === organKey);
    if (targetIdx !== -1) {
      this.currentLineIndex = targetIdx;
      this._highlightStanzaDom(targetIdx);

      // 平滑滚动到视野内
      const targetEl = document.getElementById(`poem-stanza-${targetIdx}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  _highlightStanzaDom(sIdx) {
    document.querySelectorAll(".poem-line-group").forEach((el, idx) => {
      el.classList.toggle("active", idx === sIdx);
    });
  }

  // 全诗卡拉OK伴读
  togglePlayAll() {
    if (this.isPlayingAll) {
      this.stopPlayAll();
    } else {
      this.startPlayAll();
    }
  }

  startPlayAll() {
    this.isPlayingAll = true;
    if (this.playAllBtn) {
      this.playAllBtn.innerHTML = "⏹ 停止朗诵";
      this.playAllBtn.classList.add("playing");
    }

    this.currentLineIndex = 0;
    progressTracker.markPoemExplored();
    this._playNextKaraokeStep();
  }

  _playNextKaraokeStep() {
    if (!this.isPlayingAll || this.currentLineIndex >= POEM_DATA.length) {
      this.stopPlayAll();
      return;
    }

    const sIdx = this.currentLineIndex;
    const stanza = POEM_DATA[sIdx];

    // DOM 高亮卡拉OK当前行
    document.querySelectorAll(".poem-line-group").forEach((el, idx) => {
      el.classList.toggle("karaoke-current", idx === sIdx);
      el.classList.toggle("active", idx === sIdx);
    });

    // 联动外部植物器官
    if (this.onOrganSelect) {
      this.onOrganSelect(stanza.organ, false);
    }

    const targetEl = document.getElementById(`poem-stanza-${sIdx}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    const fullEn = stanza.lines.map((l) => l.en).join(" ");
    audio.speak(fullEn, audio.getSpeechRate() * 0.95, () => {
      if (!this.isPlayingAll) return;
      this.currentLineIndex++;
      this.playTimer = setTimeout(() => {
        this._playNextKaraokeStep();
      }, 700);
    });
  }

  stopPlayAll() {
    this.isPlayingAll = false;
    clearTimeout(this.playTimer);
    audio.stopAllSpeech();

    if (this.playAllBtn) {
      this.playAllBtn.innerHTML = "▶ 全诗朗诵";
      this.playAllBtn.classList.remove("playing");
    }

    document.querySelectorAll(".poem-line-group").forEach((el) => {
      el.classList.remove("karaoke-current");
    });
  }
}
