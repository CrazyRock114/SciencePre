// ==========================================================================
// SciencePre: Theme Hub Page Controller
// 渲染各主题卡片、管理主题入口、与Sky系统互通
// ==========================================================================

import { THEMES_DATA } from "./data/themes.js";
import { audio } from "./core/audio.js";

function initHub() {
  renderThemesGrid();
  bindGlobalControls();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHub);
} else {
  initHub();
}

function renderThemesGrid() {
  const container = document.getElementById("themes-grid-container");
  if (!container) return;
  container.innerHTML = "";

  THEMES_DATA.forEach((theme) => {
    const card = document.createElement("div");
    card.className = `theme-card ${theme.status === "active" ? "active-theme" : "coming-soon-theme"}`;

    const topicsHtml = theme.topics
      .map((t) => `<span class="topic-chip">${t}</span>`)
      .join("");

    card.innerHTML = `
      <div class="theme-card-top">
        <div class="theme-icon-wrap">${theme.icon}</div>
        <span class="theme-status-tag ${theme.status === "active" ? "status-active" : "status-coming"}">
          ${theme.badge}
        </span>
      </div>
      <h3>${theme.title}</h3>
      <div class="theme-subtitle">${theme.nameZh} · ${theme.subtitle}</div>
      <p class="theme-desc">${theme.description}</p>
      <div class="theme-topics">${topicsHtml}</div>
      <div class="theme-card-footer">
        <span class="theme-vocab-count">📚 核心词汇: ${theme.vocabularyCount} 词</span>
        ${
          theme.status === "active"
            ? `<a href="${theme.path}" class="theme-enter-btn">开始探索 ➔</a>`
            : `<button class="theme-disabled-btn" disabled>敬请期待</button>`
        }
      </div>
    `;

    container.appendChild(card);
  });
}

function bindGlobalControls() {
  const soundBtn = document.getElementById("hub-sound-btn");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      const nowMuted = !audio.isMuted();
      audio.setMuted(nowMuted);
      soundBtn.innerHTML = nowMuted ? "🔇 声音已静音" : "🔊 声音已开启";
      soundBtn.className = nowMuted ? "pill-btn muted-btn" : "pill-btn active";
      if (!nowMuted) audio.playTone(600, "sine", 0.08);
    });
  }
}
