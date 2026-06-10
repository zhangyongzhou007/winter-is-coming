package com.winteriscoming.module.building.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户资源实体
 */
@Data
@TableName("t_user_resource")
public class UserResource {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;

    private Integer grain;

    private Integer wood;

    private Integer stone;

    private Integer iron;

    private Integer coal;

    private Integer diamond;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
