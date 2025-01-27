// API 配置
const API_BASE_URL = 'http://localhost:8080';

// 主应用
const app = {
    init() {
        this.checkAuth();
        this.bindEvents();
    },

    checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            this.showLoginForm();
        } else {
            this.showDashboard();
        }
    },

    bindEvents() {
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin(e.target);
            }
        });
    },

    showLoginForm() {
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = `
            <div class="login-container">
                <form id="loginForm" class="login-form">
                    <h2>登录</h2>
                    <div class="form-group">
                        <label for="username">用户名</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">密码</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit">登录</button>
                </form>
            </div>
        `;
    },

    async handleLogin(form) {
        const username = form.username.value;
        const password = form.password.value;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('token', data.data.token);
                this.showDashboard();
            } else {
                alert(data.error || '登录失败');
            }
        } catch (error) {
            console.error('登录错误:', error);
            alert('登录失败，请重试');
        }
    },

    showDashboard() {
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = `
            <div class="dashboard">
                <h2>欢迎使用 LVerity 授权管理系统</h2>
                <div class="dashboard-content">
                    <p>正在加载数据...</p>
                </div>
            </div>
        `;
        // TODO: 加载仪表盘数据
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
