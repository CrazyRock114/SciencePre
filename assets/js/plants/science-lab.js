// ==========================================================================
// SciencePre: Junior Botanist Science Lab (小学生自然科学交互实验室)
// 包含 4 大主题展厅：
// 1. 植物细胞 3D 拟真积木 + 显微镜真图对照 (Three.js 3D 贴图材质 / 显微切片对照 / 液泡膨压实验)
// 2. 叶片微观横剖面与金鱼藻放氧实验 (真实 Cambridge 解剖图 / SEM 气孔实拍 / 光合速率与限制因素)
// 3. 水流直达梯与甜蜜双向快递 (木质部 vs 韧皮部 / 芹菜红墨水实验 / 真实茎横切显微图)
// 4. 花朵大解剖与小蜜蜂授粉奇遇 (真实百合花解剖实拍 / 蜜蜂采蜜 / 幼苗萌发摄影序列)
// ==========================================================================

import * as THREE from "../lib/three.module.js";
import { GLTFLoader } from "../lib/GLTFLoader.module.js";
import { DRACOLoader } from "../lib/DRACOLoader.module.js";
import {
  SCIENCE_STATIONS,
  PLANT_CELL_PARTS,
  LEAF_LAYERS,
  TRANSPORT_MODES,
  FLOWER_PARTS,
  POLLINATION_STEPS,
  IGCSE_CURRICULUM_BRIDGES
} from "../data/science-knowledge.js";
import { audio } from "../core/audio.js";
import { progressTracker } from "../core/progress.js";

export class ScienceLab {
  constructor() {
    this.currentStationId = "station-cell-3d";
    this.cell3D = null;
    this.currentStep = 1;
    this.transportMode = "xylem";
    this.celeryDyeMode = "water";
    this.photoState = { sunlight: 80, co2: 60, water: 90 };
  }

  init() {
    this.renderStationTabs();
    this.bindStationSwitching();
    this.initStation1_Cell3D();
    this.initStation2_LeafPhotosynthesis();
    this.initStation3_Transport();
    this.initStation4_Flower();
  }

  // ------------------------------------------------------------------------
  // 顶部展厅导航切换
  // ------------------------------------------------------------------------
  renderStationTabs() {
    const tabContainer = document.getElementById("science-station-tabs");
    if (!tabContainer) return;
    tabContainer.innerHTML = "";

    SCIENCE_STATIONS.forEach((station) => {
      const btn = document.createElement("button");
      btn.className = `station-tab-btn ${station.id === this.currentStationId ? "active" : ""}`;
      btn.dataset.station = station.id;
      btn.innerHTML = `
        <span class="station-tab-icon">${station.icon}</span>
        <span class="station-tab-info">
          <span class="station-tab-badge">${station.badge}</span>
          <span class="station-tab-title">${station.title}</span>
        </span>
      `;
      btn.addEventListener("click", () => {
        this.switchStation(station.id);
      });
      tabContainer.appendChild(btn);
    });
  }

  bindStationSwitching() {
    this.updateStationVisibility();
  }

  switchStation(stationId) {
    this.currentStationId = stationId;
    audio.playTone(550, "sine", 0.08);

    document.querySelectorAll(".station-tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.station === stationId);
    });

    this.updateStationVisibility();

    // 触发 3D 画布尺寸更新
    if (stationId === "station-cell-3d" && this.cell3D) {
      setTimeout(() => this.cell3D.onResize(), 60);
    }

