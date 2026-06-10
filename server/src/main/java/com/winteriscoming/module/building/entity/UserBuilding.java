package com.winteriscoming.module.building.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户建筑实体（用户已建造的建筑实例）
 */
@Data
@TableName("t_user_building")
public class UserBuilding {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;

    private String buildingKey;

    /** 建筑等级 */
    private Integer level;

    /** 槽位编号 */
    private Integer positionIndex;

    /** 状态：1正常 2升级中 */
    private Integer status;

    /** 升级完成时间 */
    private LocalDateTime upgradeEndTime;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
