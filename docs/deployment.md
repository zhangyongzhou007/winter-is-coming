# 部署手册

## 服务器信息

| 项目 | 值 |
|------|------|
| 云服务商 | 腾讯云轻量应用服务器（广州） |
| 配置 | 2核4G 5M带宽 60G SSD 500GB月流量 |
| 系统 | CentOS Stream 9 + Docker 26 |
| IP | 42.193.181.54 |
| 访问地址 | http://42.193.181.54 |

## 服务器目录结构

```
/opt/winter-is-coming/          # 项目根目录（git clone）
├── deploy/
│   ├── docker-compose.yml      # 容器编排
│   ├── .env                    # 环境变量（数据库密码等）
│   ├── Dockerfile.server       # 后端构建镜像
│   ├── Dockerfile.client       # 前端构建镜像
│   ├── nginx/
│   │   └── nginx.conf          # Nginx 反向代理配置
│   └── mysql/
│       └── init.sql            # 数据库初始化脚本
├── server/                     # Spring Boot 后端源码
├── client/                     # PixiJS 客户端源码
├── admin/                      # 管理后台源码（后续）
└── docs/                       # 文档
```

## Docker 容器清单

| 容器名 | 镜像 | 端口 | 内存限制 | 用途 |
|--------|------|------|----------|------|
| wic-mysql | mysql:8.0 | 3306 | 512M | 数据库 |
| wic-redis | redis:7-alpine | 6379 | 128M | 缓存 |
| wic-server | 自建(Dockerfile.server) | 8080 | 512M | 游戏后端 |
| wic-client-build | 自建(Dockerfile.client) | - | - | 前端构建(一次性) |
| wic-nginx | nginx:alpine | 80 | 64M | 反向代理+静态文件 |

## 数据库信息

| 项目 | 值 |
|------|------|
| 数据库名 | winter_is_coming |
| 用户 | root |
| 密码 | 见 deploy/.env |
| 字符集 | utf8mb4 / utf8mb4_general_ci |
| 初始化脚本 | deploy/mysql/init.sql |

### 数据表（共 15 张）

| 表名 | 用途 |
|------|------|
| t_user | 用户表 |
| t_game_save | 存档表 |
| t_config_building | 建筑配置（16种建筑） |
| t_config_building_level | 建筑升级配置（每级消耗/产出） |
| t_config_tech | 科技配置 |
| t_config_hero | 英雄配置 |
| t_config_hero_skill | 英雄技能配置 |
| t_config_troop | 兵种配置 |
| t_config_skin | 皮肤配置 |
| t_config_monster | 野怪配置 |
| t_config_mine | 矿脉配置 |
| t_notice | 公告表 |
| t_user_building | 用户建筑实例 |
| t_user_resource | 用户资源 |

## 常用运维命令

```bash
# 启动所有服务
cd /opt/winter-is-coming/deploy && docker compose up -d

# 停止所有服务
cd /opt/winter-is-coming/deploy && docker compose down

# 查看后端日志
docker logs wic-server -f

# 查看所有容器状态
docker ps -a

# 重新构建并启动
cd /opt/winter-is-coming/deploy && docker compose up -d --build

# 更新代码并重新部署
cd /opt/winter-is-coming && git pull && cd deploy && docker compose up -d --build

# 进入 MySQL 命令行
docker exec -it wic-mysql mysql -uroot -p

# 查看 Redis
docker exec -it wic-redis redis-cli
```

## Nginx 路由规则

| 路径 | 目标 | 说明 |
|------|------|------|
| / | 静态文件 | 游戏客户端 |
| /api/ | game-server:8080 | 后端 API 反向代理 |
| /admin/ | 静态文件 | 管理后台（后续） |
