import { Container, Graphics, Text } from 'pixi.js';

/**
 * 底部功能按钮栏
 */
export class BottomBar extends Container {
    private bg: Graphics;
    private buttons: Container[] = [];

    /** 功能按钮配置 */
    private buttonConfigs = [
        { label: '建造', color: 0x4caf50 },
        { label: '科技', color: 0x2196f3 },
        { label: '军队', color: 0xf44336 },
        { label: '英雄', color: 0xff9800 },
        { label: '野外', color: 0x9c27b0 },
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
     * 根据屏幕尺寸重新布局
     */
    public updateLayout(screenWidth: number, screenHeight: number): void {
        const barHeight = 60;
        const barY = screenHeight - barHeight;

        // 绘制背景
        this.bg.clear();
        this.bg.rect(0, barY, screenWidth, barHeight);
        this.bg.fill({ color: 0x000000, alpha: 0.7 });

        // 均匀分布按钮
        const btnSize = 44;
        const gap = screenWidth / this.buttons.length;
        this.buttons.forEach((btn, i) => {
            btn.position.set(gap * i + gap / 2 - btnSize / 2, barY + 8);
        });
    }

    /**
     * 创建单个按钮
     */
    private createButton(label: string, color: number): Container {
        const container = new Container();

        const bg = new Graphics();
        bg.roundRect(0, 0, 44, 44, 8);
        bg.fill({ color, alpha: 0.8 });
        container.addChild(bg);

        const text = new Text({
            text: label,
            style: {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff,
                fontWeight: 'bold',
            },
        });
        text.position.set(22 - text.width / 2, 16);
        container.addChild(text);

        // 交互
        container.eventMode = 'static';
        container.cursor = 'pointer';

        return container;
    }
}
