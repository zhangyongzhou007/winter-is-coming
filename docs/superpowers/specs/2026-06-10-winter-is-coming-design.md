# 《冷冬将至》游戏项目设计文档

> 项目代号：winter-is-coming
> 创建日期：2026-06-10
> 状态：设计阶段

---

## 1. 项目概述

### 1.1 核心定位

参考《无尽冬日》风格的种田策略手游。以**基地建造**为核心玩法，轻战斗、轻 PVP，重点在资源采集、科技升级、人口管理、生存经营。

### 1.2 游戏名称

- 中文名：**冷冬将至**
- 英文名：**Winter is Coming**

### 1.3 视角风格

- **2.5D 斜视角**（45° 俯视），参考《无尽冬日》《部落冲突》风格
- PixiJS 实现等距视角（Isometric）渲染

### 1.4 联机策略

- **第一阶段：单机种田**，云端存档同步
- **第二阶段：联机扩展**，加入联盟、PVP、排行榜
- 架构从一开始预留联机扩展口（接口版本化、协议可升级）

---

## 2. 核心玩法

### 2.1 基地建造

- 玩家拥有一块可扩展的基地区域
- 在网格上放置建筑：住宅、农田、仓库、工厂、防御塔等
- 建筑可升级，升级消耗资源和时间
- 不同建筑之间有协同效果（如农田靠近水源产量+10%）

### 2.2 资源系统

**基础资源（建筑/升级/训练消耗）：**

| 资源 | 城内获取 | 野外获取 | 用途 |
|------|----------|----------|------|
| 粮食 | 农田产出 | 野外农田采集 | 训练兵种、升级建筑 |
| 木材 | 伐木场 | 野外森林采集 | 建筑建造、升级 |
| 石材 | 采石场 | 野外石矿采集 | 高级建筑、城墙 |
| 铁矿 | 矿场 | 野外铁矿采集 | 武器锻造、兵种升级 |
| 煤炭 | 煤矿 | 野外煤矿采集 | 供暖、工厂运转 |

**稀有资源：**

| 资源 | 获取方式 | 用途 |
|------|----------|------|
| 钻石 | 野外钻石矿采集、任务奖励、充值 | 抽英雄、加速、购买稀有道具 |

**资源用途汇总：**
- 升级建筑 → 消耗粮食、木材、石材、铁矿
- 训练/升级兵种 → 消耗粮食、铁矿
- 科技研究 → 消耗多种基础资源
- 抽英雄碎片 → 消耗钻石
- 冬季供暖 → 消耗煤炭

### 2.3 人口管理

- 居民进入基地后永久工作，不会离开
- 需要分配工作岗位：农民、矿工、建筑工、研究员
- 人口通过建造住宅增长，住宅容量决定人口上限
- 更多人口 = 更多产出，玩家专注于合理分配劳动力

### 2.4 兵种系统

- 在兵营中训练士兵，消耗粮食 + 铁矿
- 士兵等级 1-4 级，升级消耗资源，属性全面提升
- 士兵用途：
  - 派遣到野外采集资源
  - 攻打野怪获取奖励
  - 驻守城防（未来 PVP）
- 英雄可带领士兵出征，英雄属性加成部队战力

**士兵属性：**

| 属性 | 说明 |
|------|------|
| 生命值（HP） | 士兵血量，归零则阵亡 |
| 攻击力（ATK） | 基础伤害输出 |
| 防御力（DEF） | 减少受到的伤害 |
| 采矿能力（GATHER） | 采集资源的速度和效率 |
| 攻击速度（SPD） | 攻击间隔，越高出手越快 |
| 暴击几率（CRIT） | 触发暴击的概率（百分比），暴击伤害 1.5 倍 |

**士兵等级成长（基础数值参考）：**

