---
title: 个人作品集网站
cover: image.png
description: AI辅助的基于 Astro 7 与 Tailwind CSS 4 构建的个人名片网站，支持作品分类筛选、Markdown 博客与响应式布局。
category: code
tags: ["Astro", "TypeScript", "Tailwind CSS","Claude code"]
featured: true
date: 2026-09-06
---

本项目即当前正在访问的网站，基于 Astro 7 静态站点生成与 Tailwind CSS 4 构建：

- **内容集合**：作品与博客通过 `astro:content` 的 glob 加载器管理，使用 Zod 校验 frontmatter。
- **作品模块**：支持按代码 / 设计 / 写作三类实时筛选（纯前端实现）。
- **博客模块**：Markdown 写作，`draft: true` 的草稿在构建时自动排除，动态路由渲染正文。
- **动效与响应式**：CSS 关键帧实现浮动形状与模糊光斑背景，适配移动端菜单，并通过 `prefers-reduced-motion` 提供无障碍降级。
