-- ============================================
-- 冷冬将至 - 数据库初始化脚本
-- ============================================

CREATE DATABASE IF NOT EXISTS winter_is_coming
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE winter_is_coming;

-- 用户表
CREATE TABLE IF NOT EXISTS t_user (
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
CREATE TABLE IF NOT EXISTS t_game_save (
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
CREATE TABLE IF NOT EXISTS t_config_building (
    id BIGINT PRIMARY KEY,
    building_key VARCHAR(32) NOT NULL,
    building_name VARCHAR(64) NOT NULL,
    category VARCHAR(32),
    max_level INT DEFAULT 10,
    base_cost_grain INT DEFAULT 0,
    base_cost_wood INT DEFAULT 0,
    base_cost_stone INT DEFAULT 0,
    base_cost_iron INT DEFAULT 0,
    base_cost_coal INT DEFAULT 0 COMMENT '基础升级消耗煤炭',
    build_time_seconds INT DEFAULT 60,
    unlock_furnace_level INT DEFAULT 0 COMMENT '解锁所需熔炉等级',
    max_count INT DEFAULT 1 COMMENT '最大建造数量',
    production_resource VARCHAR(16) DEFAULT NULL COMMENT '产出资源类型：grain/wood/stone/iron/coal',
    base_production_per_hour INT DEFAULT 0 COMMENT '基础每小时产出量',
    description VARCHAR(256),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_building_key (building_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 建筑升级配置表（每级的具体消耗/时间/产出）
CREATE TABLE IF NOT EXISTS t_config_building_level (
    id BIGINT PRIMARY KEY,
    building_key VARCHAR(32) NOT NULL COMMENT '建筑key',
    level INT NOT NULL COMMENT '建筑等级',
    cost_grain INT DEFAULT 0 COMMENT '升级消耗粮食',
    cost_wood INT DEFAULT 0 COMMENT '升级消耗木材',
    cost_stone INT DEFAULT 0 COMMENT '升级消耗石材',
    cost_iron INT DEFAULT 0 COMMENT '升级消耗铁矿',
    cost_coal INT DEFAULT 0 COMMENT '升级消耗煤炭',
    upgrade_time_seconds INT DEFAULT 60 COMMENT '升级耗时（秒）',
    production_per_hour INT DEFAULT 0 COMMENT '该等级每小时产出',
    hp_bonus INT DEFAULT 0 COMMENT '生命加成（城墙等）',
    capacity_bonus INT DEFAULT 0 COMMENT '容量加成（仓库等）',
    require_furnace_level INT DEFAULT 0 COMMENT '升到该级需要的熔炉等级',
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_building_level (building_key, level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 用户建筑表（用户已建造的建筑实例）
CREATE TABLE IF NOT EXISTS t_user_building (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    building_key VARCHAR(32) NOT NULL COMMENT '建筑key',
    level INT DEFAULT 0 COMMENT '建筑等级',
    position_index INT DEFAULT 0 COMMENT '槽位编号',
    status TINYINT DEFAULT 1 COMMENT '状态：1正常 2升级中',
    upgrade_end_time DATETIME DEFAULT NULL COMMENT '升级完成时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 用户资源表
CREATE TABLE IF NOT EXISTS t_user_resource (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    grain INT DEFAULT 0 COMMENT '粮食',
    wood INT DEFAULT 0 COMMENT '木材',
    stone INT DEFAULT 0 COMMENT '石材',
    iron INT DEFAULT 0 COMMENT '铁矿',
    coal INT DEFAULT 0 COMMENT '煤炭',
    diamond INT DEFAULT 0 COMMENT '钻石',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 科技配置表
CREATE TABLE IF NOT EXISTS t_config_tech (
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
CREATE TABLE IF NOT EXISTS t_config_hero (
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
CREATE TABLE IF NOT EXISTS t_config_hero_skill (
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
CREATE TABLE IF NOT EXISTS t_config_troop (
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
CREATE TABLE IF NOT EXISTS t_config_skin (
    id BIGINT PRIMARY KEY,
    skin_key VARCHAR(32) NOT NULL,
    skin_name VARCHAR(64) NOT NULL,
    skin_type VARCHAR(16) NOT NULL COMMENT 'castle/march',
    quality VARCHAR(16) NOT NULL COMMENT '品质',
    buff_type VARCHAR(32) COMMENT '加成类型：atk/def/gather/hp/crit/speed',
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
CREATE TABLE IF NOT EXISTS t_config_monster (
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
    drop_hero_fragment VARCHAR(32) COMMENT '掉落英雄碎片key',
    drop_fragment_chance INT DEFAULT 0 COMMENT '掉落概率万分比',
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_monster_key (monster_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 矿脉配置表
CREATE TABLE IF NOT EXISTS t_config_mine (
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
CREATE TABLE IF NOT EXISTS t_notice (
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
