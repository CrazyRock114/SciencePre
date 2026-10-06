// ==========================================================================
// SciencePre: Progress Tracker & Certificate Unlock Engine
// 本地持久化学习进度，确保必须达成5大条件方可解锁官方小学者证书
// ==========================================================================

const STORAGE_KEY = "sciencepre_plants_progress_v2";

class ProgressTracker {
  constructor() {
    this.data = {
      poemExplored: false,
      exploredOrgans: {},   // { roots: true, stem: true, ... }
      exploredVocab: {},    // { word: true, ... }
      sproutCompleted: false,
      memoryCompleted: false,
      quizCompleted: false,
      quizScore: 0,
      studentName: "Sky"
    };
    this.listeners = [];
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      }
    } catch (e) {
      console.warn("Progress load failed:", e);
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this._notify();
    } catch (e) {
      console.warn("Progress save failed:", e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.getStatus());
  }

  _notify() {
    const status = this.getStatus();
    this.listeners.forEach(fn => fn(status));
  }

  markPoemExplored() {
    this.data.poemExplored = true;
    this.save();
  }

  markOrganExplored(organKey) {
    if (!this.data.exploredOrgans) this.data.exploredOrgans = {};
    this.data.exploredOrgans[organKey] = true;
    this.save();
  }

  markVocabExplored(word) {
    if (!this.data.exploredVocab) this.data.exploredVocab = {};
    this.data.exploredVocab[word] = true;
    this.save();
  }

  markSproutCompleted() {
    this.data.sproutCompleted = true;
    this.save();
  }

  markMemoryCompleted() {
    this.data.memoryCompleted = true;
    this.save();
  }

  markQuizCompleted(score) {
    this.data.quizCompleted = true;
    this.data.quizScore = score;
    this.save();
  }

  setStudentName(name) {
    this.data.studentName = (name || "Sky").trim();
    this.save();
  }

  getStudentName() {
    return this.data.studentName || "Sky";
  }

  getStatus() {
    const organCount = Object.keys(this.data.exploredOrgans || {}).length;
    const vocabCount = Object.keys(this.data.exploredVocab || {}).length;
    const gameDone = this.data.sproutCompleted || this.data.memoryCompleted;

    const checklist = [
      {
        id: "poem",
        label: "诗歌跟读与探索 (Poem Explored)",
        done: !!this.data.poemExplored,
        detail: this.data.poemExplored ? "已探索诗篇" : "点击任一行诗句或全诗朗诵"
      },
      {
        id: "anatomy",
        label: "植物器官解剖 (3+ Organs Explored)",
        done: organCount >= 3,
        detail: `已探索 ${organCount}/3 个器官 (点击植物部位)`
      },
      {
        id: "vocab",
        label: "单词魔法探秘 (3+ Words Explored)",
        done: vocabCount >= 3,
        detail: `已点击学习 ${vocabCount}/3 个词汇`
      },
      {
        id: "game",
        label: "完成一局趣味游戏 (Game Completed)",
        done: gameDone,
        detail: gameDone ? "已通关拼写或记忆花园" : "通关拼写小萌芽或翻牌花园"
      },
      {
        id: "quiz",
        label: "植物小学者问答 (Final Quiz Completed)",
        done: !!this.data.quizCompleted,
        detail: this.data.quizCompleted ? `通关测试 (${this.data.quizScore}/4 题)` : "完成 4 道科学小测验"
      }
    ];

    const completedCount = checklist.filter(item => item.done).length;
    const isUnlocked = completedCount === checklist.length;
    const percent = Math.round((completedCount / checklist.length) * 100);

    return {
      checklist,
      completedCount,
      totalCount: checklist.length,
      isUnlocked,
      percent,
      studentName: this.getStudentName()
    };
  }

  resetProgress() {
    this.data = {
      poemExplored: false,
      exploredOrgans: {},
      exploredVocab: {},
      sproutCompleted: false,
      memoryCompleted: false,
      quizCompleted: false,
      quizScore: 0,
      studentName: this.getStudentName()
    };
    this.save();
  }
}

export const progressTracker = new ProgressTracker();
