package com.winteriscoming.module.user.service;

import com.winteriscoming.module.user.dto.LoginDTO;
import com.winteriscoming.module.user.dto.RegisterDTO;
import com.winteriscoming.module.user.vo.LoginVO;
import com.winteriscoming.module.user.vo.UserVO;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 用户注册
     */
    UserVO register(RegisterDTO dto);

    /**
     * 用户登录
     */
    LoginVO login(LoginDTO dto);

    /**
     * 获取用户信息
     */
    UserVO getUserInfo(Long userId);
}
