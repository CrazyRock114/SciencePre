// ==========================================================================
// SciencePre: Kids Arcade Games Engine (Plants)
// 包含拼写小萌芽(真实生长动画)、翻牌记忆花园、植物小学者问答(无Bug无限重玩)
// ==========================================================================

import { SPROUT_GAME_WORDS, MEMORY_MATCH_CARDS, QUIZ_DATA } from "../data/plants-data.js";
import { audio } from "../core/audio.js";
import { progressTracker } from "../core/progress.js";

export class GamesArcade {
  constructor() {
    this.currentMode = "sprout"; // sprout | memory | quiz

    // Sprout 状态
    this.sproutWordIndex = 0;
    this.sproutEntered = [];

    // Memory 状态
    this.memFlipped = [];
    this.memMatchedCount = 0;
    this.memMoves = 0;
    this.memSeconds = 0;
    this.memTimer = null;

    // Quiz 状态
    this.quizIndex = 0;
    this.quizScore = 0;
  }

  init() {
    this._bindModeTabs();
    this.initSproutGame();
    this.initMemoryGame();
    this.initQuizGame();
  }

  _bindModeTabs() {
    document.querySelectorAll(".arcade-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        this.switchMode(mode);
      });
    });
  }

  switchMode(mode) {
    this.currentMode = mode;
    document.querySelectorAll(".arcade-tab-btn").forEach((b) => b.classList.remove("active"));
    const activeBtn = document.getElementById(`tab-${mode}`);
    if (activeBtn) activeBtn.classList.add("active");

    const sproutView = document.getElementById("game-sprout-view");
    const memoryView = document.getElementById("game-memory-view");
    const quizView = document.getElementById("game-quiz-view");

    if (sproutView) sproutView.style.display = mode === "sprout" ? "flex" : "none";
    if (memoryView) memoryView.style.display = mode === "memory" ? "block" : "none";
    if (quizView) quizView.style.display = mode === "quiz" ? "block" : "none";

    audio.playTone(600, "sine", 0.08);

    if (mode === "sprout") this.renderSproutCurrentWord();
    if (mode === "memory") this.initMemoryGame();
    if (mode === "quiz") this.initQuizGame();
  }

  // ========================================================================
  // 游戏 1: 拼写小萌芽 (Spelling Sprout) - 伴随字母输入真实生长
  // ========================================================================
  initSproutGame() {
    this.sproutWordIndex = 0;
    this._bindSproutActions();
    this.renderSproutCurrentWord();
  }

  _bindSproutActions() {
    const hintBtn = document.getElementById("sprout-hint-btn");
    const nextBtn = document.getElementById("sprout-next-btn");
    const speakBtn = document.getElementById("sprout-speak-btn");

    if (hintBtn) {
      hintBtn.onclick = () => this.giveSproutHint();
    }
    if (nextBtn) {
      nextBtn.onclick = () => this.nextSproutWord();
    }
    if (speakBtn) {
      speakBtn.onclick = () => {
        const wordObj = SPROUT_GAME_WORDS[this.sproutWordIndex];
        if (wordObj) audio.speak(wordObj.word);
      };
    }
  }

  renderSproutCurrentWord() {
    const wordObj = SPROUT_GAME_WORDS[this.sproutWordIndex];
    if (!wordObj) return;

    this.sproutEntered = [];

    const zhEl = document.getElementById("sprout-target-zh");
    const hintEl = document.getElementById("sprout-target-hint");
    if (zhEl) zhEl.innerText = wordObj.zh;
    if (hintEl) hintEl.innerText = wordObj.hint;

    // 渲染槽位
    const slotsEl = document.getElementById("sprout-slots-container");
    if (slotsEl) {
      slotsEl.innerHTML = "";
      for (let i = 0; i < wordObj.word.length; i++) {
        const slot = document.createElement("div");
        slot.className = "letter-slot";
        slot.id = `sprout-slot-${i}`;
        slotsEl.appendChild(slot);
      }
    }

    // 更新植物生长形态 (0%)
    this.updateSproutVisual(0);

    // 渲染键盘
    this.renderSproutKeyboard(wordObj.word);
  }

  // 核心：植物成长 5 个明确阶段
  updateSproutVisual(ratio) {
    const visualEl = document.getElementById("sprout-stage-visual");
    const stageDescEl = document.getElementById("sprout-stage-desc");
    if (!visualEl) return;

    // 5 级生长阶梯：0% -> 25% -> 50% -> 75% -> 100%
    if (ratio <= 0) {
      visualEl.innerText = "🌰";
      visualEl.className = "sprout-plant-visual stage-seed";
      if (stageDescEl) stageDescEl.innerText = "阶段 1/5：泥土中沉睡的种子 (Seed)";
    } else if (ratio < 0.4) {
      visualEl.innerText = "🌱";
      visualEl.className = "sprout-plant-visual stage-sprout";
      if (stageDescEl) stageDescEl.innerText = "阶段 2/5：吸收水分破土萌芽 (Sprout)";
    } else if (ratio < 0.7) {
      visualEl.innerText = "🎋";
      visualEl.className = "sprout-plant-visual stage-stem";
      if (stageDescEl) stageDescEl.innerText = "阶段 3/5：挺拔茎干向上生长 (Stem)";
    } else if (ratio < 1.0) {
      visualEl.innerText = "🍃";
      visualEl.className = "sprout-plant-visual stage-leaves";
      if (stageDescEl) stageDescEl.innerText = "阶段 4/5：翠绿叶片舒展迎接阳光 (Leaves)";
    } else {
      visualEl.innerText = "🌸";
      visualEl.className = "sprout-plant-visual stage-flower blossom-pop";
      if (stageDescEl) stageDescEl.innerText = "阶段 5/5：美丽花朵完全绽放！孕育新种子！";
    }
  }

  renderSproutKeyboard(targetWord) {
    const kb = document.getElementById("sprout-keyboard-container");
    if (!kb) return;
    kb.innerHTML = "";

    // 候选字母池
    const pool = targetWord.split("");
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("").filter((c) => !pool.includes(c));
    for (let i = 0; i < 4; i++) {
      pool.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    pool.sort(() => Math.random() - 0.5);

    pool.forEach((char) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "key-btn";
      btn.innerText = char.toUpperCase();
      btn.onclick = () => this.handleSproutKeyInput(char);
      kb.appendChild(btn);
    });

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "key-btn action-key";
    backBtn.innerText = "⌫ 退格";
    backBtn.onclick = () => this.handleSproutBackspace();
    kb.appendChild(backBtn);
  }

  handleSproutKeyInput(char) {
    const wordObj = SPROUT_GAME_WORDS[this.sproutWordIndex];
    if (this.sproutEntered.length >= wordObj.word.length) return;

    const idx = this.sproutEntered.length;
    this.sproutEntered.push(char.toLowerCase());

    const slot = document.getElementById(`sprout-slot-${idx}`);
    if (slot) {
      slot.innerText = char.toUpperCase();
      slot.classList.add("filled");
    }

    // 随着字母输入进度百分比更新植物成长状态
    const ratio = this.sproutEntered.length / wordObj.word.length;
    this.updateSproutVisual(ratio);

    audio.playTone(450 + idx * 50, "sine", 0.08);

    // 检查是否拼写完成
    if (this.sproutEntered.length === wordObj.word.length) {
      const enteredStr = this.sproutEntered.join("");
      if (enteredStr === wordObj.word.toLowerCase()) {
        audio.playCorrect();
        audio.speak(`Great! ${wordObj.word}!`);
        this.updateSproutVisual(1.0);
        progressTracker.markSproutCompleted();

        setTimeout(() => {
          this.nextSproutWord();
        }, 1300);
      } else {
        audio.playWrong();
        setTimeout(() => {
          this.sproutEntered = [];
          document.querySelectorAll(".letter-slot").forEach((s) => {
            s.innerText = "";
            s.classList.remove("filled");
          });
          this.updateSproutVisual(0);
        }, 600);
      }
    }
  }

  handleSproutBackspace() {
    if (this.sproutEntered.length === 0) return;
    const idx = this.sproutEntered.length - 1;
    this.sproutEntered.pop();

    const slot = document.getElementById(`sprout-slot-${idx}`);
    if (slot) {
      slot.innerText = "";
      slot.classList.remove("filled");
    }

    const wordObj = SPROUT_GAME_WORDS[this.sproutWordIndex];
    const ratio = this.sproutEntered.length / wordObj.word.length;
    this.updateSproutVisual(ratio);
    audio.playTone(320, "sine", 0.05);
  }

  giveSproutHint() {
    const wordObj = SPROUT_GAME_WORDS[this.sproutWordIndex];
    const nextChar = wordObj.word[this.sproutEntered.length];
    if (nextChar) {
      this.handleSproutKeyInput(nextChar);
    }
  }

  nextSproutWord() {
    this.sproutWordIndex = (this.sproutWordIndex + 1) % SPROUT_GAME_WORDS.length;
    this.renderSproutCurrentWord();
  }

  // ========================================================================
  // 游戏 2: 翻牌记忆花园 (Memory Match)
  // ========================================================================
  initMemoryGame() {
    this.memFlipped = [];
    this.memMatchedCount = 0;
    this.memMoves = 0;
    this.memSeconds = 0;
    clearInterval(this.memTimer);

    const movesEl = document.getElementById("mem-moves");
    const pairsEl = document.getElementById("mem-pairs");
    const timeEl = document.getElementById("mem-time");

    if (movesEl) movesEl.innerText = "0";
    if (pairsEl) pairsEl.innerText = "0/6";
    if (timeEl) timeEl.innerText = "00:00";

    this.memTimer = setInterval(() => {
      this.memSeconds++;
      const mins = String(Math.floor(this.memSeconds / 60)).padStart(2, "0");
      const secs = String(this.memSeconds % 60).padStart(2, "0");
      if (timeEl) timeEl.innerText = `${mins}:${secs}`;
    }, 1000);

    const grid = document.getElementById("memory-cards-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const deck = [...MEMORY_MATCH_CARDS].sort(() => Math.random() - 0.5);

    deck.forEach((item) => {
      const card = document.createElement("div");
      card.className = "memory-card";
      card.dataset.matchId = item.matchId;
      card.dataset.text = item.text;
      card.innerText = "❓";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "记忆翻牌卡片");

      const handleCardTrigger = () => {
        this.handleMemoryCardClick(card);
      };

      card.addEventListener("click", handleCardTrigger);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardTrigger();
        }
      });

      grid.appendChild(card);
    });
  }

  handleMemoryCardClick(card) {
    if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
    if (this.memFlipped.length >= 2) return;

    audio.playTone(520, "sine", 0.08);
    card.classList.add("flipped");
    card.innerText = card.dataset.text;
    this.memFlipped.push(card);

    if (this.memFlipped.length === 2) {
      this.memMoves++;
      const movesEl = document.getElementById("mem-moves");
      if (movesEl) movesEl.innerText = this.memMoves;

      const [c1, c2] = this.memFlipped;

      if (c1.dataset.matchId === c2.dataset.matchId) {
        setTimeout(() => {
          audio.playCorrect();
          c1.classList.add("matched");
          c2.classList.add("matched");
          this.memMatchedCount++;
          const pairsEl = document.getElementById("mem-pairs");
          if (pairsEl) pairsEl.innerText = `${this.memMatchedCount}/6`;
          this.memFlipped = [];

          if (this.memMatchedCount === 6) {
            clearInterval(this.memTimer);
            audio.playVictory();
            progressTracker.markMemoryCompleted();
          }
        }, 320);
      } else {
        setTimeout(() => {
          audio.playTone(260, "sawtooth", 0.12);
          c1.classList.remove("flipped");
          c2.classList.remove("flipped");
          c1.innerText = "❓";
          c2.innerText = "❓";
          this.memFlipped = [];
        }, 850);
      }
    }
  }

  // ========================================================================
  // 游戏 3: 植物小学者问答 (Botanist Quiz) - 彻底修复 Replay Bug
  // ========================================================================
  initQuizGame() {
    this.quizIndex = 0;
    this.quizScore = 0;

    // 确保显示题目容器，隐藏结果容器
    const cardContainer = document.getElementById("quiz-card-container");
    const summaryContainer = document.getElementById("quiz-summary-container");

    if (cardContainer) cardContainer.style.display = "block";
    if (summaryContainer) summaryContainer.style.display = "none";

    this.renderQuizQuestion();
  }

  renderQuizQuestion() {
    const q = QUIZ_DATA[this.quizIndex];
    if (!q) return;

    const numEl = document.getElementById("quiz-q-num");
    const titleEl = document.getElementById("quiz-q-title");
    const fillEl = document.getElementById("quiz-progress-fill");
    const feedbackEl = document.getElementById("quiz-feedback-box");
    const optContainer = document.getElementById("quiz-options-container");

    if (numEl) numEl.innerText = `Question ${this.quizIndex + 1} of ${QUIZ_DATA.length}`;
    if (titleEl) titleEl.innerText = q.question;
    if (fillEl) fillEl.style.width = `${((this.quizIndex + 1) / QUIZ_DATA.length) * 100}%`;
    if (feedbackEl) feedbackEl.innerText = "";

    if (optContainer) {
      optContainer.innerHTML = "";
      q.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-opt-btn";
        btn.innerHTML = `<span class="opt-badge">${String.fromCharCode(65 + idx)}</span> <span>${opt.text}</span>`;
        btn.onclick = () => this.handleQuizAnswer(opt.correct, btn, q.explain);
        optContainer.appendChild(btn);
      });
    }
  }

  handleQuizAnswer(isCorrect, btn, explainText) {
    const allBtns = document.querySelectorAll(".quiz-opt-btn");
    allBtns.forEach((b) => (b.disabled = true));

    const fBox = document.getElementById("quiz-feedback-box");
    if (isCorrect) {
      btn.classList.add("correct");
      audio.playCorrect();
      this.quizScore++;
      if (fBox) {
        fBox.style.color = "#15803d";
        fBox.innerHTML = `🎉 <strong>回答正确！</strong> ${explainText}`;
      }
    } else {
      btn.classList.add("wrong");
      audio.playWrong();
      if (fBox) {
        fBox.style.color = "#b91c1c";
        fBox.innerHTML = `💡 <strong>学习小贴士：</strong> ${explainText}`;
      }
    }

    setTimeout(() => {
      this.quizIndex++;
      if (this.quizIndex < QUIZ_DATA.length) {
        this.renderQuizQuestion();
      } else {
        this.showQuizComplete();
      }
    }, 1800);
  }

  // 结算面板：绝不销毁原题目DOM节点，而是安全显隐切换
  showQuizComplete() {
    const cardContainer = document.getElementById("quiz-card-container");
    const summaryContainer = document.getElementById("quiz-summary-container");

    if (cardContainer) cardContainer.style.display = "none";
    if (summaryContainer) {
      summaryContainer.style.display = "block";
      const scoreEl = document.getElementById("quiz-result-score");
      const msgEl = document.getElementById("quiz-result-msg");

      if (scoreEl) scoreEl.innerText = `${this.quizScore} / ${QUIZ_DATA.length}`;
      if (msgEl) {
        msgEl.innerText =
          this.quizScore === QUIZ_DATA.length
            ? "太棒了！满分通关！你已经完全掌握了植物的科学奥秘！"
            : "恭喜完成测验！你已经迈出了成为植物科学家的坚实步伐！";
      }

      // 绑定“再练一次”按钮
      const replayBtn = document.getElementById("quiz-replay-btn");
      if (replayBtn) {
        replayBtn.onclick = () => this.initQuizGame();
      }
    }

    audio.playVictory();
    progressTracker.markQuizCompleted(this.quizScore);
  }
}
