package com.winteriscoming.module.building.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.winteriscoming.common.BizException;
import com.winteriscoming.common.ErrorCode;
import com.winteriscoming.module.building.dto.BuildDTO;
import com.winteriscoming.module.building.dto.UpgradeDTO;
import com.winteriscoming.module.building.entity.ConfigBuilding;
import com.winteriscoming.module.building.entity.ConfigBuildingLevel;
import com.winteriscoming.module.building.entity.UserBuilding;
import com.winteriscoming.module.building.entity.UserResource;
import com.winteriscoming.module.building.mapper.ConfigBuildingLevelMapper;
import com.winteriscoming.module.building.mapper.ConfigBuildingMapper;
import com.winteriscoming.module.building.mapper.UserBuildingMapper;
import com.winteriscoming.module.building.mapper.UserResourceMapper;
import com.winteriscoming.module.building.service.BuildingService;
import com.winteriscoming.module.building.vo.BuildingInfoVO;
import com.winteriscoming.module.building.vo.UserBuildingVO;
import com.winteriscoming.module.building.vo.UserResourceVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 建筑服务实现
 */
@Service
public class BuildingServiceImpl implements BuildingService {

    private final ConfigBuildingMapper configBuildingMapper;
    private final ConfigBuildingLevelMapper configBuildingLevelMapper;
    private final UserBuildingMapper userBuildingMapper;
    private final UserResourceMapper userResourceMapper;

    public BuildingServiceImpl(ConfigBuildingMapper configBuildingMapper,
                               ConfigBuildingLevelMapper configBuildingLevelMapper,
                               UserBuildingMapper userBuildingMapper,
                               UserResourceMapper userResourceMapper) {
        this.configBuildingMapper = configBuildingMapper;
        this.configBuildingLevelMapper = configBuildingLevelMapper;
        this.userBuildingMapper = userBuildingMapper;
        this.userResourceMapper = userResourceMapper;
    }

