// ==========================================================================
// SciencePre: Plants Theme Main Entry Controller
// 组装并调度各个业务子模块，实现 Poem <-> Organ 真实双向联动
// ==========================================================================

import { PoemTheater } from "./poem-theater.js";
import { PlantCanvas } from "./plant-canvas.js";
import { VocabLab } from "./vocab-lab.js";
import { GamesArcade } from "./games.js";
import { CertificateController } from "./certificate.js";
import { SCIENCE_VS_POETRY } from "../data/plants-data.js";
import { audio } from "../core/audio.js";

function initPlants() {
  let poemTheater = null;
  let plantCanvas = null;
  let vocabLab = null;
  let gamesArcade = null;
  let certController = null;

  // 1. 初始化单词工坊
  vocabLab = new VocabLab();
  vocabLab.init();

  // 2. 初始化诗歌剧场与活体植物画布（建立真正的双向联动）
  // Poem -> Organ: 当诗句被点击或卡拉OK滚动时，高亮植物SVG器官
  poemTheater = new PoemTheater({
    onOrganSelect: (organKey) => {
      if (plantCanvas) {
        plantCanvas.selectOrgan(organKey, false, false);
      }
    },
    onWordInspect: (word) => {
      if (vocabLab) vocabLab.inspectWord(word);
    }
  });

  // Organ -> Poem: 当植物SVG部位或按钮被点击时，反向高亮诗句并滚动聚焦
  plantCanvas = new PlantCanvas({
    onOrganSelect: (organKey) => {
      if (poemTheater) {
        poemTheater.highlightByOrgan(organKey);
      }
    }
  });

  poemTheater.init();
  plantCanvas.init();

  // 3. 诗歌内关键词点击事件代理
  const poemContainer = document.getElementById("poem-lines-container");
  if (poemContainer) {
    poemContainer.addEventListener("click", (e) => {
      const badge = e.target.closest(".keyword-badge");
      if (badge && badge.dataset.word) {
        e.stopPropagation();
        vocabLab.inspectWord(badge.dataset.word);
      }
    });
  }

  // 4. 渲染“诗歌 vs 科学”辨析专栏
  renderScienceVsPoetry();

  // 5. 初始化游戏馆与证书控制器
  gamesArcade = new GamesArcade();
  gamesArcade.init();

  certController = new CertificateController();
  certController.init();

  // 暴露到 window 方便测试与诊断
  window.__progressTracker = progressTracker;

  // 6. 绑定顶部通用控制栏 (双速语速、中英显隐、全局声音)
  bindGlobalControls(poemTheater);
});

function renderScienceVsPoetry() {
  const container = document.getElementById("vs-cards-container");
  if (!container) return;
  container.innerHTML = "";

  SCIENCE_VS_POETRY.forEach((item) => {
    const card = document.createElement("div");
    card.className = "vs-card";
    card.innerHTML = `
      <div class="vs-card-header">${item.verdict}</div>
      <div class="vs-poem-line">“${item.poemLine}”</div>
      <div class="vs-card-body">${item.explanation}</div>
    `;
    container.appendChild(card);
  });
}

function bindGlobalControls(poemTheater) {
  // 全局声音主开关
  const soundBtn = document.getElementById("sound-btn");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      const nowMuted = !audio.isMuted();
      audio.setMuted(nowMuted);
      soundBtn.innerHTML = nowMuted ? "🔇 声音已静音" : "🔊 声音已开启";
      soundBtn.className = nowMuted ? "pill-btn muted-btn" : "pill-btn active";
      if (!nowMuted) audio.playTone(600, "sine", 0.08);
    });
  }

  // 双速语速切换
  const speedBtn = document.getElementById("tts-speed-btn");
  if (speedBtn) {
    speedBtn.addEventListener("click", () => {
      const curRate = audio.getSpeechRate();
      if (curRate === 1.0) {
        audio.setSpeechRate(0.72);
        speedBtn.innerHTML = "🐢 慢速 0.7x";
        speedBtn.classList.add("gold");
      } else {
        audio.setSpeechRate(1.0);
        speedBtn.innerHTML = "🐇 常速 1.0x";
        speedBtn.classList.remove("gold");
      }
      audio.playTone(880, "sine", 0.08);
    });
  }

  // 中英双语显隐切换
  let showZh = true;
  const langBtn = document.getElementById("lang-toggle-btn");
  if (langBtn) {
    langBtn.addEventListener("click", () => {
      showZh = !showZh;
      langBtn.innerHTML = showZh ? "🇨🇳 中英双语" : "🇬🇧 纯英沉浸";
      document.querySelectorAll(".line-zh").forEach((el) => {
        el.classList.toggle("hidden-zh", !showZh);
      });
      audio.playTone(700, "sine", 0.08);
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPlants);
} else {
  initPlants();
}
