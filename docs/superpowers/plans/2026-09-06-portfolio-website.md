# 个人作品集网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个中文、创意活泼风格、综合型（代码/设计/写作）的个人作品集静态网站，首版用占位内容，可本地预览。

**Architecture:** 混合式（方案 C）——首页单页展示（Hero + 精选作品 + 关于简介 + 联系入口）+ 独立子页面（/projects、/blog、/blog/[slug]、/contact）。内容用 Astro Content Collections（Markdown）管理，作品与博客通过 `getCollection()` 在构建时静态生成。

**Tech Stack:** Astro 6.x、TypeScript（strict）、Tailwind CSS v4（`@tailwindcss/vite` 插件）、`astro:content` + `astro/zod`（内容 schema 校验）。

## Global Constraints

- 站点语言：中文，`<html lang="zh-CN">`；所有用户可见文案用中文。
- 内容：占位内容，结构可替换（作品/博客用 Markdown frontmatter 维护）。
- 作品类型枚举：`code` | `design` | `writing`（页面显示为「代码 / 设计 / 写作」）。
- 设计令牌（颜色，Tailwind v4 `@theme`）：米白底 `#FFF8F0`、墨色 `#2D2A26`、珊瑚橙 `#FF6B6B`、青绿 `#4ECDC4`、明黄 `#FFE66D`。
- 字体：正文 `Noto Sans SC`，标题显示字体 `ZCOOL KuaiLe`（均经 Google Fonts 引入，带系统回退）。
- 验证门禁：`npm run check`（astro check 类型检查）+ `npm run build`（构建，含 Zod 内容校验）。这是本项目的「测试」等价物（静态内容站点，spec §8 明确如此）。
- 交互只用原生 JS（`<script>`），不引入 React/Svelte 等 UI 框架。
- 依赖版本一律用 `@latest`，不手写具体版本号。

---

### Task 1: 项目脚手架 + 依赖安装

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/pages/index.astro`（最小占位页，用于首次构建验证）

**Interfaces:**
- Produces: 可构建的空 Astro 项目；`npm run dev` / `npm run build` / `npm run check` 脚本可用；Tailwind 插件已挂载到 Vite。

- [ ] **Step 1: 创建 `package.json`**

```json
{
  "name": "portfolio",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "astro": "astro"
  }
}
```

- [ ] **Step 2: 创建 `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: 创建 `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: 创建 `.gitignore`**

```
node_modules/
dist/
.astro/
```

- [ ] **Step 5: 创建最小首页 `src/pages/index.astro`**

```astro
---
---
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>占位首页</title>
  </head>
  <body>
    <h1>你好，世界</h1>
  </body>
</html>
```

- [ ] **Step 6: 安装依赖**

Run: `npm install astro@latest @astrojs/check@latest typescript@latest tailwindcss@latest @tailwindcss/vite@latest`

- [ ] **Step 7: 验证构建通过**

Run: `npm run build`
Expected: 构建成功，生成 `dist/index.html`。

- [ ] **Step 8: 提交**

```bash
git init
git add -A
git commit -m "chore: scaffold Astro project with Tailwind v4"
```

---

### Task 2: 设计令牌 + 全局样式

**Files:**
- Create: `src/styles/global.css`

**Interfaces:**
- Produces: `global.css` 定义 Tailwind v4 `@theme` 颜色令牌 `cream/ink/coral/teal/sun` 与字体令牌 `font-display/font-body`，供后续所有组件使用 `bg-coral`、`text-ink`、`font-display` 等工具类。Tailwind 扫描任意 `src/**/*.astro` 生成对应工具类。

- [ ] **Step 1: 创建 `src/styles/global.css`**

```css
@import "tailwindcss";

