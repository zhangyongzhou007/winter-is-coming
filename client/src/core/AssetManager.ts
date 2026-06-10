/**
 * 资源加载管理器
 * 第一阶段用代码生成色块，后续扩展为加载实际美术素材
 */
export class AssetManager {
    private static loaded = false;

    /**
     * 预加载所有资源
     */
    public static async loadAll(): Promise<void> {
        if (this.loaded) return;

        // 第一阶段暂无需要预加载的外部资源
        // 后续在此处添加纹理、音频等资源的加载
        console.log('[AssetManager] 资源加载完成（第一阶段无外部资源）');
        this.loaded = true;
    }
}
