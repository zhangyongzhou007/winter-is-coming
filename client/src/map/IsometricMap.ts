import { Container, Graphics } from 'pixi.js';
import { Tile, TileType } from './Tile';

/**
 * 等距地图核心 - 2.5D 菱形网格渲染
 */
export class IsometricMap extends Container {
    /** 地图行列数 */
    public readonly rows: number;
    public readonly cols: number;

    /** 单个地块的宽高（等距投影后） */
    public readonly tileWidth = 64;
    public readonly tileHeight = 32;

    /** 地块二维数组 */
    private tiles: Tile[][] = [];

    /** 地块图形容器 */
    private tileContainer: Container;

    /** 网格线容器 */
    private gridContainer: Container;

    constructor(rows: number = 20, cols: number = 20) {
        super();
        this.rows = rows;
        this.cols = cols;

        this.tileContainer = new Container();
        this.gridContainer = new Container();
        this.addChild(this.tileContainer);
        this.addChild(this.gridContainer);

        this.generateMap();
        this.renderMap();
    }

    /**
     * 生成地图数据（随机地形）
     */
    private generateMap(): void {
        for (let row = 0; row < this.rows; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const rand = Math.random();
                let type: TileType;
                if (rand < 0.65) {
                    type = TileType.GRASS;
                } else if (rand < 0.80) {
                    type = TileType.FOREST;
                } else if (rand < 0.90) {
                    type = TileType.STONE;
                } else if (rand < 0.95) {
                    type = TileType.WATER;
                } else {
                    type = TileType.MOUNTAIN;
                }
                this.tiles[row][col] = new Tile(row, col, type);
            }
        }
    }

    /**
     * 渲染整个地图
     */
    private renderMap(): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tile = this.tiles[row][col];
                const { x, y } = this.gridToIso(row, col);

                // 绘制地块菱形色块
                const g = new Graphics();
                g.poly([
                    { x: 0, y: -this.tileHeight / 2 },              // 上
                    { x: this.tileWidth / 2, y: 0 },                 // 右
                    { x: 0, y: this.tileHeight / 2 },                // 下
                    { x: -this.tileWidth / 2, y: 0 },                // 左
                ]);
                g.fill({ color: tile.getColor() });
                g.stroke({ color: 0x2a2a4a, width: 1, alpha: 0.3 });
                g.position.set(x, y);
                this.tileContainer.addChild(g);
            }
        }
    }

    /**
     * 笛卡尔网格坐标 → 等距投影坐标
     */
    public gridToIso(row: number, col: number): { x: number; y: number } {
        const x = (col - row) * (this.tileWidth / 2);
        const y = (col + row) * (this.tileHeight / 2);
        return { x, y };
    }

    /**
     * 等距投影坐标 → 笛卡尔网格坐标
     */
    public isoToGrid(isoX: number, isoY: number): { row: number; col: number } {
        const col = Math.round((isoX / (this.tileWidth / 2) + isoY / (this.tileHeight / 2)) / 2);
        const row = Math.round((isoY / (this.tileHeight / 2) - isoX / (this.tileWidth / 2)) / 2);
        return { row, col };
    }

    /**
     * 获取地图中心的等距坐标（用于初始居中）
     */
    public getCenter(): { x: number; y: number } {
        return this.gridToIso(this.rows / 2, this.cols / 2);
    }
}