| 等级 | HP | ATK | DEF | GATHER | SPD | CRIT |
|------|-----|-----|-----|--------|-----|------|
| Lv.1 | 100 | 10 | 5 | 10 | 1.0 | 0% |
| Lv.2 | 180 | 20 | 12 | 18 | 1.2 | 0% |
| Lv.3 | 300 | 35 | 22 | 30 | 1.4 | 2% |
| Lv.4 | 500 | 60 | 40 | 50 | 1.7 | 5% |

**暴击属性设计原则：** 暴击是稀缺属性，难以获得。
- 士兵升级：Lv.3 才开始有暴击，Lv.4 也只有 5%
- 英雄技能：仅橙色（传说）品质英雄有暴击加成技能
- 城堡皮肤：仅限时活动皮肤"暗夜幽城"提供 +3%
- 出征皮肤：仅限时活动皮肤"龙骑军团"提供 +3%
- 暴击伤害倍率：1.5 倍（固定，不可提升）
- 全身毕业暴击上限约 20%，需要大量投入才能达到

- 升级消耗粮食 + 铁矿，高等级还需要煤炭
- 同一时间只能升一个等级的兵种（或用钻石加速）

### 2.5 英雄系统

- **获取方式：** 用钻石抽取英雄碎片
- **碎片合成：** 收集足够碎片解锁英雄
- **星级升阶：** 1星 → 2星 → ... → 5星，每次升星消耗碎片
- **英雄属性：** 攻击、防御、采集速度、带兵上限
- **英雄品质：** 绿色（普通）→ 蓝色（精良）→ 紫色（史诗）→ 橙色（传说）
- **英雄用途：**
  - 带兵采集：提升采集速度和负重
  - 带兵打野怪：提升战斗力
  - 驻守城防（未来 PVP）

**英雄技能体系：**

每个英雄拥有 1 个主动技能 + 1-2 个被动技能，升星解锁更强技能。

技能分类：

| 技能类型 | 效果 | 示例 | 品质限制 |
|----------|------|------|----------|
| 攻击加成 | 提升部队攻击力百分比 | 战吼：部队攻击力 +15% | 所有品质 |
| 防御加成 | 提升部队防御力百分比 | 铁壁：部队防御力 +20% | 所有品质 |
| 采集加成 | 提升采集速度百分比 | 勤劳：采集速度 +25% | 所有品质 |
| 生命加成 | 提升部队生命值百分比 | 坚韧：部队 HP +20% | 蓝色以上 |
| 负重加成 | 提升部队采集负重 | 大力：负重上限 +30% | 蓝色以上 |
| 速度加成 | 提升行军速度 | 疾行：行军速度 +20% | 紫色以上 |
| 暴击加成 | 提升部队暴击几率 | 锐眼：暴击几率 +5% | **仅橙色** |

技能升级规则：
- 1星解锁：被动技能 1（基础效果）
- 3星解锁：被动技能 2
- 5星解锁：主动技能强化（效果翻倍）

### 2.6 皮肤系统

**城堡皮肤：**

更换城堡整体外观风格，影响所有建筑的视觉主题，**并附带属性加成**。

| 皮肤名称 | 风格 | 属性加成 | 获取方式 |
|----------|------|----------|----------|
| 冰霜堡垒 | 冰蓝色调，冰晶装饰，飘雪效果 | 无（默认） | 默认皮肤 |
| 烈焰王城 | 暗红色调，熔岩纹理，火焰粒子 | 全军攻击力 +5% | 钻石购买 |
| 翡翠森林 | 翠绿色调，藤蔓缠绕，萤火虫飘飞 | 资源产出 +5% | 钻石购买 |
| 黄金圣殿 | 金色色调，华丽雕刻，光芒四射 | 全军防御力 +5% | 钻石购买 |
| 暗夜幽城 | 深紫色调，月光笼罩，幽灵飘荡 | 全军暴击几率 +3% | 限时活动 |

- 切换皮肤后所有建筑外观同步变化
- 皮肤属性加成全局生效（城内 + 野外）
- 暗夜幽城给暴击加成，但只能通过限时活动获取，体现暴击的稀缺性
- 后续可持续出新皮肤作为收入来源

