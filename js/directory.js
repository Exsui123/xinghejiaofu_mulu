/**
 * 星河教辅目录展示系统 - 目录操作功能
 */

const DIRECTORY = {
    // 根据ID获取文件夹
    getFolderById: function(folderId) {
        const findFolder = (folders, id) => {
            for (const folder of folders) {
                if (folder.id === id) {
                    return folder;
                }
                
                if (folder.children && folder.children.length > 0) {
                    const found = findFolder(folder.children, id);
                    if (found) {
                        return found;
                    }
                }
            }
            
            return null;
        };
        
        return findFolder(APP.currentState.directoryData, folderId);
    },
    
    // 根据路径获取文件夹列表
    getFoldersByPath: function(path) {
        if (path === 'root') {
            return APP.currentState.directoryData;
        }
        
        const pathParts = path.split('/');
        const lastFolderId = pathParts[pathParts.length - 1];
        const folder = this.getFolderById(lastFolderId);
        
        return folder ? folder.children : [];
    },
    
    // 根据路径获取父文件夹
    getParentFolderByPath: function(path) {
        if (path === 'root') {
            return null;
        }
        
        const pathParts = path.split('/');
        
        if (pathParts.length === 1) {
            return { id: 'root', children: APP.currentState.directoryData };
        }
        
        // 移除最后一个部分，获取父路径
        pathParts.pop();
        const parentId = pathParts[pathParts.length - 1];
        
        return this.getFolderById(parentId);
    },
    
    // 显示添加文件夹模态框
    showAddFolderModal: function(parentPath) {
        // 设置模态框标题
        APP.elements.folderModalTitle.textContent = '添加目录';
        
        // 清空表单字段
        document.getElementById('folderId').value = '';
        document.getElementById('folderName').value = '';
        document.getElementById('folderDescription').value = '';
        document.getElementById('folderParentPath').value = parentPath;
        
        // 显示模态框
        APP.elements.folderModal.classList.remove('hidden');
        document.getElementById('folderName').focus();
    },
    
    // 显示编辑文件夹模态框
    showEditFolderModal: function(folderId) {
        const folder = this.getFolderById(folderId);
        
        if (!folder) {
            APP.showError('找不到指定的文件夹');
            return;
        }
        
        // 设置模态框标题
        APP.elements.folderModalTitle.textContent = '编辑目录';
        
        // 填充表单字段
        document.getElementById('folderId').value = folder.id;
        document.getElementById('folderName').value = folder.name;
        document.getElementById('folderDescription').value = folder.description || '';
        document.getElementById('folderParentPath').value = APP.currentState.currentPath;
        
        // 显示模态框
        APP.elements.folderModal.classList.remove('hidden');
        document.getElementById('folderName').focus();
    },
    
    // 添加新文件夹
    addFolder: function(parentPath, name, description) {
        if (!name || name.trim() === '') {
            APP.showError('目录名称不能为空');
            return false;
        }
        
        // 生成唯一ID
        const newId = this.generateUniqueId();
        
        // 创建新文件夹对象
        const newFolder = {
            id: newId,
            name: name.trim(),
            description: description.trim(),
            children: []
        };
        
        // 添加到指定路径
        if (parentPath === 'root') {
            APP.currentState.directoryData.push(newFolder);
        } else {
            const parentId = parentPath.split('/').pop();
            const parentFolder = this.getFolderById(parentId);
            
            if (!parentFolder) {
                APP.showError('找不到父目录');
                return false;
            }
            
            if (!parentFolder.children) {
                parentFolder.children = [];
            }
            
            parentFolder.children.push(newFolder);
        }
        
        // 保存到本地存储
        this.saveDirectoryData();
        
        // 重新渲染当前目录
        APP.renderCurrentDirectory();
        
        return true;
    },
    
    // 编辑文件夹
    editFolder: function(folderId, name, description) {
        if (!name || name.trim() === '') {
            APP.showError('目录名称不能为空');
            return false;
        }
        
        const folder = this.getFolderById(folderId);
        
        if (!folder) {
            APP.showError('找不到指定的文件夹');
            return false;
        }
        
        // 更新文件夹信息
        folder.name = name.trim();
        folder.description = description.trim();
        
        // 保存到本地存储
        this.saveDirectoryData();
        
        // 更新面包屑和当前路径标题
        APP.updateBreadcrumb();
        APP.updatePathTitle();
        
        // 重新渲染当前目录
        APP.renderCurrentDirectory();
        
        return true;
    },
    
    // 删除文件夹
    deleteFolder: function(folderId) {
        // 查找文件夹及其父文件夹
        const findFolderAndParent = (folders, id, parent = null) => {
            for (let i = 0; i < folders.length; i++) {
                if (folders[i].id === id) {
                    return { folder: folders[i], parent, index: i };
                }
                
                if (folders[i].children && folders[i].children.length > 0) {
                    const result = findFolderAndParent(folders[i].children, id, folders[i]);
                    if (result) {
                        return result;
                    }
                }
            }
            
            return null;
        };
        
        const result = findFolderAndParent(APP.currentState.directoryData, folderId);
        
        if (!result) {
            APP.showError('找不到指定的文件夹');
            return false;
        }
        
        // 删除文件夹
        if (result.parent) {
            result.parent.children.splice(result.index, 1);
        } else {
            APP.currentState.directoryData.splice(result.index, 1);
        }
        
        // 保存到本地存储
        this.saveDirectoryData();
        
        // 重新渲染当前目录
        APP.renderCurrentDirectory();
        
        return true;
    },
    
    // 从文本导入目录（每行一个文件夹）
    importDirectoryFromText: function(textData) {
        if (!textData || textData.trim() === '') {
            APP.showError('导入数据不能为空');
            return false;
        }
        
        // 分割文本为行
        const lines = textData.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
            APP.showError('没有有效的目录名称');
            return false;
        }
        
        // 创建文件夹对象数组
        const folders = [];
        
        for (let i = 0; i < lines.length; i++) {
            const folderName = lines[i].trim();
            
            if (folderName) {
                const folderId = 'import_' + Date.now() + '_' + i;
                folders.push({
                    id: folderId,
                    name: folderName,
                    description: '',
                    children: []
                });
            }
        }
        
        // 根据当前路径确定添加位置
        if (APP.currentState.currentPath === 'root') {
            // 添加到根目录
            APP.currentState.directoryData = APP.currentState.directoryData.concat(folders);
        } else {
            // 添加到当前目录
            const pathParts = APP.currentState.currentPath.split('/');
            const currentFolderId = pathParts[pathParts.length - 1];
            const currentFolder = this.getFolderById(currentFolderId);
            
            if (!currentFolder) {
                APP.showError('找不到当前目录');
                return false;
            }
            
            if (!currentFolder.children) {
                currentFolder.children = [];
            }
            
            currentFolder.children = currentFolder.children.concat(folders);
        }
        
        // 保存到本地存储
        this.saveDirectoryData();
        
        // 重新渲染当前目录
        APP.renderCurrentDirectory();
        
        return true;
    },
    
    // 导入目录（JSON格式，保留旧方法兼容）
    importDirectory: function(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!Array.isArray(data)) {
                APP.showError('导入的数据格式不正确，应为JSON数组');
                return false;
            }
            
            // 为新导入的数据分配ID
            const assignIds = (folders, prefix = '') => {
                for (let i = 0; i < folders.length; i++) {
                    const newId = prefix ? `${prefix}-${i+1}` : `import-${Date.now()}-${i+1}`;
                    folders[i].id = newId;
                    
                    if (folders[i].children && folders[i].children.length > 0) {
                        assignIds(folders[i].children, newId);
                    } else {
                        folders[i].children = [];
                    }
                }
            };
            
            assignIds(data);
            
            // 根据当前路径确定添加位置
            if (APP.currentState.currentPath === 'root') {
                // 添加到根目录
                APP.currentState.directoryData = APP.currentState.directoryData.concat(data);
            } else {
                // 添加到当前目录
                const pathParts = APP.currentState.currentPath.split('/');
                const currentFolderId = pathParts[pathParts.length - 1];
                const currentFolder = this.getFolderById(currentFolderId);
                
                if (!currentFolder) {
                    APP.showError('找不到当前目录');
                    return false;
                }
                
                if (!currentFolder.children) {
                    currentFolder.children = [];
                }
                
                currentFolder.children = currentFolder.children.concat(data);
            }
            
            // 保存到本地存储
            this.saveDirectoryData();
            
            // 重新渲染当前目录
            APP.renderCurrentDirectory();
            
            APP.showSuccess('成功导入目录数据');
            return true;
        } catch (e) {
            console.error('导入目录数据时出错:', e);
            APP.showError('导入数据格式不正确，请检查JSON格式');
            return false;
        }
    },
    
    // 导出目录
    exportDirectory: function() {
        // 生成包含const声明的数据字符串
        const jsContent = '/**\n' +
            ' * 星河教辅目录数据文件\n' +
            ' * 使用方法：\n' +
            ' * 1. 将此文件重命名为 directory-data.js\n' +
            ' * 2. 放入项目的 data 文件夹中\n' +
            ' * 3. 替换原有的 directory-data.js 文件\n' +
            ' */\n\n' +
            'const DIRECTORY_DATA = ' + 
            JSON.stringify(APP.currentState.directoryData, null, 2) +
            ';';
        
        // 创建下载链接
        const blob = new Blob([jsContent], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = '星河教辅目录_' + new Date().toISOString().split('T')[0] + '.js';
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        return true;
    },
    
    // 保存目录数据到本地存储
    saveDirectoryData: function() {
        localStorage.setItem('directoryData', JSON.stringify(APP.currentState.directoryData));
    },
    
    // 生成唯一ID
    generateUniqueId: function() {
        return 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}; 