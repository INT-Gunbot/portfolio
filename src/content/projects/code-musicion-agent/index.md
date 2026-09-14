---
title: Musicion Agent
cover: ./cover.png
order: 9
description: 基于自然语言的音乐推荐智能体，结合 LangGraph、Neo4j 图数据库与混合检索，把一句话需求转换为可解释的推荐结果。
category: code
tags: ["Python", "LangGraph", "Neo4j", "Next.js", "Docker"]
links:

  repo: https://github.com/INT-Gunbot/Musicion-Agent
featured: true
date: 2026-09-06
---

## 🎯 这是什么

Musicion 是一个开源音乐推荐智能体。你只需用一句话描述心情、场景、声音、喜欢的歌手，或者明确说出不想听什么。系统会把这句话转换成检索计划，在音乐库中寻找歌曲，并解释推荐理由。

- 🗣️ **说人话就行** — "今天心情特别差，想一个人静一静"，不需要你先想好流派和关键词
- 🔎 **不只依赖关键词** — 同时参考歌曲知识和听感相似度，避免只用一种方式找歌
- 🧠 **越用越懂你** — 点赞、收藏、跳过以及你明确表达的偏好可以影响后续排序，但不会覆盖你这一次的要求
- 🌐 **库里没有可以联网补充** — 联网发现是可选能力，随时可以关闭
- ♻️ **让音乐库持续成长** — 经过授权的音频可以自动检查、补充标签、转换为可检索表示，审核后再进入正式曲库
- 🧪 **日常 / 开发两种模式** — 开发模式的数据独立存放，不参与个性化学习，也不进训练集



## ✨ 它是怎么工作的

1. **理解需求**：Planner 会区分歌手、语言等明确条件，以及情绪、氛围、场景等柔性偏好。
2. **多路找歌**：图谱检索负责查找符合事实和关系的歌曲，向量检索负责寻找听感或语义相似的歌曲，最后融合结果并保持多样性。
3. **从反馈中学习**：点赞、收藏、跳过和会话上下文会被记录为可追溯事件。真正有用的偏好可以在后续对话中被召回，无关或过期信息不会一直塞进上下文。
4. **形成数据飞轮**：系统可以对授权音频进行格式检查，用模型补充标签和背景信息，生成音乐向量，再把审核后的结果加入可检索曲库。

大语言模型负责规划“应该怎样找”，确定性的程序负责在执行前检查计划。模型不会绕过曲库，直接虚构一份歌单。

### 为 Musicion 训练的 Planner

默认配置可以直接调用 Qwen3.7 Plus API。项目同时提供一个针对自身检索规则训练的 35B Planner。在独立保留的 500 条规划评测中，训练后的 Planner 有 **99.4%** 的输出符合结构要求，**95.6%** 的请求能够选择正确的意图与检索路线。这些数据衡量的是规划能力，不等同于主观音乐审美评分。

两种 Planner 共用同一套检索、记忆、排序和前端代码，因此切换模型不需要重新开发推荐系统。

---

## 🚀 快速启动

```powershell
cd <你的项目目录>
Copy-Item .env.example .env
notepad .env
```

`.env` 里至少填这几项（默认用 DashScope / Qwen）：

```env
MAIN_LLM_PROVIDER=dashscope
MODEL_NAME=qwen3.7-plus
DASHSCOPE_API_KEY=你的 DashScope Key
NEO4J_PASSWORD=你的 Neo4j 密码
MUSIC_DATA_PATH=../data
```

然后启动，打开 `http://localhost:3003`：

```powershell
.\musicion.ps1 up gpu
```

没有 NVIDIA 显卡就用 `.\musicion.ps1 up cpu`。CUDA/ROCm GPU 档默认由 MuQ
理解中文语义、OMAR 做声学重排；资源受限的纯 CPU 档才使用 M2D-CLAP。

想换模型厂商（SiliconFlow / Google / 火山 / 本地 SGLang、vLLM、Ollama），改 `MAIN_LLM_PROVIDER` 和 `MODEL_NAME` 并填对应 Key 即可，也可以启动后在前端「系统设置」里改。

### 选择 Planner

Musicion 既可以使用 API 模型，也可以连接自己部署的 OpenAI 兼容模型服务。大模型可以留在 GPU 服务器上，其余应用仍然运行在普通电脑上。

| 方案 | 适合什么情况 | 需要什么 |
|---|---|---|
| Qwen3.7 Plus API | 最省事的首次运行 | API Key，不需要本地大显卡 |
| Musicion V4.2 35B | 项目专用规划、私有部署 | 一台高显存推理服务器 |
| 安全演示 | 展示界面和检索流程 | 仅需 CPU，不调用外部模型 |

