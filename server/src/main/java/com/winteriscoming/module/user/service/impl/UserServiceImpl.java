package com.winteriscoming.module.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.winteriscoming.common.BizException;
import com.winteriscoming.common.ErrorCode;
import com.winteriscoming.module.building.service.BuildingService;
import com.winteriscoming.module.user.dto.LoginDTO;
import com.winteriscoming.module.user.dto.RegisterDTO;
import com.winteriscoming.module.user.entity.User;
import com.winteriscoming.module.user.mapper.UserMapper;
import com.winteriscoming.module.user.service.UserService;
import com.winteriscoming.module.user.vo.LoginVO;
import com.winteriscoming.module.user.vo.UserVO;
import com.winteriscoming.util.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

/**
 * 用户服务实现
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final BuildingService buildingService;

    /** 密码加盐前缀 */
    private static final String SALT = "winter_is_coming_";

    public UserServiceImpl(UserMapper userMapper, JwtUtil jwtUtil, BuildingService buildingService) {
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
        this.buildingService = buildingService;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVO register(RegisterDTO dto) {
        // 检查用户名是否已存在
        LambdaQueryWrapper<User> query = new LambdaQueryWrapper<>();
        query.eq(User::getUsername, dto.getUsername());
        if (userMapper.selectCount(query) > 0) {
            throw new BizException(ErrorCode.USERNAME_EXIST);
        }

        // 创建用户
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(encryptPassword(dto.getPassword()));
        user.setNickname(dto.getNickname() != null ? dto.getNickname() : dto.getUsername());
        user.setLevel(1);
        user.setStatus(1);
        userMapper.insert(user);

        // 初始化新用户游戏数据（Lv.0熔炉 + 初始资源）
        buildingService.initNewUser(user.getId());

        return toUserVO(user);
    }

    @Override
    public LoginVO login(LoginDTO dto) {
        // 查找用户
        LambdaQueryWrapper<User> query = new LambdaQueryWrapper<>();
        query.eq(User::getUsername, dto.getUsername());
        User user = userMapper.selectOne(query);
        if (user == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND);
        }

        // 校验密码
        if (!user.getPassword().equals(encryptPassword(dto.getPassword()))) {
            throw new BizException(ErrorCode.PASSWORD_ERROR);
        }

        // 校验账号状态
        if (user.getStatus() != 1) {
            throw new BizException(ErrorCode.ACCOUNT_DISABLED);
        }

        // 更新最后登录时间
        User updateUser = new User();
        updateUser.setId(user.getId());
        updateUser.setLastLoginTime(LocalDateTime.now());
        userMapper.updateById(updateUser);

        // 生成 token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setUserInfo(toUserVO(user));
        return loginVO;
    }

    @Override
    public UserVO getUserInfo(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND);
        }
        return toUserVO(user);
    }

    /**
     * 密码加密：MD5(salt + password)
     */
    private String encryptPassword(String password) {
        try {
            String raw = SALT + password;
            return DigestUtils.md5DigestAsHex(raw.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new BizException("密码处理失败");
        }
    }

    /**
     * Entity 转 VO
     */
    private UserVO toUserVO(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setLevel(user.getLevel());
        vo.setLastLoginTime(user.getLastLoginTime());
        vo.setCreateTime(user.getCreateTime());
        return vo;
    }
}
