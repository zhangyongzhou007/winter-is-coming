package com.winteriscoming.module.building.vo;

import lombok.Data;

/**
 * 建筑详情返回数据（含下一级升级消耗）
 */
@Data
public class BuildingInfoVO {

    private Long userBuildingId;

    private String buildingKey;

    private String buildingName;

    private String category;

    private Integer currentLevel;

    private Integer maxLevel;

    /** 当前每小时产出 */
    private Integer productionPerHour;

    /** 当前防御/容量加成 */
    private Integer hpBonus;

    private Integer capacityBonus;

    /** 下一级升级消耗 */
    private Integer nextCostGrain;

    private Integer nextCostWood;

    private Integer nextCostStone;

    private Integer nextCostIron;

    private Integer nextCostCoal;

    private Integer nextUpgradeTimeSeconds;

    /** 下一级需要的熔炉等级 */
    private Integer nextRequireFurnaceLevel;

    /** 是否可升级 */
    private Boolean canUpgrade;
}
