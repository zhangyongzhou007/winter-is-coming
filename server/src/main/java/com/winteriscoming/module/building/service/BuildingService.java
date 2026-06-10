package com.winteriscoming.module.building.service;

import com.winteriscoming.module.building.dto.BuildDTO;
import com.winteriscoming.module.building.dto.UpgradeDTO;
import com.winteriscoming.module.building.entity.ConfigBuilding;
import com.winteriscoming.module.building.entity.ConfigBuildingLevel;
import com.winteriscoming.module.building.vo.BuildingInfoVO;
import com.winteriscoming.module.building.vo.UserBuildingVO;
import com.winteriscoming.module.building.vo.UserResourceVO;

import java.util.List;

/**
 * 建筑服务接口
 */
public interface BuildingService {

    /**
     * 获取用户所有建筑列表
     */
    List<UserBuildingVO> getUserBuildings(Long userId);

    /**
     * 建造新建筑
     */
    UserBuildingVO build(Long userId, BuildDTO dto);

    /**
     * 升级建筑
     */
    UserBuildingVO upgrade(Long userId, UpgradeDTO dto);

    /**
     * 获取建筑详情（含下一级消耗）
     */
    BuildingInfoVO getBuildingInfo(Long userId, Long userBuildingId);

    /**
     * 获取全部建筑配置
     */
    List<ConfigBuilding> getAllBuildingConfigs();

    /**
     * 获取全部建筑升级配置
     */
    List<ConfigBuildingLevel> getAllBuildingLevelConfigs();

    /**
     * 获取用户资源
     */
    UserResourceVO getUserResource(Long userId);

    /**
     * 初始化新用户数据（注册后调用：创建Lv.0熔炉 + 初始资源）
     */
    void initNewUser(Long userId);
}