**出征队列皮肤：**

更换部队在野外行军时的外观效果，**并附带属性加成**。

| 皮肤名称 | 行军外观 | 属性加成 | 获取方式 |
|----------|----------|----------|----------|
| 寒冰骑兵 | 冰蓝色铠甲，马蹄冰霜拖尾 | 无（默认） | 默认皮肤 |
| 烈焰战骑 | 红色重甲，行军路径火焰痕迹 | 部队攻击力 +5% | 钻石购买 |
| 暗影突袭 | 黑色斗篷，烟雾拖尾效果 | 行军速度 +8% | 钻石购买 |
| 圣光骑士 | 白金铠甲，金色光环拖尾 | 部队生命值 +5% | 钻石购买 |
| 龙骑军团 | 龙形坐骑，飞行拖尾特效 | 部队暴击几率 +3% | 限时活动 |

- 在野外地图上其他玩家（联机阶段）可以看到你的皮肤
- 龙骑军团给暴击加成，同样限时活动获取

### 2.7 科技树

- 分支：农业、建筑、军事、探索
- 解锁新建筑、新资源、新能力
- 研究需要消耗资源 + 研究员 + 时间

### 2.8 季节与天气

- 游戏内时间循环：春 → 夏 → 秋 → 冬
- 冬季是核心挑战：
  - 农田停产
  - 煤炭消耗翻倍（供暖）
- 玩家需要在春夏秋储备物资，撑过冬天
- 季节变化配合精美的视觉效果（飘雪、落叶、花开等）

### 2.9 视觉风格

- **画面精美**是核心卖点，场面要漂亮好看
- 等距视角下的精致建筑模型，每个建筑有多级外观变化
- 丰富的环境动画：炊烟、水流、风吹草动、昼夜光影
- 季节视觉差异明显：春天花开、夏天绿荫、秋天金黄、冬天白雪
- 建筑建造/升级有动画过渡效果
- 居民在基地中走动的小人动画

---

## 3. 场景划分

### 3.1 城堡内部（主城）

- 玩家的核心经营区域，2.5D 等距视角近景
- 建造/升级建筑、分配人口、生产资源
- 能看到每个建筑细节、居民走动、炊烟水流
- 所有经营管理操作在此完成

### 3.2 野外地图（世界地图）

- 坐标制地图，每个位置有坐标（X, Y）
- 支持**坐标搜索**：输入坐标直接跳转定位
- 支持**小地图**：右上角缩略图显示全局，点击快速跳转
- 支持**筛选功能**：
  - 按矿脉类型筛选（粮食/木材/石材/铁矿/煤矿/钻石矿）
  - 按野怪等级筛选
  - 按空地/已占领筛选

**野外资源点（矿脉）：**

| 矿脉类型 | 等级范围 | 产出资源 | 稀有度 |
|----------|----------|----------|--------|
| 农田 | Lv.1-6 | 粮食 | 普通 |
| 森林 | Lv.1-6 | 木材 | 普通 |
| 石矿 | Lv.1-6 | 石材 | 普通 |
| 铁矿 | Lv.1-6 | 铁矿 | 较少 |
| 煤矿 | Lv.1-6 | 煤炭 | 较少 |
| 钻石矿 | Lv.3-6 | 钻石 | 稀有 |

- 矿脉等级越高，产出越多，但需要更高战力的部队驻守采集
- 采集需要时间，派遣英雄 + 士兵前往
- 钻石矿刷新少、竞争激烈（联机阶段）

**野怪：**

| 野怪等级 | 难度 | 击杀奖励 |
|----------|------|----------|
| Lv.1-3 | 简单 | 少量资源 + 经验 |
| Lv.4-6 | 中等 | 中量资源 + 经验 + 小概率钻石 |
| Lv.7-10 | 困难 | 大量资源 + 经验 + 英雄碎片 |

- 野怪分布在地图各处，定时刷新
- 击杀需要派遣英雄带兵出征
- 高级野怪掉落英雄碎片，是免费获取英雄的途径

