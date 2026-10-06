// ==========================================================================
// SciencePre: Plant Science Knowledge Base (小学生双语植物科学知识库)
// 源自 Cambridge IGCSE Biology 核心知识点，以小学生生动形象的口吻重塑
// 包含：3D植物细胞、叶片横截面与光合实验室、水流电梯与双向快递、花朵立体解剖与授粉奇遇
// ==========================================================================

export const SCIENCE_STATIONS = [
  {
    id: "station-cell-3d",
    badge: "3D 微观探索",
    icon: "🔬",
    title: "植物细胞 3D 奇幻积木",
    subtitle: "Plant Cell 3D Explorer",
    desc: "在显微镜下，植物是由一块块坚固的神奇积木搭建而成的！旋转 3D 细胞，探秘没有骨头的植物为何能顶天立地！"
  },
  {
    id: "station-leaf-photo",
    badge: "微观横剖面 + 互动实验室",
    icon: "🍃",
    title: "叶片微观厨房与光合作用",
    subtitle: "Leaf Cross-Section & Photosynthesis Lab",
    desc: "切开一片叶子，看看里面的阳光豪宅与气孔门卫！动手调节阳光与二氧化碳，体验亲手为植物烘焙能量饼干！"
  },
  {
    id: "station-transport",
    badge: "动感管道模拟",
    icon: "🚀",
    title: "水流直达梯与甜蜜双向快递",
    subtitle: "Xylem & Phloem Transport Highways",
    desc: "水怎样冲向 50 米高的树顶？叶片做的糖送到哪里去？切换查看木质部与韧皮部体内的超级高速公路！"
  },
  {
    id: "station-flower",
    badge: "立体解剖 + 绘本漫游",
    icon: "🌸",
    title: "花朵大解剖与小蜜蜂授粉奇遇",
    subtitle: "Flower Anatomy & The Seed Mission",
    desc: "一朵花不仅仅是美丽的装饰，它是孕育种子的摇篮！一步步揭开花粉旅行与果实诞生的神奇旅程！"
  }
];

// 1. 植物细胞 3D 模型结构数据
export const PLANT_CELL_PARTS = [
  {
    id: "cell-wall",
    nameEn: "Cell Wall",
    ipa: "/sel wɔːl/",
    nameZh: "细胞壁",
    metaphor: "🏰 绿色防弹坚固城堡",
    color: "#22c55e",
    summary: "由坚韧的纤维素 (Cellulose) 织成的坚固大外壳。人类靠骨头站立，植物没有骨骼，全靠千千万万个细胞壁紧紧靠在一起，撑起参天大树！",
    kidFact: "💡 动物细胞完全没有细胞壁哦！这就是为什么我们的皮肤软软的，而树皮硬邦邦的！",
    funQuestion: "如果植物没有细胞壁会怎样？",
    funAnswer: "就会像一滩软软的水泥一样趴在地上，根本长不高！"
  },
  {
    id: "chloroplast",
    nameEn: "Chloroplast",
    ipa: "/ˈklɔːr.ə.plæst/",
    nameZh: "叶绿体",
    metaphor: "☀️ 太阳能美食微型厨房",
    color: "#16a34a",
    summary: "充满叶绿素 (Chlorophyll) 绿色色素的微型工厂。它就像叶片里的超级太阳能电池板，捕捉太阳光芒，把二氧化碳和水做成甜甜的葡萄糖食物！",
    kidFact: "💡 树叶之所以是绿色的，就是因为数以亿计的叶绿体在阳光下闪闪发亮！",
    funQuestion: "地下深处的根部细胞有叶绿体吗？",
    funAnswer: "没有哦！因为泥土里照不到阳光，所以根不需要也不浪费能量制造叶绿体，它是白色的！"
  },
  {
    id: "vacuole",
    nameEn: "Large Vacuole",
    ipa: "/ˈvæk.ju.oʊl/",
    nameZh: "中央大液泡",
    metaphor: "💧 充气水囊大水库",
    color: "#38bdf8",
    summary: "细胞中央巨大的液体储藏室，里面装满了植物细胞液（水、糖分与矿物质）。喝饱水时它像打满气的气球一样撑紧细胞（Turgid），植物就神气活现地站立；缺水时就会瘪掉（Flaccid），整株植物就会蔫头耷脑！",
    kidFact: "💡 妈妈洗青菜放水里会变脆挺，就是因为大液泡大口大口吸饱了水！",
    funQuestion: "浇水能让蔫掉的花重新立起来吗？",
    funAnswer: "能！水流经导管进入大液泡，把细胞重新撑圆，花枝就重新直立了！"
  },
  {
    id: "nucleus",
    nameEn: "Nucleus",
    ipa: "/ˈnjuː.kli.əs/",
    nameZh: "细胞核",
    metaphor: "🧠 总司令指挥大脑",
    color: "#a855f7",
    summary: "细胞正中央最核心的控制中心。里面保存着植物所有的生长基因图纸 (DNA)——指挥植物什么时候该开花、叶子长多大、叶脉往哪伸！",
    kidFact: "💡 每一个细胞核里都写着一整棵大树的全部制造说明书！",
    funQuestion: "细胞核负责做什么？",
    funAnswer: "它是指挥官！发布生长、分裂和修补伤口的最高指令！"
  },
  {
    id: "membrane",
    nameEn: "Cell Membrane",
    ipa: "/sel ˈmem.breɪn/",
    nameZh: "细胞膜",
    metaphor: "🛡️ 智能安检门卫",
    color: "#34d399",
    summary: "紧贴在细胞壁内侧的一层柔韧薄膜。它就像智能安检门，仔细检查每一个想要进出的分子：水和有用的养分欢迎进来，坏细菌和毒素统统拦在门外！",
    kidFact: "💡 它是半透性的 (Partially Permeable)，水分子可以自由穿过！",
    funQuestion: "细胞壁和细胞膜哪个在外面？",
    funAnswer: "细胞壁在最外面，细胞膜在里面紧紧包裹着细胞质！"
  },
  {
    id: "mitochondria",
    nameEn: "Mitochondria",
    ipa: "/ˌmaɪ.təʊˈkɒn.dri.ə/",
    nameZh: "线粒体",
    metaphor: "⚡ 细胞微型发电站",
    color: "#f97316",
    summary: "把叶绿体制造出来的糖类加上氧气进行呼吸分解，释放出植物生长、吸水所需要的充沛能量 (Energy/ATP)！白天夜晚都不停工！",
    kidFact: "💡 植物也需要呼吸！夜里没有阳光时，线粒体就在消耗白天存下的粮食发电！",
    funQuestion: "植物晚上做不做呼吸作用？",
    funAnswer: "做！植物白天和夜晚都在呼吸，无时无刻不在用线粒体发电！"
  }
];

