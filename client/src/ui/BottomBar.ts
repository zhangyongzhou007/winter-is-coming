import { Container, Graphics, Text } from 'pixi.js';

/**
 * 右侧功能按钮栏 — 横屏模式下放在屏幕右侧竖排
 *
 * 参考无尽冬日横屏布局：右侧竖排 5 个圆形功能入口
 */
export class BottomBar extends Container {
    private bg: Graphics;
    private buttons: Container[] = [];

    /** 功能按钮配置 */
    private buttonConfigs = [
        { label: '建造', color: 0x4caf50, icon: '🏗️' },
        { label: '科技', color: 0x2196f3, icon: '🔬' },
        { label: '军队', color: 0xf44336, icon: '⚔️' },
        { label: '英雄', color: 0xff9800, icon: '🦸' },
        { label: '野外', color: 0x9c27b0, icon: '🗺️' },
    ];

    constructor() {
        super();

        this.bg = new Graphics();
        this.addChild(this.bg);

        // 创建按钮
        this.buttonConfigs.forEach((config) => {
            const btn = this.createButton(config.label, config.color);
            this.buttons.push(btn);
            this.addChild(btn);
        });
    }

    /**
     * 根据屏幕尺寸重新布局 — 横屏右侧竖排
     */
    public updateLayout(screenWidth: number, screenHeight: number): void {
        const barWidth = 60;
        const barX = screenWidth - barWidth;
        const barStartY = 40; // HUD下方开始

        // 绘制背景
        this.bg.clear();
        this.bg.rect(barX, barStartY, barWidth, screenHeight - barStartY);
        this.bg.fill({ color: 0x000000, alpha: 0.5 });

        // 竖排分布按钮
        const btnSize = 44;
        const gap = 8;
        const totalHeight = this.buttons.length * (btnSize + gap) - gap;
        const startY = barStartY + (screenHeight - barStartY - totalHeight) / 2;

        this.buttons.forEach((btn, i) => {
            btn.position.set(
                barX + (barWidth - btnSize) / 2,
                startY + i * (btnSize + gap)
            );
        });
    }

    /**
     * 创建单个按钮
     */
    private createButton(label: string, color: number): Container {
        const container = new Container();
        const size = 44;

        // 圆角矩形背景
        const bg = new Graphics();
        bg.roundRect(0, 0, size, size, 10);
        bg.fill({ color, alpha: 0.8 });
        container.addChild(bg);

        // 按钮文字
        const text = new Text({
            text: label,
            style: {
                fontFamily: 'Arial, "Microsoft YaHei"',
                fontSize: 11,
                fill: 0xffffff,
                fontWeight: 'bold',
            },
        });
        text.position.set(size / 2 - text.width / 2, size / 2 - text.height / 2);
        container.addChild(text);

        // 交互
        container.eventMode = 'static';
        container.cursor = 'pointer';

        return container;
    }
}
