package com.winteriscoming.module.user.vo;

import lombok.Data;

/**
 * 登录成功返回
 */
@Data
public class LoginVO {

    private String token;

    private UserVO userInfo;
}
