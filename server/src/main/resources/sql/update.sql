-- ============================================
-- 冷冬将至 - 数据库增量更新脚本
-- 新版本追加到最后，禁止插入到前面
-- ============================================

-- v1.0.0 初始版本，无增量

-- ============================================
-- v1.1.0 第二阶段：城堡建筑系统
-- ============================================

-- 1. t_config_building 扩展字段：解锁熔炉等级
SET @exist = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_config_building' AND COLUMN_NAME = 'unlock_furnace_level');
SET @sql = IF(@exist = 0, 'ALTER TABLE t_config_building ADD COLUMN unlock_furnace_level INT DEFAULT 0 COMMENT ''解锁所需熔炉等级''', 'SELECT 1');
PREPARE _stmt FROM @sql; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- 2. t_config_building 扩展字段：最大建造数量
SET @exist = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_config_building' AND COLUMN_NAME = 'max_count');
SET @sql = IF(@exist = 0, 'ALTER TABLE t_config_building ADD COLUMN max_count INT DEFAULT 1 COMMENT ''最大建造数量''', 'SELECT 1');
PREPARE _stmt FROM @sql; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- 3. t_config_building 扩展字段：产出资源类型
SET @exist = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_config_building' AND COLUMN_NAME = 'production_resource');
SET @sql = IF(@exist = 0, 'ALTER TABLE t_config_building ADD COLUMN production_resource VARCHAR(16) DEFAULT NULL COMMENT ''产出资源类型：grain/wood/stone/iron/coal''', 'SELECT 1');
PREPARE _stmt FROM @sql; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- 4. t_config_building 扩展字段：基础每小时产出
SET @exist = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_config_building' AND COLUMN_NAME = 'base_production_per_hour');
SET @sql = IF(@exist = 0, 'ALTER TABLE t_config_building ADD COLUMN base_production_per_hour INT DEFAULT 0 COMMENT ''基础每小时产出量''', 'SELECT 1');
PREPARE _stmt FROM @sql; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- 5. t_config_building 扩展字段：升级消耗煤炭
SET @exist = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_config_building' AND COLUMN_NAME = 'base_cost_coal');
SET @sql = IF(@exist = 0, 'ALTER TABLE t_config_building ADD COLUMN base_cost_coal INT DEFAULT 0 COMMENT ''基础升级消耗煤炭''', 'SELECT 1');
PREPARE _stmt FROM @sql; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- 6. 建筑升级配置表（每级的具体消耗/时间/产出）
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
    hp_bonus INT DEFAULT 0 COMMENT '生命加成（城墙/住宅等）',
    capacity_bonus INT DEFAULT 0 COMMENT '容量加成（仓库等）',
    require_furnace_level INT DEFAULT 0 COMMENT '升到该级需要的熔炉等级',
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_building_level (building_key, level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. 用户建筑表（用户已建造的建筑实例）
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

-- 8. 用户资源表
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

-- ============================================
-- 9. 插入16种建筑配置数据（幂等：INSERT IGNORE）
-- ============================================

INSERT IGNORE INTO t_config_building (id, building_key, building_name, category, max_level, base_cost_grain, base_cost_wood, base_cost_stone, base_cost_iron, base_cost_coal, build_time_seconds, unlock_furnace_level, max_count, production_resource, base_production_per_hour, description, status) VALUES
-- 核心建筑
(1, 'furnace',        '熔炉',     'core',     30, 100, 100, 0,   0,  0,  60,  0, 1, NULL,    0,   '城堡核心，升级解锁其他建筑', 1),
-- 资源建筑
(2, 'hunter_hut',     '猎人小屋', 'resource', 30, 80,  50,  0,   0,  0,  30,  1, 3, 'grain', 100, '派出猎人采集食物',           1),
(3, 'lumber_camp',    '伐木场',   'resource', 30, 50,  80,  0,   0,  0,  30,  1, 3, 'wood',  100, '伐木工人采集木材',           1),
(4, 'quarry',         '采石场',   'resource', 30, 80,  80,  50,  0,  0,  45,  3, 2, 'stone', 80,  '开采石材',                   1),
(5, 'iron_works',     '炼铁厂',   'resource', 30, 100, 100, 80,  50, 0,  60,  5, 2, 'iron',  60,  '冶炼铁矿',                   1),
(6, 'coal_mine',      '煤矿',     'resource', 30, 120, 120, 100, 80, 0,  90,  8, 2, 'coal',  50,  '开采煤炭',                   1),
-- 军事建筑
(7, 'shield_camp',    '盾兵营',   'military', 30, 100, 80,  50,  0,  0,  60,  2, 1, NULL,    0,   '训练盾兵，高生命高防御',     1),
(8, 'spear_camp',     '矛兵营',   'military', 30, 80,  100, 80,  50, 0,  60,  4, 1, NULL,    0,   '训练矛兵，近战输出',         1),
(9, 'archer_camp',    '射手营',   'military', 30, 80,  120, 100, 80, 0,  90,  7, 1, NULL,    0,   '训练射手，远程输出',         1),
-- 功能建筑
(10, 'hero_hall',     '英雄大厅', 'function', 30, 120, 100, 80,  0,  0,  90,  3, 1, NULL,    0,   '英雄招募、升星、管理',       1),
(11, 'warehouse',     '仓库',     'function', 30, 80,  80,  50,  0,  0,  30,  1, 1, NULL,    0,   '提高资源存储上限',           1),
(12, 'wall',          '城墙',     'function', 30, 50,  50,  100, 50, 0,  60,  2, 1, NULL,    0,   '提升城堡防御值',             1),
(13, 'institute',     '研究所',   'function', 30, 100, 100, 100, 50, 0,  90,  4, 1, NULL,    0,   '研发科技树',                 1),
(14, 'lighthouse',    '灯塔',     'function', 30, 80,  80,  80,  50, 0,  60,  5, 1, NULL,    0,   '扩大野外侦查范围',           1),
(15, 'residence',     '住宅',     'function', 30, 60,  60,  0,   0,  0,  30,  1, 1, NULL,    0,   '提高人口上限',               1),
(16, 'hospital',      '医院',     'function', 30, 100, 80,  60,  0,  0,  60,  3, 1, NULL,    0,   '治疗受伤士兵',               1),
(17, 'crystal_lab',   '炼晶实验室','function', 30, 200, 200, 200, 100,50, 120, 10, 1, NULL,   0,   '钻石合成与加工',             1);

-- ============================================
-- 10. 插入建筑升级配置（Lv.0 → Lv.5，消耗按1.5倍递增）
-- ============================================

-- 熔炉升级配置
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(101, 'furnace', 1, 100,  100,  0,    0,   0,  10,   0, 0),
(102, 'furnace', 2, 150,  150,  50,   0,   0,  30,   0, 0),
(103, 'furnace', 3, 225,  225,  75,   0,   0,  60,   0, 0),
(104, 'furnace', 4, 340,  340,  115,  50,  0,  120,  0, 0),
(105, 'furnace', 5, 510,  510,  170,  75,  0,  180,  0, 0);

-- 猎人小屋升级配置（产出粮食）
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(201, 'hunter_hut', 1, 80,   50,   0,    0,   0,  10,   100, 1),
(202, 'hunter_hut', 2, 120,  75,   0,    0,   0,  20,   150, 1),
(203, 'hunter_hut', 3, 180,  115,  0,    0,   0,  40,   225, 2),
(204, 'hunter_hut', 4, 270,  170,  50,   0,   0,  80,   340, 3),
(205, 'hunter_hut', 5, 405,  255,  75,   0,   0,  120,  510, 4);

-- 伐木场升级配置（产出木材）
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(301, 'lumber_camp', 1, 50,   80,   0,    0,   0,  10,   100, 1),
(302, 'lumber_camp', 2, 75,   120,  0,    0,   0,  20,   150, 1),
(303, 'lumber_camp', 3, 115,  180,  0,    0,   0,  40,   225, 2),
(304, 'lumber_camp', 4, 170,  270,  50,   0,   0,  80,   340, 3),
(305, 'lumber_camp', 5, 255,  405,  75,   0,   0,  120,  510, 4);

-- 采石场升级配置（产出石材）
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(401, 'quarry', 1, 80,   80,   50,   0,   0,  15,   80,  3),
(402, 'quarry', 2, 120,  120,  75,   0,   0,  30,   120, 3),
(403, 'quarry', 3, 180,  180,  115,  0,   0,  60,   180, 4),
(404, 'quarry', 4, 270,  270,  170,  50,  0,  90,   270, 5),
(405, 'quarry', 5, 405,  405,  255,  75,  0,  150,  405, 5);

-- 炼铁厂升级配置（产出铁矿）
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(501, 'iron_works', 1, 100,  100,  80,   50,  0,  20,   60,  5),
(502, 'iron_works', 2, 150,  150,  120,  75,  0,  40,   90,  5),
(503, 'iron_works', 3, 225,  225,  180,  115, 0,  80,   135, 6),
(504, 'iron_works', 4, 340,  340,  270,  170, 0,  120,  200, 7),
(505, 'iron_works', 5, 510,  510,  405,  255, 0,  180,  300, 8);

-- 煤矿升级配置（产出煤炭）
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(601, 'coal_mine', 1, 120,  120,  100,  80,  0,  30,   50,  8),
(602, 'coal_mine', 2, 180,  180,  150,  120, 0,  60,   75,  8),
(603, 'coal_mine', 3, 270,  270,  225,  180, 0,  90,   115, 9),
(604, 'coal_mine', 4, 405,  405,  340,  270, 0,  150,  170, 10),
(605, 'coal_mine', 5, 600,  600,  510,  405, 50, 210,  255, 10);

-- 盾兵营升级配置
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(701, 'shield_camp', 1, 100,  80,   50,   0,   0,  20,   0, 2),
(702, 'shield_camp', 2, 150,  120,  75,   0,   0,  40,   0, 3),
(703, 'shield_camp', 3, 225,  180,  115,  50,  0,  60,   0, 4),
(704, 'shield_camp', 4, 340,  270,  170,  75,  0,  120,  0, 5),
(705, 'shield_camp', 5, 510,  405,  255,  115, 0,  180,  0, 6);

-- 矛兵营升级配置
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(801, 'spear_camp', 1, 80,   100,  80,   50,  0,  20,   0, 4),
(802, 'spear_camp', 2, 120,  150,  120,  75,  0,  40,   0, 4),
(803, 'spear_camp', 3, 180,  225,  180,  115, 0,  60,   0, 5),
(804, 'spear_camp', 4, 270,  340,  270,  170, 0,  120,  0, 6),
(805, 'spear_camp', 5, 405,  510,  405,  255, 0,  180,  0, 7);

-- 射手营升级配置
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(901, 'archer_camp', 1, 80,   120,  100,  80,  0,  30,   0, 7),
(902, 'archer_camp', 2, 120,  180,  150,  120, 0,  60,   0, 7),
(903, 'archer_camp', 3, 180,  270,  225,  180, 0,  90,   0, 8),
(904, 'archer_camp', 4, 270,  405,  340,  270, 0,  150,  0, 9),
(905, 'archer_camp', 5, 405,  600,  510,  405, 0,  210,  0, 10);

-- 英雄大厅升级配置
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(1001, 'hero_hall', 1, 120,  100,  80,   0,   0,  30,   0, 3),
(1002, 'hero_hall', 2, 180,  150,  120,  0,   0,  60,   0, 4),
(1003, 'hero_hall', 3, 270,  225,  180,  50,  0,  90,   0, 5),
(1004, 'hero_hall', 4, 405,  340,  270,  75,  0,  150,  0, 6),
(1005, 'hero_hall', 5, 600,  510,  405,  115, 0,  210,  0, 8);

-- 仓库升级配置（capacity_bonus 表示存储上限加成）
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, capacity_bonus, require_furnace_level) VALUES
(1101, 'warehouse', 1, 80,   80,   50,   0,   0,  10,   0, 5000,  1),
(1102, 'warehouse', 2, 120,  120,  75,   0,   0,  20,   0, 10000, 2),
(1103, 'warehouse', 3, 180,  180,  115,  0,   0,  40,   0, 20000, 3),
(1104, 'warehouse', 4, 270,  270,  170,  50,  0,  80,   0, 35000, 4),
(1105, 'warehouse', 5, 405,  405,  255,  75,  0,  120,  0, 50000, 5);

