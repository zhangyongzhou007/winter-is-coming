import { Application } from 'pixi.js';
import { SceneManager } from './SceneManager';
import { InputManager } from './InputManager';

/**
 * 游戏主类 - 初始化 PixiJS Application，管理生命周期
 */
export class Game {
    public app: Application;
    public sceneManager: SceneManager;
    public inputManager: InputManager;

    private static instance: Game;

    private constructor() {
        this.app = new Application();
        this.sceneManager = new SceneManager(this);
        this.inputManager = new InputManager(this);
    }

    public static getInstance(): Game {
        if (!Game.instance) {
            Game.instance = new Game();
        }
        return Game.instance;
    }

    /**
     * 初始化游戏
     */
    public async init(): Promise<void> {
        await this.app.init({
            background: '#1a1a2e',
            resizeTo: window,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        document.body.appendChild(this.app.canvas as HTMLCanvasElement);

        // 初始化输入管理器
        this.inputManager.init();

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        });

        console.log('[Game] 游戏初始化完成');
    }

    /**
     * 获取画布宽度
     */
    public get width(): number {
        return this.app.screen.width;
    }

    /**
     * 获取画布高度
     */
    public get height(): number {
        return this.app.screen.height;
    }
}
