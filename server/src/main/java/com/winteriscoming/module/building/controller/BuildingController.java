package com.winteriscoming.module.building.controller;

import com.winteriscoming.common.Result;
import com.winteriscoming.interceptor.JwtInterceptor;
import com.winteriscoming.module.building.dto.BuildDTO;
import com.winteriscoming.module.building.dto.UpgradeDTO;
import com.winteriscoming.module.building.entity.ConfigBuilding;
import com.winteriscoming.module.building.entity.ConfigBuildingLevel;
import com.winteriscoming.module.building.service.BuildingService;
import com.winteriscoming.module.building.vo.BuildingInfoVO;
import com.winteriscoming.module.building.vo.UserBuildingVO;
import com.winteriscoming.module.building.vo.UserResourceVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 建筑模块控制器
 */
@RestController
@RequestMapping("/api/v1")
public class BuildingController {

    private final BuildingService buildingService;

    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    /**
     * 获取我的建筑列表
     */
    @GetMapping("/building/list")
    public Result<List<UserBuildingVO>> getMyBuildings() {
        Long userId = JwtInterceptor.getCurrentUserId();
        return Result.ok(buildingService.getUserBuildings(userId));
    }

    /**
     * 建造新建筑
     */
    @PostMapping("/building/build")
    public Result<UserBuildingVO> build(@Valid @RequestBody BuildDTO dto) {
        Long userId = JwtInterceptor.getCurrentUserId();
        return Result.ok(buildingService.build(userId, dto));
    }

    /**
     * 升级建筑
     */
    @PostMapping("/building/upgrade")
    public Result<UserBuildingVO> upgrade(@Valid @RequestBody UpgradeDTO dto) {
        Long userId = JwtInterceptor.getCurrentUserId();
        return Result.ok(buildingService.upgrade(userId, dto));
    }

    /**
     * 获取建筑详情（含下一级消耗）
     */
    @GetMapping("/building/info")
    public Result<BuildingInfoVO> getBuildingInfo(@RequestParam Long userBuildingId) {
        Long userId = JwtInterceptor.getCurrentUserId();
        return Result.ok(buildingService.getBuildingInfo(userId, userBuildingId));
    }

    /**
     * 获取我的资源
     */
    @GetMapping("/resource/my")
    public Result<UserResourceVO> getMyResource() {
        Long userId = JwtInterceptor.getCurrentUserId();
        return Result.ok(buildingService.getUserResource(userId));
    }

    /**
     * 获取全部建筑配置（不需要登录也可，放到config路径下）
     */
    @GetMapping("/config/buildings")
    public Result<List<ConfigBuilding>> getBuildingConfigs() {
        return Result.ok(buildingService.getAllBuildingConfigs());
    }

    /**
     * 获取全部建筑升级配置
     */
    @GetMapping("/config/building-levels")
    public Result<List<ConfigBuildingLevel>> getBuildingLevelConfigs() {
        return Result.ok(buildingService.getAllBuildingLevelConfigs());
    }
}