-- 城墙升级配置（hp_bonus 表示防御值加成）
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, hp_bonus, require_furnace_level) VALUES
(1201, 'wall', 1, 50,   50,   100,  50,  0,  20,   0, 500,  2),
(1202, 'wall', 2, 75,   75,   150,  75,  0,  40,   0, 1000, 3),
(1203, 'wall', 3, 115,  115,  225,  115, 0,  60,   0, 2000, 4),
(1204, 'wall', 4, 170,  170,  340,  170, 0,  120,  0, 3500, 5),
(1205, 'wall', 5, 255,  255,  510,  255, 0,  180,  0, 5000, 6);

-- 研究所升级配置
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(1301, 'institute', 1, 100,  100,  100,  50,  0,  30,   0, 4),
(1302, 'institute', 2, 150,  150,  150,  75,  0,  60,   0, 5),
(1303, 'institute', 3, 225,  225,  225,  115, 0,  90,   0, 6),
(1304, 'institute', 4, 340,  340,  340,  170, 0,  150,  0, 7),
(1305, 'institute', 5, 510,  510,  510,  255, 0,  210,  0, 8);

-- 灯塔升级配置
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(1401, 'lighthouse', 1, 80,   80,   80,   50,  0,  20,   0, 5),
(1402, 'lighthouse', 2, 120,  120,  120,  75,  0,  40,   0, 6),
(1403, 'lighthouse', 3, 180,  180,  180,  115, 0,  60,   0, 7),
(1404, 'lighthouse', 4, 270,  270,  270,  170, 0,  120,  0, 8),
(1405, 'lighthouse', 5, 405,  405,  405,  255, 0,  180,  0, 9);