@theme {
  --color-cream: #fff8f0;
  --color-ink: #2d2a26;
  --color-coral: #ff6b6b;
  --color-teal: #4ecdc4;
  --color-sun: #ffe66d;

  --font-display: "ZCOOL KuaiLe", "Noto Sans SC", sans-serif;
  --font-body: "Noto Sans SC", system-ui, -apple-system, sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  color: var(--color-ink);
  background-color: var(--color-cream);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2: 验证构建通过**

Run: `npm run build`
Expected: 构建成功（`global.css` 尚未被引用也不报错）。

- [ ] **Step 3: 提交**

```bash
git add src/styles/global.css
git commit -m "style: add design tokens and global styles"
```

---

### Task 3: 内容 schema + 占位内容

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/projects/code-blog-system.md`
- Create: `src/content/projects/code-data-dashboard.md`
- Create: `src/content/projects/design-mobile-ui.md`
- Create: `src/content/projects/design-brand-vi.md`
- Create: `src/content/projects/writing-tech-articles.md`
- Create: `src/content/projects/writing-product-notes.md`
- Create: `src/content/blog/astro-portfolio-guide.md`
- Create: `src/content/blog/color-and-emotion.md`
- Create: `src/content/blog/draft-article.md`

**Interfaces:**
- Produces: 集合 `projects` 与 `blog`，可经 `getCollection('projects')` / `getCollection('blog')` 获取。`projects` 条目类型：`{ id: string, data: { title, description, category: 'code'|'design'|'writing', tags: string[], cover?: string, links?: { demo?, repo?, article? }, featured: boolean, date?: Date }, body: string }`。`blog` 条目：`{ id, data: { title, description, date: Date, tags: string[], draft: boolean }, body }`。

- [ ] **Step 1: 创建 `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['code', 'design', 'writing']),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    links: z
      .object({
        demo: z.string().url().optional(),
        repo: z.string().url().optional(),
        article: z.string().url().optional(),
      })
      .optional(),
    featured: z.boolean().default(false),
    date: z.coerce.date().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
```

- [ ] **Step 2: 创建 6 个占位作品**

`src/content/projects/code-blog-system.md`:
```md
---
title: 个人博客系统
description: 一个全栈博客平台，支持 Markdown 写作与评论功能。
category: code
tags: ["Astro", "TypeScript", "Tailwind"]
links:
  demo: https://example.com/demo/blog
  repo: https://github.com/example/blog
featured: true
date: 2026-01-10
---

这是一个占位作品。替换为你的真实项目介绍：技术栈、核心功能、亮点与截图。
```

`src/content/projects/code-data-dashboard.md`:
```md
---
title: 数据分析可视化看板
description: 用 Python 与前端图表库构建的实时数据看板。
category: code
tags: ["Python", "Streamlit", "数据可视化"]
links:
  repo: https://github.com/example/dashboard
featured: false
date: 2025-11-20
---

占位作品。替换为你的真实数据项目介绍。
```

`src/content/projects/design-mobile-ui.md`:
```md
---
title: 移动端 App UI 设计
description: 一套活泼风格的移动端界面设计，含组件库与交互动效。
category: design
tags: ["Figma", "UI/UX", "动效"]
links:
  demo: https://example.com/demo/app-ui
featured: true
date: 2026-02-15
---

占位作品。替换为你的真实设计作品说明。
```

`src/content/projects/design-brand-vi.md`:
```md
---
title: 品牌 VI 设计
description: 为初创品牌打造的完整视觉识别系统。
category: design
tags: ["品牌", "VI", "Logo"]
featured: false
date: 2025-09-01
---

占位作品。替换为你的真实品牌设计说明。
```

`src/content/projects/writing-tech-articles.md`:
```md
---
title: 技术文章合集
description: 关于前端工程与数据分析的系列原创文章。
category: writing
tags: ["技术写作", "教程"]
links:
  article: https://example.com/blog
featured: true
date: 2026-03-01
---

占位作品。替换为你的真实写作作品介绍。
```

`src/content/projects/writing-product-notes.md`:
```md
---
title: 产品设计手记
description: 记录产品思考与设计决策的随笔集。
category: writing
tags: ["产品", "随笔"]
featured: false
date: 2025-12-05
---

占位作品。替换为你的真实内容。
```

- [ ] **Step 3: 创建 3 篇占位博客**

`src/content/blog/astro-portfolio-guide.md`:
```md
---
title: 如何用 Astro 搭建个人作品集
description: 从零开始，用 Astro 与 Content Collections 快速构建一个静态作品集网站。
date: 2026-01-05
tags: ["Astro", "教程"]
draft: false
---

这是占位文章。替换为你的真实博客正文。
```

`src/content/blog/color-and-emotion.md`:
```md
---
title: 色彩与情绪：我的设计思考
description: 探讨色彩如何影响用户情绪，以及如何在界面中运用大胆配色。
date: 2025-12-18
tags: ["设计", "色彩"]
draft: false
---

