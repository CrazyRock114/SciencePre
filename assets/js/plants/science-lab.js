// ==========================================================================
// SciencePre: Junior Botanist Science Lab (小学生自然科学交互实验室)
// 包含 4 大主题展厅：
// 1. 植物细胞 3D 奇幻积木 (Three.js 3D 渲染，支持旋转/缩放/器官点选/液泡膨压实验)
// 2. 叶片微观横剖面与阳光厨房光合模拟器 (实时光合速率与限制因素发现)
// 3. 水流直达梯与甜蜜双向快递 (木质部蒸腾拉力 vs 韧皮部源库运输粒子图)
// 4. 花朵大解剖与小蜜蜂授粉奇遇 (互动解剖 + 四步蜕变绘本)
// ==========================================================================

import * as THREE from "../lib/three.module.js";
import {
  SCIENCE_STATIONS,
  PLANT_CELL_PARTS,
  LEAF_LAYERS,
  TRANSPORT_MODES,
  FLOWER_PARTS,
  POLLINATION_STEPS
} from "../data/science-knowledge.js";
import { audio } from "../core/audio.js";
import { progressTracker } from "../core/progress.js";

export class ScienceLab {
  constructor() {
    this.currentStationId = "station-cell-3d";
    this.cell3D = null;
    this.currentStep = 1;
    this.transportMode = "xylem";
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
    // 默认展示 station-cell-3d
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
      setTimeout(() => this.cell3D.onResize(), 50);
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
  // 展厅 1: 植物细胞 3D 奇幻积木 (Three.js WebGL)
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
        document.querySelectorAll(".leaf-layer-card").forEach((c) => c.classList.remove("active"));
        item.classList.add("active");
        this.highlightLeafSvgLayer(layer.id);
        audio.speak(layer.nameEn);
      });
      container.appendChild(item);
    });
  }

  highlightLeafSvgLayer(layerId) {
    document.querySelectorAll(".svg-leaf-slice-layer").forEach((el) => {
      el.classList.toggle("focused-layer", el.dataset.layer === layerId);
    });
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

    // 科学核心：限制因素！木桶效应：取决于供给最短缺的原料
    const rate = Math.min(sunlight, co2, water);

    const rateMeter = document.getElementById("photosynthesis-rate-meter");
    const rateNumber = document.getElementById("photosynthesis-rate-num");
    const bubblesContainer = document.getElementById("oxygen-bubbles-cloud");
    const toastBox = document.getElementById("limiting-factor-toast");

    if (rateMeter) rateMeter.style.width = `${rate}%`;
    if (rateNumber) rateNumber.textContent = `${rate}%`;

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
  // 展厅 3: 水流电梯与双向甜蜜快递 (木质部 vs 韧皮部)
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
      pipelineView.className = `transport-pipeline-box ${mode}-mode`;
    }
  }

  // ========================================================================
  // 展厅 4: 花朵大解剖与小蜜蜂授粉奇遇
  // ========================================================================
  initStation4_Flower() {
    this.renderFlowerPartsList();
    this.bindPollinationStoryCarousel();
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
          <div class="story-step-badge">第 ${stepData.step} 幕 · ${stepData.enTitle}</div>
          <h4>${stepData.title}</h4>
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
// Three.js 3D 植物细胞引擎 (独立自给自足轻量封装)
// ==========================================================================
class Cell3DScene {
  constructor(container, onPartSelect) {
    this.container = container;
    this.onPartSelect = onPartSelect;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cellGroup = null;

    this.isDragging = false;
    this.prevPointerPos = { x: 0, y: 0 };
    this.rotationVel = { x: 0, y: 0.005 };
    this.autoRotate = true;

    this.partsMeshes = new Map();
    this.vacuoleMesh = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.vacuoleTurgorScale = 1.0;
    this.isFallback2D = false;

    this.setupScene();
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
      this.scene.background = new THREE.Color(0x0f172a); // 深空蓝，衬托鲜艳微观世界

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 3, 9);
      this.camera.lookAt(0, 0, 0);

      // 灯光体系：双向冷暖补光
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      this.scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight1.position.set(5, 8, 5);
      this.scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
      dirLight2.position.set(-5, -3, -5);
      this.scene.add(dirLight2);

      this.cellGroup = new THREE.Group();
      this.scene.add(this.cellGroup);

      this.buildCellModel();
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

    // 3. 中央大液泡 (随 vacuoleTurgorScale 缩放)
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
    // 1. 细胞壁 (Cell Wall)：六边形厚实城堡，带剖面开窗展示内部
    const wallGeo = new THREE.BoxGeometry(4.6, 3.4, 3.6, 4, 4, 4);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const cellWallMesh = new THREE.Mesh(wallGeo, wallMat);
    cellWallMesh.name = "cell-wall";
    this.cellGroup.add(cellWallMesh);
    this.partsMeshes.set("cell-wall", cellWallMesh);

    // 细胞壁立体边缘外框线 (强调多面体坚固性)
    const edges = new THREE.EdgesGeometry(wallGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4ade80, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    this.cellGroup.add(wireframe);

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
    this.cellGroup.add(membraneMesh);
    this.partsMeshes.set("membrane", membraneMesh);

    // 3. 中央大液泡 (Large Vacuole)：清澈蔚蓝水球
    const vacuoleGeo = new THREE.SphereGeometry(1.25, 32, 24);
    const vacuoleMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.75
    });
    this.vacuoleMesh = new THREE.Mesh(vacuoleGeo, vacuoleMat);
    this.vacuoleMesh.position.set(-0.35, -0.1, 0.1);
    this.vacuoleMesh.scale.set(1.1, 0.9, 1.0);
    this.vacuoleMesh.name = "vacuole";
    this.cellGroup.add(this.vacuoleMesh);
    this.partsMeshes.set("vacuole", this.vacuoleMesh);

    // 4. 细胞核 (Nucleus)：高贵深紫色球体 + 核心核仁
    const nucleusGeo = new THREE.SphereGeometry(0.72, 24, 20);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.35,
      roughness: 0.3
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleusMesh.position.set(1.4, 0.45, -0.3);
    nucleusMesh.name = "nucleus";
    this.cellGroup.add(nucleusMesh);
    this.partsMeshes.set("nucleus", nucleusMesh);

    // 核孔外圈小环
    const nucleolusGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const nucleolusMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const nucleolus = new THREE.Mesh(nucleolusGeo, nucleolusMat);
    nucleusMesh.add(nucleolus);

    // 5. 叶绿体 (Chloroplasts)：散布在细胞质各处的翡翠绿小飞碟 (5个)
    const chloroGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 16);
    const chloroMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      emissive: 0x22c55e,
      emissiveIntensity: 0.4,
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
      this.cellGroup.add(chloroMesh);
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
      this.cellGroup.add(mitoMesh);
      if (i === 0) this.partsMeshes.set("mitochondria", mitoMesh);
    });

    // 初始微微倾斜，展现立体层次
    this.cellGroup.rotation.set(0.35, 0.5, 0);
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
        // 如果移动距离很小，视为点击射线命中检测
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
        this.onPartSelect(targetMesh.name);
        this.focusPart(targetMesh.name);
        audio.playTone(660, "sine", 0.08);
      }
    }
  }

  focusPart(partId) {
    const mesh = this.partsMeshes.get(partId);
    if (!mesh) return;

    // 闪烁高亮呼吸效果
    const originalScale = mesh.scale.clone();
    mesh.scale.multiplyScalar(1.25);
    setTimeout(() => {
      mesh.scale.copy(originalScale);
    }, 280);
  }

  setVacuoleTurgor(scaleValue) {
    this.vacuoleTurgorScale = scaleValue;
    if (this.vacuoleMesh) {
      this.vacuoleMesh.scale.set(scaleValue * 1.1, scaleValue * 0.9, scaleValue * 1.0);
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

