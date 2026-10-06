// ==========================================================================
// SciencePre: Theme 01 Plants - Comprehensive Learning Content
// 包含诗歌、科学探险站、诗歌vs科学解析、两层词库（20核心词+9高阶科学词）、问答
// ==========================================================================

export const POEM_DATA = [
  {
    stanzaIndex: 0,
    organ: "roots",
    title: "地下根系 Roots",
    lines: [
      {
        en: "Roots go down beneath the ground,",
        zh: "根系深深扎入泥土，",
        organ: "roots",
        highlightWords: ["roots", "beneath", "ground"]
      },
      {
        en: "Drink up water, safe and sound.",
        zh: "汲取清水，安然茁壮。",
        organ: "roots",
        highlightWords: ["drink up", "safe and sound"]
      }
    ]
  },
  {
    stanzaIndex: 1,
    organ: "stem",
    title: "挺拔茎干 Stem",
    lines: [
      {
        en: "Stem stands straight and grows so tall,",
        zh: "枝干笔直，高高生长，",
        organ: "stem",
        highlightWords: ["stem", "straight", "tall"]
      },
      {
        en: "Carries water, one and all.",
        zh: "输送雨露，滋养八方。",
        organ: "stem",
        highlightWords: ["carries", "one and all"]
      }
    ]
  },
  {
    stanzaIndex: 2,
    organ: "leaves",
    title: "阳光绿叶 Leaves",
    lines: [
      {
        en: "Green leaves catch the sunny light,",
        zh: "翠绿叶片，拥抱阳光，",
        organ: "leaves",
        highlightWords: ["leaves", "catch", "sunny", "light"]
      },
      {
        en: "Make the food day after night.",
        zh: "日夜劳作，积蓄能量。",
        organ: "leaves",
        highlightWords: ["make food", "day after night"]
      }
    ]
  },
  {
    stanzaIndex: 3,
    organ: "flowers",
    title: "美丽花朵 Flowers",
    lines: [
      {
        en: "Pretty flowers open wide,",
        zh: "美丽花朵，肆意绽放，",
        organ: "flowers",
        highlightWords: ["pretty", "flowers", "open wide"]
      },
      {
        en: "Seeds are hidden deep inside.",
        zh: "小小种子，深藏心房。",
        organ: "seeds",
        highlightWords: ["seeds", "hidden", "deep inside"]
      }
    ]
  }
];

