/**
 * 更新检查器
 * 检测 config.js 是否需要更新，并提示用户
 */

class UpdateChecker {
    constructor() {
        this.configModifiedTime = null;
        this.checkInterval = 5000; // 5秒检查一次
        this.notificationShown = false;
    }

    /**
     * 初始化检查器
     */
    async init() {
        // 在页面加载时显示提示
        // this.showUpdateReminder(); // 已禁用温馨提示功能
        
        // 定期检查（仅供参考，实际无法获取文件修改时间）
        // setInterval(() => this.checkForUpdates(), this.checkInterval);
    }

    /**
     * 显示更新提醒
     */
    showUpdateReminder() {
        // 检查是否在会话中已经显示过
        const hasShownToday = sessionStorage.getItem('updateReminderShown');
        
        if (hasShownToday) {
            return;
        }

        // 创建提醒横幅
        const banner = document.createElement('div');
        banner.id = 'update-reminder';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            z-index: 10000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            animation: slideDown 0.3s ease-out;
        `;

        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 1.2rem;">💡</span>
                <span>
                    <strong>温馨提示：</strong>
                    添加新文章后，请运行 <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px;">update-config-py.bat</code> 更新配置
                </span>
            </div>
            <button id="reminder-close" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: background 0.3s ease;
            ">知道了</button>
        `;

        // 添加动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
            }
            #reminder-close:hover {
                background: rgba(255,255,255,0.3) !important;
            }
        `;
        document.head.appendChild(style);

        // 添加到页面
        document.body.insertBefore(banner, document.body.firstChild);

        // 调整主内容的位置
        document.body.style.paddingTop = banner.offsetHeight + 'px';

        // 绑定关闭事件
        document.getElementById('reminder-close').addEventListener('click', () => {
            banner.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                banner.remove();
                document.body.style.paddingTop = '0';
                sessionStorage.setItem('updateReminderShown', 'true');
            }, 300);
        });

        // 添加上滑动画
        style.textContent += `
            @keyframes slideUp {
                from { transform: translateY(0); }
                to { transform: translateY(-100%); }
            }
        `;

        // 5秒后自动关闭
        setTimeout(() => {
            const closeBtn = document.getElementById('reminder-close');
            if (closeBtn) {
                closeBtn.click();
            }
        }, 10000);
    }

    /**
     * 检查是否有更新（理论上的实现）
     */
    async checkForUpdates() {
        // 注意：由于浏览器安全限制，实际上无法获取本地文件的修改时间
        // 这里仅作为示例代码
        
        try {
            // 尝试重新加载配置文件（通过添加时间戳避免缓存）
            const response = await fetch(`config.js?t=${Date.now()}`);
            const lastModified = response.headers.get('Last-Modified');
            
            if (lastModified) {
                const modTime = new Date(lastModified).getTime();
                
                if (this.configModifiedTime && modTime > this.configModifiedTime) {
                    this.showUpdateNotification();
                }
                
                this.configModifiedTime = modTime;
            }
        } catch (error) {
            console.log('[UpdateChecker] 检查更新失败:', error.message);
        }
    }

    /**
     * 显示更新通知
     */
    showUpdateNotification() {
        if (this.notificationShown) {
            return;
        }

        this.notificationShown = true;

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5rem;">🔄</span>
                <div>
                    <strong>配置已更新</strong><br>
                    <small>刷新页面查看最新内容</small>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // 3秒后淡出
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        // 添加动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 创建快捷更新按钮（可选）
     */
    createQuickUpdateButton() {
        const button = document.createElement('button');
        button.id = 'quick-update-btn';
        button.innerHTML = '🔄 更新配置';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            z-index: 9999;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        });

        button.addEventListener('click', () => {
            this.showUpdateInstructions();
        });

        document.body.appendChild(button);
    }

    /**
     * 显示更新说明
     */
    showUpdateInstructions() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            animation: fadeIn 0.3s ease-out;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            ">
                <h2 style="margin-top: 0; color: #2d3748;">📝 如何更新配置</h2>
                <ol style="line-height: 1.8; color: #4a5568;">
                    <li>双击运行 <code style="background: #f7fafc; padding: 2px 6px; border-radius: 3px;">update-config-py.bat</code></li>
                    <li>等待脚本完成（约3-5秒）</li>
                    <li>返回浏览器按 <kbd style="background: #667eea; color: white; padding: 2px 8px; border-radius: 3px;">Ctrl+F5</kbd> 刷新</li>
                </ol>
                <p style="background: #ebf8ff; padding: 10px; border-radius: 6px; border-left: 4px solid #4299e1; color: #2c5282; margin: 15px 0;">
                    💡 <strong>提示：</strong>由于浏览器安全限制，无法自动运行批处理文件。
                </p>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 10px 30px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                    width: 100%;
                    margin-top: 10px;
                ">知道了</button>
            </div>
        `;

        document.body.appendChild(modal);

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const checker = new UpdateChecker();
        checker.init();
        // 可选：添加快捷按钮
        // checker.createQuickUpdateButton();
    });
} else {
    const checker = new UpdateChecker();
    checker.init();
    // 可选：添加快捷按钮
    // checker.createQuickUpdateButton();
}