// 2. 叶片横截面与光合作用知识
export const LEAF_LAYERS = [
  {
    id: "cuticle-epidermis",
    nameEn: "Upper Cuticle & Epidermis",
    nameZh: "上表皮与角质层",
    role: "🧥 透明防水冲锋衣",
    desc: "覆盖在叶片最表面的一层透明蜡质。下雨时水滴在荷叶上滚来滚去就是它的功劳！它不仅完全透明让阳光穿透，还能防止叶片体内的宝贵水分被烈日烤干！"
  },
  {
    id: "palisade",
    nameEn: "Palisade Mesophyll",
    nameZh: "栅栏组织",
    role: "🏢 顶层阳光海景公寓",
    desc: "紧挨在上表皮下方的圆柱形细胞，排列得像整齐的栅栏。这里是整片叶子采光最好的位置，里面密密麻麻塞满了叶绿体，是光合作用做饭的最核心主力军！"
  },
  {
    id: "spongy",
    nameEn: "Spongy Mesophyll",
    nameZh: "海绵组织",
    role: "🧽 通风游乐场",
    desc: "形状不规则、松松垮垮的细胞层，彼此之间留着大大小小的空隙（Air Spaces），就像洗碗海绵里的气泡。二氧化碳和氧气在这里像捉迷藏一样自由穿梭扩散！"
  },
  {
    id: "vein",
    nameEn: "Vein (Vascular Bundle)",
    nameZh: "叶脉管道群",
    role: "🚰 进水送糖的交通干线",
    desc: "叶片上的青筋！粗管子是木质部 (Xylem)，从根部带来满满的水分；细管子是韧皮部 (Phloem)，把做好的糖果打包运往花朵和果实！"
  },
  {
    id: "stoma-guard",
    nameEn: "Stomata & Guard Cells",
    nameZh: "气孔与保卫细胞",
    role: "🚪 成对值班的胖香蕉门卫",
    desc: "大多藏在叶片背面的小孔（Stoma）。每个小孔由一对弯弯的保卫细胞守卫：白天吸水鼓起时小门打开，让二氧化碳进屋做饭；炎热或夜间时放水贴紧，把门关死防失水！"
  }
];