    @Override
    public List<UserBuildingVO> getUserBuildings(Long userId) {
        List<UserBuilding> buildings = userBuildingMapper.selectList(
                new LambdaQueryWrapper<UserBuilding>().eq(UserBuilding::getUserId, userId)
        );
        return buildings.stream().map(this::toUserBuildingVO).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserBuildingVO build(Long userId, BuildDTO dto) {
        // 1. 查建筑配置
        ConfigBuilding config = getConfigByKey(dto.getBuildingKey());

        // 2. 检查熔炉等级是否满足
        int furnaceLevel = getUserFurnaceLevel(userId);
        if (furnaceLevel < config.getUnlockFurnaceLevel()) {
            throw new BizException(ErrorCode.BUILDING_FURNACE_LEVEL_LOW);
        }

        // 3. 检查是否超过最大建造数量
        long currentCount = userBuildingMapper.selectCount(
                new LambdaQueryWrapper<UserBuilding>()
                        .eq(UserBuilding::getUserId, userId)
                        .eq(UserBuilding::getBuildingKey, dto.getBuildingKey())
        );
        if (currentCount >= config.getMaxCount()) {
            throw new BizException(ErrorCode.BUILDING_MAX_COUNT);
        }

        // 4. 检查槽位是否被占用
        Long slotOccupied = userBuildingMapper.selectCount(
                new LambdaQueryWrapper<UserBuilding>()
                        .eq(UserBuilding::getUserId, userId)
                        .eq(UserBuilding::getPositionIndex, dto.getPositionIndex())
        );
        if (slotOccupied > 0) {
            throw new BizException(ErrorCode.BUILDING_SLOT_OCCUPIED);
        }

        // 5. 查Lv.1升级配置，检查资源并扣除
        ConfigBuildingLevel levelConfig = getLevelConfig(dto.getBuildingKey(), 1);
        UserResource resource = getOrCreateResource(userId);
        checkAndDeductResource(resource, levelConfig);

        // 6. 创建建筑实例
        UserBuilding building = new UserBuilding();
        building.setUserId(userId);
        building.setBuildingKey(dto.getBuildingKey());
        building.setLevel(1);
        building.setPositionIndex(dto.getPositionIndex());
        building.setStatus(1);
        userBuildingMapper.insert(building);

        return toUserBuildingVO(building);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserBuildingVO upgrade(Long userId, UpgradeDTO dto) {
        // 1. 查用户建筑
        UserBuilding building = userBuildingMapper.selectById(dto.getUserBuildingId());
        if (building == null || !building.getUserId().equals(userId)) {
            throw new BizException(ErrorCode.BUILDING_NOT_FOUND);
        }

        // 2. 检查是否正在升级
        if (building.getStatus() == 2) {
            throw new BizException(ErrorCode.BUILDING_UPGRADING);
        }

        // 3. 检查是否已达最高等级
        ConfigBuilding config = getConfigByKey(building.getBuildingKey());
        if (building.getLevel() >= config.getMaxLevel()) {
            throw new BizException(ErrorCode.BUILDING_MAX_LEVEL);
        }

        int nextLevel = building.getLevel() + 1;

        // 4. 查下一级配置
        ConfigBuildingLevel levelConfig = getLevelConfig(building.getBuildingKey(), nextLevel);

        // 5. 非熔炉建筑，检查熔炉等级是否满足
        if (!"furnace".equals(building.getBuildingKey())) {
            int furnaceLevel = getUserFurnaceLevel(userId);
            if (furnaceLevel < levelConfig.getRequireFurnaceLevel()) {
                throw new BizException(ErrorCode.BUILDING_FURNACE_LEVEL_LOW);
            }
        }

        // 6. 检查资源并扣除
        UserResource resource = getOrCreateResource(userId);
        checkAndDeductResource(resource, levelConfig);

        // 7. 设置升级状态和完成时间
        building.setStatus(2);
        building.setUpgradeEndTime(LocalDateTime.now().plusSeconds(levelConfig.getUpgradeTimeSeconds()));
        userBuildingMapper.updateById(building);

        // 8. 立即完成升级（当前阶段简化处理，后续改为定时任务）
        building.setLevel(nextLevel);
        building.setStatus(1);
        building.setUpgradeEndTime(null);
        userBuildingMapper.updateById(building);

        return toUserBuildingVO(building);
    }

    @Override
    public BuildingInfoVO getBuildingInfo(Long userId, Long userBuildingId) {
        UserBuilding building = userBuildingMapper.selectById(userBuildingId);
        if (building == null || !building.getUserId().equals(userId)) {
            throw new BizException(ErrorCode.BUILDING_NOT_FOUND);
        }

        ConfigBuilding config = getConfigByKey(building.getBuildingKey());
        BuildingInfoVO vo = new BuildingInfoVO();
        vo.setUserBuildingId(building.getId());
        vo.setBuildingKey(building.getBuildingKey());
        vo.setBuildingName(config.getBuildingName());
        vo.setCategory(config.getCategory());
        vo.setCurrentLevel(building.getLevel());
        vo.setMaxLevel(config.getMaxLevel());

        // 当前等级的产出/加成
        ConfigBuildingLevel currentLevelConfig = getLevelConfigOrNull(building.getBuildingKey(), building.getLevel());
        if (currentLevelConfig != null) {
            vo.setProductionPerHour(currentLevelConfig.getProductionPerHour());
            vo.setHpBonus(currentLevelConfig.getHpBonus());
            vo.setCapacityBonus(currentLevelConfig.getCapacityBonus());
        } else {
            vo.setProductionPerHour(0);
            vo.setHpBonus(0);
            vo.setCapacityBonus(0);
        }

        // 下一级消耗
        if (building.getLevel() < config.getMaxLevel()) {
            ConfigBuildingLevel nextLevelConfig = getLevelConfigOrNull(building.getBuildingKey(), building.getLevel() + 1);
            if (nextLevelConfig != null) {
                vo.setNextCostGrain(nextLevelConfig.getCostGrain());
                vo.setNextCostWood(nextLevelConfig.getCostWood());
                vo.setNextCostStone(nextLevelConfig.getCostStone());
                vo.setNextCostIron(nextLevelConfig.getCostIron());
                vo.setNextCostCoal(nextLevelConfig.getCostCoal());
                vo.setNextUpgradeTimeSeconds(nextLevelConfig.getUpgradeTimeSeconds());
                vo.setNextRequireFurnaceLevel(nextLevelConfig.getRequireFurnaceLevel());

                // 判断是否可升级
                UserResource resource = getOrCreateResource(userId);
                int furnaceLevel = getUserFurnaceLevel(userId);
                boolean canAfford = resource.getGrain() >= nextLevelConfig.getCostGrain()
                        && resource.getWood() >= nextLevelConfig.getCostWood()
                        && resource.getStone() >= nextLevelConfig.getCostStone()
                        && resource.getIron() >= nextLevelConfig.getCostIron()
                        && resource.getCoal() >= nextLevelConfig.getCostCoal();
                boolean furnaceOk = "furnace".equals(building.getBuildingKey())
                        || furnaceLevel >= nextLevelConfig.getRequireFurnaceLevel();
                vo.setCanUpgrade(canAfford && furnaceOk && building.getStatus() == 1);
            } else {
                vo.setCanUpgrade(false);
            }
        } else {
            vo.setCanUpgrade(false);
        }

        return vo;
    }

    @Override
    public List<ConfigBuilding> getAllBuildingConfigs() {
        return configBuildingMapper.selectList(
                new LambdaQueryWrapper<ConfigBuilding>().eq(ConfigBuilding::getStatus, 1)
        );
    }

    @Override
    public List<ConfigBuildingLevel> getAllBuildingLevelConfigs() {
        return configBuildingLevelMapper.selectList(
                new LambdaQueryWrapper<ConfigBuildingLevel>().eq(ConfigBuildingLevel::getStatus, 1)
        );
    }

    @Override
    public UserResourceVO getUserResource(Long userId) {
        UserResource resource = getOrCreateResource(userId);
        UserResourceVO vo = new UserResourceVO();
        vo.setGrain(resource.getGrain());
        vo.setWood(resource.getWood());
        vo.setStone(resource.getStone());
        vo.setIron(resource.getIron());
        vo.setCoal(resource.getCoal());
        vo.setDiamond(resource.getDiamond());
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void initNewUser(Long userId) {
        // 1. 创建Lv.0熔炉
        UserBuilding furnace = new UserBuilding();
        furnace.setUserId(userId);
        furnace.setBuildingKey("furnace");
        furnace.setLevel(0);
        furnace.setPositionIndex(0);
        furnace.setStatus(1);
        userBuildingMapper.insert(furnace);

        // 2. 创建初始资源
        UserResource resource = new UserResource();
        resource.setUserId(userId);
        resource.setGrain(500);
        resource.setWood(500);
        resource.setStone(0);
        resource.setIron(0);
        resource.setCoal(0);
        resource.setDiamond(10);
        userResourceMapper.insert(resource);
    }

    // ==================== 私有方法 ====================

    /**
     * 根据建筑key查配置
     */
    private ConfigBuilding getConfigByKey(String buildingKey) {
        ConfigBuilding config = configBuildingMapper.selectOne(
                new LambdaQueryWrapper<ConfigBuilding>().eq(ConfigBuilding::getBuildingKey, buildingKey)
        );
        if (config == null) {
            throw new BizException(ErrorCode.BUILDING_CONFIG_NOT_FOUND);
        }
        return config;
    }

    /**
     * 查建筑升级配置（必须存在）
     */
    private ConfigBuildingLevel getLevelConfig(String buildingKey, int level) {
        ConfigBuildingLevel config = getLevelConfigOrNull(buildingKey, level);
        if (config == null) {
            throw new BizException(ErrorCode.BUILDING_LEVEL_CONFIG_NOT_FOUND);
        }
        return config;
    }

    /**
     * 查建筑升级配置（允许null）
     */
    private ConfigBuildingLevel getLevelConfigOrNull(String buildingKey, int level) {
        return configBuildingLevelMapper.selectOne(
                new LambdaQueryWrapper<ConfigBuildingLevel>()
                        .eq(ConfigBuildingLevel::getBuildingKey, buildingKey)
                        .eq(ConfigBuildingLevel::getLevel, level)
        );
    }

    /**
     * 获取用户熔炉等级
     */
    private int getUserFurnaceLevel(Long userId) {
        UserBuilding furnace = userBuildingMapper.selectOne(
                new LambdaQueryWrapper<UserBuilding>()
                        .eq(UserBuilding::getUserId, userId)
                        .eq(UserBuilding::getBuildingKey, "furnace")
        );
        return furnace != null ? furnace.getLevel() : 0;
    }

    /**
     * 获取或创建用户资源记录
     */
    private UserResource getOrCreateResource(Long userId) {
        UserResource resource = userResourceMapper.selectOne(
                new LambdaQueryWrapper<UserResource>().eq(UserResource::getUserId, userId)
        );
        if (resource == null) {
            resource = new UserResource();
            resource.setUserId(userId);
            resource.setGrain(0);
            resource.setWood(0);
            resource.setStone(0);
            resource.setIron(0);
            resource.setCoal(0);
            resource.setDiamond(0);
            userResourceMapper.insert(resource);
        }
        return resource;
    }

    /**
     * 检查资源是否足够并扣除
     */
    private void checkAndDeductResource(UserResource resource, ConfigBuildingLevel levelConfig) {
        if (resource.getGrain() < levelConfig.getCostGrain()
                || resource.getWood() < levelConfig.getCostWood()
                || resource.getStone() < levelConfig.getCostStone()
                || resource.getIron() < levelConfig.getCostIron()
                || resource.getCoal() < levelConfig.getCostCoal()) {
            throw new BizException(ErrorCode.BUILDING_RESOURCE_NOT_ENOUGH);
        }

        resource.setGrain(resource.getGrain() - levelConfig.getCostGrain());
        resource.setWood(resource.getWood() - levelConfig.getCostWood());
        resource.setStone(resource.getStone() - levelConfig.getCostStone());
        resource.setIron(resource.getIron() - levelConfig.getCostIron());
        resource.setCoal(resource.getCoal() - levelConfig.getCostCoal());
        userResourceMapper.updateById(resource);
    }

    /**
     * 用户建筑实体转VO
     */
    private UserBuildingVO toUserBuildingVO(UserBuilding building) {
        UserBuildingVO vo = new UserBuildingVO();
        vo.setId(building.getId());
        vo.setBuildingKey(building.getBuildingKey());
        vo.setLevel(building.getLevel());
        vo.setPositionIndex(building.getPositionIndex());
        vo.setStatus(building.getStatus());
        vo.setUpgradeEndTime(building.getUpgradeEndTime());

        // 填充配置信息
        try {
            ConfigBuilding config = getConfigByKey(building.getBuildingKey());
            vo.setBuildingName(config.getBuildingName());
            vo.setCategory(config.getCategory());
        } catch (Exception e) {
            vo.setBuildingName(building.getBuildingKey());
            vo.setCategory("unknown");
        }

        // 填充当前产出
        ConfigBuildingLevel levelConfig = getLevelConfigOrNull(building.getBuildingKey(), building.getLevel());
        vo.setProductionPerHour(levelConfig != null ? levelConfig.getProductionPerHour() : 0);

        return vo;
    }
}
