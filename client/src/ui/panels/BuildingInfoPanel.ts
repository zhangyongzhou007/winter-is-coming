import { Container, Graphics, Text } from 'pixi.js';
import { Game } from '../../core/Game';
import { BuildingInfoData } from '../../network/Api';

/**
 * 建筑详情面板 — 点击已有建筑时弹出
 *
 * 显示：建筑名称、等级、产出、下一级消耗、升级按钮
 */
export class BuildingInfoPanel extends Container {
    private bg: Graphics;
    private titleText: Text;
    private levelText: Text;
    private productionText: Text;
    private costTexts: Text[] = [];
    private upgradeBtn: Container;
    private upgradeBtnText: Text;
    private closeBtn: Container;

    /** 当前显示的建筑信息 */
    private currentInfo: BuildingInfoData | null = null;

    /** 升级按钮回调 */
    private onUpgradeCallback: ((userBuildingId: number) => void) | null = null;

    /** 关闭回调 */
    private onCloseCallback: (() => void) | null = null;

    /** 面板尺寸 */
    private panelWidth = 300;
    private panelHeight = 280;

    constructor() {
        super();
        this.visible = false;

        // 半透明背景
        this.bg = new Graphics();
        this.addChild(this.bg);

        // 标题
        this.titleText = new Text({
            text: '',
            style: { fontFamily: 'Arial, "Microsoft YaHei"', fontSize: 16, fill: 0xffffff, fontWeight: 'bold' },
        });
        this.titleText.position.set(15, 12);
        this.addChild(this.titleText);

        // 等级
        this.levelText = new Text({
            text: '',
            style: { fontFamily: 'Arial', fontSize: 13, fill: 0xffeb3b },
        });
        this.levelText.position.set(15, 36);
        this.addChild(this.levelText);

        // 产出信息
        this.productionText = new Text({
            text: '',
            style: { fontFamily: 'Arial, "Microsoft YaHei"', fontSize: 12, fill: 0x81c784 },
        });
        this.productionText.position.set(15, 58);
        this.addChild(this.productionText);

        // 升级消耗（5行：粮食/木材/石材/铁矿/煤炭）
        const costLabels = ['粮食', '木材', '石材', '铁矿', '煤炭'];
        const costColors = [0xf5c842, 0x8b6914, 0x9e9e9e, 0x607d8b, 0x424242];
        costLabels.forEach((label, i) => {
            const text = new Text({
                text: `${label}: 0`,
                style: { fontFamily: 'Arial, "Microsoft YaHei"', fontSize: 11, fill: costColors[i] },
            });
            text.position.set(15, 82 + i * 18);
            this.costTexts.push(text);
            this.addChild(text);
        });

        // 升级按钮
        this.upgradeBtn = new Container();
        const btnBg = new Graphics();
        btnBg.roundRect(0, 0, 120, 36, 8);
        btnBg.fill({ color: 0x4caf50, alpha: 0.9 });
        this.upgradeBtn.addChild(btnBg);

        this.upgradeBtnText = new Text({
            text: '升级',
            style: { fontFamily: 'Arial, "Microsoft YaHei"', fontSize: 14, fill: 0xffffff, fontWeight: 'bold' },
        });
        this.upgradeBtnText.position.set(60 - this.upgradeBtnText.width / 2, 10);
        this.upgradeBtn.addChild(this.upgradeBtnText);

        this.upgradeBtn.position.set(90, 195);
        this.upgradeBtn.eventMode = 'static';
        this.upgradeBtn.cursor = 'pointer';
        this.upgradeBtn.on('pointerdown', this.onUpgradeClick, this);
        this.addChild(this.upgradeBtn);

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
    }

    /**
     * 显示建筑详情
     */
    public show(info: BuildingInfoData): void {
        this.currentInfo = info;
        const game = Game.getInstance();

        // 绘制背景
        this.bg.clear();
        this.bg.roundRect(0, 0, this.panelWidth, this.panelHeight, 12);
        this.bg.fill({ color: 0x1a1a2e, alpha: 0.95 });
        this.bg.stroke({ color: 0x4a4a6a, width: 2, alpha: 0.8 });

        // 居中显示
        this.position.set(
            (game.width - this.panelWidth) / 2,
            (game.height - this.panelHeight) / 2
        );

        // 填充数据
        this.titleText.text = info.buildingName;
        this.levelText.text = `等级: ${info.currentLevel} / ${info.maxLevel}`;

        // 产出信息
        if (info.productionPerHour > 0) {
            this.productionText.text = `产出: ${info.productionPerHour}/小时`;
        } else if (info.hpBonus > 0) {
            this.productionText.text = `防御加成: +${info.hpBonus}`;
        } else if (info.capacityBonus > 0) {
            this.productionText.text = `容量加成: +${info.capacityBonus}`;
        } else {
            this.productionText.text = '';
        }

        // 升级消耗
        if (info.currentLevel < info.maxLevel) {
            const costs = [
                info.nextCostGrain,
                info.nextCostWood,
                info.nextCostStone,
                info.nextCostIron,
                info.nextCostCoal,
            ];
            const labels = ['粮食', '木材', '石材', '铁矿', '煤炭'];
            this.costTexts.forEach((text, i) => {
                text.text = `${labels[i]}: ${costs[i]}`;
                text.visible = true;
            });

            // 升级按钮状态
            this.upgradeBtn.visible = true;
            if (info.canUpgrade) {
                this.upgradeBtnText.text = `升级 (${info.nextUpgradeTimeSeconds}秒)`;
                this.upgradeBtn.alpha = 1;
            } else {
                this.upgradeBtnText.text = '条件不足';
                this.upgradeBtn.alpha = 0.5;
            }
            this.upgradeBtnText.position.set(60 - this.upgradeBtnText.width / 2, 10);
        } else {
            this.costTexts.forEach((text) => { text.visible = false; });
            this.upgradeBtn.visible = false;
        }

        this.visible = true;
    }

    /**
     * 关闭面板
     */
    public close = (): void => {
        this.visible = false;
        this.currentInfo = null;
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    };

    /**
     * 注册升级回调
     */
    public onUpgrade(callback: (userBuildingId: number) => void): void {
        this.onUpgradeCallback = callback;
    }

    /**
     * 注册关闭回调
     */
    public onClose(callback: () => void): void {
        this.onCloseCallback = callback;
    }

    /**
     * 升级按钮点击
     */
    private onUpgradeClick(): void {
        if (this.currentInfo && this.currentInfo.canUpgrade && this.onUpgradeCallback) {
            this.onUpgradeCallback(this.currentInfo.userBuildingId);
        }
    }
}