**野外操作流程：**
```
打开野外地图 → 搜索坐标/筛选目标 → 选择矿脉或野怪
→ 选择英雄 + 派遣士兵 → 行军（有行军时间）→ 到达后采集/战斗
→ 采集完成/战斗结束 → 部队返回城堡 → 资源入库
```

---

## 4. 技术架构

### 3.1 整体架构

```
┌─────────────┐     ┌─────────────┐
│  游戏客户端   │────▶│  游戏后端    │
│  PixiJS H5   │◀────│  Spring Boot │
│  (WebView)   │     │             │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │   MySQL     │
                    │   Redis     │
                    └─────────────┘

┌─────────────┐     ┌─────────────┐
│  管理后台     │────▶│  后端共用    │
│  Vue 3       │◀────│  或独立接口  │
└─────────────┘     └─────────────┘
```

### 3.2 技术栈

| 模块 | 技术 | 语言 |
|------|------|------|
| 游戏客户端 | PixiJS + TypeScript | TypeScript |
| Android 包装 | WebView（Android Studio） | Kotlin/Java |
| 鸿蒙包装 | WebView（DevEco Studio） | ArkTS |
| 游戏后端 | Spring Boot 3.x + MyBatis-Plus | Java 17 |
| 数据库 | MySQL 8.0 | SQL |
| 缓存 | Redis 7.x | - |
| 后台管理 | Vue 3 + Element Plus + TypeScript | TypeScript |
| 部署 | Docker + docker-compose + Nginx | YAML |

### 3.3 仓库结构

```
winter-is-coming/
├── client/                    # 游戏客户端（PixiJS + TypeScript）
│   ├── src/
│   │   ├── core/              # 游戏核心引擎（渲染、输入、资源加载）
│   │   ├── scenes/            # 游戏场景（主城、世界地图、战斗）
│   │   ├── ui/                # UI 组件（背包、科技树、建造面板）
│   │   ├── models/            # 数据模型
│   │   ├── network/           # 网络层（HTTP，后续可切 WebSocket）
│   │   ├── config/            # 客户端配置
│   │   └── assets/            # 静态资源（图片、动画、音效）
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
│
├── server/                    # 游戏后端（Spring Boot）
│   ├── src/main/java/
│   │   └── com/winteriscoming/
│   │       ├── controller/    # 接口层
│   │       ├── service/       # 业务层
│   │       ├── mapper/        # 数据访问层
│   │       ├── model/
│   │       │   ├── entity/    # 数据库实体
│   │       │   ├── dto/       # 数据传输对象
│   │       │   └── vo/        # 视图对象
│   │       ├── config/        # 配置类
│   │       ├── common/        # 公共组件（Result、异常处理）
│   │       └── util/          # 工具类
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── mapper/            # MyBatis XML
│   │   └── sql/
│   │       ├── init.sql       # 初始化 SQL
│   │       └── update.sql     # 增量更新 SQL
│   └── pom.xml
│
├── admin/                     # 后台管理系统（Vue 3）
│   ├── src/
│   │   ├── views/             # 页面
│   │   ├── components/        # 组件
│   │   ├── api/               # 接口调用
│   │   ├── router/            # 路由
│   │   └── stores/            # 状态管理
│   └── package.json
│
├── deploy/                    # 部署配置
│   ├── docker-compose.yml
│   ├── Dockerfile.server
│   ├── Dockerfile.admin
│   ├── nginx/
│   │   └── nginx.conf
│   └── mysql/
│       └── init.sql
│
├── docs/                      # 项目文档
│   └── superpowers/specs/
│       └── 2026-06-10-winter-is-coming-design.md
│
└── README.md
```

---

## 5. 后端设计

### 5.1 API 设计原则

- RESTful 风格，只用 GET 和 POST
- URL 带版本号：`/api/v1/`
- 统一返回格式：`Result<T>` { code, msg, data }
- JWT 登录鉴权 + 接口签名校验