export const ORGAN_INFO = {
  roots: {
    icon: "🪱",
    name: "Roots [ruːts] · 根系",
    phonetic: "/ruːts/",
    word: "roots",
    poemStanza: 0,
    desc: "根系深深扎入泥土（beneath the ground），是植物稳稳抓牢大地的“锚”（Anchor），同时尖端数十亿根微小的根毛（Root Hairs）如同微型吸管，把土壤中的水分和矿物质大口喝进体内！",
    secret: "🔍 <strong>科学严谨提示</strong>：根毛极其细小，必须在显微镜下才能看清。它们极大地增大了吸水表面积！"
  },
  stem: {
    icon: "🎋",
    name: "Stem [stem] · 茎干",
    phonetic: "/stem/",
    word: "stem",
    poemStanza: 1,
    desc: "茎笔直挺拔（stands straight），像植物坚固的脊梁骨，把绿叶托举到高空去沐浴阳光。茎内部还纵横交错着被称为导管（Xylem）的微型水管，把水分和矿物质自下而上源源不断输送给植物的每一个部分！",
    secret: "🔍 <strong>英语成语解读</strong>：“one and all”在英语里表示“everyone/everything without exception（无一例外，所有个体）”，在这里生动描写茎无私地滋润植物全株！"
  },
  leaves: {
    icon: "🍃",
    name: "Leaves [liːvz] · 叶片",
    phonetic: "/liːvz/",
    word: "leaves",
    poemStanza: 2,
    desc: "叶片是植物的神奇“太阳能美食工厂”。叶肉细胞中的叶绿体（Chloroplast）含有叶绿素（Chlorophyll），利用阳光能量，将水和从空气中吸收的二氧化碳（Carbon dioxide）转化为植物所需的糖分食物，并向大气释放出氧气（Oxygen）！",
    secret: "🔍 <strong>科学严谨提示</strong>：叶绿体 (Chloroplast) 是做饭的“小厨房”，而叶绿素 (Chlorophyll) 是里面负责吸收光线的“绿色色素分子”，两者不可混淆！"
  },
  flowers: {
    icon: "🌸",
    name: "Flowers [ˈflaʊərz] · 花朵",
    phonetic: "/ˈflaʊərz/",
    word: "flowers",
    poemStanza: 3,
    desc: "花朵盛大绽放（open wide），以艳丽的花瓣和芳香的花蜜邀请昆虫（如蜜蜂、蝴蝶）前来做客，完成极其关键的传粉（Pollination）过程，为孕育下一代新生命打下基础！",
    secret: "🔍 <strong>科学繁衍全流程</strong>：成熟种子并不是一开始就直接裸露在花心，而是：花朵盛开 ➔ 昆虫传粉 ➔ 受精完成 ➔ 子房与花托发育成果实 ➔ 种子在果实内部安全成熟！"
  },
  seeds: {
    icon: "🌰",
    name: "Seeds [siːdz] · 种子",
    phonetic: "/siːdz/",
    word: "seeds",
    poemStanza: 3,
    desc: "种子深藏在果实和花托的心房内部（hidden deep inside）。每一粒种子都是一个装满了营养的“生命胶囊”，内含微小而沉睡的胚芽。当遇到合适的水分、氧气和温度（WOW口诀），就会破土萌芽（Germination）！",
    secret: "🔍 <strong>萌发三要素 WOW 口诀</strong>：Water (水分) + Oxygen (氧气) + Warmth (温暖)！种子发芽阶段通常不需要光照，只需要这三大要素。"
  }
};

export const SCIENCE_VS_POETRY = [
  {
    id: "day-night",
    poemLine: "Make the food day after night.",
    verdict: "💡 诗歌意象 vs 科学严谨事实",
    explanation: "诗句中的“day after night”是一种拟人化文学修辞，形容植物日复一日辛勤工作积蓄能量。<br><strong>科学事实</strong>：<strong>光合作用必须依赖光照 (Light)！</strong> 因此植物<strong>只能在白天（或人工光照下）</strong>制造糖分食物。在夜晚没有光照时，光合作用停止，植物依靠细胞呼吸作用（Cellular Respiration）消耗白天储存的糖分来维持生命活动，绝对不会在黑夜依靠阳光做饭！"
  },
  {
    id: "photosynthesis-formula",
    poemLine: "Green leaves catch the sunny light, Make the food...",
    verdict: "🔬 光合作用科学原料与产物",
    explanation: "科学公式：<strong>水 (Water) + 二氧化碳 (Carbon dioxide) + 阳光 (Light) ➔ 糖分食物 (Glucose) + 氧气 (Oxygen)</strong>。<br>注意：植物吸收的不是笼统的“空气”，而是其中的<strong>二氧化碳</strong>；释放的也是维持动物呼吸的<strong>氧气</strong>（科学上严谨表述为 Oxygen，避免使用“纯净氧气”等非专业口语）。"
  },
  {
    id: "chloroplast-vs-chlorophyll",
    poemLine: "Green leaves...",
    verdict: "🧪 叶绿体 vs 叶绿素概念辨析",
    explanation: "• <strong>叶绿体 (Chloroplast)</strong>：植物细胞内的微型“细胞器”，相当于整座进行光合作用的美食厨房工厂。<br>• <strong>叶绿素 (Chlorophyll)</strong>：存在于叶绿体内部的“吸光绿色色素”，如同太阳能电池板中的感光材料。两者是<strong>工厂容器与内部零件分子</strong>的关系，不可混为一谈。"
  },
  {
    id: "flower-to-seed",
    poemLine: "Pretty flowers open wide, Seeds are hidden deep inside.",
    verdict: "🌱 从花朵到种子的真实发育过程",
    explanation: "科学模型：<strong>花朵 (Flower) ➔ 传粉 (Pollination) ➔ 子房膨大发育成果实 (Fruit) ➔ 种子 (Seeds) 深藏在果实内部</strong>。<br>种子深藏并不是固定在盛开的花心，而是花瓣凋谢后，果实与种皮为种子宝宝提供了天然坚固的避风港与营养保护！"
  },
  {
    id: "one-and-all-meaning",
    poemLine: "Carries water, one and all.",
    verdict: "📖 英语成语 'one and all' 准确含义",
    explanation: "在英语中，<strong>'one and all'</strong> 是一个经典习语，字面意思是 <strong>'everyone or everything without exception'（无一例外，所有个体）</strong>。<br>在这里诗人表达的是：茎里的导管把水分公正地输送给根茎叶花每一个部分，绝不遗漏任何一个器官！不要误理解为固定词组“每一个角落”。"
  }
];

