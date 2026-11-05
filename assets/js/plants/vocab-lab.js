// ==========================================================================
// SciencePre: Word Magic Lab Engine (Plants)
// 渲染两层词汇库(20核心词+9高阶科学词)，支持点击音节分块朗读、双速朗读与变形规律
// ==========================================================================

import { CORE_POEM_WORDS, SCIENCE_EXPLORER_WORDS } from "../data/plants-data.js";
import { audio } from "../core/audio.js";
import { progressTracker } from "../core/progress.js";

// ==========================================================================
// 诗歌经典短语与成语深度弹窗数据 (Phrase Cards Data)
// ==========================================================================
const PHRASE_CARDS_DATA = {
  "one and all": {
    title: "one and all",
    ipa: "/wʌn ænd ɔːl/",
    zh: "全体 / 无一例外 / 大家",
    tag: "成语与习语 Idiom",
    poemContext: "在诗句“Carries water, one and all”中，诗人巧妙使用此习语，形容茎部导管像大公无私的供水管道，把清泉运送给植物全株每一个器官，无一遗漏！",
    example: "The gentle morning rain brought joy to one and all. (温柔的晨雨为所有生灵带来了欢欣。)",
    funfact: "💡 <strong>成语小妙招</strong>：'one and all' 强调的是全员、全株，每一个都算数！在英语演讲和童谣中常常用于烘托温暖博爱的意境。"
  },
  "day after night": {
    title: "day after night",
    ipa: "/deɪ ˈɑːftər naɪt/",
    zh: "日日夜夜 / 寒来暑往 / 不停歇",
    tag: "优美短语 Phrase",
    poemContext: "在诗句“Make the food day after night”中，描写绿叶如同日夜运转的太阳能美食工坊，白天吸收阳光光合制造养分，夜晚将糖分储藏并输送到全株，生生不息！",
    example: "The stars twinkle in the dark sky, day after night. (星辰在夜空中闪烁，日日夜夜未曾止歇。)",
    funfact: "💡 <strong>科学小知识</strong>：植物白天通过光合作用产生淀粉和葡萄糖，夜晚没有阳光时，植物通过呼吸作用消耗氧气并运送糖分，所以确实是“日夜都在辛勤劳作”哦！"
  },
  "safe and sound": {
    title: "safe and sound",
    ipa: "/seɪf ænd saʊnd/",
    zh: "安然无恙 / 健健康康",
    tag: "押韵成语 Rhyming Idiom",
    poemContext: "在诗句“Drink up water, safe and sound”中，描写根系吸收充足水分，牢牢锚定大地，经历风雨依然安然无恙、健壮生长！",
    example: "After the big storm, the seedling was safe and sound. (暴风雨过后，小树苗依然安然无恙。)",
    funfact: "💡 <strong>趣味发音</strong>：safe 和 sound 都是以 s 开头（头韵 Alliteration），读起来节奏明快、朗朗上口，是英语儿童文学中最常用的祝福语之一！"
  },
  "open wide": {
    title: "open wide",
    ipa: "/ˈoʊpən waɪd/",
    zh: "盛大绽放 / 敞开心房",
    tag: "动作短语 Verb Phrase",
    poemContext: "在诗句“Pretty flowers open wide”中，花瓣充分展开，向天空和蜜蜂蝴蝶展现鲜艳的花瓣与甜美花蜜，热情邀请昆虫传粉！",
    example: "Flowers open wide to greet the warm morning sunshine. (花朵盛大绽放，迎接温暖的晨曦。)",
    funfact: "💡 <strong>传粉奥秘</strong>：花朵敞开花瓣不仅是为了美观，更是为了给蜜蜂蝴蝶提供降落跑道（Landing Strip），帮助雄蕊花粉顺利传到雌蕊上！"
  },
  "deep inside": {
    title: "deep inside",
    ipa: "/diːp ɪnˈsaɪd/",
    zh: "在最深处 / 受到周全保护",
    tag: "位置短语 Prepositional Phrase",
    poemContext: "在诗句“Seeds are hidden deep inside”中，描写下一代的新生命——种子，被母体花朵、子房和果实重重保护在最核心处，安全沉睡等待萌发！",
    example: "The pearl is hidden deep inside the ocean shell. (珍珠深藏在大海贝壳的最深处。)",
    funfact: "💡 <strong>生命摇篮</strong>：种子内藏有小小的植物胚芽（Embryo），外层有坚韧的种皮，因此即使在最深处也能抵御干旱与严寒，等待春风吹拂！"
  }
};

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

  // 展现短语/成语详细弹窗
  showPhrasePopup(phraseKey) {
    const key = (phraseKey || "").toLowerCase().trim();
    const data = PHRASE_CARDS_DATA[key];
    if (!data) return false;

    let overlay = document.getElementById("phrase-popup-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "phrase-popup-overlay";
      overlay.className = "phrase-popup-overlay";
      document.body.appendChild(overlay);

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
        }
      });
    }

    overlay.innerHTML = `
      <div class="phrase-popup-card" role="dialog" aria-modal="true" aria-labelledby="phrase-popup-title">
        <div class="phrase-popup-header">
          <span class="phrase-popup-badge">${data.tag}</span>
          <button type="button" class="phrase-popup-close-btn" id="phrase-popup-close" aria-label="关闭弹窗">✕</button>
        </div>
        <div class="phrase-popup-body">
          <div class="phrase-popup-title-row">
            <h3 class="phrase-popup-title" id="phrase-popup-title">${data.title}</h3>
            <span class="phrase-popup-ipa">${data.ipa}</span>
          </div>
          <div class="phrase-popup-zh">${data.zh}</div>
          <div class="phrase-popup-section">
            <h6>📖 诗歌意境解析</h6>
            <p>${data.poemContext}</p>
          </div>
          <div class="phrase-popup-section" style="border-left-color: #3b82f6;">
            <h6 style="color: #1d4ed8;">🌟 精选例句</h6>
            <p>${data.example}</p>
          </div>
          <div class="phrase-popup-funfact">
            ${data.funfact}
          </div>
          <div class="phrase-popup-actions">
            <button type="button" class="phrase-speak-btn" id="phrase-popup-speak">
              🔊 朗读短语
            </button>
            <button type="button" class="phrase-speak-btn" id="phrase-popup-speak-slow" style="background: #0ea5e9;">
              🐢 慢速跟读
            </button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = overlay.querySelector("#phrase-popup-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        overlay.classList.remove("active");
      });
    }

    const speakBtn = overlay.querySelector("#phrase-popup-speak");
    if (speakBtn) {
      speakBtn.addEventListener("click", () => {
        audio.playPop();
        audio.speak(data.title, 1.0);
      });
    }

    const speakSlowBtn = overlay.querySelector("#phrase-popup-speak-slow");
    if (speakSlowBtn) {
      speakSlowBtn.addEventListener("click", () => {
        audio.playPop();
        audio.speak(data.title, 0.68);
      });
    }

    // 显示弹窗
    overlay.classList.add("active");
    audio.playTone(600, "triangle", 0.1);
    audio.speak(data.title, 1.0);
    return true;
  }

  // 外部高亮特定单词并平滑滚动
  inspectWord(wordText) {
    let cleanWord = (wordText || "").toLowerCase().trim();
    if (cleanWord === "make the food") cleanWord = "make food";

    // 优先尝试短语与成语弹窗
    const isPhraseOpened = this.showPhrasePopup(cleanWord);

    // 同时在下方词卡网格中尝试滚动并高亮
    const targetCard = document.getElementById(`word-card-${cleanWord.replace(/\s+/g, "-")}`);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
      targetCard.classList.add("card-highlight-pulse");
      setTimeout(() => {
        targetCard.classList.remove("card-highlight-pulse");
      }, 2000);
      progressTracker.markVocabExplored(cleanWord);
      if (!isPhraseOpened) {
        audio.speak(cleanWord, 1.0);
      }
    } else {
      progressTracker.markVocabExplored(cleanWord);
    }
  }
}
