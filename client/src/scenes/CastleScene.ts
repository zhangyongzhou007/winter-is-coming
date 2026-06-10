import { Container, Graphics } from 'pixi.js';
import { Scene } from '../core/SceneManager';
import { Game } from '../core/Game';
import { HUD } from '../ui/HUD';
import { BottomBar } from '../ui/BottomBar';
import { BuildingSlot } from '../castle/BuildingSlot';
import {
    CASTLE_SLOTS,
    CASTLE_TILE_WIDTH,
    CASTLE_TILE_HEIGHT,
    getCastleCenter,
    gridToIso,
} from '../castle/CastleLayout';

/**
 * 城堡主城场景 — 城堡内部俯视布局
 *
 * 中心是熔炉，周围分布 15 个建筑槽位。
 * 底部用等距菱形地面铺底，营造 2.5D 内部空间感。
 */
export class CastleScene extends Scene {
    /** 可拖拽的城堡容器（地面 + 建筑槽位） */
    private castleContainer: Container;

    /** 地面图形 */
    private ground: Graphics;

    /** 所有建筑槽位 */
    private slots: BuildingSlot[] = [];

    /** HUD 资源栏 */
    private hud: HUD;

    /** 右侧功能栏 */
    private bottomBar: BottomBar;

    constructor() {
        super();

        this.castleContainer = new Container();
        this.ground = new Graphics();
        this.hud = new HUD();
        this.bottomBar = new BottomBar();
    }

    public onEnter(): void {
        const game = Game.getInstance();

        // 1. 绘制城堡地面（9x9 等距菱形网格）
        this.drawGround();
        this.castleContainer.addChild(this.ground);

        // 2. 创建所有建筑槽位
        this.createSlots();

        // 3. 城堡容器居中到屏幕中央
        this.addChild(this.castleContainer);
        this.centerCastle();

        // 4. 添加 HUD（固定在屏幕顶部）
        this.addChild(this.hud);
        this.hud.updateLayout(game.width);

        // 5. 添加功能栏（横屏时放在右侧）
        this.addChild(this.bottomBar);
        this.bottomBar.updateLayout(game.width, game.height);

        // 6. 注册拖拽 → 移动城堡视图
        game.inputManager.onDrag((dx, dy) => {
            this.castleContainer.position.x += dx;
            this.castleContainer.position.y += dy;
        });

        // 7. 注册缩放 → 城堡缩放
        game.inputManager.onZoom((scale) => {
            this.castleContainer.scale.set(scale);
        });

        // 8. 监听窗口大小变化
        window.addEventListener('resize', this.onResize);

        console.log('[CastleScene] 城堡内部场景已加载');
    }

    public onExit(): void {
        window.removeEventListener('resize', this.onResize);
        this.removeChildren();
        this.slots = [];
        console.log('[CastleScene] 城堡场景已退出');
    }

    /**
     * 绘制城堡地面 — 9x9 等距菱形网格
     */
    private drawGround(): void {
        this.ground.clear();

        const gridSize = 9;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const { x, y } = gridToIso(row, col);
                const tw = CASTLE_TILE_WIDTH;
                const th = CASTLE_TILE_HEIGHT;

                // 交替颜色形成棋盘纹理
                const isEven = (row + col) % 2 === 0;
                const fillColor = isEven ? 0x2a3a2a : 0x253525;

                this.ground.poly([
                    { x: x, y: y - th / 2 },
                    { x: x + tw / 2, y: y },
                    { x: x, y: y + th / 2 },
                    { x: x - tw / 2, y: y },
                ]);
                this.ground.fill({ color: fillColor, alpha: 0.8 });
                this.ground.stroke({ color: 0x3a4a3a, width: 1, alpha: 0.4 });
            }
        }
    }

    /**
     * 创建所有建筑槽位
     */
    private createSlots(): void {
        CASTLE_SLOTS.forEach((slotConfig) => {
            const slot = new BuildingSlot(slotConfig);

            // 注册点击回调（后续 Task 4/5 实现面板交互）
            slot.onClick((clickedSlot) => {
                const key = clickedSlot.getBuildingKey();
                if (key) {
                    console.log(`[CastleScene] 点击建筑: ${key} Lv.${clickedSlot.getBuildingLevel()}`);
                } else {
                    console.log(`[CastleScene] 点击空槽位: #${clickedSlot.config.slotId} (${clickedSlot.config.category})`);
                }
            });

            this.slots.push(slot);
            this.castleContainer.addChild(slot);
        });
    }

    /**
     * 将城堡容器居中到屏幕中央
     */
    private centerCastle(): void {
        const game = Game.getInstance();
        const center = getCastleCenter();

        // 横屏：向右偏移一点（给右侧功能栏留空间）
        const offsetX = -30;
        this.castleContainer.position.set(
            game.width / 2 - center.x + offsetX,
            game.height / 2 - center.y
        );
    }

    /**
     * 窗口大小变化时重新布局
     */
    private onResize = (): void => {
        const game = Game.getInstance();
        this.hud.updateLayout(game.width);
        this.bottomBar.updateLayout(game.width, game.height);
        this.centerCastle();
    };

    /**
     * 获取指定槽位（供后续 Task 4/5 使用）
     */
    public getSlot(slotId: number): BuildingSlot | undefined {
        return this.slots.find((s) => s.config.slotId === slotId);
    }

    /**
     * 获取所有槽位（供后续使用）
     */
    public getAllSlots(): BuildingSlot[] {
        return this.slots;
    }
}
