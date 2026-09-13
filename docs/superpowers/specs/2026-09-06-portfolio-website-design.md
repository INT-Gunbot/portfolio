# 个人作品集网站 — 设计文档

- 日期：2026-09-06
- 状态：已确认（待实现）

## 1. 目标与范围

构建一个**个人作品集网站**，用于呈现综合型（代码 / 设计 / 写作）作品。网站为**中文**内容，采用**创意活泼**的视觉风格。首版使用**占位内容**，结构搭建完成后由用户替换为真实作品。

### 非目标（YAGNI）

- 不引入后端 / CMS / 数据库，纯静态站点
- 不实现评论、点赞、搜索等动态功能
- 不做多语言（仅中文）
- 不接入分析、RSS、订阅等扩展（后续需要再加）

## 2. 技术选型

| 维度 | 选择 | 理由 |
|------|------|------|
| 框架 | Astro（静态优先） | 内容优先、默认零 JS、SEO 好 |
| 语言 | TypeScript | 类型安全，内容 schema 校验 |
| 样式 | Tailwind CSS + 自定义 CSS 设计令牌 | 快速实现创意活泼的自定义设计 |
| 内容管理 | Astro Content Collections（Markdown） | 新增作品/文章 = 新增 `.md` 文件，易维护 |
| 交互 | 原生 JS（Astro islands） | 仅筛选/导航，无需引入 UI 框架 |

## 3. 架构与页面结构

混合式（方案 C）：首页单页展示 + 独立子页面。

| 路由 | 内容 |
|------|------|
| `/` | 首页：Hero + 精选作品 + 关于简介 + 联系入口 |
| `/projects` | 完整作品列表，按类型（代码/设计/写作）筛选 |
| `/blog` | 博客文章列表 |
| `/blog/[slug]` | 单篇文章详情页 |
| `/contact` | 联系方式页 |

## 4. 文件结构

```
portfolio/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/                     # 静态资源（favicon、图片、字体）
└── src/
    ├── content.config.ts       # Content Collections 的 schema（Zod 校验）
    ├── content/
    │   ├── projects/           # 作品 .md 文件（占位）
    │   └── blog/               # 博客 .md 文件（占位）
    ├── layouts/
    │   └── BaseLayout.astro    # 全局布局：head、导航、页脚
    ├── components/
    │   ├── Nav.astro
    │   ├── Footer.astro
    │   ├── Hero.astro
    │   ├── ProjectCard.astro
    │   ├── ProjectFilter.astro # 分类筛选（原生 JS）
    │   ├── FeaturedProjects.astro
    │   ├── AboutPreview.astro
    │   └── ContactCTA.astro
    ├── pages/
    │   ├── index.astro
    │   ├── projects/index.astro
    │   ├── blog/index.astro
    │   ├── blog/[slug].astro
    │   └── contact.astro
    └── styles/
        └── global.css          # 设计令牌 + 全局样式
```

## 5. 数据模型（Content Collections Schema）

### Project（作品）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 作品标题 |
| `description` | string | 是 | 一句话简介 |
| `category` | `'code' \| 'design' \| 'writing'` | 是 | 作品类型 |
| `tags` | string[] | 否 | 标签 |
| `cover` | string | 否 | 封面图路径 |
| `links` | `{ demo?, repo?, article? }` | 否 | 演示/仓库/文章链接 |
| `featured` | boolean | 否（默认 false） | 是否精选（显示在首页） |
| `date` | date | 否 | 日期 |

### Blog（博客）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 标题 |
| `description` | string | 是 | 摘要 |
| `date` | date | 是 | 日期 |
| `tags` | string[] | 否 | 标签 |
| `draft` | boolean | 否（默认 false） | 草稿（true 则构建排除） |

### 占位内容

- 作品：6 个占位作品，覆盖 `code` / `design` / `writing` 三类，其中 3 个标记 `featured`
- 博客：3 篇占位文章，其中 1 篇 `draft: true`（用于验证草稿排除逻辑）

## 6. 视觉设计（创意活泼）

- **配色**：暖色底（米白 `#FFF8F0`）+ 大胆强调色
  - 珊瑚橙 `#FF6B6B`、青绿 `#4ECDC4`、明黄 `#FFE66D`
  - 强调色用渐变点缀
- **字体**：标题用圆润粗体显示字体；正文 `Noto Sans SC` + 系统回退栈
- **活泼元素**：圆角卡片 + 柔和阴影、渐变 / blob 形状、滚动渐显动画、卡片 hover 上浮
- **响应式**：移动端优先；窄屏导航折叠为汉堡菜单
- **无障碍**：语义化 HTML、对比度达标、图片 alt、键盘可操作、`prefers-reduced-motion` 降级

## 7. 交互与数据流

- 数据流：`getCollection('projects' | 'blog')` → 构建时静态生成页面
- 作品筛选：`/projects` 页用原生 JS 按 `category` 过滤卡片
- 移动端导航：原生 JS 切换开合
- 无运行时依赖，产出纯静态文件

## 8. 错误处理与验证

- **内容校验**：`content.config.ts` 用 Zod 定义 schema，frontmatter 缺失/类型错误在 `astro build` 时报错
- **构建门禁**：`astro check`（类型检查）+ `astro build`（构建）作为质量门禁
- **本地预览**：`npm run dev` 起本地服务
- 静态站点无运行时错误处理；schema 校验 + 构建通过为主要保障

## 9. 部署

首版仅**本地预览**（`npm run dev`）。后续如需上线，优先 GitHub Pages（Astro 原生支持，需补充 `site` 与 `base` 配置 + GitHub Actions）。