// ==========================================================================
// 词汇体系：20 个诗歌核心词 (Core Poem Words)
// ==========================================================================
export const CORE_POEM_WORDS = [
  {
    word: "roots",
    ipa: "/ruːts/",
    chunks: ["roots"],
    zh: "根系 (吸水与固定)",
    poemContext: "本诗第一句主角，扎入泥土吸收水分并锚定植物。",
    transformation: "root (单数) ➔ roots (复数加 s)",
    example: "The tree has deep roots that drink up rain.",
    phonicsRule: "oo 发长音 /uː/，结尾 ts 发清辅音组合 /ts/。"
  },
  {
    word: "beneath",
    ipa: "/bɪˈniːθ/",
    chunks: ["be", "neath"],
    zh: "在...下方 / 深处",
    poemContext: "描述根系深深伸展在土壤深处，比 under 更有诗意。",
    transformation: "介词，同义词 under / below",
    example: "The treasure was buried beneath the ground.",
    phonicsRule: "双音节 be-neath，ea 发长元音 /iː/，结尾 th 发咬舌音 /θ/。"
  },
  {
    word: "ground",
    ipa: "/ɡraʊnd/",
    chunks: ["ground"],
    zh: "泥土 / 地面",
    poemContext: "指孕育植物根系的土地与土壤环境。",
    transformation: "名词，常搭配 under the ground",
    example: "Seeds wait in the warm ground for spring.",
    phonicsRule: "ou 组合发双元音 /aʊ/，nd 结尾清晰收音。"
  },
  {
    word: "drink up",
    ipa: "/drɪŋk ʌp/",
    chunks: ["drink", "up"],
    zh: "大口喝完 / 咕咚咕咚喝干",
    poemContext: "拟人化生动描写根毛像吸管一样吸饱土壤水分。",
    transformation: "drink ➔ drank (过去式) ➔ drunk (过去分词)",
    example: "Thirsty flowers drink up the cool morning dew.",
    phonicsRule: "drink 中 dr 发 /dr/，ink 发 /ɪŋk/，与 up 自然连读。"
  },
  {
    word: "safe and sound",
    ipa: "/seɪf ænd saʊnd/",
    chunks: ["safe", "and", "sound"],
    zh: "安然无恙 / 健健康康",
    poemContext: "诗歌经典押韵成语，形容植物扎根稳固、水分充足茁壮无恙。",
    transformation: "成语固定搭配，不能随意颠倒",
    example: "After the big storm, the seedling was safe and sound.",
    phonicsRule: "safe 元音字母 a 发开音节 /eɪ/，sound 中 ou 发 /aʊ/。"
  },
  {
    word: "stem",
    ipa: "/stem/",
    chunks: ["stem"],
    zh: "茎干 / 枝干",
    poemContext: "植物主干，起到支撑和导管输送水分的核心作用。",
    transformation: "stem (单数) ➔ stems (复数)",
    example: "A sunflower has a strong green stem.",
    phonicsRule: "单音节词，短元音 e 发 /e/，收尾 m 闭唇发鼻音。"
  },
  {
    word: "straight",
    ipa: "/streɪt/",
    chunks: ["straight"],
    zh: "笔直的 / 挺拔的",
    poemContext: "描写茎昂首挺胸直立向上的健康姿态。",
    transformation: "形容词/副词；反义词 crooked (弯曲的)",
    example: "Stand straight like a tall pine tree!",
    phonicsRule: "辅音连缀 str-，中间 aigh 发 /eɪ/，gh 不发音！"
  },
  {
    word: "tall",
    ipa: "/tɔːl/",
    chunks: ["tall"],
    zh: "高大的 / 耸立的",
    poemContext: "形容枝干长得高高，把叶子送到高处拥抱阳光。",
    transformation: "tall ➔ taller (比较级) ➔ tallest (最高级)",
    example: "The oak tree grew very tall over many years.",
    phonicsRule: "all 组合发长音 /ɔːl/，如 ball, fall, wall。"
  },
  {
    word: "carries",
    ipa: "/ˈkæriz/",
    chunks: ["car", "ries"],
    zh: "运送 / 挑运",
    poemContext: "描写茎内部的导管把水分源源不断运送给各个器官。",
    transformation: "★ 核心变形：carry ➔ carries (辅音加 y 结尾，变 y 为 i 再加 es)",
    example: "The xylem carries water up to the highest branch.",
    phonicsRule: "双音节 car-ries，重音在第一音节，ies 发 /iz/。"
  },
  {
    word: "leaves",
    ipa: "/liːvz/",
    chunks: ["leaves"],
    zh: "叶片 (复数)",
    poemContext: "展开双臂捕捉阳光进行光合作用的绿叶群。",
    transformation: "★ 核心变形：leaf (单数) ➔ leaves (以 f 结尾，变 f 为 ves)",
    example: "Green leaves use sunlight to make food.",
    phonicsRule: "ea 发长元音 /iː/，ves 发浊辅音 /vz/。"
  },
  {
    word: "catch",
    ipa: "/kætʃ/",
    chunks: ["catch"],
    zh: "捕捉 / 截获",
    poemContext: "拟人化写绿叶像小手一样捕捉照射过来的阳光能量。",
    transformation: "catch ➔ caught (过去式) ➔ catching (现在分词)",
    example: "Solar panels catch sunlight just like plant leaves do.",
    phonicsRule: "tch 组合发清辅音 /tʃ/，如 match, watch, catch。"
  },
  {
    word: "sunny",
    ipa: "/ˈsʌni/",
    chunks: ["sun", "ny"],
    zh: "阳光充足的 / 明媚的",
    poemContext: "形容明媚金黄的太阳光照。",
    transformation: "★ 核心变形：sun (名词) ➔ sunny (双写辅音字母 n 加 y 变形容词)",
    example: "Plants grow best on a sunny summer day.",
    phonicsRule: "短元音 u 发 /ʌ/，重读闭音节双写 n 加 y。"
  },
  {
    word: "light",
    ipa: "/laɪt/",
    chunks: ["light"],
    zh: "光 / 光芒",
    poemContext: "光合作用必不可少的能量驱动源泉。",
    transformation: "名词/形容词；反义词 dark",
    example: "Without light, green plants cannot make food.",
    phonicsRule: "igh 组合发双元音 /aɪ/，gh 不发音，如 night, bright。"
  },
  {
    word: "make food",
    ipa: "/meɪk fuːd/",
    chunks: ["make", "food"],
    zh: "制造养分 / 做食物",
    poemContext: "光合作用的生动通俗表达：将水与二氧化碳转化为葡萄糖。",
    transformation: "动宾短语；make ➔ made (过去式)",
    example: "Leaves make food during the day when the sun shines.",
    phonicsRule: "make 中 a_e 开音节发 /eɪ/，food 中 oo 发长音 /uː/。"
  },
  {
    word: "pretty",
    ipa: "/ˈprɪti/",
    chunks: ["pret", "ty"],
    zh: "美丽的 / 娇艳的",
    poemContext: "形容花朵艳丽动人，吸引昆虫前来传粉。",
    transformation: "pretty ➔ prettier ➔ prettiest",
    example: "The pretty red petals attract busy bees.",
    phonicsRule: "双音节 pret-ty，字母 e 在此特殊发短音 /ɪ/。"
  },
  {
    word: "flowers",
    ipa: "/ˈflaʊərz/",
    chunks: ["flow", "ers"],
    zh: "花朵 (复数)",
    poemContext: "被子植物的繁殖器官，负责产生花粉与受精。",
    transformation: "flower (单数) ➔ flowers (复数加 s)",
    example: "Flowers bloom in the warm sunshine.",
    phonicsRule: "flow 中 ow 发双元音 /aʊ/，ers 发弱读 /ərz/。"
  },
  {
    word: "open wide",
    ipa: "/ˈoʊpən waɪd/",
    chunks: ["o", "pen", "wide"],
    zh: "盛大绽放 / 敞开心房",
    poemContext: "描写花朵花瓣完全张开迎接阳光和小昆虫。",
    transformation: "动副短语；wide 是副词，意为充分地/张大地",
    example: "The morning glories open wide at sunrise.",
    phonicsRule: "open 双音节 o-pen，wide 开音节 i_e 发 /waɪd/。"
  },
  {
    word: "seeds",
    ipa: "/siːdz/",
    chunks: ["seeds"],
    zh: "种子 (复数)",
    poemContext: "深藏在果实与花托内部的生命胶囊，蕴含新生命。",
    transformation: "seed (单数) ➔ seeds (复数加 s)",
    example: "Tiny apple seeds can grow into gigantic trees.",
    phonicsRule: "ee 组合发长元音 /iː/，结尾 ds 发浊音 /dz/。"
  },
  {
    word: "hidden",
    ipa: "/ˈhɪdn/",
    chunks: ["hid", "den"],
    zh: "隐蔽的 / 深藏的",
    poemContext: "描写种子深藏受到周全保护，等待时机发芽。",
    transformation: "★ 核心变形：hide (动词原形) ➔ hid (过去式) ➔ hidden (过去分词/形容词)",
    example: "The seeds are hidden safely inside the pumpkin.",
    phonicsRule: "双音节 hid-den，双写 d，第二个音节弱化成成节辅音 /dn/。"
  },
  {
    word: "deep inside",
    ipa: "/diːp ɪnˈsaɪd/",
    chunks: ["deep", "in", "side"],
    zh: "在最深处 / 深藏心底",
    poemContext: "诗歌末句，烘托出种子受母体保护的宁静与神秘。",
    transformation: "介词短语；反义词 on the outside",
    example: "Deep inside the peach is a hard protective pit.",
    phonicsRule: "deep 中 ee 发长音 /iː/，inside 中 in 发 /ɪn/，side 发 /saɪd/。"
  }
];

