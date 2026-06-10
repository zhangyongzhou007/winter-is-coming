package com.winteriscoming.module.gameconfig.controller;

import com.winteriscoming.common.Result;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 配置接口（只读）
 */
@RestController
@RequestMapping("/api/v1/config")
public class ConfigController {

    private final StringRedisTemplate redisTemplate;

    /** Redis 中配置版本号的 key */
    private static final String CONFIG_VERSION_KEY = "game:config:version";

    public ConfigController(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * 获取配置版本号，客户端用于判断是否需要热更
     */
    @GetMapping("/version")
    public Result<String> version() {
        String version = redisTemplate.opsForValue().get(CONFIG_VERSION_KEY);
        if (version == null) {
            version = "1.0.0";
        }
        return Result.ok(version);
    }
}
