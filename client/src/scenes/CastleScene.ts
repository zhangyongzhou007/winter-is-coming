import { Scene } from '../core/SceneManager';
import { Game } from '../core/Game';
import { IsometricMap } from '../map/IsometricMap';
import { HUD } from '../ui/HUD';
import { BottomBar } from '../ui/BottomBar';

/**
 * 城堡主城场景 - 等距地图 + HUD + 底部按钮栏
 */
export class CastleScene extends Scene {
    private map: IsometricMap;
    private hud: HUD;
    private bottomBar: BottomBar;

    constructor() {
        super();
        this.map = new IsometricMap(20, 20);
        this.hud = new HUD();
        this.bottomBar = new BottomBar();
    }

    public onEnter(): void {
        const game = Game.getInstance();

        // 添加地图
        this.addChild(this.map);

        // 地图居中到屏幕中央
        const center = this.map.getCenter();
        this.map.position.set(
            game.width / 2 - center.x,
            game.height / 2 - center.y
        );

        // 添加 HUD（固定在屏幕顶部）
        this.addChild(this.hud);
        this.hud.updateLayout(game.width);

        // 添加底部栏
        this.addChild(this.bottomBar);
        this.bottomBar.updateLayout(game.width, game.height);

        // 注册拖拽 → 移动地图
        game.inputManager.onDrag((dx, dy) => {
            this.map.position.x += dx;
            this.map.position.y += dy;
        });

        // 注册缩放 → 地图缩放
        game.inputManager.onZoom((scale) => {
            this.map.scale.set(scale);
        });

        console.log('[CastleScene] 城堡场景已加载');
    }

    public onExit(): void {
        this.removeChildren();
        console.log('[CastleScene] 城堡场景已退出');
    }
}
