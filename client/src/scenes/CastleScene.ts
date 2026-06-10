import { Container, Graphics } from 'pixi.js';
import { Scene } from '../core/SceneManager';
import { Game } from '../core/Game';
import { HUD } from '../ui/HUD';
import { BottomBar } from '../ui/BottomBar';
import { BuildingSlot } from '../castle/BuildingSlot';
import { BuildingInfoPanel } from '../ui/panels/BuildingInfoPanel';
import { BuildPanel } from '../ui/panels/BuildPanel';
import {
    CASTLE_SLOTS,
    CASTLE_TILE_WIDTH,
    CASTLE_TILE_HEIGHT,
    getCastleCenter,
    gridToIso,
    BuildingCategory,
} from '../castle/CastleLayout';
import {
    BuildingApi,
    ResourceApi,
    ConfigApi,
    UserBuildingData,
    BuildingConfig,
} from '../network/Api';
import { HttpClient } from '../network/HttpClient';

/**
 * 城堡主城场景 — 城堡内部俯视布局
 *
 * 中心是熔炉，周围分布 15 个建筑槽位。
 * 支持点击建筑查看详情/升级，点击空槽位建造新建筑。
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

    /** 建筑详情面板 */
    private buildingInfoPanel: BuildingInfoPanel;

    /** 建造面板 */
    private buildPanel: BuildPanel;

    /** 建筑配置缓存 */
    private buildingConfigs: BuildingConfig[] = [];

    constructor() {
        super();

        this.castleContainer = new Container();
        this.ground = new Graphics();
        this.hud = new HUD();
        this.bottomBar = new BottomBar();
        this.buildingInfoPanel = new BuildingInfoPanel();
        this.buildPanel = new BuildPanel();
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

        // 6. 添加UI面板（在最上层）
        this.addChild(this.buildingInfoPanel);
        this.addChild(this.buildPanel);
        this.setupPanelCallbacks();

        // 7. 注册拖拽 → 移动城堡视图
        game.inputManager.onDrag((dx, dy) => {
            this.castleContainer.position.x += dx;
            this.castleContainer.position.y += dy;
        });

        // 8. 注册缩放 → 城堡缩放
        game.inputManager.onZoom((scale) => {
            this.castleContainer.scale.set(scale);
        });

        // 9. 监听窗口大小变化
        window.addEventListener('resize', this.onResize);

        // 10. 如果有token，加载后端数据
        if (HttpClient.getToken()) {
            this.loadServerData();
        }

        console.log('[CastleScene] 城堡内部场景已加载');
    }

    public onExit(): void {
        window.removeEventListener('resize', this.onResize);
        this.removeChildren();
        this.slots = [];
        console.log('[CastleScene] 城堡场景已退出');
    }

    /**
     * 设置面板回调
     */
    private setupPanelCallbacks(): void {
        // 升级回调
        this.buildingInfoPanel.onUpgrade(async (userBuildingId) => {
            try {
                await BuildingApi.upgrade(userBuildingId);
                this.buildingInfoPanel.close();
                await this.refresh();
                console.log('[CastleScene] 升级成功');
            } catch (error) {
                console.error('[CastleScene] 升级失败:', error);
            }
        });

        // 建造回调
        this.buildPanel.onBuild(async (buildingKey, positionIndex) => {
            try {
                await BuildingApi.build(buildingKey, positionIndex);
                this.buildPanel.close();
                await this.refresh();
                console.log('[CastleScene] 建造成功');
            } catch (error) {
                console.error('[CastleScene] 建造失败:', error);
            }
        });
    }

    /**
     * 从后端加载建筑和资源数据
     */
    private async loadServerData(): Promise<void> {
        try {
            // 并发加载建筑列表、资源、建筑配置
            const [buildings, resource, configs] = await Promise.all([
                BuildingApi.getMyBuildings(),
                ResourceApi.getMyResource(),
                ConfigApi.getBuildingConfigs(),
            ]);

            // 缓存建筑配置
            this.buildingConfigs = configs;
            this.buildPanel.setBuildingConfigs(configs);

            // 更新建筑到对应槽位
            this.applyBuildingData(buildings);

            // 更新熔炉等级到建造面板
            const furnace = buildings.find((b) => b.buildingKey === 'furnace');
            this.buildPanel.setFurnaceLevel(furnace ? furnace.level : 0);

            // 更新HUD资源
            this.hud.updateAllResources([
                resource.grain,
                resource.wood,
                resource.stone,
                resource.iron,
                resource.coal,
                resource.diamond,
            ]);

            console.log(`[CastleScene] 已加载 ${buildings.length} 个建筑, ${configs.length} 种配置`);
        } catch (error) {
            console.warn('[CastleScene] 加载服务端数据失败，使用离线模式:', error);
        }
    }

    /**
     * 将后端建筑数据应用到槽位上
     */
    private applyBuildingData(buildings: UserBuildingData[]): void {
        // 先清空所有槽位（除了默认熔炉）
        this.slots.forEach((slot) => {
            if (!slot.config.defaultBuildingKey) {
                slot.clearBuilding();
            }
        });

        // 再应用后端数据
        buildings.forEach((b) => {
            const slot = this.getSlot(b.positionIndex);
            if (slot) {
                slot.setBuilding(b.buildingKey, b.buildingName, b.level);
                slot.setServerBuildingId(b.id);
            }
        });
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

            slot.onClick(async (clickedSlot) => {
                const key = clickedSlot.getBuildingKey();
                const serverId = clickedSlot.getServerBuildingId();

                if (key && serverId) {
                    // 有建筑：请求详情并弹出信息面板
                    try {
                        const info = await BuildingApi.getBuildingInfo(serverId);
                        this.buildingInfoPanel.show(info);
                    } catch (error) {
                        console.error('[CastleScene] 获取建筑详情失败:', error);
                    }
                } else if (!key) {
                    // 空槽位：弹出建造面板
                    this.buildPanel.show(
                        clickedSlot.config.category as BuildingCategory,
                        clickedSlot.config.slotId
                    );
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
     * 获取指定槽位
     */
    public getSlot(slotId: number): BuildingSlot | undefined {
        return this.slots.find((s) => s.config.slotId === slotId);
    }

    /**
     * 获取所有槽位
     */
    public getAllSlots(): BuildingSlot[] {
        return this.slots;
    }

    /**
     * 刷新数据（建造/升级后调用）
     */
    public async refresh(): Promise<void> {
        await this.loadServerData();
    }
}
