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

// ===== 配置模块 =====

export const ConfigApi = {
    /** 获取配置版本号 */
    getVersion() {
        return HttpClient.get<string>('/config/version');
    },
};