    if (progressTracker && typeof progressTracker.markPoemExplored === "function") {
      progressTracker.markPoemExplored();
    }
  }

  updateStationVisibility() {
    document.querySelectorAll(".science-station-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === this.currentStationId);
    });
  }

  // ========================================================================
  // 展厅 1: 植物细胞 3D 拟真积木 + 显微镜真图对照
  // ========================================================================
  initStation1_Cell3D() {
    const container = document.getElementById("cell-3d-canvas-container");
    if (!container) return;

    this.cell3D = new Cell3DScene(container, (partId) => {
      this.inspectCellPart(partId);
    });

    // 渲染细胞结构选择器药丸按钮
    const pillsContainer = document.getElementById("cell-parts-pills");
    if (pillsContainer) {
      pillsContainer.innerHTML = "";
      PLANT_CELL_PARTS.forEach((part, idx) => {
        const pill = document.createElement("button");
        pill.className = `cell-pill-btn ${idx === 0 ? "active" : ""}`;
        pill.dataset.part = part.id;
        pill.innerHTML = `<span class="pill-dot" style="background:${part.color}"></span> ${part.nameZh} <span class="pill-en">${part.nameEn}</span>`;
        pill.addEventListener("click", () => {
          this.inspectCellPart(part.id);
          this.cell3D.focusPart(part.id);
        });
        pillsContainer.appendChild(pill);
      });
    }

    // 默认展示第一个细胞结构（细胞壁）
    this.inspectCellPart(PLANT_CELL_PARTS[0].id);

    // 绑定 3D 拟真模型 vs 透视分件 vs 显微镜真图对照切换
    const btnView3D = document.getElementById("btn-view-3d");
    const btnViewExploded = document.getElementById("btn-view-exploded");
    const btnViewMicroscope = document.getElementById("btn-view-microscope");
    const canvasContainer = document.getElementById("cell-3d-canvas-container");
    const microscopeContainer = document.getElementById("cell-microscope-container");
    const modeTag = document.getElementById("cell-current-mode-tag");

    const setViewMode = (mode) => {
      if (btnView3D) btnView3D.classList.toggle("active", mode === "3d");
      if (btnViewExploded) btnViewExploded.classList.toggle("active", mode === "exploded");
      if (btnViewMicroscope) btnViewMicroscope.classList.toggle("active", mode === "microscope");

      if (mode === "microscope") {
        if (canvasContainer) canvasContainer.style.display = "none";
        if (microscopeContainer) microscopeContainer.style.display = "block";
        if (modeTag) modeTag.textContent = "当前模式：📸 显微镜真图对照";
        audio.playTone(720, "sine", 0.08);
        audio.speak("Microscopic comparison view");
      } else {
        if (canvasContainer) canvasContainer.style.display = "block";
        if (microscopeContainer) microscopeContainer.style.display = "none";

        if (mode === "3d") {
          if (this.cell3D) this.cell3D.setModelMode("learningCell");
          if (modeTag) modeTag.textContent = "当前模式：🔬 拟真实模 (LearningCell)";
          audio.playTone(600, "sine", 0.08);
          audio.speak("Realistic 3D plant cell model");
        } else if (mode === "exploded") {
          if (this.cell3D) this.cell3D.setModelMode("exploded");
          if (modeTag) modeTag.textContent = "当前模式：🧩 透视分件 (器官积木)";
          audio.playTone(660, "sine", 0.08);
          audio.speak("Exploded organelle view");
        }

        if (this.cell3D) this.cell3D.onResize();
      }
    };

    if (btnView3D) btnView3D.addEventListener("click", () => setViewMode("3d"));
    if (btnViewExploded) btnViewExploded.addEventListener("click", () => setViewMode("exploded"));
    if (btnViewMicroscope) btnViewMicroscope.addEventListener("click", () => setViewMode("microscope"));

    // 绑定显微镜图纸热点引脚点击
    document.querySelectorAll(".microscope-pin").forEach((pin) => {
      pin.addEventListener("click", () => {
        const partId = pin.dataset.part;
        if (partId) {
          this.inspectCellPart(partId);
          if (this.cell3D) this.cell3D.focusPart(partId);
        }
      });
    });

    // 绑定大液泡浇水实验
    const waterBtn = document.getElementById("btn-vacuole-water");
    const droughtBtn = document.getElementById("btn-vacuole-drought");
    const turgorStateText = document.getElementById("vacuole-turgor-state");

    if (waterBtn && droughtBtn && turgorStateText) {
      waterBtn.addEventListener("click", () => {
        this.cell3D.setVacuoleTurgor(1.2);
        waterBtn.classList.add("active");
        droughtBtn.classList.remove("active");
        turgorStateText.innerHTML = `💧 <strong>饱满挺立 (Turgid)</strong>：大液泡大口吸饱水分，像气球一样把细胞壁撑得笔直！植物神气十足！`;
        audio.playTone(720, "sine", 0.12);
        audio.speak("Water makes the vacuole full and turgid!");
      });

      droughtBtn.addEventListener("click", () => {
        this.cell3D.setVacuoleTurgor(0.55);
        droughtBtn.classList.add("active");
        waterBtn.classList.remove("active");
        turgorStateText.innerHTML = `☀️ <strong>缺水萎蔫 (Flaccid)</strong>：很久没浇水，大液泡缩水干瘪，细胞失去了支撑力，整株植物耷拉下了叶子！`;
        audio.playTone(320, "sine", 0.15);
        audio.speak("Without water, the plant wilts and droops.");
      });
    }

    // 自动旋转切换
    const autoSpinBtn = document.getElementById("btn-cell-autospin");
    if (autoSpinBtn) {
      autoSpinBtn.addEventListener("click", () => {
        const isSpinning = this.cell3D.toggleAutoRotate();
        autoSpinBtn.innerHTML = isSpinning ? "⏸️ 暂停旋转" : "🔄 自动旋转";
        autoSpinBtn.classList.toggle("active", isSpinning);
      });
    }

    // 视角重置
    const resetViewBtn = document.getElementById("btn-cell-reset");
    if (resetViewBtn) {
      resetViewBtn.addEventListener("click", () => {
        this.cell3D.resetCamera();
        audio.playTone(600, "triangle", 0.08);
      });
    }
  }

  inspectCellPart(partId) {
    const part = PLANT_CELL_PARTS.find((p) => p.id === partId);
    if (!part) return;

    // 高亮激活药丸
    document.querySelectorAll(".cell-pill-btn").forEach((pill) => {
      pill.classList.toggle("active", pill.dataset.part === partId);
    });

    // 高亮激活显微镜引脚
    document.querySelectorAll(".microscope-pin").forEach((pin) => {
      pin.classList.toggle("active", pin.dataset.part === partId);
    });

    const infoCard = document.getElementById("cell-part-detail-card");
    if (!infoCard) return;

    infoCard.innerHTML = `
      <div class="card-part-header" style="border-left: 5px solid ${part.color}">
        <div class="card-part-titles">
          <h4>${part.nameZh} <span class="card-part-en">${part.nameEn}</span></h4>
          <span class="card-part-ipa">${part.ipa}</span>
        </div>
        <button class="part-speak-btn" id="speak-part-${part.id}" title="朗读此器官名称">🔊 发音</button>
      </div>
      <div class="card-part-metaphor">${part.metaphor}</div>
      <p class="card-part-desc">${part.summary}</p>
      
      <div class="card-part-microscope-detail">
        <span class="microscope-sub-badge">🔬 显微镜实拍细节</span>
        <p>${part.microscopeDetail || "高倍显微镜下，该结构具有鲜明的细胞生物学识别特征！"}</p>
      </div>

      <div class="card-part-fact">${part.kidFact}</div>
      <div class="card-part-qa">
        <strong>❓ ${part.funQuestion}</strong>
        <p>👉 ${part.funAnswer}</p>
      </div>
    `;

    const speakBtn = document.getElementById(`speak-part-${part.id}`);
    if (speakBtn) {
      speakBtn.addEventListener("click", () => {
        audio.speak(part.nameEn);
        audio.playTone(660, "sine", 0.08);
      });
    }
  }

  // ========================================================================
  // 展厅 2: 叶片微观横剖面与光合作用配方实验室
  // ========================================================================
  initStation2_LeafPhotosynthesis() {
    this.renderLeafLayersList();
    this.bindLeafPins();
    this.bindPhotosynthesisSimulator();
  }

  renderLeafLayersList() {
    const container = document.getElementById("leaf-layers-container");
    if (!container) return;
    container.innerHTML = "";

    LEAF_LAYERS.forEach((layer, idx) => {
      const item = document.createElement("div");
      item.className = `leaf-layer-card ${idx === 1 ? "active" : ""}`;
      item.dataset.layer = layer.id;
      item.innerHTML = `
        <div class="layer-card-title">
          <span class="layer-tag">${layer.role}</span>
          <h5>${layer.nameZh} <span class="layer-en">${layer.nameEn}</span></h5>
        </div>
        <p class="layer-desc">${layer.desc}</p>
      `;
      item.addEventListener("click", () => {
        this.selectLeafLayer(layer.id);
      });
      container.appendChild(item);
    });
  }

  bindLeafPins() {
    document.querySelectorAll(".leaf-pin").forEach((pin) => {
      pin.addEventListener("click", () => {
        const layerId = pin.dataset.layer;
        if (layerId) {
          this.selectLeafLayer(layerId);
        }
      });
    });
  }

  selectLeafLayer(layerId) {
    document.querySelectorAll(".leaf-layer-card").forEach((c) => {
      c.classList.toggle("active", c.dataset.layer === layerId);
    });
    document.querySelectorAll(".leaf-pin").forEach((p) => {
      p.classList.toggle("active", p.dataset.layer === layerId);
    });

    const layer = LEAF_LAYERS.find((l) => l.id === layerId);
    if (layer) {
      audio.speak(layer.nameEn);
      audio.playTone(700, "triangle", 0.08);
    }
  }

  bindPhotosynthesisSimulator() {
    const sunSlider = document.getElementById("slider-sunlight");
    const co2Slider = document.getElementById("slider-co2");
    const waterSlider = document.getElementById("slider-water");

    const sunVal = document.getElementById("val-sunlight");
    const co2Val = document.getElementById("val-co2");
    const waterVal = document.getElementById("val-water");

    const updateSim = () => {
      if (sunSlider) this.photoState.sunlight = parseInt(sunSlider.value, 10);
      if (co2Slider) this.photoState.co2 = parseInt(co2Slider.value, 10);
      if (waterSlider) this.photoState.water = parseInt(waterSlider.value, 10);

      if (sunVal) sunVal.textContent = `${this.photoState.sunlight}%`;
      if (co2Val) co2Val.textContent = `${this.photoState.co2}%`;
      if (waterVal) waterVal.textContent = `${this.photoState.water}%`;

      this.calcPhotosynthesisRate();
    };

    if (sunSlider) sunSlider.addEventListener("input", updateSim);
    if (co2Slider) co2Slider.addEventListener("input", updateSim);
    if (waterSlider) waterSlider.addEventListener("input", updateSim);

    updateSim();
  }

  calcPhotosynthesisRate() {
    const { sunlight, co2, water } = this.photoState;

    // 科学核心：限制因素木桶效应，取决于供给最短缺的原料
    const rate = Math.min(sunlight, co2, water);

    const rateMeter = document.getElementById("photosynthesis-rate-meter");
    const rateNumber = document.getElementById("photosynthesis-rate-num");
    const bubblesContainer = document.getElementById("oxygen-bubbles-cloud");
    const toastBox = document.getElementById("limiting-factor-toast");
    const elodeaRateNum = document.getElementById("elodea-bubble-rate-num");
    const elodeaSpawner = document.getElementById("elodea-bubble-spawner");

    if (rateMeter) rateMeter.style.width = `${rate}%`;
    if (rateNumber) rateNumber.textContent = `${rate}%`;

    // 金鱼藻放氧实验冒泡速率换算 (0~80 泡/分钟)
    const bubbleRate = Math.round(rate * 0.8);
    if (elodeaRateNum) {
      elodeaRateNum.textContent = `${bubbleRate} 泡/分钟`;
    }

    // 金鱼藻试管中生成动态微型气泡
    if (elodeaSpawner) {
      const elodeaBubbleCount = Math.floor(bubbleRate / 12);
      let elodeaBubblesHtml = "";
      for (let i = 0; i < elodeaBubbleCount; i++) {
        const left = 45 + (Math.random() * 10 - 5);
        const delay = Math.random() * 1.8;
        const dur = Math.max(1.0, 2.5 - rate * 0.015);
        elodeaBubblesHtml += `<span class="beaker-rising-bubble" style="left:${left}%; animation-delay:${delay}s; animation-duration:${dur}s;"></span>`;
      }
      elodeaSpawner.innerHTML = elodeaBubblesHtml;
    }

    // 产生气泡密度与糖块动画
    if (bubblesContainer) {
      const bubbleCount = Math.floor(rate / 10);
      let bubblesHtml = "";
      for (let i = 0; i < bubbleCount; i++) {
        const left = 10 + Math.random() * 80;
        const delay = Math.random() * 1.5;
        bubblesHtml += `<span class="o2-bubble" style="left:${left}%; animation-delay:${delay}s">🫧 O₂</span>`;
      }
      bubblesContainer.innerHTML = bubblesHtml;
    }

    // 智能限制因素侦探提示
    if (toastBox) {
      if (rate === 0) {
        if (sunlight === 0) {
          toastBox.innerHTML = `🌙 <strong>天黑啦！</strong> 没有阳光，叶绿体无法开工做饭！阳光是当前最大的限制因素！`;
        } else if (co2 === 0) {
          toastBox.innerHTML = `💨 <strong>缺气了！</strong> 没有二氧化碳，再好的阳光也做不出糖果！二氧化碳是限制因素！`;
        } else {
          toastBox.innerHTML = `💧 <strong>极度干旱！</strong> 没有水分参与光合反应，工厂彻底停产！`;
        }
        toastBox.className = "sim-toast limiting";
      } else if (sunlight > 70 && co2 < 30) {
        toastBox.innerHTML = `💡 <strong>小侦探发现限制因素 (Limiting Factor)！</strong> 虽然阳光很强，但因为二氧化碳太少，做饭速度被死死卡在 ${rate}%！试着调大二氧化碳看看！`;
        toastBox.className = "sim-toast limiting";
      } else if (rate >= 80) {
        toastBox.innerHTML = `🎉 <strong>能量大爆发！</strong> 阳光、二氧化碳和水分全都充足！叶片正在全力制造甜甜的葡萄糖 (Glucose) 并释放大量氧气 (O₂)！`;
        toastBox.className = "sim-toast success";
      } else {
        toastBox.innerHTML = `🌱 <strong>平稳生产中：</strong> 光合作用速率为 ${rate}%。三样原料都在协同工作！`;
        toastBox.className = "sim-toast normal";
      }
    }
  }

  // ========================================================================
  // 展厅 3: 水流电梯与双向甜蜜快递 (木质部 vs 韧皮部 + 芹菜吸墨水实验)
  // ========================================================================
  initStation3_Transport() {
    const btnXylem = document.getElementById("btn-mode-xylem");
    const btnPhloem = document.getElementById("btn-mode-phloem");

    if (btnXylem && btnPhloem) {
      btnXylem.addEventListener("click", () => {
        this.setTransportMode("xylem");
      });
      btnPhloem.addEventListener("click", () => {
        this.setTransportMode("phloem");
      });
    }

    // 芹菜吸墨水互动实验组切换
    const btnDyeWater = document.getElementById("btn-dye-water");
    const btnDyeRed = document.getElementById("btn-dye-red");
    const btnDyeBlue = document.getElementById("btn-dye-blue");

    if (btnDyeWater && btnDyeRed && btnDyeBlue) {
      btnDyeWater.addEventListener("click", () => this.setCeleryDye("water"));
      btnDyeRed.addEventListener("click", () => this.setCeleryDye("red"));
      btnDyeBlue.addEventListener("click", () => this.setCeleryDye("blue"));
    }

    this.setTransportMode("xylem");
  }

  setTransportMode(mode) {
    this.transportMode = mode;
    audio.playTone(mode === "xylem" ? 640 : 780, "sine", 0.08);

    const btnXylem = document.getElementById("btn-mode-xylem");
    const btnPhloem = document.getElementById("btn-mode-phloem");
    if (btnXylem && btnPhloem) {
      btnXylem.classList.toggle("active", mode === "xylem");
      btnPhloem.classList.toggle("active", mode === "phloem");
    }

    const data = TRANSPORT_MODES[mode];
    const detailsContainer = document.getElementById("transport-mode-details");
    if (detailsContainer) {
      detailsContainer.innerHTML = `
        <div class="transport-card-header ${mode}">
          <h4>${data.title}</h4>
          <span class="transport-direction-badge">${data.direction}</span>
        </div>
        <div class="transport-grid">
          <div class="transport-prop">
            <strong>📦 运输货物：</strong>
            <span>${data.cargo}</span>
          </div>
          <div class="transport-prop">
            <strong>🧱 管道结构：</strong>
            <span>${data.structure}</span>
          </div>
          <div class="transport-prop full-width">
            <strong>🚀 动力来源：</strong>
            <p>${data.drivingForce}</p>
          </div>
          <div class="transport-metaphor full-width">
            💡 <strong>小学生生动理解：</strong> ${data.kidMetaphor}
          </div>
        </div>
      `;
    }

    // 管道视觉粒子流向切换
    const pipelineView = document.getElementById("transport-pipeline-view");
    if (pipelineView) {
      pipelineView.className = `transport-pipeline-box ${mode}-mode ${this.celeryDyeMode}-dye`;
    }
  }

  setCeleryDye(dye) {
    this.celeryDyeMode = dye;
    const btnWater = document.getElementById("btn-dye-water");
    const btnRed = document.getElementById("btn-dye-red");
    const btnBlue = document.getElementById("btn-dye-blue");
    const toast = document.getElementById("celery-obs-toast");
    const pipelineView = document.getElementById("transport-pipeline-view");

    if (btnWater) btnWater.classList.toggle("active", dye === "water");
    if (btnRed) btnRed.classList.toggle("active", dye === "red");
    if (btnBlue) btnBlue.classList.toggle("active", dye === "blue");

    if (pipelineView) {
      pipelineView.classList.remove("water-dye", "red-dye", "blue-dye");
      pipelineView.classList.add(`${dye}-dye`);
    }

    if (toast) {
      if (dye === "water") {
        toast.innerHTML = `💧 <strong>清水对照：</strong> 水分在木质部空心导管中静静向上攀爬，滋润全身细胞。`;
        audio.playTone(550, "sine", 0.08);
      } else if (dye === "red") {
        toast.innerHTML = `🔴 <strong>红墨水浸泡：</strong> 红色食用色素沿着木质部导管一路飞驰向上，切开芹菜茎截面，那一圈小圆点（木质部）被染成鲜艳红斑，叶脉也变红了！证明水分子只在木质部中单向向上飙升！`;
        audio.playTone(720, "triangle", 0.1);
        audio.speak("Red ink stains the xylem vessels only!");
      } else {
        toast.innerHTML = `🔵 <strong>蓝墨水浸泡：</strong> 蓝色色素随着叶片强大的蒸腾拉力快速直达叶缘，蓝色脉络清晰可见！`;
        audio.playTone(660, "triangle", 0.1);
        audio.speak("Water moves up to every leaf vein!");
      }
    }
  }

  // ========================================================================
  // 展厅 4: 花朵大解剖与小蜜蜂授粉奇遇
  // ========================================================================
  initStation4_Flower() {
    this.renderFlowerPartsList();
    this.bindFlowerViewSwitcher();
    this.bindPollinationStoryCarousel();
  }

  bindFlowerViewSwitcher() {
    const btnDiag = document.getElementById("btn-flower-diagram-view");
    const btnReal = document.getElementById("btn-flower-real-view");
    const mainImg = document.getElementById("flower-main-display-img");
    const caption = document.getElementById("flower-figure-caption");

    if (btnDiag && btnReal && mainImg && caption) {
      btnDiag.addEventListener("click", () => {
        btnDiag.classList.add("active");
        btnReal.classList.remove("active");
        mainImg.src = "/assets/images/science/flower-dissection-diagram.png";
        caption.textContent = "经典模式示意图：雌蕊居中（柱头+花柱+子房+胚珠），雄蕊环绕（花药+花丝），花瓣引客，花萼护蕾。";
        audio.playTone(620, "sine", 0.08);
      });

      btnReal.addEventListener("click", () => {
        btnReal.classList.add("active");
        btnDiag.classList.remove("active");
        mainImg.src = "/assets/images/science/flower-dissection-real-photo.jpg";
        caption.textContent = "真实百合花解剖实拍：粉嫩花瓣已被整齐展开，清晰展现出中央挺拔的雌蕊（柱头与花柱），四周环绕着顶着棕红花粉的花药与花丝！";
        audio.playTone(740, "sine", 0.08);
        audio.speak("Real flower dissection photograph");
      });
    }
  }

  renderFlowerPartsList() {
    const listContainer = document.getElementById("flower-parts-list");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    FLOWER_PARTS.forEach((part) => {
      const card = document.createElement("div");
      card.className = "flower-part-card";
      card.innerHTML = `
        <div class="flower-card-top">
          <span class="flower-part-role">${part.role}</span>
          <h5>${part.nameZh} <span class="flower-en">${part.nameEn}</span></h5>
        </div>
        <p class="flower-part-desc">${part.desc}</p>
      `;
      card.addEventListener("click", () => {
        audio.speak(part.nameEn);
        audio.playTone(800, "triangle", 0.08);
      });
      listContainer.appendChild(card);
    });
  }

  bindPollinationStoryCarousel() {
    const stepIndicators = document.getElementById("pollination-step-indicators");
    const storyBox = document.getElementById("pollination-story-display");
    const nextBtn = document.getElementById("btn-pollination-next");
    const prevBtn = document.getElementById("btn-pollination-prev");

    const updateStory = (stepNum) => {
      this.currentStep = stepNum;
      const stepData = POLLINATION_STEPS.find((s) => s.step === stepNum);
      if (!stepData) return;

      if (storyBox) {
        storyBox.innerHTML = `
          <div class="story-step-badge">${stepData.badge || "第 " + stepData.step + " 步"} · ${stepData.enTitle}</div>
          <h4>${stepData.title}</h4>
          
          <div class="story-step-visual">
            <img src="${stepData.image}" alt="${stepData.title}" class="story-visual-img" />
            <span class="story-visual-caption">${stepData.imageCaption || ""}</span>
          </div>

          <p class="story-step-text">${stepData.text}</p>
        `;
      }

      if (stepIndicators) {
        stepIndicators.querySelectorAll(".story-dot").forEach((dot) => {
          dot.classList.toggle("active", parseInt(dot.dataset.step, 10) === stepNum);
        });
      }

      audio.playTone(500 + stepNum * 80, "sine", 0.08);
    };

    if (stepIndicators) {
      stepIndicators.innerHTML = "";
      POLLINATION_STEPS.forEach((s) => {
        const dot = document.createElement("button");
        dot.className = `story-dot ${s.step === 1 ? "active" : ""}`;
        dot.dataset.step = s.step;
        dot.textContent = s.step;
        dot.addEventListener("click", () => updateStory(s.step));
        stepIndicators.appendChild(dot);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const next = this.currentStep >= 4 ? 1 : this.currentStep + 1;
        updateStory(next);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const prev = this.currentStep <= 1 ? 4 : this.currentStep - 1;
        updateStory(prev);
      });
    }

    updateStory(1);
  }
}

