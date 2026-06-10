package com.winteriscoming.interceptor;

import com.winteriscoming.common.BizException;
import com.winteriscoming.common.ErrorCode;
import com.winteriscoming.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT 登录校验拦截器
 */
@Component
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    /** ThreadLocal 存储当前登录用户ID */
    private static final ThreadLocal<Long> CURRENT_USER_ID = new ThreadLocal<>();

    public JwtInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader("Authorization");
        if (token == null || token.isBlank()) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }

        // 去掉 Bearer 前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (!jwtUtil.validateToken(token)) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        CURRENT_USER_ID.set(userId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        CURRENT_USER_ID.remove();
    }

    /**
     * 获取当前登录用户ID
     */
    public static Long getCurrentUserId() {
        Long userId = CURRENT_USER_ID.get();
        if (userId == null) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }
        return userId;
    }
}
