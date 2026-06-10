import { Container, Graphics, Text } from 'pixi.js';
import {
    SlotConfig,
    CASTLE_TILE_WIDTH,
    CASTLE_TILE_HEIGHT,
    gridToIso,
} from './CastleLayout';

/**
 * 建筑槽位的颜色配置（按分类）
 */
const CATEGORY_COLORS: Record<string, { fill: number; stroke: number }> = {
    core:     { fill: 0xd84315, stroke: 0xff6e40 },   // 熔炉-火红色
    resource: { fill: 0x558b2f, stroke: 0x7cb342 },   // 资源-绿色
    military: { fill: 0xc62828, stroke: 0xef5350 },   // 军事-红色
    function: { fill: 0x1565c0, stroke: 0x42a5f5 },   // 功能-蓝色
};

/**
 * 建筑槽位组件
 *
 * 每个槽位渲染为一个等距菱形，显示建筑名称和等级。
 * 空槽位显示虚线边框和"+"号。
 * 有建筑时显示实色填充和建筑信息。
 */
export class BuildingSlot extends Container {
    /** 槽位配置 */
    public readonly config: SlotConfig;

    /** 当前建筑key（null=空槽位） */
    private buildingKey: string | null;

    /** 当前建筑等级 */
    private buildingLevel: number;

    /** 建筑显示名 */
    private buildingName: string;

    /** 菱形图形 */
    private diamond: Graphics;

    /** 名称文字 */
    private nameText: Text;

    /** 等级文字 */
    private levelText: Text;

    /** 后端建筑实例ID（用于升级/查详情） */
    private serverBuildingId: number | null = null;

    /** 点击回调 */
    private clickCallback: ((slot: BuildingSlot) => void) | null = null;

    constructor(config: SlotConfig) {
        super();
        this.config = config;
        this.buildingKey = config.defaultBuildingKey;
        this.buildingLevel = config.defaultBuildingKey ? 0 : -1;
        this.buildingName = config.defaultBuildingKey ? config.label : '';

        // 计算等距位置
        const pos = gridToIso(config.gridRow, config.gridCol);
        this.position.set(pos.x, pos.y);

        // 创建菱形图形
        this.diamond = new Graphics();
        this.addChild(this.diamond);

        // 名称文字
        this.nameText = new Text({
            text: '',
            style: {
                fontFamily: 'Arial, "Microsoft YaHei"',
                fontSize: 11,
                fill: 0xffffff,
                fontWeight: 'bold',
                align: 'center',
            },
        });
        this.nameText.anchor.set(0.5, 0.5);
        this.addChild(this.nameText);

        // 等级文字
        this.levelText = new Text({
            text: '',
            style: {
                fontFamily: 'Arial',
                fontSize: 9,
                fill: 0xffeb3b,
                fontWeight: 'bold',
                align: 'center',
            },
        });
        this.levelText.anchor.set(0.5, 0.5);
        this.addChild(this.levelText);

        // 交互
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', this.onTap, this);

        // 初始渲染
        this.render();
    }

    /**
     * 渲染槽位外观
     */
    private render(): void {
        const tw = CASTLE_TILE_WIDTH;
        const th = CASTLE_TILE_HEIGHT;
        const colors = CATEGORY_COLORS[this.config.category] || CATEGORY_COLORS.function;

        this.diamond.clear();

        // 绘制可见菱形
        this.diamond.poly([
            { x: 0, y: -th / 2 },
            { x: tw / 2, y: 0 },
            { x: 0, y: th / 2 },
            { x: -tw / 2, y: 0 },
        ]);

        if (this.buildingKey) {
            // 有建筑：实色填充
            this.diamond.fill({ color: colors.fill, alpha: 0.85 });
            this.diamond.stroke({ color: colors.stroke, width: 2, alpha: 1 });

            this.nameText.text = this.buildingName;
            this.nameText.position.set(0, -4);

            this.levelText.text = `Lv.${this.buildingLevel}`;
            this.levelText.position.set(0, 10);
            this.levelText.visible = true;
        } else {
            // 空槽位：半透明 + 虚线边框效果
            this.diamond.fill({ color: 0x333355, alpha: 0.4 });
            this.diamond.stroke({ color: 0x666688, width: 1, alpha: 0.6 });

            this.nameText.text = '+';
            this.nameText.style.fontSize = 18;
            this.nameText.position.set(0, 0);

            this.levelText.visible = false;
        }
    }

    /**
     * 设置建筑数据（有建筑时）
     */
    public setBuilding(buildingKey: string, name: string, level: number): void {
        this.buildingKey = buildingKey;
        this.buildingName = name;
        this.buildingLevel = level;
        this.nameText.style.fontSize = 11;
        this.render();
    }

    /**
     * 清空建筑（变为空槽位）
     */
    public clearBuilding(): void {
        this.buildingKey = null;
        this.buildingName = '';
        this.buildingLevel = -1;
        this.render();
    }

    /**
     * 获取当前建筑key
     */
    public getBuildingKey(): string | null {
        return this.buildingKey;
    }

    /**
     * 获取当前建筑等级
     */
    public getBuildingLevel(): number {
        return this.buildingLevel;
    }

    /**
     * 设置后端建筑实例ID
     */
    public setServerBuildingId(id: number): void {
        this.serverBuildingId = id;
    }

    /**
     * 获取后端建筑实例ID
     */
    public getServerBuildingId(): number | null {
        return this.serverBuildingId;
    }

    /**
     * 注册点击回调
     */
    public onClick(callback: (slot: BuildingSlot) => void): void {
        this.clickCallback = callback;
    }

    /**
     * 点击事件处理
     */
    private onTap(): void {
        if (this.clickCallback) {
            this.clickCallback(this);
        }
    }
}
