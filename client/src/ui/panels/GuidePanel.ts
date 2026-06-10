import { Container, Graphics, Text } from 'pixi.js';
import { Game } from '../../core/Game';

/**
 * 新手引导面板 — 首次进入时引导玩家操作
 *
 * 步骤：
 * 1. 欢迎提示 + 点击熔炉升级到 Lv.1
 * 2. 升级后提示建造猎人小屋和伐木场
 */
export class GuidePanel extends Container {
    private bg: Graphics;
    private titleText: Text;
    private contentText: Text;
    private btn: Container;
    private btnText: Text;

    /** 确认回调 */
    private onConfirmCallback: (() => void) | null = null;

    private panelWidth = 340;
    private panelHeight = 160;

    constructor() {
        super();
        this.visible = false;

        this.bg = new Graphics();
        this.addChild(this.bg);

        // 标题
        this.titleText = new Text({
            text: '',
            style: { fontFamily: 'Arial, "Microsoft YaHei"', fontSize: 16, fill: 0xffeb3b, fontWeight: 'bold' },
        });
        this.titleText.position.set(15, 12);
        this.addChild(this.titleText);

        // 内容
        this.contentText = new Text({
            text: '',
            style: {
                fontFamily: 'Arial, "Microsoft YaHei"',
                fontSize: 13,
                fill: 0xe0e0e0,
                wordWrap: true,
                wordWrapWidth: this.panelWidth - 30,
            },
        });
        this.contentText.position.set(15, 42);
        this.addChild(this.contentText);

        // 确认按钮
        this.btn = new Container();
        const btnBg = new Graphics();
        btnBg.roundRect(0, 0, 100, 34, 8);
        btnBg.fill({ color: 0xff9800, alpha: 0.9 });
        this.btn.addChild(btnBg);

        this.btnText = new Text({
            text: '知道了',
            style: { fontFamily: 'Arial, "Microsoft YaHei"', fontSize: 13, fill: 0xffffff, fontWeight: 'bold' },
        });
        this.btnText.position.set(50 - this.btnText.width / 2, 9);
        this.btn.addChild(this.btnText);

        this.btn.position.set(this.panelWidth / 2 - 50, this.panelHeight - 48);
        this.btn.eventMode = 'static';
        this.btn.cursor = 'pointer';
        this.btn.on('pointerdown', this.onConfirm, this);
        this.addChild(this.btn);
    }

    /**
     * 显示引导
     */
    public show(title: string, content: string, buttonText: string = '知道了'): void {
        const game = Game.getInstance();

        this.bg.clear();
        this.bg.roundRect(0, 0, this.panelWidth, this.panelHeight, 12);
        this.bg.fill({ color: 0x1a1a2e, alpha: 0.95 });
        this.bg.stroke({ color: 0xff9800, width: 2, alpha: 0.8 });

        this.position.set(
            (game.width - this.panelWidth) / 2,
            (game.height - this.panelHeight) / 2
        );

        this.titleText.text = title;
        this.contentText.text = content;
        this.btnText.text = buttonText;
        this.btnText.position.set(50 - this.btnText.width / 2, 9);

        this.visible = true;
    }

    /**
     * 注册确认回调
     */
    public onConfirmClick(callback: () => void): void {
        this.onConfirmCallback = callback;
    }

    /**
     * 确认按钮点击
     */
    private onConfirm = (): void => {
        this.visible = false;
        if (this.onConfirmCallback) {
            this.onConfirmCallback();
        }
    };
}