这是占位文章。替换为你的真实博客正文。
```

`src/content/blog/draft-article.md`:
```md
---
title: 未完成的草稿
description: 这篇是草稿，构建时应被排除在列表之外。
date: 2026-02-01
tags: ["草稿"]
draft: true
---

这是一篇草稿，用于验证 `draft: true` 的排除逻辑。
```

- [ ] **Step 4: 验证内容 schema 通过**

Run: `npm run build`
Expected: 构建成功，无 Zod 校验错误（9 个 .md 文件 frontmatter 全部通过 schema）。

- [ ] **Step 5: 提交**

```bash
git add src/content.config.ts src/content
git commit -m "feat: add content collections and placeholder content"
```

---

### Task 4: 全局布局 + 导航 + 页脚

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`

**Interfaces:**
- Consumes: `src/styles/global.css`（Task 2）。
- Produces:
  - `BaseLayout.astro` 接收 props `{ title: string; description?: string }`，渲染 `<head>`（含 Google Fonts、`lang="zh-CN"`）+ `<Nav />` + `<slot />` + `<Footer />`。
  - `Nav.astro` / `Footer.astro` 无需 props。
  - 站点导航链接集合（后续页面也复用这些 href）：`/`（首页）、`/projects`（作品）、`/blog`（博客）、`/contact`（联系）。

- [ ] **Step 1: 创建 `src/layouts/BaseLayout.astro`**