### 5.2 核心接口

**用户模块**
- `POST /api/v1/user/register` — 注册
- `POST /api/v1/user/login` — 登录
- `GET /api/v1/user/info` — 获取用户信息

**存档模块**
- `POST /api/v1/save/upload` — 上传存档
- `GET /api/v1/save/download` — 下载存档
- `GET /api/v1/save/list` — 存档列表

**配置模块**
- `GET /api/v1/config/buildings` — 建筑配置表
- `GET /api/v1/config/tech` — 科技树配置
- `GET /api/v1/config/troops` — 兵种配置表
- `GET /api/v1/config/heroes` — 英雄配置表
- `GET /api/v1/config/monsters` — 野怪配置表
- `GET /api/v1/config/mines` — 矿脉配置表
- `GET /api/v1/config/version` — 配置版本号（用于热更判断）

**野外地图模块**
- `GET /api/v1/map/region` — 获取指定区域地图数据（按坐标范围）
- `GET /api/v1/map/search` — 搜索坐标
- `GET /api/v1/map/filter` — 筛选矿脉/野怪

**出征模块**
- `POST /api/v1/march/dispatch` — 派遣部队（采集/打怪）
- `GET /api/v1/march/list` — 当前行军列表
- `POST /api/v1/march/recall` — 召回部队

**英雄模块**
- `POST /api/v1/hero/gacha` — 钻石抽英雄碎片
- `POST /api/v1/hero/upgrade` — 英雄升星
- `GET /api/v1/hero/list` — 我的英雄列表

**皮肤模块**
- `GET /api/v1/skin/list` — 皮肤商店列表
- `POST /api/v1/skin/buy` — 购买皮肤
- `POST /api/v1/skin/equip` — 装备皮肤

**运营模块**
- `GET /api/v1/notice/list` — 公告列表
- `GET /api/v1/version/check` — 版本更新检查

### 5.3 核心数据表

