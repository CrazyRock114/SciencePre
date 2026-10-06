# Plants: Nature's Green Magic 🌱 小学生自然英语与科学探索营

> **“让科学变得像童话一样迷人，让英语单词变得像积木一样简单！”**
> 
> 本项目是平行于 [Sky's Science Word Lab (IGCSE 体系)](https://sky.igcse.xyz) 的**小学生专属科学英语专题探索系统**。
> 采用“一首英文诗 + 一个科学专题”沉浸式教学模式，深度融合**自然拼读（Phonics）**、**音节拆分（Syllables）**、**互动解剖（Anatomy Explorer）**、**通俗科学小故事**与**儿童游戏互动**。
>
> 🌐 **预设独立二级域名**：[https://plants.igcse.xyz](https://plants.igcse.xyz)  
> 📦 **独立开源仓库**：`CrazyRock114/junior_science_plants` (可一键部署至 GitHub Pages / Cloudflare Pages / Vercel)

---

## 📜 核心启蒙诗歌 (The Theme Poem)

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

## 🌟 专为小学生设计的五大核心亮点

### 1. 🔤 超级单词魔法工坊 (Supercharged Vocabulary Support)
针对小学生“长词难记、发音不准、概念抽象”的痛点：
- **音节拆分 (Syllables Break-down)**：每个单词均标有音节切分积木（如 `be·neath`, `car·ries`, `flow·ers`, `pho·to·syn·the·sis`）；
- **双速真声点读 (Dual-Speed Speech)**：
  - 🐇 **常速 1.0x**：地道纯正发音；
  - 🐢 **慢速 0.7x**：慢动作磨耳朵，听清辅音清浊与尾音咬舌（如 `th` /θ/）；
- **地道习语与趣味表达解构**：
  - `Safe and sound`：不仅是安全，更是“平安无事、健健康康”；
  - `One and all`：每一个角落全面覆盖；
  - `Leaf` (单数) ➔ `Leaves` (复数) 的神奇变形规则。

### 2. 🔬 4 大深入浅出科学奇迹站 (4 Science Wonder Stations)
把枯燥的植物生理学转化为小学生听得懂、记得住的拟人化故事：
1. **Station 1: 地下吸水特工 —— 根 (Roots)**
   - 植物的“定海神针”（Anchor 抓地抗风）+ 数亿根微型吸管（Root Hairs 吸水）；
   - 内置“💧 给土壤浇水”互动模拟。
2. **Station 2: 绿色摩天大楼的超高速电梯 —— 茎 (Stem)**
   - 挺拔直立（Support）+ 导管微水梯（Xylem 水分子手拉手）；
   - 配套“彩虹芹菜”家庭实验指南。
3. **Station 3: 全世界最神奇的太阳能美食厨房 —— 叶 (Leaves)**
   - 叶绿素大厨 + 光合作用（Photosynthesis）配方：
     `阳光 + 水 + 二氧化碳 ➔ 植物甜点心 (糖) + 纯净氧气`；
   - 趣味光合作用魔法点亮特效。
4. **Station 4: 蜜蜂派对与生命时间胶囊 —— 花与种子 (Flowers & Seeds)**
   - 花朵穿上艳丽彩衣发传粉请柬（Pollination）；
   - 种子发芽三大法宝（WOW 口诀：Water, Oxygen, Warmth）。

### 3. 🎨 活体植物互动探险画布 (Interactive Anatomy Explorer)
- 纯原生 SVG 矢量绘制的活体植物微生态，包含天空太阳、白云、花、茎、叶、地表线与地下错综根系；
- 鼠标点击或触屏点选任何器官，镜头高亮、播放音效、同步联动诗歌行，并呼出“器官特工卡”！

### 4. 🎮 三款小学生趣味练习游戏 (Kids Arcade)
- 🌱 **拼写小萌芽 (Spelling Sprout)**：输入字母拼词，伴随动画一步步破土发芽、抽茎、展叶、开花！
- 🃏 **翻牌记忆花园 (Memory Match)**：生动图文配对，锻炼短时记忆与词义联想；
- 🧠 **植物小学者问答 (Botanist Quiz)**：4 道情境化闯关小测验，通关即可收集自然宝石。

### 5. 🏆 皇家植物学者荣誉勋章与证书 (Junior Botanist Certificate)
- 通关后可输入学生姓名（如 Sky）；
- 自动生成精美证书，支持一键庆祝撒花与打卡分享。

---

## 🚀 部署与二级域名配置 (Deployment & Domain Setup)

本专题采用**零第三方依赖、单文件纯静态架构**，极致轻量（秒开秒读，无需任何构建工具）：

### 步骤 1：新建 GitHub 仓库
在 GitHub 上创建名为 `junior_science_plants` 的新仓库，并在本地执行：
```bash
cd /Users/crazyrock/Antigravity/junior_science_plants
git init
git add .
git commit -m "Initial commit: Junior Nature Lab Plants Theme"
git branch -M main
git remote add origin https://github.com/CrazyRock114/junior_science_plants.git
git push -u origin main
```

### 步骤 2：配置二级域名 `plants.igcse.xyz`
1. 本仓库根目录下已包含 `CNAME` 文件，内容为 `plants.igcse.xyz`；
2. 在域名托管商（如 Cloudflare / DNSPod / 阿里云）添加 DNS 解析记录：
   - **记录类型**：`CNAME`
   - **主机记录**：`plants`
   - **记录值**：`crazyrock114.github.io`（或您的 GitHub Pages 分配地址 / Vercel CNAME）
3. 在 GitHub 仓库设置 `Settings ➔ Pages` 中，选择 `main` 分支 `/ (root)`，开启 `Enforce HTTPS` 即可！

---

## 🗺️ 后续小学生自然科学专题路线图

- [x] **Unit 1: Plants (植物之谜)** —— 本期发布《Plants》诗歌篇
- [ ] **Unit 2: Animals & Insects (昆虫与小动物的微观世界)**
- [ ] **Unit 3: Weather & Water Cycle (神奇天气与小水滴历险记)**
- [ ] **Unit 4: Solar System & Stars (太阳系与星空探秘)**
