/**
 * 星河教辅目录展示系统 - 主要JavaScript功能
 */

// 全局变量
const APP = {
    // 当前状态
    currentState: {
        isAdmin: false,         // 是否是管理员
        currentPath: 'root',    // 当前路径
        directoryData: null,    // 目录数据
        selectedFolderId: null  // 当前选中的文件夹ID
    },
    
    // 缓存的DOM元素
    elements: {},
    
    // 初始化应用
    init: function() {
        console.log('初始化星河教辅目录展示系统...');
        
        // 缓存DOM元素
        this.cacheElements();
        
        // 绑定事件
        this.bindEvents();
        
        // 加载初始数据
        this.loadDirectoryData();
        
        // 设置快捷键
        this.setupShortcuts();
    },
    
    // 缓存DOM元素，提高性能
    cacheElements: function() {
        // 主要容器
        this.elements.directoryContainer = document.getElementById('directoryContainer');
        this.elements.breadcrumbList = document.getElementById('breadcrumbList');
        this.elements.currentPathTitle = document.getElementById('currentPathTitle');
        
        // 按钮
        this.elements.exportBtn = document.getElementById('exportBtn');
        this.elements.importBtn = document.getElementById('importBtn');
        this.elements.addFolderBtn = document.getElementById('addFolderBtn');
        this.elements.logoutBtn = document.getElementById('logoutBtn');
        
        // 模态框
        this.elements.loginPanel = document.getElementById('loginPanel');
        this.elements.loginForm = document.getElementById('loginForm');
        this.elements.closeLoginBtn = document.getElementById('closeLoginBtn');
        
        this.elements.folderModal = document.getElementById('folderModal');
        this.elements.folderForm = document.getElementById('folderForm');
        this.elements.closeFolderBtn = document.getElementById('closeFolderBtn');
        this.elements.folderModalTitle = document.getElementById('folderModalTitle');
        
        this.elements.importModal = document.getElementById('importModal');
        this.elements.importForm = document.getElementById('importForm');
        this.elements.closeImportBtn = document.getElementById('closeImportBtn');
        
        this.elements.confirmDeleteModal = document.getElementById('confirmDeleteModal');
        this.elements.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.elements.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        this.elements.closeConfirmBtn = document.getElementById('closeConfirmBtn');
    },
    
    // 绑定事件处理函数
    bindEvents: function() {
        // 导出按钮点击事件
        this.elements.exportBtn.addEventListener('click', () => {
            DIRECTORY.exportDirectory();
        });
        
        // 批量导入按钮点击事件
        this.elements.importBtn.addEventListener('click', () => {
            this.showImportModal();
        });
        
        // 添加文件夹按钮点击事件
        this.elements.addFolderBtn.addEventListener('click', () => {
            DIRECTORY.showAddFolderModal(this.currentState.currentPath);
        });
        
        // 登出按钮点击事件
        this.elements.logoutBtn.addEventListener('click', () => {
            ADMIN.logout();
        });
        
        // 登录表单提交事件
        this.elements.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            ADMIN.login(username, password);
        });
        
        // 文件夹表单提交事件
        this.elements.folderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const folderId = document.getElementById('folderId').value;
            const folderName = document.getElementById('folderName').value;
            const folderDescription = document.getElementById('folderDescription').value;
            const parentPath = document.getElementById('folderParentPath').value;
            
            if (folderId) {
                // 编辑现有文件夹
                DIRECTORY.editFolder(folderId, folderName, folderDescription);
            } else {
                // 添加新文件夹
                DIRECTORY.addFolder(parentPath, folderName, folderDescription);
            }
            
            this.closeFolderModal();
        });
        
        // 导入表单提交事件
        this.elements.importForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const importData = document.getElementById('importData').value;
            DIRECTORY.importDirectoryFromText(importData);
            this.closeImportModal();
        });
        
        // 确认删除按钮点击事件
        this.elements.confirmDeleteBtn.addEventListener('click', () => {
            if (this.currentState.selectedFolderId) {
                DIRECTORY.deleteFolder(this.currentState.selectedFolderId);
                this.closeConfirmDeleteModal();
            }
        });
        
        // 取消删除按钮点击事件
        this.elements.cancelDeleteBtn.addEventListener('click', () => {
            this.closeConfirmDeleteModal();
        });
        
        // 关闭模态框按钮事件
        this.elements.closeLoginBtn.addEventListener('click', this.closeLoginPanel.bind(this));
        this.elements.closeFolderBtn.addEventListener('click', this.closeFolderModal.bind(this));
        this.elements.closeImportBtn.addEventListener('click', this.closeImportModal.bind(this));
        this.elements.closeConfirmBtn.addEventListener('click', this.closeConfirmDeleteModal.bind(this));
    },
    
    // 加载目录数据
    loadDirectoryData: function() {
        // 优先使用外部定义的数据文件
        if (typeof DIRECTORY_DATA !== 'undefined') {
            this.currentState.directoryData = DIRECTORY_DATA;
            this.renderCurrentDirectory();
            return;
        }
        
        // 如果没有外部数据文件，尝试从本地存储获取数据（用于本地编辑版本）
        let savedData = localStorage.getItem('directoryData');
        
        if (savedData) {
            try {
                this.currentState.directoryData = JSON.parse(savedData);
                this.renderCurrentDirectory();
            } catch (e) {
                console.error('解析存储的目录数据时出错:', e);
                this.loadSampleData();
            }
        } else {
            // 如果没有保存的数据，加载示例数据
            this.loadSampleData();
        }
    },
    
    // 加载示例数据
    loadSampleData: function() {
        // 示例数据
        const sampleData = [
            {
                id: '1',
                name: '小学教材',
                description: '小学各年级教材目录',
                children: [
                    {
                        id: '1-1',
                        name: '一年级',
                        description: '一年级教材',
                        children: [
                            {
                                id: '1-1-1',
                                name: '语文',
                                description: '一年级语文教材'
                            },
                            {
                                id: '1-1-2',
                                name: '数学',
                                description: '一年级数学教材'
                            }
                        ]
                    },
                    {
                        id: '1-2',
                        name: '二年级',
                        description: '二年级教材',
                        children: [
                            {
                                id: '1-2-1',
                                name: '语文',
                                description: '二年级语文教材'
                            },
                            {
                                id: '1-2-2',
                                name: '数学',
                                description: '二年级数学教材'
                            }
                        ]
                    }
                ]
            },
            {
                id: '2',
                name: '初中教材',
                description: '初中各年级教材目录',
                children: [
                    {
                        id: '2-1',
                        name: '初一',
                        description: '初一教材',
                        children: []
                    },
                    {
                        id: '2-2',
                        name: '初二',
                        description: '初二教材',
                        children: []
                    },
                    {
                        id: '2-3',
                        name: '初三',
                        description: '初三教材',
                        children: []
                    }
                ]
            },
            {
                id: '3',
                name: '高中教材',
                description: '高中各年级教材目录',
                children: []
            }
        ];
        
        this.currentState.directoryData = sampleData;
        this.renderCurrentDirectory();
        
        // 保存到本地存储
        localStorage.setItem('directoryData', JSON.stringify(sampleData));
    },
    
    // 渲染当前目录
    renderCurrentDirectory: function() {
        // 获取当前路径的文件夹
        const currentFolders = DIRECTORY.getFoldersByPath(this.currentState.currentPath);
        
        // 更新面包屑
        this.updateBreadcrumb();
        
        // 更新当前路径标题
        this.updatePathTitle();
        
        // 清空目录容器
        this.elements.directoryContainer.innerHTML = '';
        
        // 如果当前目录为空，显示提示信息
        if (!currentFolders || currentFolders.length === 0) {
            this.elements.directoryContainer.innerHTML = '<div class="empty-directory">该目录仅展示【资料种类】，没有具体的文件内容</div>';
            return;
        }
        
        // 渲染文件夹
        currentFolders.forEach(folder => {
            const folderElement = this.createFolderElement(folder);
            this.elements.directoryContainer.appendChild(folderElement);
        });
    },
    
    // 创建文件夹元素 - 改为竖排列表样式
    createFolderElement: function(folder) {
        const folderElement = document.createElement('div');
        folderElement.className = 'folder fade-in';
        folderElement.dataset.id = folder.id;
        
        // 添加文件夹内容
        folderElement.innerHTML = `
            <div class="folder-icon">
                <i class="fas fa-folder"></i>
            </div>
            <div class="folder-content">
                <div class="folder-name">${folder.name}</div>
                <div class="folder-description">${folder.description || ''}</div>
            </div>
            <div class="folder-actions admin-only ${this.currentState.isAdmin ? '' : 'hidden'}">
                <button class="action-btn edit-btn" data-id="${folder.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-folder-btn" data-id="${folder.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        // 添加点击事件，打开文件夹
        folderElement.addEventListener('click', (e) => {
            // 如果点击的是操作按钮，不打开文件夹
            if (e.target.closest('.folder-actions')) {
                return;
            }
            
            this.openFolder(folder.id);
        });
        
        // 编辑按钮点击事件
        const editBtn = folderElement.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                DIRECTORY.showEditFolderModal(folder.id);
            });
        }
        
        // 删除按钮点击事件
        const deleteBtn = folderElement.querySelector('.delete-folder-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showConfirmDeleteModal(folder.id);
            });
        }
        
        return folderElement;
    },
    
    // 打开文件夹
    openFolder: function(folderId) {
        // 更新当前路径
        if (this.currentState.currentPath === 'root') {
            this.currentState.currentPath = folderId;
        } else {
            this.currentState.currentPath += '/' + folderId;
        }
        
        // 渲染新目录
        this.renderCurrentDirectory();
    },
    
    // 返回根目录
    goToRoot: function() {
        this.currentState.currentPath = 'root';
        this.renderCurrentDirectory();
    },
    
    // 更新面包屑导航
    updateBreadcrumb: function() {
        // 重置面包屑
        this.elements.breadcrumbList.innerHTML = '<li><a href="javascript:void(0)" onclick="APP.goToRoot()" data-path="root"><i class="fas fa-home"></i> 首页</a></li>';
        
        // 如果当前路径是根目录，不添加其他面包屑
        if (this.currentState.currentPath === 'root') {
            return;
        }
        
        // 解析路径
        const pathParts = this.currentState.currentPath.split('/');
        let currentPath = '';
        
        // 创建面包屑项
        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            
            if (i === 0) {
                currentPath = part;
            } else {
                currentPath += '/' + part;
            }
            
            // 获取文件夹名称
            const folder = DIRECTORY.getFolderById(part);
            if (folder) {
                const breadcrumbItem = document.createElement('li');
                breadcrumbItem.innerHTML = `<a href="javascript:void(0)" data-path="${currentPath}">${folder.name}</a>`;
                
                // 添加面包屑点击事件
                breadcrumbItem.querySelector('a').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.currentState.currentPath = e.target.dataset.path;
                    this.renderCurrentDirectory();
                });
                
                this.elements.breadcrumbList.appendChild(breadcrumbItem);
            }
        }
    },
    
    // 更新路径标题
    updatePathTitle: function() {
        if (this.currentState.currentPath === 'root') {
            this.elements.currentPathTitle.textContent = '根目录';
            return;
        }
        
        // 获取最后一个路径部分的文件夹
        const pathParts = this.currentState.currentPath.split('/');
        const lastFolderId = pathParts[pathParts.length - 1];
        const folder = DIRECTORY.getFolderById(lastFolderId);
        
        if (folder) {
            this.elements.currentPathTitle.textContent = folder.name;
        }
    },
    
    // 设置键盘快捷键
    setupShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            // Alt + L 打开登录面板
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                this.showLoginPanel();
            }
        });
    },
    
    // 显示登录面板
    showLoginPanel: function() {
        this.elements.loginPanel.classList.remove('hidden');
        document.getElementById('username').focus();
    },
    
    // 关闭登录面板
    closeLoginPanel: function() {
        this.elements.loginPanel.classList.add('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    },
    
    // 显示导入模态框
    showImportModal: function() {
        this.elements.importModal.classList.remove('hidden');
        document.getElementById('importData').focus();
    },
    
    // 关闭导入模态框
    closeImportModal: function() {
        this.elements.importModal.classList.add('hidden');
        document.getElementById('importData').value = '';
    },
    
    // 关闭文件夹模态框
    closeFolderModal: function() {
        this.elements.folderModal.classList.add('hidden');
        document.getElementById('folderId').value = '';
        document.getElementById('folderName').value = '';
        document.getElementById('folderDescription').value = '';
        document.getElementById('folderParentPath').value = '';
    },
    
    // 显示确认删除模态框
    showConfirmDeleteModal: function(folderId) {
        this.currentState.selectedFolderId = folderId;
        this.elements.confirmDeleteModal.classList.remove('hidden');
    },
    
    // 关闭确认删除模态框
    closeConfirmDeleteModal: function() {
        this.elements.confirmDeleteModal.classList.add('hidden');
        this.currentState.selectedFolderId = null;
    },
    
    // 显示错误信息
    showError: function(message) {
        alert('错误: ' + message);
    },
    
    // 显示成功信息
    showSuccess: function(message) {
        alert('成功: ' + message);
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    APP.init();
}); 