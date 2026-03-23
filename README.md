# FitForge

一个基于 Next.js App Router 构建的健身训练与营养规划 Web 应用。项目把动作浏览、3D 肌群高亮、营养规划、训练计划生成、历史记录和趋势看板整合到同一套工作流中，适合作为全栈产品演示项目。

## 项目简介

FitForge 采用“规则优先，AI 补充”的设计思路：

- 动作模块基于肌群关系与 3D 人体模型展示训练部位
- 营养规划由规则层给出核心数字，AI 层补充解释与可执行菜单
- 训练计划由规则引擎负责动作结构与约束，AI 只负责 explanation 补充
- 历史记录与 dashboard 让营养、训练和身体数据形成闭环

## 核心功能

- `/exercises`
  动作分类浏览、动作详情联动、主次肌群标签、3D 模型高亮
- `/nutrition`
  三层输出结构：计算结果、解释逻辑、饮食示例
- `/plan`
  规则优先的一周训练计划生成与保存
- `/history`
  营养历史、训练历史、身体数据记录
- `/dashboard`
  本周肌群覆盖热力图、体重趋势、营养目标趋势

## 技术栈

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Drizzle ORM
- SQLite
- React Three Fiber + Drei
- Zod
- React Hook Form

## 页面说明

- `/`
  首页导航与功能概览
- `/exercises`
  左侧分类与动作列表，中间 3D 人体 viewer，右侧动作详情
- `/nutrition`
  左侧表单，右侧三层营养结果 tabs
- `/plan`
  左侧训练计划输入，右侧周计划详情与 explanation
- `/history`
  营养历史、训练历史、身体数据三个 tab
- `/dashboard`
  热力图、体重趋势、营养趋势

## 本地运行方式

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在根目录新建 `.env.local`，至少包含：

```bash
DATABASE_URL=file:./drizzle/local.db
```

也可以直接复制 `.env.example` 作为起点。

### 3. 启动开发环境

```bash
npm run dev
```

默认访问地址：

- [首页](http://localhost:3000/)
- [动作页](http://localhost:3000/exercises)
- [营养页](http://localhost:3000/nutrition)
- [训练计划页](http://localhost:3000/plan)
- [历史页](http://localhost:3000/history)
- [看板页](http://localhost:3000/dashboard)

## 数据库初始化方式

### 1. 生成 migration

```bash
npm run db:generate
```

### 2. 执行 migration

```bash
npm run db:migrate
```

### 3. 导入 seed 数据

```bash
npm run db:seed
```

### 4. 验证训练规则

```bash
npm run verify:training-rules
```

说明：

- 运行时数据库连接来自 `DATABASE_URL`
- 当前阶段默认使用本地 SQLite 文件：`file:./drizzle/local.db`
- `drizzle.config.ts` 在未设置环境变量时也会回退到本地 SQLite

## 项目亮点

- 动作库 + 3D 高亮
  主肌群与次肌群会在 glTF 人体模型上实时高亮显示
- 三层营养输出
  同时给出核心数字、中文解释、三种日常场景饮食示例
- 规则优先的训练计划生成
  训练日有明确允许动作、禁止动作和覆盖校验，避免胸日带弯举、背日带下压
- 历史记录与 dashboard 联动
  营养、训练和体重记录可以在 `/history` 和 `/dashboard` 中串联查看

## 当前仓库说明

当前主线应用是仓库根目录这套 Next.js 项目：

- `app/`
- `src/`
- `scripts/`
- `drizzle/`

仓库中仍保留旧时代遗留目录与脚本，但已经归档到 `legacy/`，仅作历史参考，未参与当前构建：

- `legacy/frontend/`
- `legacy/backend/`
- `legacy/requirements.txt`
- `legacy/start.bat`
- `legacy/start.sh`
- `legacy/frontend.log`
- `legacy/backend.log`

后续如果确认不再需要参考这些旧文件，再考虑单独移除。

## 后续规划

- 增加真实 workout logs，而不是只基于最近训练计划估算 dashboard 热力图
- 接入真实 AI provider，替换当前 mock / stub 实现
- 增加更完整的测试覆盖，包括规则层和页面交互回归
- 在真正部署阶段再评估远程数据库与生产环境方案
