import { Container, Graphics, Text } from 'pixi.js';

/**
 * 资源数据
 */
interface ResourceData {
    name: string;
    value: number;
    color: number;
    icon: string;
}

/**
 * 顶部资源栏 HUD — 横屏布局，左侧显示 6 种资源
 */
export class HUD extends Container {
    private bg: Graphics;
    private resourceTexts: Text[] = [];

    /** 六种资源 */
    private resources: ResourceData[] = [
        { name: '粮食', value: 500,  color: 0xf5c842, icon: '🌾' },
        { name: '木材', value: 500,  color: 0x8b6914, icon: '🪵' },
        { name: '石材', value: 0,    color: 0x9e9e9e, icon: '🪨' },
        { name: '铁矿', value: 0,    color: 0x607d8b, icon: '⛏️' },
        { name: '煤炭', value: 0,    color: 0x424242, icon: '�ite' },
        { name: '钻石', value: 10,   color: 0x00bcd4, icon: '💎' },
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
                    fontFamily: 'Arial, "Microsoft YaHei"',
                    fontSize: 13,
                    fill: res.color,
                    fontWeight: 'bold',
                },
            });
            this.resourceTexts.push(text);
            this.addChild(text);
        });
    }

    /**
     * 根据屏幕宽度重新布局（横屏适配）
     */
    public updateLayout(screenWidth: number): void {
        // 横屏：资源栏只占左侧大部分（右侧留给功能栏）
        const barWidth = screenWidth - 70;

        // 绘制背景
        this.bg.clear();
        this.bg.rect(0, 0, barWidth, 32);
        this.bg.fill({ color: 0x000000, alpha: 0.6 });

        // 均匀分布资源文字
        const padding = 10;
        const gap = (barWidth - padding * 2) / this.resources.length;
        this.resourceTexts.forEach((text, i) => {
            text.position.set(padding + gap * i, 8);
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

    /**
     * 批量更新资源（对接后端数据用）
     */
    public updateAllResources(values: number[]): void {
        values.forEach((val, i) => {
            this.updateResource(i, val);
        });
    }
}
