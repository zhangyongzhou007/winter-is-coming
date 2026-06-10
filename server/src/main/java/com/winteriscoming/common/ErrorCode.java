package com.winteriscoming.common;

import lombok.Getter;

/**
 * 业务错误码枚举
 */
@Getter
public enum ErrorCode {

    // 通用
    SUCCESS(200, "success"),
    SYSTEM_ERROR(500, "系统繁忙，请稍后再试"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "无权限访问"),

    // 用户模块 1001-1099
    USER_NOT_FOUND(1001, "用户不存在"),
    USERNAME_EXIST(1002, "用户名已存在"),
    PASSWORD_ERROR(1003, "密码错误"),
    ACCOUNT_DISABLED(1004, "账号已被禁用"),

    // 配置模块 2001-2099
    CONFIG_NOT_FOUND(2001, "配置不存在"),
    ;

    private final int code;
    private final String msg;

    ErrorCode(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }
}
