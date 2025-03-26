/**
 * 星河教辅目录展示系统 - 管理员功能
 */

const ADMIN = {
    // 管理员用户名和密码
    credentials: {
        username: 'Exsui',
        password: 'Exsui0910'
    },
    
    // 登录状态存储键
    STORAGE_KEY: 'adminLoginStatus',
    
    // 初始化管理员功能
    init: function() {
        // 检查是否已登录
        this.checkLoginStatus();
    },
    
    // 登录功能
    login: function(username, password) {
        if (username === this.credentials.username && password === this.credentials.password) {
            // 登录成功
            this.setLoggedIn(true);
            APP.closeLoginPanel();
            APP.showSuccess('登录成功');
        } else {
            // 登录失败
            APP.showError('用户名或密码错误');
        }
    },
    
    // 登出功能
    logout: function() {
        this.setLoggedIn(false);
        APP.showSuccess('已退出登录');
    },
    
    // 设置登录状态
    setLoggedIn: function(isLoggedIn) {
        // 更新应用状态
        APP.currentState.isAdmin = isLoggedIn;
        
        // 保存登录状态到本地存储
        if (isLoggedIn) {
            localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
        } else {
            localStorage.removeItem(this.STORAGE_KEY);
        }
        
        // 更新界面
        this.updateUI();
    },
    
    // 检查登录状态
    checkLoginStatus: function() {
        const loginTimestamp = localStorage.getItem(this.STORAGE_KEY);
        
        if (loginTimestamp) {
            // 检查登录时间是否超过24小时
            const currentTime = Date.now();
            const loginTime = parseInt(loginTimestamp);
            const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                // 登录有效
                APP.currentState.isAdmin = true;
                this.updateUI();
                return;
            }
            
            // 登录已过期，清除状态
            localStorage.removeItem(this.STORAGE_KEY);
        }
        
        // 未登录或登录已过期
        APP.currentState.isAdmin = false;
        this.updateUI();
    },
    
    // 更新界面显示
    updateUI: function() {
        const adminElements = document.querySelectorAll('.admin-only');
        
        if (APP.currentState.isAdmin) {
            // 显示管理员元素
            adminElements.forEach(el => el.classList.remove('hidden'));
        } else {
            // 隐藏管理员元素
            adminElements.forEach(el => el.classList.add('hidden'));
        }
        
        // 重新渲染当前目录以更新文件夹的操作按钮
        APP.renderCurrentDirectory();
    },
    
    // 检查是否有管理员权限
    hasPermission: function() {
        return APP.currentState.isAdmin;
    }
};

// 页面加载完成后初始化管理员功能
document.addEventListener('DOMContentLoaded', function() {
    ADMIN.init();
}); 