// 3. 水流电梯与双向甜蜜快递知识
export const TRANSPORT_MODES = {
  xylem: {
    title: "木质部管道 (Xylem) · 向上冲的水流电梯",
    direction: "⬆️ 只能单向向上 (Upwards only)",
    cargo: "💧 水分与矿物质（氮、磷、钾离子）",
    structure: "由死去的细胞连成的空心木质长吸管，坚硬无阻碍",
    drivingForce: "蒸腾拉力 (Transpiration Pull)：叶片气孔水分蒸发到空气中，像我们在吸管顶端用力吮吸一口，把整条水柱从地下拉上云端！",
    kidMetaphor: "植物不需要水泵，叶子一蒸发，就像一双无形的大手在树梢拼命吸吸管，把几吨水硬生生拽上 50 米大树！"
  },
  phloem: {
    title: "韧皮部管道 (Phloem) · 双向送达的甜蜜快递",
    direction: "↕️ 双向皆可送达 (Up and Down)",
    cargo: "🍬 蔗糖 (Sucrose) 与氨基酸营养液",
    structure: "由活细胞串联成的细密筛管 (Sieve tubes)，配有伴胞守护",
    drivingForce: "从【源 (Source)】运到【库 (Sink)】：叶子是做糖的源头，春天嫩芽需要长就往上送，秋天根部要屯粮就往下送！",
    kidMetaphor: "植物身体里的专属外卖小哥！既能上楼送点心给萌芽和花骨朵，又能下楼送年糕给大树根储藏过冬！"
  }
};

// 4. 花朵解剖与授粉故事步进
export const FLOWER_PARTS = [
  {
    nameEn: "Petal",
    nameZh: "花瓣",
    role: "🎪 绚丽的迎宾招牌与停机坪",
    desc: "鲜艳夺目、香气扑鼻，还藏着甜甜的花蜜。主要任务就是大声呼唤蜜蜂、蝴蝶和蜂鸟来做客！"
  },
  {
    nameEn: "Stamen",
    nameZh: "雄蕊 (男主人群)",
    role: "🟡 花药 (Anther) + 花丝 (Filament)",
    desc: "顶端的花药就像金粉盒子，生产出千千万万粒微小的金黄色花粉 (Pollen)！细长的花丝把花药高高举起，方便碰上昆虫！"
  },
  {
    nameEn: "Carpel / Pistil",
    nameZh: "雌蕊 (女主人)",
    role: "🟢 柱头 (Stigma) + 花柱 (Style) + 子房 (Ovary)",
    desc: "最顶端的柱头黏糊糊的，像一只粘蝇纸手套，牢牢粘住到访的花粉！中间的花柱是通道，最底下的子房像一座安全的育婴室！"
  },
  {
    nameEn: "Ovule & Seeds",
    nameZh: "胚珠与种子",
    role: "🍼 沉睡中的小小胚珠",
    desc: "深藏在子房内部的小球球。一旦与花粉结合受精，胚珠就会变成果仁种子，子房慢慢膨大变成多汁可口的苹果或桃子！"
  }
];

export const POLLINATION_STEPS = [
  {
    step: 1,
    title: "🌸 花朵盛开迎客来",
    enTitle: "The Flower Welcomes Guests",
    text: "春天清晨，花瓣舒展，散发出甜蜜诱人的花蜜芬芳，在阳光下向天空招手：“小蜜蜂，快来喝香甜下午茶！”"
  },
  {
    step: 2,
    title: "🐝 蜜蜂快递员登场",
    enTitle: "The Bee Pollinator Arrives",
    text: "毛茸茸的小蜜蜂飞落到花朵里吸吮花蜜，不知不觉间，雄蕊花药上的金色花粉沾满了蜜蜂的毛绒大衣！"
  },
  {
    step: 3,
    title: "🎯 降落黏性柱头与花粉管",
    enTitle: "Landing & Pollen Tube Race",
    text: "当小蜜蜂飞到下一朵花时，身上的花粉被雌蕊顶端黏糊糊的柱头牢牢抓获！花粉萌发出一根极细的花粉管，一路顺着花柱向下钻入子房！"
  },
  {
    step: 4,
    title: "🍎 受精、种子与果实诞生",
    enTitle: "Fertilisation & Seed Creation",
    text: "花粉与胚珠完美结合（受精 Fertilisation）！花瓣圆满完成任务翩然飘落，子房慢慢膨大变成美味的水果，胚珠变成坚硬饱满的种子，准备开启下一代生命！"
  }
];