// ==========================================================================
// Three.js 3D 植物细胞引擎 (含拟真生物贴图材质与微观细节)
// ==========================================================================
class Cell3DScene {
  constructor(container, onPartSelect) {
    this.container = container;
    this.onPartSelect = onPartSelect;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cellGroup = null;
    this.explodedGroup = new THREE.Group();
    this.learningCellMesh = null;
    this.learningCellBaseScale = 1.0;
    this.currentModelMode = "learningCell";
    this.modelLoading = false;
    this.isModelLoaded = false;

    this.isDragging = false;
    this.prevPointerPos = { x: 0, y: 0 };
    this.autoRotate = true;

    this.partsMeshes = new Map();
    this.vacuoleMesh = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.vacuoleTurgorScale = 1.0;
    this.isFallback2D = false;

    this.setupScene();
  }

  // ------------------------------------------------------------------------
  // 生成高拟真细胞壁纤维素微纤丝贴图 (Cellulose Microfibril Texture)
  // ------------------------------------------------------------------------
  createCellWallTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // 底色：植物细胞深草绿色
    ctx.fillStyle = "#15803d";
    ctx.fillRect(0, 0, 512, 512);

    // 经纬向纤维素微纤丝织网 (Cellulose woven lattice)
    ctx.strokeStyle = "rgba(74, 222, 128, 0.45)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 512; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // 45 度对角加强纤维
    ctx.strokeStyle = "rgba(187, 247, 208, 0.25)";
    ctx.lineWidth = 2;
    for (let i = -512; i < 1024; i += 36) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 512, 512);
      ctx.stroke();
    }

    // 细胞砖缝边界立体浮雕
    ctx.strokeStyle = "rgba(20, 83, 45, 0.7)";
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 504);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // ------------------------------------------------------------------------
  // 生成高拟真叶绿体基粒叠层贴图 (Chloroplast Thylakoid Grana Discs)
  // ------------------------------------------------------------------------
  createChloroplastTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // 叶绿体基质暗翠绿
    ctx.fillStyle = "#14532d";
    ctx.fillRect(0, 0, 256, 256);

    // 叠片状基粒 (Grana Stacks)
    for (let i = 0; i < 16; i++) {
      const cx = 35 + (i % 4) * 60 + (i * 3) % 10;
      const cy = 35 + Math.floor(i / 4) * 60 + (i * 5) % 10;
      const r = 20;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "#16a34a";
      ctx.fill();
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 3;
      ctx.stroke();

      // 内层囊状膜
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "#86efac";
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  // ------------------------------------------------------------------------
  // 生成液泡水波与反光贴图 (Vacuole Water Caustics Texture)
  // ------------------------------------------------------------------------
  createVacuoleTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 128);
    grad.addColorStop(0, "#e0f2fe");
    grad.addColorStop(0.4, "#38bdf8");
    grad.addColorStop(1, "#0284c7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // 水波纹柔光
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(40 + i * 25, 50 + (i % 3) * 45, 28 + (i * 3), 0, Math.PI * 2);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  // ------------------------------------------------------------------------
  // 生成细胞核孔与染色质贴图 (Nucleus Pores & Chromatin Texture)
  // ------------------------------------------------------------------------
  createNucleusTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#7e22ce";
    ctx.fillRect(0, 0, 256, 256);

    // 核孔小斑点 (Nuclear Pores)
    ctx.fillStyle = "#c084fc";
    for (let i = 0; i < 50; i++) {
      const px = ((i * 37) % 240) + 8;
      const py = ((i * 53) % 240) + 8;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  setupScene() {
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 450;

    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.container.appendChild(this.renderer.domElement);

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0f172a); // 深空蓝，衬托微观世界

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 3, 9);
      this.camera.lookAt(0, 0, 0);

      // 灯光体系：双向冷暖补光
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
      this.scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight1.position.set(5, 8, 5);
      this.scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.85);
      dirLight2.position.set(-5, -3, -5);
      this.scene.add(dirLight2);

      this.cellGroup = new THREE.Group();
      this.cellGroup.add(this.explodedGroup);
      this.scene.add(this.cellGroup);

      this.buildCellModel();
      this.loadLearningCellGLB();
      this.bindEvents();
      this.animate();
    } catch (e) {
      console.warn("WebGL unavailable, falling back to 2D Canvas cell view:", e);
      this.setupFallback2D(width, height);
    }
  }

  setupFallback2D(width, height) {
    this.isFallback2D = true;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.background = "#0f172a";
    this.container.appendChild(canvas);
    this.canvas2D = canvas;
    this.ctx2D = canvas.getContext("2d");

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < 60 * this.vacuoleTurgorScale) {
        this.onPartSelect("vacuole");
      } else if (dist < 130) {
        this.onPartSelect("chloroplast");
      } else {
        this.onPartSelect("cell-wall");
      }
    });

    this.renderFallback2D();
  }

  renderFallback2D() {
    if (!this.ctx2D) return;
    const ctx = this.ctx2D;
    const w = this.canvas2D.width;
    const h = this.canvas2D.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, w, h);

    // 1. 细胞壁多边形外框
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 12;
    ctx.strokeRect(cx - 180, cy - 130, 360, 260);

    ctx.fillStyle = "rgba(22, 163, 74, 0.22)";
    ctx.fillRect(cx - 174, cy - 124, 348, 248);

    // 2. 细胞膜
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 3.5;
    ctx.strokeRect(cx - 165, cy - 115, 330, 230);

    // 3. 中央大液泡
    const vr = 65 * (this.vacuoleTurgorScale || 1.0);
    ctx.beginPath();
    ctx.arc(cx - 35, cy, Math.max(vr, 25), 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
    ctx.fill();
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("💧 大液泡 (Vacuole)", cx - 35, cy + 5);

    // 4. 细胞核
    ctx.beginPath();
    ctx.arc(cx + 95, cy - 35, 38, 0, Math.PI * 2);
    ctx.fillStyle = "#a855f7";
    ctx.fill();
    ctx.fillText("🧠 细胞核", cx + 95, cy - 30);

    // 5. 叶绿体 (4个)
    const chloroPos = [
      [cx + 90, cy + 55],
      [cx - 110, cy - 65],
      [cx - 105, cy + 60],
      [cx + 25, cy - 75]
    ];
    chloroPos.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.ellipse(x, y, 22, 14, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "#15803d";
      ctx.fill();
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText("🌱 植物细胞微观结构图 (点击各器官即可点读查看)", cx, 30);
  }

  buildCellModel() {
    // 生成拟真生物材质贴图
    const cellWallTex = this.createCellWallTexture();
    const chloroTex = this.createChloroplastTexture();
    const vacuoleTex = this.createVacuoleTexture();
    const nucleusTex = this.createNucleusTexture();

    this.explodedGroup.name = "exploded-group";

    // 1. 细胞壁 (Cell Wall)：贴图加持的纤维素城堡外壳
    const wallGeo = new THREE.BoxGeometry(4.6, 3.4, 3.6, 4, 4, 4);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      map: cellWallTex,
      roughness: 0.45,
      metalness: 0.05,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide
    });
    const cellWallMesh = new THREE.Mesh(wallGeo, wallMat);
    cellWallMesh.name = "cell-wall";
    this.explodedGroup.add(cellWallMesh);
    this.partsMeshes.set("cell-wall", cellWallMesh);

    // 细胞壁立体边缘金色外框线 (强调多面体坚固性)
    const edges = new THREE.EdgesGeometry(wallGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x86efac, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    this.explodedGroup.add(wireframe);

    // 2. 细胞膜 (Cell Membrane)：贴合内侧的轻透柔光膜
    const membraneGeo = new THREE.BoxGeometry(4.3, 3.1, 3.3);
    const membraneMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      roughness: 0.6,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    const membraneMesh = new THREE.Mesh(membraneGeo, membraneMat);
    membraneMesh.name = "membrane";
    this.explodedGroup.add(membraneMesh);
    this.partsMeshes.set("membrane", membraneMesh);

    // 3. 中央大液泡 (Large Vacuole)：水波纹流光大水球
    const vacuoleGeo = new THREE.SphereGeometry(1.25, 32, 24);
    const vacuoleMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      map: vacuoleTex,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2,
      roughness: 0.15,
      transmission: 0.65,
      transparent: true,
      opacity: 0.8
    });
    this.vacuoleMesh = new THREE.Mesh(vacuoleGeo, vacuoleMat);
    this.vacuoleMesh.position.set(-0.35, -0.1, 0.1);
    this.vacuoleMesh.scale.set(1.1, 0.9, 1.0);
    this.vacuoleMesh.name = "vacuole";
    this.explodedGroup.add(this.vacuoleMesh);
    this.partsMeshes.set("vacuole", this.vacuoleMesh);

    // 4. 细胞核 (Nucleus)：核孔贴图 + 深紫色球体 + 核心核仁
    const nucleusGeo = new THREE.SphereGeometry(0.72, 24, 20);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      map: nucleusTex,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.35,
      roughness: 0.35
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleusMesh.position.set(1.4, 0.45, -0.3);
    nucleusMesh.name = "nucleus";
    this.explodedGroup.add(nucleusMesh);
    this.partsMeshes.set("nucleus", nucleusMesh);

    // 核仁红宝石小球
    const nucleolusGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const nucleolusMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const nucleolus = new THREE.Mesh(nucleolusGeo, nucleolusMat);
    nucleusMesh.add(nucleolus);

    // 5. 叶绿体 (Chloroplasts)：表面带有囊状基粒叠层贴图的翡翠绿小飞碟 (5个)
    const chloroGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 16);
    const chloroMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      map: chloroTex,
      emissive: 0x22c55e,
      emissiveIntensity: 0.38,
      roughness: 0.3
    });

    const chloroPositions = [
      [1.2, -0.9, 0.8],
      [-1.3, 0.9, 0.7],
      [-1.5, -0.8, -0.6],
      [0.6, 1.0, -0.9],
      [1.5, 0.8, 0.9]
    ];

    chloroPositions.forEach((pos, i) => {
      const chloroMesh = new THREE.Mesh(chloroGeo, chloroMat);
      chloroMesh.position.set(pos[0], pos[1], pos[2]);
      chloroMesh.rotation.set(Math.random(), Math.random(), 0);
      chloroMesh.name = "chloroplast";
      this.explodedGroup.add(chloroMesh);
      if (i === 0) this.partsMeshes.set("chloroplast", chloroMesh);
    });

    // 6. 线粒体 (Mitochondria)：活力橙色小胶囊 (3个)
    const mitoGeo = new THREE.CapsuleGeometry(0.18, 0.35, 8, 16);
    const mitoMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 0.3,
      roughness: 0.3
    });

    const mitoPositions = [
      [0.2, -1.0, -0.8],
      [-1.2, -0.2, 1.1],
      [0.8, -0.4, -1.0]
    ];

    mitoPositions.forEach((pos, i) => {
      const mitoMesh = new THREE.Mesh(mitoGeo, mitoMat);
      mitoMesh.position.set(pos[0], pos[1], pos[2]);
      mitoMesh.rotation.set(0.5, 0.8, 0.3);
      mitoMesh.name = "mitochondria";
      this.explodedGroup.add(mitoMesh);
      if (i === 0) this.partsMeshes.set("mitochondria", mitoMesh);
    });

    // 初始微微倾斜，展现立体层次
    this.cellGroup.rotation.set(0.35, 0.5, 0);
  }

  loadLearningCellGLB() {
    this.modelLoading = true;
    try {
      const dracoLoader = new DRACOLoader();
      const dracoPath = new URL("../../draco/", import.meta.url).href;
      dracoLoader.setDecoderPath(dracoPath);

      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);

      const modelUrl = new URL("../../models/plant-cell.glb", import.meta.url).href;

      gltfLoader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene || gltf.scenes[0];
          if (!model) {
            console.warn("No scene found in plant-cell.glb");
            return;
          }

          // 计算包围盒并居中归一化缩放
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const targetSize = 4.4;
          const scale = maxDim > 0 ? targetSize / maxDim : 1;
          model.scale.setScalar(scale);
          this.learningCellBaseScale = scale;

          const center = new THREE.Vector3();
          box.getCenter(center);
          center.multiplyScalar(scale);
          model.position.sub(center);

          // 开启阴影和双面渲染
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.side = THREE.DoubleSide;
                child.material.needsUpdate = true;
              }
            }
          });

          this.learningCellMesh = model;
          this.learningCellMesh.name = "learning-cell-glb";
          this.cellGroup.add(this.learningCellMesh);
          this.isModelLoaded = true;
          this.modelLoading = false;

          // 全局暴露便于测试和外部校验
          window.__learningCellMesh = this.learningCellMesh;

          // 保持当前显示模式
          this.setModelMode(this.currentModelMode);
        },
        undefined,
        (err) => {
          console.warn("Could not load plant-cell.glb, falling back to exploded view:", err);
          this.modelLoading = false;
          this.setModelMode("exploded");
        }
      );
    } catch (err) {
      console.warn("Error initializing GLTF/DRACO loader:", err);
      this.modelLoading = false;
      this.setModelMode("exploded");
    }
  }

  setModelMode(mode) {
    this.currentModelMode = mode;
    if (mode === "learningCell") {
      if (this.learningCellMesh) {
        this.learningCellMesh.visible = true;
        this.explodedGroup.visible = false;
      } else {
        // 模型尚未加载完成时，先展示分件积木，平滑过渡
        this.explodedGroup.visible = true;
      }
    } else if (mode === "exploded") {
      if (this.learningCellMesh) {
        this.learningCellMesh.visible = false;
      }
      this.explodedGroup.visible = true;
    }
  }

  bindEvents() {
    const dom = this.renderer.domElement;

    // 鼠标与触摸拖拽旋转
    dom.addEventListener("pointerdown", (e) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.prevPointerPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("pointermove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevPointerPos.x;
      const dy = e.clientY - this.prevPointerPos.y;

      this.cellGroup.rotation.y += dx * 0.008;
      this.cellGroup.rotation.x += dy * 0.008;

      this.prevPointerPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("pointerup", (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.checkRaycastClick(e);
      }
    });

    // 滚轮缩放
    dom.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.005;
      this.camera.position.z = Math.min(Math.max(this.camera.position.z + zoomDelta, 4.5), 15);
    });

    // 窗口尺寸自适应
    window.addEventListener("resize", () => this.onResize());
  }

  checkRaycastClick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cellGroup.children, true);

    if (intersects.length > 0) {
      let targetMesh = intersects[0].object;
      while (targetMesh && !targetMesh.name && targetMesh.parent) {
        targetMesh = targetMesh.parent;
      }
      if (targetMesh && targetMesh.name) {
        if (targetMesh.name === "learning-cell-glb") {
          audio.playTone(660, "sine", 0.08);
          this.focusPart("cell-wall");
        } else {
          this.onPartSelect(targetMesh.name);
          this.focusPart(targetMesh.name);
          audio.playTone(660, "sine", 0.08);
        }
      }
    }
  }

  focusPart(partId) {
    const mesh = this.partsMeshes.get(partId);
    if (mesh) {
      // 闪烁高亮呼吸效果
      const originalScale = mesh.scale.clone();
      mesh.scale.multiplyScalar(1.25);
      setTimeout(() => {
        mesh.scale.copy(originalScale);
      }, 280);
    }
    // 拟真实模状态下整体进行轻微呼吸回馈
    if (this.learningCellMesh && this.learningCellMesh.visible && this.learningCellBaseScale) {
      const curScale = this.learningCellMesh.scale.x;
      this.learningCellMesh.scale.setScalar(curScale * 1.04);
      setTimeout(() => {
        this.learningCellMesh.scale.setScalar(curScale);
      }, 240);
    }
  }

  setVacuoleTurgor(scaleValue) {
    this.vacuoleTurgorScale = scaleValue;
    if (this.vacuoleMesh) {
      this.vacuoleMesh.scale.set(scaleValue * 1.1, scaleValue * 0.9, scaleValue * 1.0);
    }
    if (this.learningCellMesh && this.learningCellBaseScale) {
      const tScale = scaleValue > 1 ? 1.06 : (scaleValue < 1 ? 0.94 : 1.0);
      this.learningCellMesh.scale.setScalar(this.learningCellBaseScale * tScale);
    }
    if (this.isFallback2D) {
      this.renderFallback2D();
    }
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    return this.autoRotate;
  }

  resetCamera() {
    if (this.camera && this.cellGroup) {
      this.camera.position.set(0, 3, 9);
      this.cellGroup.rotation.set(0.35, 0.5, 0);
    }
  }

  onResize() {
    if (this.isFallback2D && this.canvas2D) {
      this.canvas2D.width = this.container.clientWidth || 600;
      this.canvas2D.height = this.container.clientHeight || 450;
      this.renderFallback2D();
      return;
    }
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 450;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    if (this.isFallback2D) return;
    requestAnimationFrame(() => this.animate());

    if (this.autoRotate && !this.isDragging && this.cellGroup) {
      this.cellGroup.rotation.y += 0.004;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
