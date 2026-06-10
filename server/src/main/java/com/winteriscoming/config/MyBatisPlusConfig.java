package com.winteriscoming.config;

import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
import com.winteriscoming.util.SnowflakeIdGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis-Plus 配置
 */
@Configuration
public class MyBatisPlusConfig {

    /**
     * 雪花算法ID生成器，注册到 MyBatis-Plus
     */
    @Bean
    public IdentifierGenerator idGenerator() {
        SnowflakeIdGenerator snowflake = new SnowflakeIdGenerator(1, 1);
        return entity -> snowflake.nextId();
    }
}
