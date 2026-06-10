package com.winteriscoming.module.building.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 建筑配置实体
 */
@Data
@TableName("t_config_building")
public class ConfigBuilding {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String buildingKey;

    private String buildingName;

    /** 分类：core/resource/military/function */
    private String category;

    private Integer maxLevel;

    private Integer baseCostGrain;

    private Integer baseCostWood;

    private Integer baseCostStone;

    private Integer baseCostIron;

    private Integer baseCostCoal;

    private Integer buildTimeSeconds;

    /** 解锁所需熔炉等级 */
    private Integer unlockFurnaceLevel;

    /** 最大建造数量 */
    private Integer maxCount;

    /** 产出资源类型：grain/wood/stone/iron/coal */
    private String productionResource;

    /** 基础每小时产出量 */
    private Integer baseProductionPerHour;

    private String description;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
