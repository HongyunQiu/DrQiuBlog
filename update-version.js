#!/usr/bin/env node

/**
 * 自动更新版本号脚本
 * 用于解决浏览器缓存问题
 * 
 * 使用方法：
 *   node update-version.js
 */

const fs = require('fs');
const path = require('path');

// 生成新的版本号（基于当前日期时间）
const now = new Date();
const version = now.toISOString().slice(0, 19).replace(/[-:T]/g, '').slice(0, 14);
// 格式：20240115143025 (年月日时分秒)

console.log(`[VERSION] 更新版本号到: ${version}`);

// 需要更新版本号的文件
const filesToUpdate = [
    'index.html'
];

// 版本号替换模式
const versionPattern = /v=\d+/g;

filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        try {
            let content = fs.readFileSync(filePath, 'utf-8');
            const originalContent = content;
            
            // 替换所有版本号
            content = content.replace(versionPattern, `v=${version}`);
            
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf-8');
                console.log(`[SUCCESS] 已更新 ${filePath}`);
            } else {
                console.log(`[SKIP] ${filePath} 无需更新`);
            }
        } catch (error) {
            console.error(`[ERROR] 更新 ${filePath} 失败:`, error.message);
        }
    } else {
        console.warn(`[WARN] 文件不存在: ${filePath}`);
    }
});

console.log(`[COMPLETE] 版本号更新完成！`);
console.log(`[INFO] 请重新启动服务器以应用更改`);