```astro
---
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = '个人作品集' } = Astro.props;
---
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=ZCOOL+KuaiLe&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="min-h-screen flex flex-col">
    <Nav />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: 创建 `src/components/Nav.astro`**

```astro
---
const links = [
  { href: '/', label: '首页' },
  { href: '/projects', label: '作品' },
  { href: '/blog', label: '博客' },
  { href: '/contact', label: '联系' },
];
---
<header class="sticky top-0 z-10 bg-cream/90 backdrop-blur border-b border-ink/10">
  <nav class="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
    <a href="/" class="font-display text-xl text-ink">我的作品集</a>
    <ul class="hidden sm:flex gap-6">
      {links.map((link) => (
        <li>
          <a href={link.href} class="font-medium text-ink/70 hover:text-coral transition">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
    <button
      id="nav-toggle"
      type="button"
      class="sm:hidden text-ink"
      aria-expanded="false"
      aria-controls="mobile-menu"
      aria-label="打开菜单"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </nav>
  <div id="mobile-menu" class="sm:hidden hidden px-6 pb-4">
    <ul class="flex flex-col gap-3">
      {links.map((link) => (
        <li>
          <a href={link.href} class="font-medium text-ink/70 hover:text-coral transition">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
</header>

<script>
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  toggle?.addEventListener('click', () => {
    const open = menu?.classList.toggle('hidden') === false;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  });
</script>
```

- [ ] **Step 3: 创建 `src/components/Footer.astro`**

```astro
<footer class="border-t border-ink/10 py-8 text-center text-sm text-ink/60">
  <p>© 2026 我的作品集 · 用 Astro 构建</p>
  <div class="mt-2 flex justify-center gap-4">
    <a href="https://github.com/" class="hover:text-coral transition">GitHub</a>
    <a href="mailto:hello@example.com" class="hover:text-coral transition">Email</a>
  </div>
</footer>
```

- [ ] **Step 4: 用 BaseLayout 重写 `src/pages/index.astro`（临时验证布局）**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="我的作品集">
  <h1 class="font-display text-4xl">你好，世界</h1>
</BaseLayout>
```

- [ ] **Step 5: 验证构建通过**

Run: `npm run build`
Expected: 构建成功；`dist/index.html` 含导航与页脚结构。

- [ ] **Step 6: 提交**

```bash
git add src/layouts src/components src/pages/index.astro
git commit -m "feat: add base layout, nav, and footer"
```

---

### Task 5: 首页（Hero + 精选作品 + 关于简介 + 联系入口）

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/AboutPreview.astro`
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/FeaturedProjects.astro`
- Create: `src/components/ContactCTA.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getCollection('projects')`（Task 3）；`BaseLayout`（Task 4）。
- Produces: `ProjectCard.astro` 接收 props `{ project: CollectionEntry<'projects'> }`，供首页精选与 /projects 列表复用。首页不在此任务实现筛选逻辑。

- [ ] **Step 1: 创建 `src/components/Hero.astro`**

```astro
---
const name = '你的名字';
const tagline = '代码 · 设计 · 写作，一个多面手。';
---
<section class="relative overflow-hidden px-6 py-24 text-center">
  <div class="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-coral/20 blur-3xl" aria-hidden="true"></div>
  <div class="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-teal/20 blur-3xl" aria-hidden="true"></div>
  <div class="relative">
    <h1 class="font-display text-5xl sm:text-6xl">{name}</h1>
    <p class="mt-4 text-xl text-ink/70">{tagline}</p>
    <div class="mt-8 flex justify-center gap-4">
      <a href="/projects" class="rounded-full bg-coral px-6 py-3 font-medium text-white hover:opacity-90 transition">
        看看作品
      </a>
      <a href="/contact" class="rounded-full border border-ink/20 px-6 py-3 font-medium hover:border-coral hover:text-coral transition">
        联系我
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: 创建 `src/components/ProjectCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  project: CollectionEntry<'projects'>;
}

const { project } = Astro.props;
const { title, description, category, tags, links } = project.data;

const categoryLabel: Record<string, string> = {
  code: '代码',
  design: '设计',
  writing: '写作',
};

const categoryColor: Record<string, string> = {
  code: 'from-coral to-sun',
  design: 'from-teal to-sun',
  writing: 'from-sun to-coral',
};
---
<article
  class="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg transition"
  data-category={category}
>
  <div class={`h-32 bg-gradient-to-br ${categoryColor[category] ?? 'from-sun to-teal'}`} aria-hidden="true"></div>
  <div class="flex flex-1 flex-col gap-2 p-5">
    <div class="flex items-center justify-between">
      <h3 class="font-display text-xl">{title}</h3>
      <span class="rounded-full bg-cream px-2 py-0.5 text-xs text-ink/60">{categoryLabel[category] ?? category}</span>
    </div>
    <p class="text-sm text-ink/70">{description}</p>
    {tags.length > 0 && (
      <ul class="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <li class="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/60">{tag}</li>
        ))}
      </ul>
    )}
    {links && (
      <div class="mt-auto flex gap-3 pt-2 text-sm">
        {links.demo && <a href={links.demo} class="font-medium text-coral hover:underline">演示</a>}
        {links.repo && <a href={links.repo} class="font-medium text-coral hover:underline">仓库</a>}
        {links.article && <a href={links.article} class="font-medium text-coral hover:underline">文章</a>}
      </div>
    )}
  </div>
</article>
```

- [ ] **Step 3: 创建 `src/components/FeaturedProjects.astro`**

```astro
---
import { getCollection } from 'astro:content';
import ProjectCard from './ProjectCard.astro';

const projects = (await getCollection('projects'))
  .filter((p) => p.data.featured)
  .sort((a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0));
---
<section class="px-6 py-16">
  <div class="mx-auto max-w-5xl">
    <h2 class="font-display text-3xl">精选作品</h2>
    <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard project={project} />
      ))}
    </div>
    <div class="mt-8 text-center">
      <a href="/projects" class="font-medium text-coral hover:underline">查看全部作品 →</a>
    </div>
  </div>
