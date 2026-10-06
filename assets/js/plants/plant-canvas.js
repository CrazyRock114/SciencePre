// ==========================================================================
// SciencePre: Plant Canvas Interactive (Plants)
// 活体植物SVG矢量探险画布、热点交互、键盘无障碍支持、双向与诗歌联动
// ==========================================================================

import { ORGAN_INFO } from "../data/plants-data.js";
import { audio } from "../core/audio.js";
import { progressTracker } from "../core/progress.js";

export class PlantCanvas {
  constructor({ onOrganSelect }) {
    this.onOrganSelect = onOrganSelect;
    this.currentOrganKey = "roots";
  }

  init() {
    this._bindSvgHotspots();
    this._bindOrganButtons();
    this._bindInspectPanelSpeech();
    this.selectOrgan("roots", false, false);
  }

  _bindSvgHotspots() {
    const organKeys = ["roots", "stem", "leaves", "flowers", "seeds"];
    organKeys.forEach((key) => {
      const el = document.getElementById(`svg-${key}`);
      if (!el) return;

      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `植物器官：${ORGAN_INFO[key]?.name || key}`);

      const handleTrigger = (e) => {
        e.stopPropagation();
        this.selectOrgan(key, true, true);
      };

      el.addEventListener("click", handleTrigger);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTrigger(e);
        }
      });
    });
  }

  _bindOrganButtons() {
    const organKeys = ["roots", "stem", "leaves", "flowers", "seeds"];
    organKeys.forEach((key) => {
      const btn = document.getElementById(`btn-${key}`);
      if (!btn) return;

      btn.addEventListener("click", () => {
        this.selectOrgan(key, true, true);
      });
    });
  }

  _bindInspectPanelSpeech() {
    const btn = document.getElementById("inspect-sound-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        const info = ORGAN_INFO[this.currentOrganKey];
        if (info) {
          audio.speak(info.word);
        }
      });
    }
  }

  // 选中器官
  // shouldSpeak: 是否发音
  // notifyExternal: 是否反向通知诗歌剧场高亮诗句 (Organ -> Poem)
  selectOrgan(key, shouldSpeak = true, notifyExternal = true) {
    this.currentOrganKey = key;
    const info = ORGAN_INFO[key];
    if (!info) return;

    progressTracker.markOrganExplored(key);

    // 1. 更新底部器官特工面板 DOM
    this._updateInspectPanel(info);

    // 2. 更新按钮高亮态
    document.querySelectorAll(".organ-btn").forEach((btn) => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`btn-${key}`);
    if (activeBtn) activeBtn.classList.add("active");

    // 3. 更新 SVG 部位高亮态
    document.querySelectorAll(".hotspot").forEach((el) => el.classList.remove("active-part"));
    const svgEl = document.getElementById(`svg-${key}`);
    if (svgEl) svgEl.classList.add("active-part");

    // 4. 双向联动：反向通知诗歌剧场高亮对应诗句
    if (notifyExternal && this.onOrganSelect) {
      this.onOrganSelect(key);
    }

    if (shouldSpeak) {
      audio.playPop();
      audio.speak(info.word);
    }
  }

  _updateInspectPanel(info) {
    const iconEl = document.getElementById("inspect-icon");
    const nameEl = document.getElementById("inspect-name");
    const phoneticEl = document.getElementById("inspect-phonetic");
    const descEl = document.getElementById("inspect-desc");
    const secretEl = document.getElementById("inspect-secret");

    if (iconEl) iconEl.innerText = info.icon;
    if (nameEl) nameEl.innerText = info.name;
    if (phoneticEl) phoneticEl.innerText = `${info.phonetic} · 点击按钮朗读`;
    if (descEl) descEl.innerHTML = info.desc;
    if (secretEl) secretEl.innerHTML = info.secret;
  }
}