// ==========================================================================
// 词汇体系：9 个科学探秘高阶词 (Science Explorer Words)
// ==========================================================================
export const SCIENCE_EXPLORER_WORDS = [
  {
    word: "root hairs",
    ipa: "/ruːt heərz/",
    chunks: ["root", "hairs"],
    zh: "根毛 (微观吸水小吸管)",
    poemContext: "诗中“Drink up water”背后的微观结构器官。",
    transformation: "root hair (单数) ➔ root hairs (复数)",
    example: "Root hairs increase surface area to absorb more water.",
    phonicsRule: "air 组合发 /eə/，与 root 构成复合科学名词。"
  },
  {
    word: "xylem",
    ipa: "/ˈzaɪləm/",
    chunks: ["xy", "lem"],
    zh: "导管 (木质部超微水梯)",
    poemContext: "诗中“Carries water, one and all”由茎内导管承担。",
    transformation: "科学专业名词（不可数），植物体内运输水分的管道系统",
    example: "Water travels upward through the xylem tubes.",
    phonicsRule: "字母 x 开头特殊发 /z/，y 发双元音 /aɪ/，即 /zaɪ-ləm/。"
  },
  {
    word: "chloroplast",
    ipa: "/ˈklɔːrəplæst/",
    chunks: ["chlo", "ro", "plast"],
    zh: "叶绿体 (绿色厨房细胞器)",
    poemContext: "光合作用发生的细胞器工厂，切勿与叶绿素混淆！",
    transformation: "名词；来自希腊语 chloros (绿) + plastos (形成体)",
    example: "Plant cells contain chloroplasts where photosynthesis occurs.",
    phonicsRule: "ch 发清辅音 /k/，分为三个音节 chlo-ro-plast。"
  },
  {
    word: "chlorophyll",
    ipa: "/ˈklɔːrəfɪl/",
    chunks: ["chlo", "ro", "phyll"],
    zh: "叶绿素 (吸收阳光的绿色色素)",
    poemContext: "叶绿体内部吸收太阳光能量的特殊色素分子。",
    transformation: "不可数名词；植物呈现翠绿色的根本原因",
    example: "Chlorophyll absorbs red and blue light from the sun.",
    phonicsRule: "结尾 phyll 发 /fɪl/，整词发 /klɔːrəfɪl/。"
  },
  {
    word: "photosynthesis",
    ipa: "/ˌfoʊtoʊˈsɪnθəsɪs/",
    chunks: ["pho", "to", "syn", "the", "sis"],
    zh: "光合作用 (植物光能做饭)",
    poemContext: "诗中“Green leaves... make the food”的终极科学机理。",
    transformation: "★ 构词法：photo (光) + synthesis (合成制造)",
    example: "During photosynthesis, plants turn water and carbon dioxide into food.",
    phonicsRule: "5 个音节：pho-to-syn-the-sis，第 3 音节重读。"
  },
  {
    word: "carbon dioxide",
    ipa: "/ˈkɑːrbən daɪˈɑːksaɪd/",
    chunks: ["car", "bon", "di", "ox", "ide"],
    zh: "二氧化碳 (做食物的气体原料)",
    poemContext: "光合作用的化学原料气体，绝非笼统的普通空气！",
    transformation: "化学式 CO₂；di- 表示“二”，oxide 表示“氧化物”",
    example: "Leaves take in carbon dioxide through tiny pores called stomata.",
    phonicsRule: "dioxide 发音为 di-ox-ide /daɪˈɑːksaɪd/。"
  },
  {
    word: "oxygen",
    ipa: "/ˈɑːksɪdʒən/",
    chunks: ["ox", "y", "gen"],
    zh: "氧气 (光合作用释放的气体)",
    poemContext: "光合作用的副产物，供地球上人类与动物呼吸生存。",
    transformation: "化学式 O₂；严谨表达为 oxygen，非口语化的 fresh oxygen",
    example: "Forests produce oxygen which all animals breathe.",
    phonicsRule: "三音节 ox-y-gen，开头 ox 发 /ɑːks/，重音在前。"
  },
  {
    word: "pollination",
    ipa: "/ˌpɑːləˈneɪʃən/",
    chunks: ["pol", "li", "na", "tion"],
    zh: "传粉 (花粉传递的生命仪式)",
    poemContext: "花朵绽放吸引小蜜蜂蝴蝶的核心目的。",
    transformation: "pollinate (动词) ➔ pollination (名词，加 -ion)",
    example: "Bees help in pollination while collecting sweet nectar.",
    phonicsRule: "4 个音节，结尾 tion 发 /ʃən/，重音在 na 上。"
  },
  {
    word: "germination",
    ipa: "/ˌdʒɜːrmɪˈneɪʃən/",
    chunks: ["ger", "mi", "na", "tion"],
    zh: "萌发 / 发芽 (破壳新生)",
    poemContext: "种子在适宜温度、水分与氧气下苏醒的过程。",
    transformation: "germinate (动词) ➔ germination (名词)",
    example: "Water and warmth trigger the germination of the bean seed.",
    phonicsRule: "g 在 e 前发浊辅音 /dʒ/，ger-mi-na-tion。"
  }
];

