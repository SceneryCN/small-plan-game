# 弹幕抉择

竖屏 **弹幕射击 + 道具抉择** 小游戏：玩家在下方移动，**自动向上射击**；左侧落下可击碎的 **强化道具**，右侧不断出现 **敌人** 与 **波次 BOSS**。在「爽感」与「走位 / 资源」之间做取舍。

## 游戏简介

- **操作**：在画面下半区滑动或拖动，控制机体水平移动（平滑跟随）。
- **战斗**：主炮自动开火；可叠加 **射速、三连、穿透、激光、核弹、护盾、浮游炮、跟踪弹** 等限时强化，另有 **小回血（10% 最大生命）** 与 **反应装甲**（常驻浮游炮、与敌贴身一次即碎、机体换甲外观）等；每种道具有独立像素图标。
- **激光**：**纯垂直** 光束判定，按波次爆发高伤；有三连时会变为 **多条平行竖线**，并非扇形散射。
- **难度**：随波次与时间的 **连续难度** 上升；**每 3 波** 出现 BOSS（tier 3）、**每 2 波** 出现精英双怪（与 BOSS 同波时优先 BOSS，例如第 6 波只出 BOSS）；道具掉落刻意偏少，避免无脑碾压。
- **画面 / 音频**：像素风精灵（Canvas 纹理）、粒子与镜头轻微震动；程序化 BGM / 音效。

技术栈：**React 19** + **TypeScript** + **Vite 8**，渲染与游戏循环使用 **Pixi.js 8**。

## 项目构成

```
src/
├── main.tsx                 # 入口
├── App.tsx                  # 根布局（画布 + 叠层 UI）
├── config/
│   └── gameConfig.ts        # 数值与道具 / 敌人表、波次间隔等常量
├── store/
│   └── gameStore.ts         # Zustand：界面状态、HUD 数据
├── input/
│   └── InputManager.ts      # 画布指针 → 逻辑坐标
├── entities/
│   └── Entity.ts            # 玩家、子弹、敌、道具、追踪弹等数据结构
├── game/                    # 与渲染解耦：强化快照、瞬时拾取（回血 / 装甲等）
├── engine/                  # 与 Pixi 强相关的「引擎层」
│   ├── GameEngine.ts        # 主循环：输入 → 生成 → 移动 → 战斗 → 粒子 → 摄像机
│   ├── EntityManager.ts     # 实体池、生成、精灵挂载、同步
│   ├── Camera.ts            # 舞台容器 + 屏幕震动
│   ├── CollisionSystem.ts   # 子弹与敌 / 道具碰撞
│   └── ParticleSystem.ts    # 简单粒子
├── systems/                 # 纯逻辑系统（便于单测与调参）
│   ├── CombatSystem.ts      # 射击、激光波次、追踪弹、伤害与拾取效果
│   ├── MovementSystem.ts    # 玩家插值、敌弹道具运动
│   ├── SpawnSystem.ts       # 敌 / 道具生成节奏、波次 BOSS 事件
│   ├── DifficultySystem.ts  # 连续难度 + 离散「波数」计时
│   └── EffectSystem.ts      # 强化持续时间递减
├── sprites/                 # 像素格子 → Texture（SpriteFactory 统一生成图集）
├── audio/                   # Web Audio：BGMManager、各 Track、SFX
├── ui/                      # React：加载 / 开始 / 结束 / HUD / GameCanvas
└── utils/                   # math、pixelCanvas、对象池等
```

根目录其它说明：

- **`public/`**：静态资源（含 `.nojekyll`，便于 GitHub Pages）。
- **`scripts/deploy-github.mjs`**：`npm run deploy` 时按仓库名设置 Vite `base` 并推送到 `gh-pages` 分支。

## 本地开发

```bash
npm install
npm run dev
```

## 构建与部署（GitHub Pages）

```bash
npm run build
npm run deploy          # 构建后推送到 gh-pages，详见脚本内注释
```

仓库 **Settings → Pages** 中选择分支 **`gh-pages`**、目录 **`/(root)`** 即可托管。

若仓库名与 `package.json` 的 `name` 不一致，可显式指定公共路径，例如：

```bash
GH_PAGES_BASE=/你的仓库名/ npm run deploy
```
