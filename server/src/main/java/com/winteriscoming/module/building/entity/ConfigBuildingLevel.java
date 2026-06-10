package com.winteriscoming.module.building.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 建筑升级配置实体（每级的消耗/时间/产出）
 */
@Data
@TableName("t_config_building_level")
public class ConfigBuildingLevel {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String buildingKey;

    private Integer level;

    private Integer costGrain;

    private Integer costWood;

    private Integer costStone;

    private Integer costIron;

    private Integer costCoal;

    private Integer upgradeTimeSeconds;

    private Integer productionPerHour;

    private Integer hpBonus;

    private Integer capacityBonus;

    /** 升到该级需要的熔炉等级 */
    private Integer requireFurnaceLevel;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