```sql
-- 用户表
CREATE TABLE t_user (
    id BIGINT PRIMARY KEY,
    username VARCHAR(32) NOT NULL,
    password VARCHAR(128) NOT NULL,
    nickname VARCHAR(32),
    avatar VARCHAR(256),
    level INT DEFAULT 1,
    status TINYINT DEFAULT 1,
    last_login_time DATETIME,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 存档表
CREATE TABLE t_game_save (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    save_name VARCHAR(64),
    save_data MEDIUMTEXT NOT NULL,
    game_day INT DEFAULT 1,
    season VARCHAR(16),
    population INT DEFAULT 0,
    save_version INT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 建筑配置表
CREATE TABLE t_config_building (
    id BIGINT PRIMARY KEY,
    building_key VARCHAR(32) NOT NULL,
    building_name VARCHAR(64) NOT NULL,
    category VARCHAR(32),
    max_level INT DEFAULT 10,
    base_cost_grain INT DEFAULT 0,
    base_cost_wood INT DEFAULT 0,
    base_cost_stone INT DEFAULT 0,
    base_cost_iron INT DEFAULT 0,
    build_time_seconds INT DEFAULT 60,
    description VARCHAR(256),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_building_key (building_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 科技配置表
CREATE TABLE t_config_tech (
    id BIGINT PRIMARY KEY,
    tech_key VARCHAR(32) NOT NULL,
    tech_name VARCHAR(64) NOT NULL,
    branch VARCHAR(32),
    level INT DEFAULT 1,
    prerequisite_tech_key VARCHAR(32),
    cost_grain INT DEFAULT 0,
    cost_wood INT DEFAULT 0,
    cost_stone INT DEFAULT 0,
    cost_iron INT DEFAULT 0,
    research_time_seconds INT DEFAULT 120,
    effect_description VARCHAR(256),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tech_key (tech_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 英雄配置表
CREATE TABLE t_config_hero (
    id BIGINT PRIMARY KEY,
    hero_key VARCHAR(32) NOT NULL,
    hero_name VARCHAR(64) NOT NULL,
    quality VARCHAR(16) NOT NULL COMMENT '品质：green/blue/purple/orange',
    base_attack INT DEFAULT 0,
    base_defense INT DEFAULT 0,
    base_gather_speed INT DEFAULT 100 COMMENT '采集速度百分比',
    base_troop_capacity INT DEFAULT 100 COMMENT '带兵上限',
    fragment_to_unlock INT DEFAULT 10 COMMENT '解锁所需碎片数',
    fragment_per_star INT DEFAULT 20 COMMENT '每次升星所需碎片数',
    max_star INT DEFAULT 5,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_hero_key (hero_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 英雄技能配置表
CREATE TABLE t_config_hero_skill (
    id BIGINT PRIMARY KEY,
    hero_key VARCHAR(32) NOT NULL COMMENT '所属英雄',
    skill_key VARCHAR(32) NOT NULL,
    skill_name VARCHAR(64) NOT NULL,
    skill_type VARCHAR(16) NOT NULL COMMENT 'passive/active',
    effect_type VARCHAR(32) NOT NULL COMMENT 'atk_boost/def_boost/gather_boost/crit_boost/hp_boost/carry_boost/speed_boost',
    effect_value INT DEFAULT 0 COMMENT '效果数值（百分比）',
    unlock_star INT DEFAULT 1 COMMENT '解锁所需星级：1/3/5',
    description VARCHAR(256),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_skill_key (skill_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 兵种配置表
CREATE TABLE t_config_troop (
    id BIGINT PRIMARY KEY,
    troop_key VARCHAR(32) NOT NULL,
    troop_name VARCHAR(64) NOT NULL,
    level INT DEFAULT 1 COMMENT '兵种等级 1-4',
    hp INT DEFAULT 100 COMMENT '生命值',
    attack INT DEFAULT 10 COMMENT '攻击力',
    defense INT DEFAULT 5 COMMENT '防御力',
    gather_ability INT DEFAULT 10 COMMENT '采矿能力',
    attack_speed DECIMAL(3,1) DEFAULT 1.0 COMMENT '攻击速度',
    crit_chance INT DEFAULT 5 COMMENT '暴击几率百分比',
    carry_capacity INT DEFAULT 50 COMMENT '负重',
    cost_grain INT DEFAULT 0,
    cost_iron INT DEFAULT 0,
    cost_coal INT DEFAULT 0,
    train_time_seconds INT DEFAULT 60,
    upgrade_troop_key VARCHAR(32) COMMENT '升级后的兵种key',
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_troop_key (troop_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 皮肤配置表
CREATE TABLE t_config_skin (
    id BIGINT PRIMARY KEY,
    skin_key VARCHAR(32) NOT NULL,
    skin_name VARCHAR(64) NOT NULL,
    skin_type VARCHAR(16) NOT NULL COMMENT 'castle/march',
    quality VARCHAR(16) NOT NULL COMMENT '品质',
    buff_type VARCHAR(32) COMMENT '加成类型：atk/def/gather/hp/crit/speed，可为空',
    buff_value INT DEFAULT 0 COMMENT '加成数值（百分比）',
    price_diamond INT DEFAULT 0 COMMENT '钻石价格，0为免费或活动获取',
    description VARCHAR(256),
    obtain_way VARCHAR(32) DEFAULT 'shop' COMMENT 'default/shop/event',
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_skin_key (skin_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 野怪配置表
CREATE TABLE t_config_monster (
    id BIGINT PRIMARY KEY,
    monster_key VARCHAR(32) NOT NULL,
    monster_name VARCHAR(64) NOT NULL,
    level INT DEFAULT 1,
    attack INT DEFAULT 0,
    defense INT DEFAULT 0,
    hp INT DEFAULT 100,
    reward_grain INT DEFAULT 0,
    reward_wood INT DEFAULT 0,
    reward_stone INT DEFAULT 0,
    reward_iron INT DEFAULT 0,
    reward_diamond INT DEFAULT 0,
    reward_exp INT DEFAULT 0,
    drop_hero_fragment VARCHAR(32) COMMENT '掉落英雄碎片key，可为空',
    drop_fragment_chance INT DEFAULT 0 COMMENT '掉落概率万分比',
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_monster_key (monster_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 矿脉配置表
CREATE TABLE t_config_mine (
    id BIGINT PRIMARY KEY,
    mine_key VARCHAR(32) NOT NULL,
    mine_name VARCHAR(64) NOT NULL,
    mine_type VARCHAR(16) NOT NULL COMMENT 'food/wood/stone/iron/coal/diamond',
    level INT DEFAULT 1,
    output_per_hour INT DEFAULT 100,
    capacity INT DEFAULT 1000 COMMENT '矿脉总储量',
    min_troop_power INT DEFAULT 0 COMMENT '最低部队战力要求',
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_mine_key (mine_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 公告表
CREATE TABLE t_notice (
    id BIGINT PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    content TEXT,
    notice_type TINYINT DEFAULT 1,
    start_time DATETIME,
    end_time DATETIME,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

---

## 6. 客户端设计

### 6.1 渲染引擎

- 使用 PixiJS 8.x 作为 2D 渲染引擎
- 城堡内部：等距视角（Isometric）实现 2.5D 效果
- 野外地图：俯视坐标制地图，支持缩放和拖拽
- 两个场景支持一键切换

### 6.2 核心模块

| 模块 | 职责 |
|------|------|
| IsometricMap | 城堡等距地图渲染、坐标转换、地块管理 |
| WorldMap | 野外坐标地图、小地图、筛选、搜索 |
| BuildingManager | 建筑放置、升级、拆除、动画 |
| ResourceManager | 资源计算、产出、消耗（含钻石） |
| PopulationManager | 人口分配、岗位管理 |
| TroopManager | 兵种训练、升级、部队编制 |
| HeroManager | 英雄抽取、升星、装备、技能 |
| MarchManager | 出征调度、行军状态、采集/战斗结算 |
| TechTree | 科技树 UI 与逻辑 |
| SeasonSystem | 季节轮转、天气视觉效果（飘雪/落叶/花开） |
| VFXManager | 环境动画（炊烟、水流、光影、粒子特效） |
| SaveManager | 本地存档 + 云端同步 |
| NetworkManager | HTTP 请求封装（后续可切 WebSocket） |
| UIManager | HUD、弹窗、菜单、背包 |

### 6.3 场景流程

```
启动 → 登录/注册 → 主界面
                      │
              ┌───────┴───────┐
              ▼               ▼
        城堡内部           野外地图
        ├── 建造面板       ├── 坐标搜索
        ├── 科技树         ├── 小地图
        ├── 人口管理       ├── 矿脉筛选
        ├── 兵营（训练）   ├── 野怪筛选
        ├── 英雄殿堂       ├── 派兵采集
        ├── 资源总览       └── 派兵打怪
        └── 设置 / 存档
