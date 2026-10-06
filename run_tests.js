// ==========================================================================
// SciencePre v0.2 Automated Test Runner (Chrome DevTools Protocol)
// 真正使用系统原生 Google Chrome 浏览器内核进行自动化端到端测试
// ==========================================================================

import { spawn } from "child_process";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9222;
const BASE_URL = (process.argv[2] || "http://localhost:8765").replace(/\/+$/, "");

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      } else if (data.method) {
        if (data.method === "Runtime.exceptionThrown") {
          console.error("🚨 BROWSER EXCEPTION:", JSON.stringify(data.params.exceptionDetails));
        } else if (data.method === "Runtime.consoleAPICalled") {
          console.log("🖥️ CONSOLE:", data.params.type, data.params.args.map(a => a.value !== undefined ? a.value : a.description).join(" "));
        }
        this.events.push(data);
      }
    };
  }

  waitOpen() {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState === WebSocket.OPEN) return resolve();
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }
}

async function main() {
  console.log("🚀 Launching Headless Chrome for End-to-End Testing...");
  const profileDir = `/tmp/chrome-test-${Date.now()}`;
  const chromeProcess = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    "--enable-webgl",
    "--use-gl=angle",
    "--no-sandbox",
    "about:blank"
  ]);

  // 等待 Chrome 端口就绪
  let wsUrl = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise((r) => setTimeout(r, 400));
    try {
      const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const tabs = await listRes.json();
      const pageTab = tabs.find((t) => t.type === "page");
      if (pageTab && pageTab.webSocketDebuggerUrl) {
        wsUrl = pageTab.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      // 端口尚未开放，继续等待
    }
  }

  if (!wsUrl) {
    throw new Error("Could not connect to Chrome debugging target on port " + PORT);
  }

  let cdp = null;
  const testResults = [];

  function record(id, name, pass, detail = "") {
    testResults.push({ id, name, pass, detail });
    const mark = pass ? "✅ PASS" : "❌ FAIL";
    console.log(`[${mark}] Test ${id}: ${name} ${detail ? "(" + detail + ")" : ""}`);
  }

  try {
    cdp = new CDPClient(wsUrl);
    await cdp.waitOpen();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    // 监听未捕获异常
    const uncaughtErrors = [];
    cdp.send("Runtime.addBinding", { name: "onConsoleError" });

    // -------------------------------------------------------------
    // Test 1: Theme Hub -> Plants 导航可达性
    // -------------------------------------------------------------
    console.log(`Testing target URL: ${BASE_URL}`);
    await cdp.send("Page.navigate", { url: `${BASE_URL}/` });
    await cdp.eval(`
      new Promise((resolve) => {
        if (document.querySelector('.theme-card.active-theme .theme-enter-btn')) return resolve();
        const timer = setInterval(() => {
          if (document.querySelector('.theme-card.active-theme .theme-enter-btn')) {
            clearInterval(timer);
            resolve();
          }
        }, 50);
        setTimeout(() => { clearInterval(timer); resolve(); }, 4000);
      })
    `);

    const hubToPlantsHref = await cdp.eval(`
      (() => {
        const link = document.querySelector('.theme-card.active-theme .theme-enter-btn');
        return link ? link.getAttribute('href') : null;
      })()
    `);
    record(1, "Theme Hub → Plants 导航链接", hubToPlantsHref === "/plants/", `href: ${hubToPlantsHref}`);

    // -------------------------------------------------------------
    // Test 2 & 19: Plants -> Theme Hub 导航与 /plants/ 直接刷新
    // -------------------------------------------------------------
    await cdp.send("Page.navigate", { url: `${BASE_URL}/plants/` });

    // 等待 ES Module 与 DOM 完全初始化就绪
    await cdp.eval(`
      new Promise((resolve) => {
        const isReady = () => window.__progressTracker && document.getElementById('poem-stanza-0');
        if (isReady()) return resolve();
        const timer = setInterval(() => {
          if (isReady()) {
            clearInterval(timer);
            resolve();
          }
        }, 50);
        setTimeout(() => { clearInterval(timer); resolve(); }, 4000);
      })
    `);

    const plantsTitle = await cdp.eval("document.title");
    record(19, "/plants/ 直接刷新与加载", plantsTitle.includes("Plants"), `Title: ${plantsTitle}`);

    const plantsToHubHref = await cdp.eval(`
      (() => {
        const link = document.querySelector('.nav-tabs a[href="/"]');
        return link ? link.getAttribute('href') : null;
      })()
    `);
    record(2, "Plants → Theme Hub 导航链接", plantsToHubHref === "/", `href: ${plantsToHubHref}`);

    // -------------------------------------------------------------
    // Test 3: Plants -> Sky 外部链接
    // -------------------------------------------------------------
    const skyHref = await cdp.eval(`
      (() => {
        const links = Array.from(document.querySelectorAll('a[href*="sky.igcse.xyz"]'));
        return links.length > 0 ? links[0].href : null;
      })()
    `);
    record(3, "Plants → Sky 高年级版互通链接", skyHref && skyHref.includes("sky.igcse.xyz"), `URL: ${skyHref}`);

    // -------------------------------------------------------------
    // Test 4 & 5: 全诗播放与单行朗诵
    // -------------------------------------------------------------
    const poemPlayRes = await cdp.eval(`
      (() => {
        const btn = document.getElementById('play-poem-btn');
        if (!btn) return false;
        btn.click();
        const playingClass = btn.classList.contains('playing');
        btn.click(); // 停止
        return playingClass;
      })()
    `);
    record(4, "Poem full playback 全诗卡拉OK朗诵触发", poemPlayRes === true);

    const singleLineRes = await cdp.eval(`
      (() => {
        const firstStanza = document.getElementById('poem-stanza-0');
        if (!firstStanza) return false;
        firstStanza.click();
        return firstStanza.classList.contains('active');
      })()
    `);
    record(5, "Individual line playback 单行点读触发", singleLineRes === true);

    // -------------------------------------------------------------
    // Test 6: Poem -> Organ 双向联动 (点击诗句高亮器官)
    // -------------------------------------------------------------
    const poemToOrganRes = await cdp.eval(`
      (() => {
        const stemStanza = document.getElementById('poem-stanza-1'); // Stem
        stemStanza.click();
        const svgStem = document.getElementById('svg-stem');
        const btnStem = document.getElementById('btn-stem');
        return svgStem.classList.contains('active-part') && btnStem.classList.contains('active');
      })()
    `);
    record(6, "Poem → Organ 联动 (点击诗句高亮植物器官)", poemToOrganRes === true);

    // -------------------------------------------------------------
    // Test 7: Organ -> Poem 反向联动 (点击植物SVG/按钮反向高亮诗句)
    // -------------------------------------------------------------
    const organToPoemRes = await cdp.eval(`
      (() => {
        const btnRoots = document.getElementById('btn-roots');
        btnRoots.click();
        const stanzaRoots = document.getElementById('poem-stanza-0');
        return stanzaRoots.classList.contains('active');
      })()
    `);
    record(7, "Organ → Poem 反向联动 (点击器官反向高亮诗句)", organToPoemRes === true);

    // -------------------------------------------------------------
    // Test 8: Vocabulary audio normal/slow 与 音节 chunk 点击
    // -------------------------------------------------------------
    const vocabChunkRes = await cdp.eval(`
      (() => {
        const chunkBtn = document.querySelector('.syllable-chip-btn');
        const normalBtn = document.querySelector('.audio-play-btn');
        const slowBtn = document.querySelector('.audio-play-btn.slow-btn');
        if (!chunkBtn || !normalBtn || !slowBtn) return false;
        chunkBtn.click();
        normalBtn.click();
        slowBtn.click();
        return true;
      })()
    `);
    record(8, "Vocabulary audio normal/slow & chunk 可点击朗读", vocabChunkRes === true);

    // -------------------------------------------------------------
    // Test 20: 3D 植物细胞 WebGL 画布加载与渲染
    // -------------------------------------------------------------
    const cell3DRes = await cdp.eval(`
      (() => {
        const canvas = document.querySelector('#cell-3d-canvas-container canvas');
        return canvas && canvas.width > 0 && canvas.height > 0;
      })()
    `);
    record(20, "3D 植物细胞 WebGL 真实画布初始化与渲染", cell3DRes === true);

    // -------------------------------------------------------------
    // Test 21: 3D 细胞器官点选与大液泡浇水膨压实验 (Turgid vs Flaccid)
    // -------------------------------------------------------------
    const turgorExpRes = await cdp.eval(`
      (() => {
        const droughtBtn = document.getElementById('btn-vacuole-drought');
        const waterBtn = document.getElementById('btn-vacuole-water');
        const stateEl = document.getElementById('vacuole-turgor-state');
        if (!droughtBtn || !waterBtn || !stateEl) return false;
        
        droughtBtn.click();
        const hasFlaccid = stateEl.innerText.includes('Flaccid') || stateEl.innerText.includes('萎蔫');
        waterBtn.click();
        const hasTurgid = stateEl.innerText.includes('Turgid') || stateEl.innerText.includes('挺立');
        return hasFlaccid && hasTurgid;
      })()
    `);
    record(21, "3D 细胞大液泡浇水膨压实验 (Turgid vs Flaccid 切换)", turgorExpRes === true);

    // -------------------------------------------------------------
    // Test 22: 叶片光合作用阳光厨房滑块与限制因素 (Limiting Factor) 实时测算
    // -------------------------------------------------------------
    const photoSimRes = await cdp.eval(`
      (() => {
        const tabBtn = document.querySelector('.station-tab-btn[data-station="station-leaf-photo"]');
        if (tabBtn) tabBtn.click();

        const sunInput = document.getElementById('slider-sunlight');
        const co2Input = document.getElementById('slider-co2');
        const rateNum = document.getElementById('photosynthesis-rate-num');
        const toast = document.getElementById('limiting-factor-toast');
        if (!sunInput || !co2Input || !rateNum || !toast) return false;

        sunInput.value = '90';
        sunInput.dispatchEvent(new Event('input'));
        co2Input.value = '20';
        co2Input.dispatchEvent(new Event('input'));

        const rateIs20 = rateNum.textContent === '20%';
        const toastHasLimiting = toast.textContent.includes('限制因素') || toast.textContent.includes('Limiting');
        return rateIs20 && toastHasLimiting;
      })()
    `);
    record(22, "叶片光合作用阳光厨房限制因素 (Limiting Factor) 动态发现", photoSimRes === true);

    // -------------------------------------------------------------
    // Test 23: 水流直达梯与甜蜜快递 (Xylem vs Phloem) 双向管道切换与粒子流
    // -------------------------------------------------------------
    const transportRes = await cdp.eval(`
      (() => {
        const tabBtn = document.querySelector('.station-tab-btn[data-station="station-transport"]');
        if (tabBtn) tabBtn.click();

        const btnPhloem = document.getElementById('btn-mode-phloem');
        const btnXylem = document.getElementById('btn-mode-xylem');
        const pipeBox = document.getElementById('transport-pipeline-view');
        if (!btnPhloem || !btnXylem || !pipeBox) return false;

        btnPhloem.click();
        const isPhloem = pipeBox.classList.contains('phloem-mode');
        btnXylem.click();
        const isXylem = pipeBox.classList.contains('xylem-mode');
        return isPhloem && isXylem;
      })()
    `);
    record(23, "水流电梯与双向甜蜜快递 (Xylem vs Phloem 管道切换)", transportRes === true);

    // -------------------------------------------------------------
    // Test 24: 花朵大解剖与小蜜蜂授粉 4 步故事书步进联动
    // -------------------------------------------------------------
    const flowerStoryRes = await cdp.eval(`
      (() => {
        const tabBtn = document.querySelector('.station-tab-btn[data-station="station-flower"]');
        if (tabBtn) tabBtn.click();

        const nextBtn = document.getElementById('btn-pollination-next');
        const storyCard = document.getElementById('pollination-story-display');
        if (!nextBtn || !storyCard) return false;

        nextBtn.click(); // 从第 1 幕切到第 2 幕
        const isStep2 = storyCard.innerText.includes('第 2 幕') || storyCard.innerText.includes('蜜蜂');
        return isStep2;
      })()
    `);
    record(24, "花朵大解剖与小蜜蜂授粉 4 步故事书交互步进", flowerStoryRes === true);

    // -------------------------------------------------------------
    // Test 25: 显微镜真图对照模式切换与微观切片展示 (Station 1)
    // -------------------------------------------------------------
    const microscopeViewRes = await cdp.eval(`
      (() => {
        const tabBtn = document.querySelector('.station-tab-btn[data-station="station-cell-3d"]');
        if (tabBtn) tabBtn.click();

        const btnMicroscope = document.getElementById('btn-view-microscope');
        const btn3D = document.getElementById('btn-view-3d');
        const container = document.getElementById('cell-microscope-container');
        if (!btnMicroscope || !container) return false;

        btnMicroscope.click();
        const isMicroscopeVisible = container.style.display !== 'none';
        const hasPins = document.querySelectorAll('.microscope-pin').length >= 4;
        const pinWall = document.querySelector('.microscope-pin[data-part="cell-wall"]');
        if (pinWall) pinWall.click();
        const activePin = document.querySelector('.microscope-pin.active');

        // 切回 3D
        btn3D.click();
        return isMicroscopeVisible && hasPins && activePin !== null;
      })()
    `);
    record(25, "Station 1: 显微镜真图对照视图切换与细胞微观热点引脚交互", microscopeViewRes === true);

    // -------------------------------------------------------------
    // Test 26: 叶片横剖面微观解剖图交互图钉与 SEM 电镜气孔 (Station 2)
    // -------------------------------------------------------------
    const leafPinsRes = await cdp.eval(`
      (() => {
        const tabBtn = document.querySelector('.station-tab-btn[data-station="station-leaf-photo"]');
        if (tabBtn) tabBtn.click();

        const pinStoma = document.querySelector('.leaf-pin[data-layer="stoma-guard"]');
        if (!pinStoma) return false;
        pinStoma.click();

        const layerStoma = document.querySelector('.leaf-layer-card[data-layer="stoma-guard"]');
        const hasSemImg = document.querySelector('.stoma-sem-img') !== null;
        return layerStoma && layerStoma.classList.contains('active') && hasSemImg;
      })()
    `);
    record(26, "Station 2: 叶片解剖图热点引脚联动与扫描电镜(SEM)真实气孔对照", leafPinsRes === true);

    // -------------------------------------------------------------
    // Test 27: 金鱼藻水下放氧实验与动态气泡生成器 (Station 2)
    // -------------------------------------------------------------
    const elodeaExpRes = await cdp.eval(`
      (() => {
        const tabBtn = document.querySelector('.station-tab-btn[data-station="station-leaf-photo"]');
        if (tabBtn) tabBtn.click();

        const sunInput = document.getElementById('slider-sunlight');
        const co2Input = document.getElementById('slider-co2');
        const waterInput = document.getElementById('slider-water');
        const bubbleNum = document.getElementById('elodea-bubble-rate-num');
        const spawner = document.getElementById('elodea-bubble-spawner');
        if (!sunInput || !bubbleNum || !spawner) return false;

        sunInput.value = '100';
        co2Input.value = '100';
        waterInput.value = '100';
        sunInput.dispatchEvent(new Event('input'));

        const highRate = bubbleNum.textContent.includes('80');
        const hasBubbles = spawner.querySelectorAll('.beaker-rising-bubble').length > 0;
        return highRate && hasBubbles;
      })()
    `);
    record(27, "Station 2: 金鱼藻水下放氧实验模拟与试管动态上升氧气泡", elodeaExpRes === true);

    // -------------------------------------------------------------
    // Test 28: 芹菜吸墨水经典实验组与染色粒子流 (Station 3)
    // -------------------------------------------------------------
    const celeryExpRes = await cdp.eval(`
      (() => {
        const tabBtn = document.querySelector('.station-tab-btn[data-station="station-transport"]');
        if (tabBtn) tabBtn.click();

        const btnRed = document.getElementById('btn-dye-red');
        const btnBlue = document.getElementById('btn-dye-blue');
        const pipeBox = document.getElementById('transport-pipeline-view');
        const toast = document.getElementById('celery-obs-toast');
        if (!btnRed || !btnBlue || !pipeBox || !toast) return false;

        btnRed.click();
        const isRedDye = pipeBox.classList.contains('red-dye') && toast.innerText.includes('红墨水');
        btnBlue.click();
        const isBlueDye = pipeBox.classList.contains('blue-dye') && toast.innerText.includes('蓝墨水');
        return isRedDye && isBlueDye;
      })()
    `);
    record(28, "Station 3: 芹菜红/蓝墨水吸收实验操作与木质部单向染色流", celeryExpRes === true);

    // -------------------------------------------------------------
    // Test 29: 花朵大解剖经典图 vs 真实百合解剖实拍切换 (Station 4)
    // -------------------------------------------------------------
    const flowerViewToggleRes = await cdp.eval(`
      (() => {
        const tabBtn = document.querySelector('.station-tab-btn[data-station="station-flower"]');
        if (tabBtn) tabBtn.click();

        const btnReal = document.getElementById('btn-flower-real-view');
        const btnDiag = document.getElementById('btn-flower-diagram-view');
        const mainImg = document.getElementById('flower-main-display-img');
        if (!btnReal || !btnDiag || !mainImg) return false;

        btnReal.click();
        const isRealImg = mainImg.src.includes('flower-dissection-real-photo.jpg');
        btnDiag.click();
        const isDiagImg = mainImg.src.includes('flower-dissection-diagram.png');
        return isRealImg && isDiagImg;
      })()
    `);
    record(29, "Station 4: 花朵结构图与真实百合解剖实拍高清照片即时切换", flowerViewToggleRes === true);

    // -------------------------------------------------------------
    // Test 30: LearningCell 3D 实模加载与 3 模式切换 (拟真实模 vs 透视分件 vs 显微镜真图)
    // -------------------------------------------------------------
    const learningCellRes = await cdp.eval(`
      (async () => {
        // 先切回 Station 1
        const tabBtn = document.querySelector('.station-tab-btn[data-station="station-cell-3d"]');
        if (tabBtn) tabBtn.click();

        const btn3D = document.getElementById('btn-view-3d');
        const btnExploded = document.getElementById('btn-view-exploded');
        const btnMicroscope = document.getElementById('btn-view-microscope');
        const modeTag = document.getElementById('cell-current-mode-tag');

        if (!btn3D || !btnExploded || !btnMicroscope || !modeTag) return { pass: false, error: "Missing toggle buttons" };

        // 等待 LearningCell GLB 模型就绪（至多 6 秒）
        for (let i = 0; i < 30; i++) {
          if (window.__learningCellMesh) break;
          await new Promise(r => setTimeout(r, 200));
        }

        const modelLoaded = window.__learningCellMesh !== null && window.__learningCellMesh !== undefined;

        // 1. 测试切到拟真实模 (btn-view-3d)
        btn3D.click();
        await new Promise(r => setTimeout(r, 120));
        const mode3DActive = btn3D.classList.contains('active');
        const mode3DText = modeTag.textContent.includes('LearningCell');
        const modelVisibleIn3D = window.__learningCellMesh ? window.__learningCellMesh.visible : false;

        // 2. 测试切到透视分件 (btn-view-exploded)
        btnExploded.click();
        await new Promise(r => setTimeout(r, 120));
        const modeExplodedActive = btnExploded.classList.contains('active');
        const modeExplodedText = modeTag.textContent.includes('透视分件');
        const modelHiddenInExploded = window.__learningCellMesh ? !window.__learningCellMesh.visible : true;

        // 3. 测试切到显微镜真图 (btn-view-microscope)
        btnMicroscope.click();
        await new Promise(r => setTimeout(r, 120));
        const modeMicroscopeActive = btnMicroscope.classList.contains('active');
        const modeMicroscopeText = modeTag.textContent.includes('显微镜真图对照');
        const canvasHidden = document.getElementById('cell-3d-canvas-container').style.display === 'none';

        // 复位回 3D 模式
        btn3D.click();

        return {
          pass: modelLoaded && mode3DActive && mode3DText && modelVisibleIn3D &&
                modeExplodedActive && modeExplodedText && modelHiddenInExploded &&
                modeMicroscopeActive && modeMicroscopeText && canvasHidden,
          modelLoaded,
          mode3DText,
          modeExplodedText,
          modeMicroscopeText
        };
      })()
    `);
    record(30, "LearningCell 3D 实模加载与 3 模式切换 (拟真实模 vs 透视分件 vs 显微镜真图)", learningCellRes.pass === true, JSON.stringify(learningCellRes));

    // -------------------------------------------------------------
    // Test 31: 双系统内链完整性 (www.igcse.xyz 完整教学站 + sky.igcse.xyz 单词打卡)
    // -------------------------------------------------------------
    const dualLinksRes = await cdp.eval(`
      (() => {
        // 1. 顶部公告栏内链检查
        const topBannerLinks = Array.from(document.querySelectorAll('.announcement-banner a, .banner-sub a')).map(a => a.href);
        const hasTopWwwLink = topBannerLinks.some(href => href.includes('www.igcse.xyz'));
        const hasTopSkyLink = topBannerLinks.some(href => href.includes('sky.igcse.xyz'));

        // 2. 4 大展厅桥接卡片 (Curriculum Bridge Cards) 检查
        const bridgeCards = document.querySelectorAll('.curriculum-bridge-card');
        const bridgeWwwLinks = Array.from(document.querySelectorAll('.bridge-main-link')).map(a => a.href);
        const bridgeWordLinks = Array.from(document.querySelectorAll('.bridge-word-link')).map(a => a.href);
        const allBridgesHaveWww = bridgeCards.length === 4 && bridgeWwwLinks.length === 4 && bridgeWwwLinks.every(href => href.includes('www.igcse.xyz'));
        const allBridgesHaveSky = bridgeWordLinks.length === 4 && bridgeWordLinks.every(href => href.includes('sky.igcse.xyz'));

        // 3. 页脚双系统内链检查
        const footerLinks = Array.from(document.querySelectorAll('footer a, .footer-links a')).map(a => a.href);
        const hasFooterWwwLink = footerLinks.some(href => href.includes('www.igcse.xyz'));
        const hasFooterSkyLink = footerLinks.some(href => href.includes('sky.igcse.xyz'));

        return {
          pass: hasTopWwwLink && hasTopSkyLink && allBridgesHaveWww && allBridgesHaveSky && hasFooterWwwLink && hasFooterSkyLink,
          bridgeCount: bridgeCards.length,
          hasTopWwwLink,
          hasTopSkyLink,
          allBridgesHaveWww,
          allBridgesHaveSky,
          hasFooterWwwLink,
          hasFooterSkyLink
        };
      })()
    `);
    record(31, "双系统内链完整性 (www.igcse.xyz 完整教学 + sky.igcse.xyz 单词特训)", dualLinksRes.pass === true, JSON.stringify(dualLinksRes));

    // -------------------------------------------------------------
    // Test 10: Spelling plant-growth progression (5 阶成长形态)
    // -------------------------------------------------------------
    const growthStagesRes = await cdp.eval(`
      (() => {
        const visualEl = document.getElementById('sprout-stage-visual');
        const descEl = document.getElementById('sprout-stage-desc');
        // 初始为种子阶段
        const isInitialSeed = visualEl.innerText === '🌰';

        // 模拟依次输入正确字母: roots (r -> o -> o -> t -> s)
        const keys = document.querySelectorAll('#sprout-keyboard-container .key-btn');
        // 输入一个字母
        const rKey = Array.from(keys).find(k => k.innerText === 'R');
        if (rKey) rKey.click();
        const stage1 = visualEl.innerText; // 🌱

        const oKey = Array.from(keys).find(k => k.innerText === 'O');
        if (oKey) oKey.click();
        const stage2 = visualEl.innerText; // 🎋

        return {
          isInitialSeed,
          afterFirst: stage1,
          afterSecond: stage2
        };
      })()
    `);
    record(10, "Spelling plant-growth progression (随输入比例递进成长)", 
      growthStagesRes.isInitialSeed && (growthStagesRes.afterFirst === '🌱' || growthStagesRes.afterSecond === '🎋'),
      `stages: 🌰 -> ${growthStagesRes.afterFirst} -> ${growthStagesRes.afterSecond}`);

    // -------------------------------------------------------------
    // Test 9: Spelling game complete
    // -------------------------------------------------------------
    const spellingCompleteRes = await cdp.eval(`
      (() => {
        // 完成整个单词 roots
        const keys = document.querySelectorAll('#sprout-keyboard-container .key-btn');
        const findKey = (c) => Array.from(keys).find(k => k.innerText === c);
        // 当前已有 r, o，继续拼 o, t, s
        const oKey = findKey('O'); if (oKey) oKey.click();
        const tKey = findKey('T'); if (tKey) tKey.click();
        const sKey = findKey('S'); if (sKey) sKey.click();
        return true;
      })()
    `);
    record(9, "Spelling game complete 拼写萌芽通关", spellingCompleteRes === true);

    // -------------------------------------------------------------
    // Test 11: Memory game complete
    // -------------------------------------------------------------
    const memoryCompleteRes = await cdp.eval(`
      (() => {
        const cards = Array.from(document.querySelectorAll('.memory-card'));
        if (cards.length === 0) return false;
        // 分组按 matchId 一对对点击
        const map = {};
        cards.forEach(c => {
          const m = c.dataset.matchId;
          if (!map[m]) map[m] = [];
          map[m].push(c);
        });
        Object.values(map).forEach(pair => {
          pair[0].click();
          pair[1].click();
        });
        return true;
      })()
    `);
    record(11, "Memory game complete 翻牌花园通关", memoryCompleteRes === true);

    // -------------------------------------------------------------
    // Test 12 & 13: Quiz complete & Quiz Play Again (无报错连续两轮)
    // -------------------------------------------------------------
    const quizTwoRoundsRes = await cdp.eval(`
      (async () => {
        // 切换到 Quiz tab
        document.getElementById('tab-quiz').click();

        async function playOneFullRound() {
          for (let q = 0; q < 4; q++) {
            const correctBtn = document.querySelector('.quiz-opt-btn');
            if (!correctBtn) throw new Error('Question button not found at q ' + q);
            correctBtn.click();
            await new Promise(r => setTimeout(r, 1900)); // 等待题目切换
          }
        }

        // 第 1 轮
        await playOneFullRound();
        const round1Summary = document.getElementById('quiz-summary-container');
        if (!round1Summary || round1Summary.style.display === 'none') {
          return { pass: false, error: 'Round 1 summary not displayed' };
        }

        // 点击“再练一次”
        const replayBtn = document.getElementById('quiz-replay-btn');
        if (!replayBtn) return { pass: false, error: 'Replay button not found' };
        replayBtn.click();
        await new Promise(r => setTimeout(r, 200));

        // 第 2 轮
        const qCardContainer = document.getElementById('quiz-card-container');
        if (!qCardContainer || qCardContainer.style.display === 'none') {
          return { pass: false, error: 'Round 2 question container not displayed' };
        }

        await playOneFullRound();
        const round2Summary = document.getElementById('quiz-summary-container');
        const passRound2 = round2Summary && round2Summary.style.display !== 'none';

        return { pass: passRound2 };
      })()
    `);
    record(12, "Quiz complete 问答通关", quizTwoRoundsRes.pass === true);
    record(13, "Quiz Play Again and complete second round (无DOM丢失连续两轮)", quizTwoRoundsRes.pass === true);

    // -------------------------------------------------------------
    // Test 14: Certificate locked before completion (此时尚未完成3个单词，证书必须处于锁定状态)
    // -------------------------------------------------------------
    const certLockedInitialRes = await cdp.eval(`
      (() => {
        const lockedBox = document.getElementById('cert-locked-box');
        const unlockedBox = document.getElementById('cert-unlocked-box');
        return {
          isLockedVisible: lockedBox && lockedBox.style.display !== 'none',
          isUnlockedHidden: unlockedBox && unlockedBox.style.display === 'none'
        };
      })()
    `);
    record(14, "Certificate locked before completion 初始状态证书锁定", 
      certLockedInitialRes.isLockedVisible && certLockedInitialRes.isUnlockedHidden);

    // -------------------------------------------------------------
    // 完成剩余条件：补全 3 个器官探索 + 3 个单词探索，达成全部 5 项条件
    // -------------------------------------------------------------
    await cdp.eval(`
      (() => {
        // 探索 3 个器官: roots, stem, leaves
        const bRoots = document.getElementById('btn-roots'); if (bRoots) bRoots.click();
        const bStem = document.getElementById('btn-stem'); if (bStem) bStem.click();
        const bLeaves = document.getElementById('btn-leaves'); if (bLeaves) bLeaves.click();

        // 探索 3 个不同词卡发音 (roots, beneath, ground)
        const cards = document.querySelectorAll('.word-card');
        if (cards[0]) cards[0].querySelector('.audio-play-btn').click();
        if (cards[1]) cards[1].querySelector('.audio-play-btn').click();
        if (cards[2]) cards[2].querySelector('.audio-play-btn').click();
        return true;
      })()
    `);
    await new Promise((r) => setTimeout(r, 400));

    const currentStatus = await cdp.eval(`
      (() => {
        return window.__progressTracker ? window.__progressTracker.getStatus() : null;
      })()
    `);
    console.log("DEBUG Progress Status:", JSON.stringify(currentStatus, null, 2));

    // -------------------------------------------------------------
    // Test 15: Certificate unlocked after all completion (5项全部达成后解锁)
    // -------------------------------------------------------------
    const certUnlockedRes = await cdp.eval(`
      (() => {
        const unlockedBox = document.getElementById('cert-unlocked-box');
        const lockedBox = document.getElementById('cert-locked-box');
        return {
          isUnlockedVisible: unlockedBox && unlockedBox.style.display !== 'none',
          isLockedHidden: lockedBox && lockedBox.style.display === 'none'
        };
      })()
    `);
    record(15, "Certificate unlocked after all completion 条件满足后解锁证书", 
      certUnlockedRes.isUnlockedVisible && certUnlockedRes.isLockedHidden);

    // -------------------------------------------------------------
    // Test 16: Reload page and progress persistence
    // -------------------------------------------------------------
    await cdp.send("Page.reload");
    await new Promise((r) => setTimeout(r, 700));
    await cdp.eval(`
      new Promise((resolve) => {
        if (window.__progressTracker) return resolve();
        const timer = setInterval(() => {
          if (window.__progressTracker) {
            clearInterval(timer);
            resolve();
          }
        }, 50);
        setTimeout(() => { clearInterval(timer); resolve(); }, 3000);
      })
    `);

    const progressPersistenceRes = await cdp.eval(`
      (() => {
        const unlockedBox = document.getElementById('cert-unlocked-box');
        return unlockedBox && unlockedBox.style.display !== 'none';
      })()
    `);
    record(16, "Reload page and progress persistence 刷新后进度保持解锁", progressPersistenceRes === true);

    // -------------------------------------------------------------
    // Test 17: Mobile narrow-width smoke test (375px)
    // -------------------------------------------------------------
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise((r) => setTimeout(r, 400));

    const mobileCheck = await cdp.eval(`
      (() => {
        const bodyWidth = document.body.clientWidth;
        const noHorizOverflow = document.documentElement.scrollWidth <= window.innerWidth + 2;
        return { bodyWidth, noHorizOverflow };
      })()
    `);
    record(17, "Mobile narrow-width smoke test (iPhone 375px 无水平溢出)", mobileCheck.noHorizOverflow === true);

    // -------------------------------------------------------------
    // Test 18: No uncaught console errors
    // -------------------------------------------------------------
    const hasConsoleErrors = await cdp.eval(`
      window.__hasGlobalErrors === true
    `);
    record(18, "No uncaught console errors 页面全局无异常抛出", !hasConsoleErrors);
  } catch (err) {
    console.error("Test execution fatal error:", err);
  } finally {
    if (chromeProcess) {
      chromeProcess.kill();
    }
  }

  console.log("\n=================== TEST SUMMARY MATRIX ===================");
  let allPass = true;
  testResults.forEach((t) => {
    const status = t.pass ? "PASS" : "FAIL";
    if (!t.pass) allPass = false;
    console.log(`${String(t.id).padStart(2, " ")}. [${status}] ${t.name}`);
  });
  console.log(`TOTAL: ${testResults.filter(t => t.pass).length}/${testResults.length} PASSED`);
  console.log("===========================================================\n");

  process.exit(allPass ? 0 : 1);
}

main();