-- 住宅升级配置（capacity_bonus 表示人口上限加成）
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, capacity_bonus, require_furnace_level) VALUES
(1501, 'residence', 1, 60,   60,   0,    0,   0,  10,   0, 50,  1),
(1502, 'residence', 2, 90,   90,   0,    0,   0,  20,   0, 100, 2),
(1503, 'residence', 3, 135,  135,  50,   0,   0,  40,   0, 200, 3),
(1504, 'residence', 4, 200,  200,  75,   0,   0,  80,   0, 350, 4),
(1505, 'residence', 5, 300,  300,  115,  0,   0,  120,  0, 500, 5);

-- 医院升级配置（capacity_bonus 表示治疗容量）
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, capacity_bonus, require_furnace_level) VALUES
(1601, 'hospital', 1, 100,  80,   60,   0,   0,  20,   0, 100, 3),
(1602, 'hospital', 2, 150,  120,  90,   0,   0,  40,   0, 200, 4),
(1603, 'hospital', 3, 225,  180,  135,  50,  0,  60,   0, 350, 5),
(1604, 'hospital', 4, 340,  270,  200,  75,  0,  120,  0, 500, 6),
(1605, 'hospital', 5, 510,  405,  300,  115, 0,  180,  0, 750, 7);

-- 炼晶实验室升级配置
INSERT IGNORE INTO t_config_building_level (id, building_key, level, cost_grain, cost_wood, cost_stone, cost_iron, cost_coal, upgrade_time_seconds, production_per_hour, require_furnace_level) VALUES
(1701, 'crystal_lab', 1, 200,  200,  200,  100, 50,  60,   0, 10),
(1702, 'crystal_lab', 2, 300,  300,  300,  150, 75,  120,  0, 11),
(1703, 'crystal_lab', 3, 450,  450,  450,  225, 115, 180,  0, 12),
(1704, 'crystal_lab', 4, 675,  675,  675,  340, 170, 240,  0, 13),
(1705, 'crystal_lab', 5, 1000, 1000, 1000, 510, 255, 300,  0, 15);
