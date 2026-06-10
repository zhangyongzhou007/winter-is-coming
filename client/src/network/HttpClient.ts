/**
 * HTTP 请求客户端 - 封装 fetch，统一处理 JWT token 和错误
 */
export class HttpClient {
    private static baseURL = '/api/v1';
    private static token: string | null = null;

    /**
     * 设置 JWT token
     */
    public static setToken(token: string): void {
        this.token = token;
        localStorage.setItem('token', token);
    }

    /**
     * 获取存储的 token
     */
    public static getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    }

    /**
     * 清除 token
     */
    public static clearToken(): void {
        this.token = null;
        localStorage.removeItem('token');
    }

    /**
     * GET 请求
     */
    public static async get<T>(url: string, params?: Record<string, string>): Promise<T> {
        let fullUrl = `${this.baseURL}${url}`;
        if (params) {
            const query = new URLSearchParams(params).toString();
            fullUrl += `?${query}`;
        }
        return this.request<T>(fullUrl, { method: 'GET' });
    }

    /**
     * POST 请求
     */
    public static async post<T>(url: string, data?: unknown): Promise<T> {
        const fullUrl = `${this.baseURL}${url}`;
        return this.request<T>(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * 统一请求处理
     */
    private static async request<T>(url: string, options: RequestInit): Promise<T> {
        const headers: Record<string, string> = {
            ...(options.headers as Record<string, string>),
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            const result = await response.json();

            if (result.code === 200) {
                return result.data as T;
            }

            // 未登录，清除 token
            if (result.code === 401) {
                this.clearToken();
            }

            throw new Error(result.msg || '请求失败');
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('网络请求异常');
        }
    }
}
