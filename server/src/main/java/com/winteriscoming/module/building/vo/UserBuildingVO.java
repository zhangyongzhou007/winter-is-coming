package com.winteriscoming.module.building.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户建筑返回数据
 */
@Data
public class UserBuildingVO {

    private Long id;

    private String buildingKey;

    private String buildingName;

    private String category;

    private Integer level;

    private Integer positionIndex;

    /** 状态：1正常 2升级中 */
    private Integer status;

    /** 升级完成时间 */
    private LocalDateTime upgradeEndTime;

    /** 当前每小时产出 */
    private Integer productionPerHour;
}
