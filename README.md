# 冷冬将至 (Winter is Coming)

种田策略手游 — 在凛冬中建造城堡、采集资源、训练军队、研究科技，生存下去。

## 项目结构

```
winter-is-coming/
├── server/     # Spring Boot 游戏后端
├── client/     # PixiJS + TypeScript 游戏客户端
├── admin/      # Vue 3 + Element Plus 管理后台
├── deploy/     # Docker 部署配置
│   ├── nginx/  # Nginx 反向代理配置
│   └── mysql/  # MySQL 初始化脚本
└── docs/       # 设计文档与开发计划
```

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | Spring Boot 3.x + MyBatis-Plus + MySQL 8.0 + Redis 7.x |
| 客户端 | PixiJS 8.x + TypeScript + Vite |
| 管理后台 | Vue 3 + Element Plus + TypeScript |
| 部署 | Docker + docker-compose + Nginx |

## 开发环境

- JDK 17+
- Node.js 20+
- MySQL 8.0
- Redis 7.x
- Docker & docker-compose

## 快速开始

```bash
# 后端
cd server
mvn spring-boot:run

# 客户端
cd client
npm install
npm run dev
```

## 部署

```bash
cd deploy
docker-compose up -d
```