// ==========================================================================
// 科学问答题目：4 道严谨而有趣的科学小测验
// ==========================================================================
export const QUIZ_DATA = [
  {
    id: 1,
    question: "1. 植物的哪一部分像数亿根微型吸管一样，深深扎入土壤吸收水分与矿物质？",
    options: [
      { text: "🪱 根系与根毛 (Roots & Root Hairs)", correct: true },
      { text: "🍃 绿叶 (Green Leaves)", correct: false },
      { text: "🌸 花瓣 (Pretty Flower Petals)", correct: false }
    ],
    explain: "完全正确！根系（Roots）深扎泥土锚定植株，根毛（Root Hairs）大大增加吸水面积！"
  },
  {
    id: 2,
    question: "2. 诗句说“Stem stands straight... Carries water, one and all”，这里的“one and all”是指什么？",
    options: [
      { text: "无一例外地输送给全株所有器官 (Everyone/everything without exception)", correct: true },
      { text: "仅仅把水分送给最高处的一朵花", correct: false },
      { text: "水只在茎里面打转不送出去", correct: false }
    ],
    explain: "非常棒！'one and all' 是英语成语，意为‘无一例外’，导管（Xylem）把水分公正输送给植物所有部位！"
  },
  {
    id: 3,
    question: "3. 关于诗句“Make the food day after night”，以下哪个科学解释最严谨准确？",
    options: [
      { text: "光合作用必须依赖光照，只能白天制造食物；夜晚依靠呼吸消耗储备 (Light is required)", correct: true },
      { text: "植物在漆黑的深夜也照常利用阳光做饭", correct: false },
      { text: "植物不需要阳光，只靠泥土就能永远做饭", correct: false }
    ],
    explain: "太专业了！光合作用（Photosynthesis）必须有光！诗句是表达日复一日的勤劳，夜晚植物靠呼吸作用生存。"
  },
  {
    id: 4,
    question: "4. 从花朵到种子，大自然的真实科学繁衍顺序是什么？",
    options: [
      { text: "花朵盛开 ➔ 昆虫传粉 (Pollination) ➔ 子房膨大发育成果实 ➔ 种子深藏内部", correct: true },
      { text: "成熟种子从天上掉下来直接插进花心", correct: false },
      { text: "叶片直接变成种子，不需要花朵和传粉", correct: false }
    ],
    explain: "恭喜全对！花朵盛开是为了邀请昆虫传粉，受精后子房发育成果实，种子被安全保护在深处！"
  }
];

