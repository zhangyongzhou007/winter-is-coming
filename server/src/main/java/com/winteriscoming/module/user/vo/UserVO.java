package com.winteriscoming.module.user.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户信息返回
 */
@Data
public class UserVO {

    private Long id;

    private String username;

    private String nickname;

    private String avatar;

    private Integer level;

    private LocalDateTime lastLoginTime;

    private LocalDateTime createTime;
}
