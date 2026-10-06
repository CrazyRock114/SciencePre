// ==========================================================================
// SciencePre: Word Magic Lab Engine (Plants)
// 渲染两层词汇库(20核心词+9高阶科学词)，支持点击音节分块朗读、双速朗读与变形规律
// ==========================================================================

import { CORE_POEM_WORDS, SCIENCE_EXPLORER_WORDS } from "../data/plants-data.js";
import { audio } from "../core/audio.js";
import { progressTracker } from "../core/progress.js";

export class VocabLab {
  constructor() {
    this.container = document.getElementById("vocab-cards-grid");
    this.currentCategory = "all";
    // 合并为完整词库，标记类别
    this.allWords = [
      ...CORE_POEM_WORDS.map((w) => ({ ...w, tier: "poem", isOrgan: ["roots", "stem", "leaves", "flowers", "seeds"].includes(w.word) })),
      ...SCIENCE_EXPLORER_WORDS.map((w) => ({ ...w, tier: "science", isOrgan: ["root hairs", "xylem"].includes(w.word) }))
    ];
  }

  init() {
    this.render("all");
    this._bindFilterButtons();
  }

  _bindFilterButtons() {
    document.querySelectorAll(".vocab-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".vocab-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.category || "all";
        this.render(cat);
        audio.playTone(640, "sine", 0.08);
      });
    });
  }

  render(category = "all") {
    if (!this.container) return;
    this.currentCategory = category;
    this.container.innerHTML = "";

    const filtered = this.allWords.filter((item) => {
      if (category === "all") return true;
      if (category === "poem") return item.tier === "poem";
      if (category === "science") return item.tier === "science";
      if (category === "organ") return item.isOrgan;
      return true;
    });

    filtered.forEach((item) => {
      const card = document.createElement("div");
      card.className = "word-card";
      card.id = `word-card-${item.word.replace(/\s+/g, "-")}`;

      // 顶部词条与分类标签
      const topDiv = document.createElement("div");
      topDiv.className = "word-card-top";

      const wordTitle = document.createElement("div");
      wordTitle.className = "word-en";
      wordTitle.innerText = item.word;

      const tag = document.createElement("span");
      tag.className = `word-tier-tag ${item.tier === "science" ? "tag-science" : "tag-poem"}`;
      tag.innerText = item.tier === "science" ? "🔬 科学高阶词" : "📖 诗歌核心词";

      topDiv.appendChild(wordTitle);
      topDiv.appendChild(tag);
      card.appendChild(topDiv);

      // 可点击音节分块 (Sound Chunks)
      const chunksDiv = document.createElement("div");
      chunksDiv.className = "syllable-chips";

      item.chunks.forEach((chunk) => {
        const chip = document.createElement("button");
        chip.className = "syllable-chip-btn";
        chip.type = "button";
        chip.innerText = chunk;
        chip.title = `点击听音节发音: ${chunk}`;
        chip.setAttribute("aria-label", `音节分块：${chunk}`);

        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          audio.playPop();
          audio.speak(chunk, 0.7);
        });

        chunksDiv.appendChild(chip);
      });
      card.appendChild(chunksDiv);

      // 音标
      const ipaDiv = document.createElement("div");
      ipaDiv.className = "word-phonetic";
      ipaDiv.innerText = `${item.ipa}`;
      card.appendChild(ipaDiv);

      // 中文义
      const zhDiv = document.createElement("div");
      zhDiv.className = "word-zh";
      zhDiv.innerText = item.zh;
      card.appendChild(zhDiv);

      // 本诗语境含义与变形
      const descDiv = document.createElement("div");
      descDiv.className = "word-context-box";
      descDiv.innerHTML = `
        <div class="context-item"><strong>诗中意境</strong>：${item.poemContext}</div>
        <div class="context-item transform-highlight"><strong>★ 词汇变形</strong>：${item.transformation}</div>
        <div class="context-item example-box"><strong>生动例句</strong>：${item.example}</div>
      `;
      card.appendChild(descDiv);

      // 自然拼读规则小贴士
      if (item.phonicsRule) {
        const phonicsDiv = document.createElement("div");
        phonicsDiv.className = "word-phonics-rule";
        phonicsDiv.innerHTML = `💡 <strong>自然拼读</strong>：${item.phonicsRule}`;
        card.appendChild(phonicsDiv);
      }

      // 双速发音控制按钮
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "word-audio-actions";

      const normalBtn = document.createElement("button");
      normalBtn.className = "audio-play-btn";
      normalBtn.innerHTML = "🔊 常速 1.0x";
      normalBtn.addEventListener("click", () => {
        audio.playPop();
        audio.speak(item.word, 1.0);
        progressTracker.markVocabExplored(item.word);
      });

      const slowBtn = document.createElement("button");
      slowBtn.className = "audio-play-btn slow-btn";
      slowBtn.innerHTML = "🐢 慢速 0.7x";
      slowBtn.addEventListener("click", () => {
        audio.playPop();
        audio.speak(item.word, 0.68);
        progressTracker.markVocabExplored(item.word);
      });

      actionsDiv.appendChild(normalBtn);
      actionsDiv.appendChild(slowBtn);
      card.appendChild(actionsDiv);

      this.container.appendChild(card);
    });
  }

  // 外部高亮特定单词并平滑滚动
  inspectWord(wordText) {
    const cleanWord = (wordText || "").toLowerCase().trim();
    const targetCard = document.getElementById(`word-card-${cleanWord.replace(/\s+/g, "-")}`);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
      targetCard.classList.add("card-highlight-pulse");
      setTimeout(() => {
        targetCard.classList.remove("card-highlight-pulse");
      }, 2000);
      progressTracker.markVocabExplored(cleanWord);
      audio.speak(cleanWord, 1.0);
    }
  }
}
