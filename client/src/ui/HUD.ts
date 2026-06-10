import { Container, Graphics, Text } from 'pixi.js';

/**
 * 资源数据
 */
interface ResourceData {
    name: string;
    value: number;
    color: number;
}

/**
 * 顶部资源栏 HUD
 */
export class HUD extends Container {
    private bg: Graphics;
    private resourceTexts: Text[] = [];

    /** 六种资源 */
    private resources: ResourceData[] = [
        { name: '粮食', value: 1000, color: 0xf5c842 },
        { name: '木材', value: 800, color: 0x8b6914 },
        { name: '石材', value: 500, color: 0x9e9e9e },
        { name: '铁矿', value: 300, color: 0x607d8b },
        { name: '煤炭', value: 200, color: 0x424242 },
        { name: '钻石', value: 50, color: 0x00bcd4 },
    ];

    constructor() {
        super();

        // 半透明背景条
        this.bg = new Graphics();
        this.addChild(this.bg);

        // 创建资源文字
        this.resources.forEach((res) => {
            const text = new Text({
                text: `${res.name}: ${res.value}`,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 14,
                    fill: res.color,
                    fontWeight: 'bold',
                },
            });
            this.resourceTexts.push(text);
            this.addChild(text);
        });
    }

    /**
     * 根据屏幕宽度重新布局
     */
    public updateLayout(screenWidth: number): void {
        // 绘制背景
        this.bg.clear();
        this.bg.rect(0, 0, screenWidth, 36);
        this.bg.fill({ color: 0x000000, alpha: 0.6 });

        // 均匀分布资源文字
        const padding = 12;
        const gap = (screenWidth - padding * 2) / this.resources.length;
        this.resourceTexts.forEach((text, i) => {
            text.position.set(padding + gap * i, 10);
        });
    }

    /**
     * 更新资源数值
     */
    public updateResource(index: number, value: number): void {
        if (index >= 0 && index < this.resources.length) {
            this.resources[index].value = value;
            this.resourceTexts[index].text = `${this.resources[index].name}: ${value}`;
        }
    }
}
