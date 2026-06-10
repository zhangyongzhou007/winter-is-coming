package com.winteriscoming.module.user.controller;

import com.winteriscoming.common.Result;
import com.winteriscoming.interceptor.JwtInterceptor;
import com.winteriscoming.module.user.dto.LoginDTO;
import com.winteriscoming.module.user.dto.RegisterDTO;
import com.winteriscoming.module.user.service.UserService;
import com.winteriscoming.module.user.vo.LoginVO;
import com.winteriscoming.module.user.vo.UserVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户接口
 */
@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 注册
     */
    @PostMapping("/register")
    public Result<UserVO> register(@Valid @RequestBody RegisterDTO dto) {
        return Result.ok(userService.register(dto));
    }

    /**
     * 登录
     */
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.ok(userService.login(dto));
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/info")
    public Result<UserVO> info() {
        Long userId = JwtInterceptor.getCurrentUserId();
        return Result.ok(userService.getUserInfo(userId));
    }
}