</section>
```

- [ ] **Step 4: 创建 `src/components/AboutPreview.astro`**

```astro
---
const skills = ['Astro', 'TypeScript', 'Python', 'Figma', '技术写作'];
---
<section class="px-6 py-16 bg-sun/20">
  <div class="mx-auto max-w-5xl">
    <h2 class="font-display text-3xl">关于我</h2>
    <p class="mt-4 max-w-2xl text-ink/70">
      我是一名多面手，喜欢在代码、设计与写作之间游走。这里是我的占位简介，替换成你的真实自我介绍。
    </p>
    <ul class="mt-6 flex flex-wrap gap-2">
      {skills.map((skill) => (
        <li class="rounded-full bg-white px-3 py-1 text-sm text-ink/70">{skill}</li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 5: 创建 `src/components/ContactCTA.astro`**

```astro
<section class="px-6 py-16 text-center">
  <div class="mx-auto max-w-2xl">
    <h2 class="font-display text-3xl">有想法？聊聊</h2>
    <p class="mt-4 text-ink/70">欢迎通过邮件或社交平台联系我。</p>
    <a href="/contact" class="mt-6 inline-block rounded-full bg-teal px-6 py-3 font-medium text-ink hover:opacity-90 transition">
      联系方式
    </a>
  </div>
</section>
```

- [ ] **Step 6: 组装首页 `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import FeaturedProjects from '../components/FeaturedProjects.astro';
import AboutPreview from '../components/AboutPreview.astro';
import ContactCTA from '../components/ContactCTA.astro';
---
<BaseLayout title="我的作品集">
  <Hero />
  <FeaturedProjects />
  <AboutPreview />
  <ContactCTA />
</BaseLayout>
```

- [ ] **Step 7: 验证构建通过**

Run: `npm run build`
Expected: 构建成功；`dist/index.html` 含 Hero、精选作品（3 个 featured）、关于、联系入口。

- [ ] **Step 8: 提交**

```bash
git add src/components src/pages/index.astro
git commit -m "feat: build homepage with hero, featured projects, about, and contact CTA"
```

---

### Task 6: /projects 页 + 分类筛选

**Files:**
- Create: `src/pages/projects/index.astro`
- Create: `src/components/ProjectFilter.astro`

**Interfaces:**
- Consumes: `getCollection('projects')`、`ProjectCard`（Task 5）、`BaseLayout`（Task 4）。
- Produces: `/projects` 页面，含「全部 / 代码 / 设计 / 写作」筛选按钮，点击后按卡片 `data-category` 显示/隐藏。`ProjectFilter.astro` 无需 props，脚本通过全局 `data-filter` / `data-category` 属性工作。

- [ ] **Step 1: 创建 `src/components/ProjectFilter.astro`**

```astro
---
const filters = [
  { value: 'all', label: '全部' },
  { value: 'code', label: '代码' },
  { value: 'design', label: '设计' },
  { value: 'writing', label: '写作' },
];
---
<div class="flex flex-wrap gap-2" role="group" aria-label="作品类型筛选">
  {filters.map((f) => (
    <button
      type="button"
      data-filter={f.value}
      aria-pressed={f.value === 'all' ? 'true' : 'false'}
      class="rounded-full border border-ink/20 px-4 py-1.5 text-sm font-medium hover:border-coral hover:text-coral transition aria-pressed:bg-coral aria-pressed:text-white aria-pressed:border-coral"
    >
      {f.label}
    </button>
  ))}
</div>

<script>
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
  const cards = document.querySelectorAll<HTMLElement>('[data-category]');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter ?? 'all';
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      cards.forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });
</script>
```

- [ ] **Step 2: 创建 `src/pages/projects/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import ProjectFilter from '../../components/ProjectFilter.astro';

const projects = (await getCollection('projects')).sort(
  (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0)
);
---
<BaseLayout title="作品 | 我的作品集" description="我的作品列表">
  <section class="px-6 py-16">
    <div class="mx-auto max-w-5xl">
      <h1 class="font-display text-4xl">作品</h1>
      <div class="mt-6">
        <ProjectFilter />
      </div>
      <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard project={project} />
        ))}
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: 验证构建通过**

Run: `npm run build`
Expected: 构建成功；`dist/projects/index.html` 含筛选按钮与全部 6 个作品卡片（均带 `data-category`）。

- [ ] **Step 4: 提交**

```bash
git add src/pages/projects src/components/ProjectFilter.astro
git commit -m "feat: add projects page with category filter"
```

---

### Task 7: /blog 列表页 + 文章详情页

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`

**Interfaces:**
- Consumes: `getCollection('blog')`（Task 3）、`BaseLayout`（Task 4）。
- Produces: `/blog` 列表（按日期倒序，排除 `draft: true`）；`/blog/[slug]` 渲染单篇文章（含 `render()` 取正文）。文章正文用 `entry.render()` 后经 `Content` 组件输出。

- [ ] **Step 1: 创建 `src/pages/blog/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

const posts = (await getCollection('blog'))
  .filter((p) => !p.data.draft)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---
<BaseLayout title="博客 | 我的作品集" description="我的文章列表">
  <section class="px-6 py-16">
    <div class="mx-auto max-w-2xl">
      <h1 class="font-display text-4xl">博客</h1>
      <ul class="mt-8 flex flex-col gap-6">
        {posts.map((post) => (
          <li>
            <a href={`/blog/${post.id}`} class="block rounded-2xl border border-ink/10 bg-white p-5 hover:-translate-y-1 hover:shadow-md transition">
              <time class="text-sm text-ink/50" datetime={post.data.date.toISOString()}>
                {post.data.date.toLocaleDateString('zh-CN')}
              </time>
              <h2 class="mt-1 font-display text-xl">{post.data.title}</h2>
              <p class="mt-2 text-sm text-ink/70">{post.data.description}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: 创建 `src/pages/blog/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

interface Props {
  post: any;
}

const { post } = Astro.props;
const { Content } = await render(post);
---
<BaseLayout title={`${post.data.title} | 我的作品集`} description={post.data.description}>
  <article class="mx-auto max-w-2xl px-6 py-16">
    <header>
      <time class="text-sm text-ink/50" datetime={post.data.date.toISOString()}>
        {post.data.date.toLocaleDateString('zh-CN')}
      </time>
      <h1 class="mt-2 font-display text-4xl">{post.data.title}</h1>
      {post.data.tags.length > 0 && (
        <ul class="mt-3 flex flex-wrap gap-1.5">
          {post.data.tags.map((tag: string) => (
            <li class="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/60">{tag}</li>
          ))}
        </ul>
      )}
    </header>
    <div class="mt-8 space-y-4 text-ink/80">
      <Content />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: 验证构建通过**

Run: `npm run build`
Expected: 构建成功；`dist/blog/index.html` 含 2 篇文章（不含草稿）；`dist/blog/astro-portfolio-guide/index.html` 与 `dist/blog/color-and-emotion/index.html` 生成。

- [ ] **Step 4: 提交**

```bash
git add src/pages/blog
git commit -m "feat: add blog list and post detail pages"
```

---

### Task 8: /contact 页

**Files:**
- Create: `src/pages/contact.astro`

**Interfaces:**
- Consumes: `BaseLayout`（Task 4）。
- Produces: `/contact` 页面，展示邮箱与社交链接（占位）。无表单提交逻辑（YAGNI，静态站点）。

- [ ] **Step 1: 创建 `src/pages/contact.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const contacts = [
  { label: '邮箱', value: 'hello@example.com', href: 'mailto:hello@example.com' },
  { label: 'GitHub', value: 'github.com/你的用户名', href: 'https://github.com/' },
  { label: '微信', value: '你的微信号（占位）' },
];
---
<BaseLayout title="联系 | 我的作品集" description="联系方式">
  <section class="px-6 py-16">
    <div class="mx-auto max-w-xl">
      <h1 class="font-display text-4xl">联系我</h1>
      <p class="mt-4 text-ink/70">把下面的占位联系方式替换成你的真实信息。</p>
      <ul class="mt-8 flex flex-col gap-4">
        {contacts.map((c) => (
          <li class="flex items-center justify-between rounded-2xl border border-ink/10 bg-white p-5">
            <span class="font-medium">{c.label}</span>
            {c.href ? (
              <a href={c.href} class="text-coral hover:underline">{c.value}</a>
            ) : (
              <span class="text-ink/70">{c.value}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: 验证构建通过**

Run: `npm run build`
Expected: 构建成功；`dist/contact/index.html` 生成。

- [ ] **Step 3: 提交**

```bash
git add src/pages/contact.astro
git commit -m "feat: add contact page"
```

---

### Task 9: 最终验证 + 本地预览

**Files:**
- 无新增文件。

**Interfaces:**
- 无新接口。对整个站点做端到端门禁验证。

- [ ] **Step 1: 类型检查**

Run: `npm run check`
Expected: 无类型错误。

- [ ] **Step 2: 完整构建**

Run: `npm run build`
Expected: 构建成功，`dist/` 下包含 5 个页面：`index.html`、`projects/index.html`、`blog/index.html`、`blog/*/index.html`（2 篇）、`contact/index.html`。

- [ ] **Step 3: 本地预览**

Run: `npm run dev`
Expected: 本地服务启动，访问 `http://localhost:4321` 可看到首页；检查：导航（含移动端汉堡菜单）、作品筛选、博客列表与详情、联系页均正常。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "chore: final verification pass"
```
