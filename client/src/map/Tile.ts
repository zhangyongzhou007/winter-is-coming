/**
 * 地块类型枚举
 */
export enum TileType {
    GRASS = 'grass',
    FOREST = 'forest',
    STONE = 'stone',
    WATER = 'water',
    MOUNTAIN = 'mountain',
}

/**
 * 单个地块
 */
export class Tile {
    public readonly row: number;
    public readonly col: number;
    public type: TileType;

    constructor(row: number, col: number, type: TileType) {
        this.row = row;
        this.col = col;
        this.type = type;
    }

    /**
     * 获取地块对应颜色
     */
    public getColor(): number {
        switch (this.type) {
            case TileType.GRASS:
                return 0x4a7c59;    // 草地绿
            case TileType.FOREST:
                return 0x2d5a27;    // 深森林绿
            case TileType.STONE:
                return 0x8a8a8a;    // 灰色石头
            case TileType.WATER:
                return 0x3a6ea5;    // 水蓝色
            case TileType.MOUNTAIN:
                return 0x6b5b4a;    // 棕色山地
            default:
                return 0x4a7c59;
        }
    }
}
