# 第一阶段：基础框架 实施计划

**目标：** 搭建完整项目骨架，浏览器打开服务器IP能看到可拖拽的2.5D等距地图，后端能注册登录。

**技术栈：** Spring Boot 3.x + MyBatis-Plus + MySQL 8.0 + Redis 7.x / PixiJS 8.x + TypeScript + Vite / Docker + Nginx

---

## Task 1: 初始化项目结构 + Git

**状态：** ✅ 已完成（2026-06-10）

创建 monorepo 目录结构：

```
winter-is-coming/
├── server/          # Spring Boot 后端
├── client/          # PixiJS 游戏客户端
├── admin/           # Vue 3 管理后台（本阶段不做，只建目录）
├── deploy/          # Docker 部署配置
│   ├── nginx/
│   └── mysql/
├── docs/            # 文档
├── .gitignore
└── README.md
```

步骤：
- [ ] 1.1 创建所有目录
- [ ] 1.2 写 .gitignore（Java + Node + IDE）
- [ ] 1.3 写 README.md
- [ ] 1.4 首次 commit + push 到 GitHub

---

## Task 2: Spring Boot 后端骨架

**状态：** ✅ 已完成（2026-06-10）

### 2.1 初始化 Spring Boot 项目

- [ ] 创建 pom.xml（Spring Boot 3.x + MyBatis-Plus + MySQL + Redis + JWT）
- [ ] 创建启动类 `WinterIsComingApplication.java`
- [ ] 创建 application.yml（数据库、Redis、JWT 配置）
- [ ] 创建 application-dev.yml（本地开发配置）
- [ ] 创建 application-prod.yml（生产配置）

### 2.2 公共组件

- [ ] `Result<T>` 统一返回类（code / msg / data）
- [ ] `BizException` 业务异常类 + 错误码枚举
- [ ] `GlobalExceptionHandler` 全局异常处理
- [ ] `JwtUtil` JWT 工具类
- [ ] 雪花算法 ID 生成器

### 2.3 数据库初始化

- [ ] 编写 init.sql（所有配置表 + 用户表 + 存档表 + 公告表）
- [ ] 编写 update.sql（空文件，预留）

### 2.4 用户模块

- [ ] `t_user` Entity
- [ ] `UserMapper` + XML
- [ ] `UserService` / `UserServiceImpl`
- [ ] `UserController`
  - POST /api/v1/user/register
  - POST /api/v1/user/login
  - GET /api/v1/user/info
- [ ] `RegisterDTO` / `LoginDTO` / `UserVO`
- [ ] JWT 拦截器（登录校验）

### 2.5 配置模块（只读接口）

- [ ] `ConfigController`
  - GET /api/v1/config/version
- [ ] 配置版本从 Redis 缓存读取

### 2.6 验证后端

- [ ] 本地启动 Spring Boot 验证
- [ ] 注册 + 登录接口测试通过
- [ ] commit

---

## Task 3: PixiJS 游戏客户端骨架

**状态：** ✅ 已完成（2026-06-10）

### 3.1 初始化前端项目

- [ ] package.json（pixi.js 8.x + typescript + vite）
- [ ] tsconfig.json
- [ ] vite.config.ts
- [ ] index.html（入口页）

### 3.2 游戏核心引擎

- [ ] `src/core/Game.ts` — 游戏主类（初始化 PixiJS Application、场景管理）
- [ ] `src/core/SceneManager.ts` — 场景切换管理
- [ ] `src/core/InputManager.ts` — 输入处理（鼠标拖拽、缩放、触摸）
- [ ] `src/core/AssetManager.ts` — 资源加载管理

### 3.3 等距地图渲染

- [ ] `src/scenes/CastleScene.ts` — 城堡主城场景
- [ ] `src/map/IsometricMap.ts` — 等距地图核心
  - 笛卡尔坐标 ↔ 等距坐标转换
  - 地块网格渲染
  - 地图拖拽滚动
  - 地图缩放（鼠标滚轮 / 双指捏合）
- [ ] `src/map/Tile.ts` — 单个地块（草地、水面、山地等）
- [ ] 用代码生成临时色块地图（不需要美术素材）

### 3.4 基础 UI

- [ ] `src/ui/HUD.ts` — 顶部资源栏（粮食/木材/石材/铁矿/煤炭/钻石 数值显示）
- [ ] `src/ui/BottomBar.ts` — 底部功能按钮栏

### 3.5 网络层

- [ ] `src/network/HttpClient.ts` — 封装 fetch 请求（baseURL、JWT token、统一错误处理）
- [ ] `src/network/Api.ts` — 各接口定义

### 3.6 入口整合

- [ ] `src/main.ts` — 入口，初始化 Game → 加载 CastleScene
- [ ] 本地 `npm run dev` 能在浏览器看到等距地图
- [ ] commit

---

## Task 4: Docker 部署配置

**状态：** ✅ 已完成（2026-06-10）

### 4.1 后端 Dockerfile

- [ ] `deploy/Dockerfile.server`（多阶段构建：Maven 打包 → JRE 运行）

### 4.2 前端构建

- [ ] `deploy/Dockerfile.client`（Node 构建 → 静态文件输出给 Nginx）

### 4.3 Nginx 配置

- [ ] `deploy/nginx/nginx.conf`
  - / → 游戏客户端静态文件
  - /api/ → 反向代理到 game-server:8080
  - /admin/ → 管理后台（后续）

### 4.4 MySQL 初始化

- [ ] `deploy/mysql/init.sql`（复制 server 的 init.sql）

### 4.5 docker-compose.yml

- [ ] 编排 5 个容器：nginx / game-server / mysql / redis / client-build
- [ ] 内存限制、端口映射、数据卷挂载
- [ ] 环境变量配置

### 4.6 验证

- [ ] 本地 docker-compose up 能正常启动所有服务
- [ ] commit

---

## Task 5: 部署到服务器

**状态：** 未开始

- [ ] 5.1 SSH 到服务器，安装 docker-compose
- [ ] 5.2 克隆 GitHub 仓库到服务器
- [ ] 5.3 配置生产环境变量（数据库密码等）
- [ ] 5.4 docker-compose up -d 启动
- [ ] 5.5 验证：浏览器打开 http://42.193.181.54 能看到等距地图
- [ ] 5.6 验证：注册登录接口可用
- [ ] 5.7 commit 最终调整 + push

---

## 完成标准

- [ ] 浏览器打开服务器 IP，能看到可拖拽、可缩放的 2.5D 等距地图
- [ ] 注册 + 登录接口正常工作
- [ ] 所有代码推送到 GitHub
- [ ] Docker 容器稳定运行

---

## 进度记录

| Task | 状态 | 完成时间 |
|------|------|----------|
| Task 1: 项目结构 | ✅ 已完成 | 2026-06-10 |
| Task 2: 后端骨架 | ✅ 已完成 | 2026-06-10 |
| Task 3: 客户端骨架 | ✅ 已完成 | 2026-06-10 |
| Task 4: Docker 配置 | ✅ 已完成 | 2026-06-10 |
| Task 5: 部署上线 | 未开始 | - |