// ==========================================================================
// 拼写游戏词库与记忆花园配对数据
// ==========================================================================
export const SPROUT_GAME_WORDS = [
  { word: "roots", zh: "根系 (吸收水分与定海神针)", hint: "长元音 /uː/ · 单音节词" },
  { word: "stem", zh: "茎干 (笔直挺拔与导管电梯)", hint: "短元音 /e/ · stands straight" },
  { word: "leaves", zh: "绿叶 (光合作用美食厨房)", hint: "leaf 的复数变形 · 变 f 为 ves" },
  { word: "flowers", zh: "美丽花朵 (吸引昆虫传粉)", hint: "flow-ers 双音节 · 盛开迎客" },
  { word: "seeds", zh: "种子 (深藏的生命时间胶囊)", hint: "长音 /iː/ · WOW三要素发芽" }
];

export const MEMORY_MATCH_CARDS = [
  { id: 1, text: "Roots 🪱", matchId: 1, type: "term" },
  { id: 2, text: "定海神针与根毛吸水", matchId: 1, type: "desc" },
  { id: 3, text: "Stem 🎋", matchId: 2, type: "term" },
  { id: 4, text: "笔直挺立与导管输导", matchId: 2, type: "desc" },
  { id: 5, text: "Leaves 🍃", matchId: 3, type: "term" },
  { id: 6, text: "叶绿体光合做食物", matchId: 3, type: "desc" },
  { id: 7, text: "Flowers 🌸", matchId: 4, type: "term" },
  { id: 8, text: "盛大绽放与传粉派对", matchId: 4, type: "desc" },
  { id: 9, text: "Seeds 🌰", matchId: 5, type: "term" },
  { id: 10, text: "深藏内部的生命胶囊", matchId: 5, type: "desc" },
  { id: 11, text: "Sunlight ☀️", matchId: 6, type: "term" },
  { id: 12, text: "光合作用的能量驱动", matchId: 6, type: "desc" }
];
