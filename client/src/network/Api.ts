import { HttpClient } from './HttpClient';

/**
 * 接口定义
 */

// ===== 类型定义 =====

export interface UserInfo {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
    level: number;
    lastLoginTime: string;
    createTime: string;
}

export interface LoginResult {
    token: string;
    userInfo: UserInfo;
}

/** 用户建筑数据 */
export interface UserBuildingData {
    id: number;
    buildingKey: string;
    buildingName: string;
    category: string;
    level: number;
    positionIndex: number;
    status: number;
    upgradeEndTime: string | null;
    productionPerHour: number;
}

/** 建筑详情 */
export interface BuildingInfoData {
    userBuildingId: number;
    buildingKey: string;
    buildingName: string;
    category: string;
    currentLevel: number;
    maxLevel: number;
    productionPerHour: number;
    hpBonus: number;
    capacityBonus: number;
    nextCostGrain: number;
    nextCostWood: number;
    nextCostStone: number;
    nextCostIron: number;
    nextCostCoal: number;
    nextUpgradeTimeSeconds: number;
    nextRequireFurnaceLevel: number;
    canUpgrade: boolean;
}

/** 建筑配置 */
export interface BuildingConfig {
    id: number;
    buildingKey: string;
    buildingName: string;
    category: string;
    maxLevel: number;
    unlockFurnaceLevel: number;
    maxCount: number;
    productionResource: string | null;
    baseProductionPerHour: number;
    description: string;
}

/** 建筑升级配置 */
export interface BuildingLevelConfig {
    id: number;
    buildingKey: string;
    level: number;
    costGrain: number;
    costWood: number;
    costStone: number;
    costIron: number;
    costCoal: number;
    upgradeTimeSeconds: number;
    productionPerHour: number;
    hpBonus: number;
    capacityBonus: number;
    requireFurnaceLevel: number;
}

/** 用户资源 */
export interface UserResourceData {
    grain: number;
    wood: number;
    stone: number;
    iron: number;
    coal: number;
    diamond: number;
}

// ===== 用户模块 =====

export const UserApi = {
    /** 注册 */
    register(username: string, password: string, nickname?: string) {
        return HttpClient.post<UserInfo>('/user/register', { username, password, nickname });
    },

    /** 登录 */
    async login(username: string, password: string) {
        const result = await HttpClient.post<LoginResult>('/user/login', { username, password });
        HttpClient.setToken(result.token);
        return result;
    },

    /** 获取用户信息 */
    getInfo() {
        return HttpClient.get<UserInfo>('/user/info');
    },
};

// ===== 建筑模块 =====

export const BuildingApi = {
    /** 获取我的建筑列表 */
    getMyBuildings() {
        return HttpClient.get<UserBuildingData[]>('/building/list');
    },

    /** 建造新建筑 */
    build(buildingKey: string, positionIndex: number) {
        return HttpClient.post<UserBuildingData>('/building/build', { buildingKey, positionIndex });
    },

    /** 升级建筑 */
    upgrade(userBuildingId: number) {
        return HttpClient.post<UserBuildingData>('/building/upgrade', { userBuildingId });
    },

    /** 获取建筑详情 */
    getBuildingInfo(userBuildingId: number) {
        return HttpClient.get<BuildingInfoData>('/building/info', { userBuildingId: String(userBuildingId) });
    },
};

// ===== 资源模块 =====

export const ResourceApi = {
    /** 获取我的资源 */
    getMyResource() {
        return HttpClient.get<UserResourceData>('/resource/my');
    },
};

// ===== 配置模块 =====

export const ConfigApi = {
    /** 获取配置版本号 */
    getVersion() {
        return HttpClient.get<string>('/config/version');
    },

    /** 获取全部建筑配置 */
    getBuildingConfigs() {
        return HttpClient.get<BuildingConfig[]>('/config/buildings');
    },

    /** 获取全部建筑升级配置 */
    getBuildingLevelConfigs() {
        return HttpClient.get<BuildingLevelConfig[]>('/config/building-levels');
    },
};
