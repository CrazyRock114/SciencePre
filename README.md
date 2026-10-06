# SciencePre 🌱 小学生自然英语与科学双语探索营

> **“让科学变得像童话一样迷人，让英语单词变得像积木一样简单！”**
> 
> **SciencePre** 是平行于 [Sky's Science Word Lab (IGCSE 体系)](https://sky.igcse.xyz) 的**小学生专属科学英语专题探索系统**。
> 本平台专为小学 Pre-IGCSE 阶段设计，采用“**一个主题 + 一首英文诗 + 科学探秘 + 单词工坊 + 互动游戏 + 荣誉认证**”的多维学习架构。
>
> 🌐 **官方独立访问域名**：[https://pre.igcse.xyz](https://pre.igcse.xyz)  
> 📦 **GitHub 独立开源仓库**：[https://github.com/CrazyRock114/SciencePre](https://github.com/CrazyRock114/SciencePre)

---

## 🗺️ SciencePre 系列专题规划 (Curriculum Roadmap)

| 主题专题 | 专题名称 | 访问路径 | 状态 | 核心亮点 |
|---|---|---|---|---|
| **Theme 01** | **Plants (神奇植物与经典英文诗)** | `/plants/` | ✅ **已上线 (主讲)** | 根/茎/叶/花/种子 5大器官，双速朗读与光合作用探索 |
| **Theme 02** | **Animals & Insects (昆虫与小动物)** | `/animals/` | ⏳ 即将上线 | 变态发育、昆虫解剖与生态食物链 (Coming Soon) |
| **Theme 03** | **Water Cycle & Weather (水循环与天气)** | `/weather/` | 📅 规划中 | 蒸发/凝结/降水、云雨雷电与大自然循环 (Coming Soon) |
| **Theme 04** | **The Solar System & Stars (太阳系与星空)** | `/solar/` | 📅 规划中 | 八大行星、地球公转自转与昼夜交替 (Coming Soon) |

---

## 🏛️ 项目工程架构 (v0.2 Foundation Hardening)

本项目采用**零打包工具、纯静态现代 Vanilla ES Modules 架构**，彻底打破单文件债务，形成清晰的 `CONTENT` / `ENGINE` / `PRESENTATION` 边界：

```
SciencePre/
├── CNAME                         # 二级域名指向 pre.igcse.xyz
├── index.html                    # Theme Hub 课程主题中心 (根首页)
├── plants/
│   └── index.html                # Theme 01: Plants 专属探索专题页
├── assets/
│   ├── css/
│   │   ├── base.css              # 全局色彩变量、Reset、无障碍与排版
│   │   ├── hub.css               # Theme Hub 专属大纲与卡片样式
│   │   └── plants.css            # Plants 专题专属样式 (SVG、科学站、词卡、游戏)
│   └── js/
│       ├── core/
│       │   ├── audio.js          # Web Audio 音效 + Web Speech TTS + 全局静音控制
│       │   ├── progress.js       # localStorage 学习进度与条件解锁引擎
│       │   └── share.js          # Canvas 动态证书图片导出与剪贴板战报分享
│       ├── data/
│       │   ├── themes.js         # 全局主题元数据
│       │   └── plants-data.js    # 诗歌、20核心词+9科学词、科学辨析、测验数据
│       ├── plants/
│       │   ├── poem-theater.js   # 诗歌剧场 (卡拉OK伴读、单句点读、双向联动)
│       │   ├── plant-canvas.js   # 活体植物 SVG 交互 (键盘可访问、双向高亮)
│       │   ├── vocab-lab.js      # 单词魔法工坊 (点击音节发音、例句、变形)
│       │   ├── games.js          # 三大儿童游戏 (拼写5阶成长、翻牌花园、无Bug问答)
│       │   ├── certificate.js    # 荣誉证书控制器 (Checklist锁卡、动态姓名)
│       │   └── plants-main.js    # Plants 专题总控制器入口
│       └── hub.js                # Theme Hub 页面主控制器
├── run_tests.js                  # 基于 Chrome DevTools Protocol 的原生自动化端到端测试套件
└── README.md
```

---

## 🌿 Theme 01: Plants · 核心启蒙诗歌

```text
Plants

Roots go down beneath the ground,
根系深深扎入泥土，

Drink up water, safe and sound.
汲取清水，安然茁壮。

Stem stands straight and grows so tall,
枝干笔直，高高生长，

Carries water, one and all.
输送雨露，滋养八方。

Green leaves catch the sunny light,
翠绿叶片，拥抱阳光，

Make the food day after night.
日夜劳作，积蓄能量。

Pretty flowers open wide,
美丽花朵，肆意绽放，

Seeds are hidden deep inside.
小小种子，深藏心房。
```

---

## 🌟 核心功能亮点与科学严谨性

1. 📖 **Poem Karaoke 沉浸剧场与双向联动**：
   - 诗歌到植物：点击任一句朗诵并高亮对应植物器官；
   - 植物到诗歌：点击植物 SVG 器官或部位按钮，反向高亮诗句并滚动聚焦；
   - 支持卡拉OK自动滚屏伴读、单句点读、🐇 1.0x / 🐢 0.7x 慢速语速切换、中英双语显隐。
2. 💡 **Poetry vs Science · 诗歌里的科学秘密**：
   - 科学辨析 `Make the food day after night`：明确光合作用必须依赖光照 (Light)，夜晚依靠细胞呼吸作用维持生命；
   - 精准区分 `chloroplast` (叶绿体/厨房工厂) 与 `chlorophyll` (叶绿素/吸光分子)；
   - 原料明确使用 `carbon dioxide` (二氧化碳)，释放 `oxygen` (氧气)；
   - 还原植物真实繁殖链：`Flower ➔ Pollination ➔ Fruit ➔ Seeds`；
   - 准确诠释成语 `one and all` 为 `everyone/everything without exception`。
3. 🔤 **超级单词魔法工坊 (Word Magic Lab)**：
   - 20 个诗歌核心词 + 9 个高阶科学词；
   - 音节分块 (Sound Chunks) 支持点击独立发音；
   - 重点变形规则（`leaf ➔ leaves`, `carry ➔ carries`, `hide ➔ hidden`, `sun ➔ sunny`）与地道例句。
4. 🎮 **三大儿童互动小游戏 (Kids Arcade)**：
   - 🌱 **拼写小萌芽 (Spelling Sprout)**：输入进度驱动植物真实成长（0% 种子 ➔ 25% 破土 ➔ 50% 挺拔茎 ➔ 75% 绿叶 ➔ 100% 鲜花绽放）；
   - 🃏 **翻牌记忆花园 (Memory Match)**：图文配对，锻炼短时记忆；
   - 🧠 **植物小学者问答 (Botanist Quiz)**：双容器安全切换，彻底修复再练一次 Bug，支持无限轮次重练。
5. 🏆 **皇家自然小学者证书 (Junior Botanist Certificate)**：
   - 严格 5 项学习达成解锁门槛（探索诗歌、探索3+器官、探索3+单词、完成1局游戏、完成科学测验）；
   - 支持输入姓名实时同步；
   - 支持 HTML5 Canvas 动态生成并下载 1200x800 高清奖状图片；
   - 支持一键复制荣誉战报分享到微信/社群。

---

## 🧪 自动化测试套件

内置 `run_tests.js`，通过 Google Chrome 浏览器内核原生 CDP (Chrome DevTools Protocol) 接口执行 19 项端到端验收测试：
```bash
node run_tests.js
```
测试覆盖全页面导航、双向联动、双速发音、5阶成长、无限轮次Quiz、条件解锁门槛、状态持久化与移动端 375px 窄屏适配。