模型切换、完整性校验、服务启动和压测工具见[自托管部署包](deploy/self_hosted_35b)。主 Docker 部署支持 CPU 与 NVIDIA CUDA；如果使用 AMD GPU，可以叠加 [ROCm 部署配置](docs/AMD_ROCM_DEPLOYMENT.md)，不需要改业务代码。

<details>
<summary>其它常用命令</summary>

| 命令 | 用途 |
|---|---|
| `.\musicion.ps1 doctor` | 检查各服务是否正常 |
| `.\musicion.ps1 down` | 停止所有容器 |
| `.\musicion.ps1 logs` | 查看服务日志 |
| `.\musicion.ps1 test` | 运行单元测试 |
| `.\musicion.ps1 ingest gpu` | 用 GPU Worker 处理待入库歌曲 |
| `python scripts/dev/start_backend.py` | 仅启动后端，供本地调试 |

</details>

---

## 🏗️ 架构

一次推荐请求会走完这条链路：

```
你说的一句话
     │
     ▼
┌──────────────────────────────────────────────────┐
│  Agent（LangGraph）                               │
│  召回记忆 → LLM 规划 → 按意图分流                  │
│  找歌 / 闲聊 / 获取歌曲 / 澄清追问                 │
└──────────────────────┬───────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────┐
│  本地检索与曲库扩展                                │
│  图谱 ＋ MuQ 语义召回 ＋ OMAR 声学重排 → 按需联网  │
└──────────────────────┬───────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────┐
│  存储：Neo4j（图谱＋向量＋行为热路径）              │
│        SQLite（长期记忆账本 ＋ 反馈事件）           │
└──────────────────────┬───────────────────────────┘
                       ▼
        SSE 流式推送 → 前端（Next.js）
                       │
                       ▼
        你的反馈 ──────┘  记录下来，更新你的偏好画像
```

### 技术栈

| 层 | 用什么 |
|---|---|
| 前端 | Next.js 16 + React 18 |
| 后端 | FastAPI + SSE 流式推送 |
| Agent | LangGraph StateGraph |
| 图数据库 | Neo4j 5.x（图谱关系 + 原生向量索引） |
| 文搜音 | GPU：MuQ-MuLan + OMAR-RQ；纯 CPU：M2D-CLAP |
| 大语言模型 | 默认 `dashscope / qwen3.7-plus`，可换 provider |
| 长期记忆 | 本地 SQLite 账本 + Neo4j 热路径 |
| 排序 | 多路召回融合 → 精排 → 多样性 |
| 部署 | Docker Compose（CPU / GPU 两种入口） |

> 📖 推荐质量与对齐评测怎么跑，见 [tests/eval/README.md](tests/eval/README.md)

---

## 📁 项目结构

```
agent/       LangGraph 工作流与意图路由
retrieval/   混合检索、融合排序、音频编码、上下文管线
tools/       图谱检索 / 文搜音 / 联网发现 / 歌曲获取
services/    记忆网关、反馈事件、排序策略、外部服务客户端
schemas/     Pydantic 契约（状态、查询计划、反馈事件）
llms/        Provider 注册表与 Prompts
api/         FastAPI 接口层
data/        数据管线与 Planner 蒸馏 harness
web/         Next.js 前端
tests/       单元测试 + 结果导向评测
```


---

## ⚙️ 配置

| 变量 | 说明 |
|---|---|
| `DASHSCOPE_API_KEY` | 默认模型的调用密钥（换 provider 就填对应厂商的） |
| `NEO4J_PASSWORD` | 本地 Neo4j 密码 |
| `MUSIC_DATA_PATH` | 音频、缓存、待入库队列、反馈日志的存放目录 |
| `MUSIC_WEB_SEARCH_ENABLED` | 是否允许联网补充候选 |
| `ADMIN_API_KEY` | 可选。设了它，删除/改配置/重建这些危险接口才需要带 key |

更多高级选项见 `.env.example`，普通使用不需要动。

服务只监听 `127.0.0.1`。要远程访问走 VPN 或 SSH 隧道。

---



## 🙏 致谢

本项目初始架构参考自 [imagist13/Muisc-Research](https://github.com/imagist13/Muisc-Research)，在此基础上做了大规模重构与功能扩展。

| 项目 | 用途 |
|---|---|
| [OpenMuQ/MuQ](https://github.com/OpenMuQ/MuQ) | MuQ-MuLan 文搜音主模型（CC-BY-NC 4.0） |
| [nttcslab/m2d](https://github.com/nttcslab/m2d) | 资源受限纯 CPU 档的 M2D-CLAP 编码器 |
| [MTG/omar-rq](https://github.com/MTG/omar-rq) | GPU 档的 OMAR-RQ 声学重排模型 |
| [aexy-io/graphzep](https://github.com/aexy-io/graphzep) | legacy 记忆适配器（可选、非默认） |

