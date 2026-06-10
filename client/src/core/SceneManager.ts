import { Container } from 'pixi.js';
import type { Game } from './Game';

/**
 * 场景基类
 */
export abstract class Scene extends Container {
    abstract onEnter(): void;
    abstract onExit(): void;
}

/**
 * 场景管理器 - 处理场景切换
 */
export class SceneManager {
    private game: Game;
    private currentScene: Scene | null = null;

    constructor(game: Game) {
        this.game = game;
    }

    /**
     * 切换到指定场景
     */
    public switchTo(scene: Scene): void {
        // 退出当前场景
        if (this.currentScene) {
            this.currentScene.onExit();
            this.game.app.stage.removeChild(this.currentScene);
        }

        // 进入新场景
        this.currentScene = scene;
        this.game.app.stage.addChild(scene);
        scene.onEnter();

        console.log(`[SceneManager] 切换场景: ${scene.constructor.name}`);
    }

    /**
     * 获取当前场景
     */
    public getCurrentScene(): Scene | null {
        return this.currentScene;
    }
}
