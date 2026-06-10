import { Container, Graphics, Text } from 'pixi.js';
import { Game } from '../../core/Game';
import { BuildingConfig } from '../../network/Api';
import { BuildingCategory } from '../../castle/CastleLayout';

/**
 * 建造面板 — 点击空槽位时弹出可建造建筑列表
 *
 * 根据槽位分类过滤可建造的建筑，显示解锁条件和消耗
 */
export class BuildPanel extends Container {
    private bg: Graphics;
    private titleText: Text;
    private closeBtn: Container;
    private listContainer: Container;

    /** 建筑配置列表 */
    private buildingConfigs: BuildingConfig[] = [];

    /** 当前槽位分类 */
    private currentCategory: BuildingCategory = 'resource';

    /** 当前槽位编号 */
    private currentSlotId: number = 0;

    /** 当前熔炉等级 */
    private furnaceLevel: number = 0;

    /** 建造回调 */
    private onBuildCallback: ((buildingKey: string, positionIndex: number) => void) | null = null;

    /** 关闭回调 */
    private onCloseCallback: (() => void) | null = null;

    /** 面板尺寸 */
    private panelWidth = 320;
    private panelHeight = 300;

    constructor() {
        super();
        this.visible = false;

        this.bg = new Graphics();
        this.addChild(this.bg);

        // 标题
        this.titleText = new Text({
            text: '选择建筑',
            style: { fontFamily: 'Arial, "Microsoft YaHei"', fontSize: 16, fill: 0xffffff, fontWeight: 'bold' },
        });
        this.titleText.position.set(15, 12);
        this.addChild(this.titleText);

        // 关闭按钮
        this.closeBtn = new Container();
        const closeBg = new Graphics();
        closeBg.roundRect(0, 0, 28, 28, 14);
        closeBg.fill({ color: 0xf44336, alpha: 0.8 });
        this.closeBtn.addChild(closeBg);
        const closeText = new Text({
            text: '✕',
            style: { fontFamily: 'Arial', fontSize: 14, fill: 0xffffff, fontWeight: 'bold' },
        });
        closeText.position.set(14 - closeText.width / 2, 7);
        this.closeBtn.addChild(closeText);
        this.closeBtn.position.set(this.panelWidth - 36, 8);
        this.closeBtn.eventMode = 'static';
        this.closeBtn.cursor = 'pointer';
        this.closeBtn.on('pointerdown', this.close, this);
        this.addChild(this.closeBtn);

        // 建筑列表容器
        this.listContainer = new Container();
        this.listContainer.position.set(10, 45);
        this.addChild(this.listContainer);
    }

    /**
     * 设置建筑配置数据
     */
    public setBuildingConfigs(configs: BuildingConfig[]): void {
        this.buildingConfigs = configs;
    }

    /**
     * 设置当前熔炉等级
     */
    public setFurnaceLevel(level: number): void {
        this.furnaceLevel = level;
    }

    /**
     * 显示建造面板
     */
    public show(category: BuildingCategory, slotId: number): void {
        this.currentCategory = category;
        this.currentSlotId = slotId;
        const game = Game.getInstance();

        // 过滤当前分类的建筑
        const available = this.buildingConfigs.filter(
            (c) => c.category === category
        );

        // 绘制背景
        const itemHeight = 50;
        this.panelHeight = Math.max(120, 50 + available.length * itemHeight + 10);

        this.bg.clear();
        this.bg.roundRect(0, 0, this.panelWidth, this.panelHeight, 12);
        this.bg.fill({ color: 0x1a1a2e, alpha: 0.95 });
        this.bg.stroke({ color: 0x4a4a6a, width: 2, alpha: 0.8 });

        // 居中显示
        this.position.set(
            (game.width - this.panelWidth) / 2,
            (game.height - this.panelHeight) / 2
        );

        // 标题
        const categoryNames: Record<string, string> = {
            core: '核心建筑', resource: '资源建筑', military: '军事建筑', function: '功能建筑',
        };
        this.titleText.text = `建造 - ${categoryNames[category] || '建筑'}`;

        // 清除旧列表
        this.listContainer.removeChildren();

        // 渲染可建造列表
        available.forEach((config, i) => {
            const item = this.createBuildItem(config, i);
            item.position.set(0, i * itemHeight);
            this.listContainer.addChild(item);
        });

        if (available.length === 0) {
            const emptyText = new Text({
                text: '暂无可建造建筑',
                style: { fontFamily: 'Arial, "Microsoft YaHei"', fontSize: 13, fill: 0x888888 },
            });
            emptyText.position.set(80, 20);
            this.listContainer.addChild(emptyText);
        }

        this.visible = true;
    }

    /**
     * 关闭面板
     */
    public close = (): void => {
        this.visible = false;
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    };

    /**
     * 注册建造回调
     */
    public onBuild(callback: (buildingKey: string, positionIndex: number) => void): void {
        this.onBuildCallback = callback;
    }

    /**
     * 注册关闭回调
     */
    public onClose(callback: () => void): void {
        this.onCloseCallback = callback;
    }

    /**
     * 创建建筑列表项
     */
    private createBuildItem(config: BuildingConfig, _index: number): Container {
        const item = new Container();
        const isUnlocked = this.furnaceLevel >= config.unlockFurnaceLevel;

        // 背景
        const bg = new Graphics();
        bg.roundRect(0, 0, this.panelWidth - 20, 44, 6);
        bg.fill({ color: isUnlocked ? 0x2a3a2a : 0x3a2a2a, alpha: 0.6 });
        item.addChild(bg);

        // 建筑名称
        const nameText = new Text({
            text: config.buildingName,
            style: {
                fontFamily: 'Arial, "Microsoft YaHei"',
                fontSize: 13,
                fill: isUnlocked ? 0xffffff : 0x888888,
                fontWeight: 'bold',
            },
        });
        nameText.position.set(10, 5);
        item.addChild(nameText);

        // 描述/条件
        const descText = new Text({
            text: isUnlocked
                ? config.description
                : `需要熔炉 Lv.${config.unlockFurnaceLevel}`,
            style: {
                fontFamily: 'Arial, "Microsoft YaHei"',
                fontSize: 10,
                fill: isUnlocked ? 0xaaaaaa : 0xff6666,
            },
        });
        descText.position.set(10, 25);
        item.addChild(descText);

        // 建造按钮（只有解锁了才显示）
        if (isUnlocked) {
            const btn = new Container();
            const btnBg = new Graphics();
            btnBg.roundRect(0, 0, 50, 28, 6);
            btnBg.fill({ color: 0x4caf50, alpha: 0.9 });
            btn.addChild(btnBg);

            const btnText = new Text({
                text: '建造',
                style: { fontFamily: 'Arial, "Microsoft YaHei"', fontSize: 11, fill: 0xffffff, fontWeight: 'bold' },
            });
            btnText.position.set(25 - btnText.width / 2, 7);
            btn.addChild(btnText);

            btn.position.set(this.panelWidth - 75, 8);
            btn.eventMode = 'static';
            btn.cursor = 'pointer';
            btn.on('pointerdown', () => {
                if (this.onBuildCallback) {
                    this.onBuildCallback(config.buildingKey, this.currentSlotId);
                }
            });
            item.addChild(btn);
        }

        return item;
    }
}
