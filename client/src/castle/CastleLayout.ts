/**
 * 建筑槽位配置 — 定义城堡内每个建筑槽位的位置和允许建造的建筑类型
 *
 * 布局说明：
 * - 城堡采用等距菱形网格，中心是熔炉（核心建筑）
 * - 其他建筑围绕熔炉分布在固定槽位上
 * - 槽位使用网格坐标(gridRow, gridCol)，渲染时转为等距坐标
 * - category 决定该槽位能放什么类型的建筑
 */

/** 建筑分类 */
export type BuildingCategory = 'core' | 'resource' | 'military' | 'function';

/** 单个槽位配置 */
export interface SlotConfig {
    /** 槽位唯一标识 */
    slotId: number;
    /** 网格行坐标 */
    gridRow: number;
    /** 网格列坐标 */
    gridCol: number;
    /** 允许的建筑分类 */
    category: BuildingCategory;
    /** 默认建筑key（新手初始化用，null表示空槽位） */
    defaultBuildingKey: string | null;
    /** 槽位显示名（空槽位时显示） */
    label: string;
}

/**
 * 城堡布局配置
 *
 * 网格坐标系：以熔炉(4,4)为中心，整个城堡占 9x9 的区域
 * 等距渲染时 tileWidth=80, tileHeight=40
 */
export const CASTLE_TILE_WIDTH = 80;
export const CASTLE_TILE_HEIGHT = 40;

/** 城堡全部槽位定义（16 个建筑槽位） */
export const CASTLE_SLOTS: SlotConfig[] = [
    // === 核心建筑：熔炉（中心位置） ===
    { slotId: 0,  gridRow: 4, gridCol: 4, category: 'core',     defaultBuildingKey: 'furnace',     label: '熔炉' },

    // === 资源建筑：靠近上方和左侧 ===
    { slotId: 1,  gridRow: 2, gridCol: 3, category: 'resource',  defaultBuildingKey: null, label: '资源区' },
    { slotId: 2,  gridRow: 2, gridCol: 5, category: 'resource',  defaultBuildingKey: null, label: '资源区' },
    { slotId: 3,  gridRow: 3, gridCol: 2, category: 'resource',  defaultBuildingKey: null, label: '资源区' },
    { slotId: 4,  gridRow: 3, gridCol: 6, category: 'resource',  defaultBuildingKey: null, label: '资源区' },
    { slotId: 5,  gridRow: 5, gridCol: 2, category: 'resource',  defaultBuildingKey: null, label: '资源区' },

    // === 军事建筑：右侧区域 ===
    { slotId: 6,  gridRow: 5, gridCol: 6, category: 'military',  defaultBuildingKey: null, label: '军事区' },
    { slotId: 7,  gridRow: 6, gridCol: 5, category: 'military',  defaultBuildingKey: null, label: '军事区' },
    { slotId: 8,  gridRow: 6, gridCol: 3, category: 'military',  defaultBuildingKey: null, label: '军事区' },

    // === 功能建筑：外围区域 ===
    { slotId: 9,  gridRow: 1, gridCol: 4, category: 'function',  defaultBuildingKey: null, label: '功能区' },
    { slotId: 10, gridRow: 3, gridCol: 4, category: 'function',  defaultBuildingKey: null, label: '功能区' },
    { slotId: 11, gridRow: 4, gridCol: 2, category: 'function',  defaultBuildingKey: null, label: '功能区' },
    { slotId: 12, gridRow: 4, gridCol: 6, category: 'function',  defaultBuildingKey: null, label: '功能区' },
    { slotId: 13, gridRow: 5, gridCol: 4, category: 'function',  defaultBuildingKey: null, label: '功能区' },
    { slotId: 14, gridRow: 7, gridCol: 4, category: 'function',  defaultBuildingKey: null, label: '功能区' },
    { slotId: 15, gridRow: 1, gridCol: 2, category: 'function',  defaultBuildingKey: null, label: '功能区' },
];

/**
 * 网格坐标 → 等距投影坐标
 */
export function gridToIso(row: number, col: number): { x: number; y: number } {
    const x = (col - row) * (CASTLE_TILE_WIDTH / 2);
    const y = (col + row) * (CASTLE_TILE_HEIGHT / 2);
    return { x, y };
}

/**
 * 获取城堡地图的中心等距坐标（熔炉位置）
 */
export function getCastleCenter(): { x: number; y: number } {
    return gridToIso(4, 4);
}
