import { Game } from './core/Game';
import { AssetManager } from './core/AssetManager';
import { CastleScene } from './scenes/CastleScene';

/**
 * 游戏入口
 */
async function bootstrap(): Promise<void> {
    console.log('[Main] 冷冬将至 - 启动中...');

    // 1. 初始化游戏引擎
    const game = Game.getInstance();
    await game.init();

    // 2. 预加载资源
    await AssetManager.loadAll();

    // 3. 进入城堡主城场景
    const castleScene = new CastleScene();
    game.sceneManager.switchTo(castleScene);

    console.log('[Main] 游戏启动完成');
}

bootstrap().catch((err) => {
    console.error('[Main] 游戏启动失败:', err);
});