```

---

## 7. 后台管理系统

### 6.1 功能模块

| 模块 | 功能 |
|------|------|
| 数据总览 | 注册数、活跃数、留存率 |
| 玩家管理 | 查看/封禁/解封玩家 |
| 配置管理 | 建筑/科技/兵种/英雄/英雄技能/野怪/矿脉/皮肤配表的 CRUD |
| 公告管理 | 发布/编辑/下架游戏公告 |
| 存档管理 | 查看玩家存档、异常数据排查 |
| 版本管理 | 客户端版本、强制更新控制 |

---

## 8. 部署架构

### 7.1 服务器

- 腾讯云轻量应用服务器
- 配置：2 核 4G 5M 带宽 60G SSD
- 系统：CentOS Stream 9（Docker 26 预装）
- IP：42.193.181.54

### 7.2 Docker 容器编排

| 容器 | 端口 | 内存限制 |
|------|------|----------|
| nginx | 80, 443 | 64M |
| game-server | 8080 | 512M |
| admin-server | 8081 | 384M |
| mysql | 3306 | 1G |
| redis | 6379 | 256M |

### 7.3 更新部署流程

```
本地改代码 → git push → SSH 到服务器 → git pull → docker-compose build → docker-compose up -d
```

---

## 9. 开发阶段规划

### 第一阶段：基础框架（1-2 周）

- 初始化项目结构（server / client / admin / deploy）
- 后端：Spring Boot 骨架、数据库初始化、用户注册登录
- 客户端：PixiJS 引擎初始化、等距地图渲染、基础 UI
- 部署：docker-compose 环境搭建
- **里程碑：能在浏览器看到一个可滚动的等距地图**

### 第二阶段：城堡核心玩法（3-4 周）

- 建筑系统：放置、升级、产出
- 资源系统：6 种资源的采集、消耗、存储
- 人口系统：分配岗位、人口增长
- 兵种系统：兵营训练、兵种升级
- 季节系统：春夏秋冬轮转、冬季挑战
- 存档系统：本地存档 + 云端同步
- **里程碑：城堡内能建造、训练、度过春→冬循环**

### 第三阶段：野外地图 + 英雄系统（3-4 周）

- 野外坐标地图：拖拽、缩放、小地图
- 坐标搜索 + 矿脉/野怪筛选
- 矿脉采集：派遣英雄+士兵 → 行军 → 采集 → 返回
- 野怪战斗：自动战斗结算
- 英雄系统：钻石抽碎片、碎片合成、升星
- **里程碑：能切换城堡/野外，派兵采集和打怪**

### 第四阶段：视觉打磨（2-3 周）

- 精美视觉效果：环境动画、粒子特效、昼夜光影
- 季节视觉：飘雪、落叶、花开、绿荫
- 建筑动画：建造过渡、升级变化、炊烟水流
- 行军动画、战斗特效
- 音效配合
- **里程碑：画面漂亮，视觉体验拉满**

### 第五阶段：科技树 + 管理后台（2-3 周）

- 科技树完整实现
- Vue 3 管理后台搭建
- 配置管理：建筑/科技/兵种/英雄/野怪/矿脉配表
- 玩家管理、公告管理、数据统计
- **里程碑：游戏内容完整，运营可通过后台管理**

### 第六阶段：移动端打包（1-2 周）

- Android WebView 壳应用
- 鸿蒙 WebView 壳应用
- 移动端适配（触摸操作、屏幕适配）
- **里程碑：手机上能玩**

### 第七阶段：联机扩展（未来）

- WebSocket 实时通信
- 联盟系统
- PVP / 排行榜
- 应用商店上架

---

## 10. 开发规范

### 9.1 后端规范

- 分层：Controller → Service → Mapper，禁止跨层调用
- 命名：严格驼峰，不照抄数据库列名
- HTTP 方法：只用 GET 和 POST
- 返回格式：统一 `Result<T>`（code / msg / data）
- 异常处理：全局 `@RestControllerAdvice`，业务异常用 `BizException`
- 时间字段：`create_time` / `update_time` 由数据库维护
- 游戏配置：全部走数据库配表，不硬编码
- 接口版本化：`/api/v1/`
- 安全：JWT 鉴权 + 接口签名校验

### 9.2 数据库规范

- 字符集：`ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`
- 禁止外键，关联只在代码层维护
- 主键：雪花算法 bigint
- 只增不删，DROP / DELETE / TRUNCATE 需确认
- 幂等 DDL：用 PREPARE 动态 SQL
- 版本管理：`update.sql` 新版本追加到最后

### 9.3 客户端规范

- 网络层统一封装，后续可切 WebSocket
- 本地 SQLite 存离线存档
- 游戏配置从服务端热更
- 资源按模块分目录，按需加载

### 9.4 Git 工作流

- 分支：`main`（稳定）→ `dev`（开发）→ `feature/*`（功能分支）
- 提交：commit → push → 更新 memory
- commit 信息：中文，简明扼要
