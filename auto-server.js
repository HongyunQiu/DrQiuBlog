#!/usr/bin/env node

/**
 * 自动更新服务器
 * 监控 context 目录变化，自动重新生成配置
 * 
 * 使用方法：
 *   npm install -g http-server chokidar
 *   node auto-server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const PORT = 8000;
const CONTEXT_DIR = './context';
const CONFIG_SCRIPT = 'generate-config.py';

// MIME 类型
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8'
};

let isUpdating = false;
let lastUpdateTime = Date.now();

/**
 * 重新生成配置
 */
function regenerateConfig() {
    if (isUpdating) {
        console.log('[SKIP] 配置更新中，跳过此次触发');
        return;
    }
    
    // 防抖：1秒内只更新一次
    const now = Date.now();
    if (now - lastUpdateTime < 1000) {
        return;
    }
    
    isUpdating = true;
    lastUpdateTime = now;
    
    console.log('\n[AUTO] 检测到文件变化，正在重新生成配置和Sitemap...');
    
    try {
        // 运行 Python 脚本（会自动更新sitemap）
        const output = execSync(`python ${CONFIG_SCRIPT}`, { 
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        console.log(output);
        console.log('[SUCCESS] 配置和Sitemap已自动更新！');
    } catch (error) {
        console.error('[ERROR] 配置更新失败:', error.message);
    } finally {
        isUpdating = false;
    }
}

/**
 * 监控文件变化
 */
function watchContextDir() {
    console.log(`[WATCH] 开始监控 ${CONTEXT_DIR} 目录...`);
    
    // 简单的文件监控（使用 fs.watch）
    try {
        fs.watch(CONTEXT_DIR, { recursive: true }, (eventType, filename) => {
            if (filename && filename.endsWith('.txt')) {
                console.log(`[CHANGE] 检测到文件变化: ${filename}`);
                regenerateConfig();
            }
        });
        console.log('[OK] 文件监控已启动');
    } catch (error) {
        console.warn('[WARN] 无法启动文件监控:', error.message);
        console.warn('[INFO] 将使用手动更新模式');
    }
}

/**
 * 简单的 HTTP 服务器
 */
function startServer() {
    const server = http.createServer((req, res) => {
        // 解析 URL
        let filePath = req.url === '/' ? '/index.html' : req.url;
        
        // 移除查询参数
        filePath = filePath.split('?')[0];
        
        // URL 解码（处理中文文件名）
        try {
            filePath = decodeURIComponent(filePath);
        } catch (e) {
            console.error('[ERROR] URL 解码失败:', filePath);
        }
        
        // 添加相对路径前缀
        filePath = '.' + filePath;
        
        // 记录请求（仅记录非静态资源）
        if (!filePath.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/i)) {
            console.log(`[REQUEST] ${req.method} ${req.url} -> ${filePath}`);
        }
        
        // 获取文件扩展名
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        
        // 确定是否为文本文件
        const textExtensions = ['.txt', '.html', '.css', '.js', '.json', '.md', '.xml', '.svg'];
        const isTextFile = textExtensions.includes(ext);
        
        // 读取文件
        const readOptions = isTextFile ? { encoding: 'utf-8' } : {};
        
        fs.readFile(filePath, readOptions, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    console.log(`[404] 文件未找到: ${filePath}`);
                    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end('<h1>404 - 文件未找到</h1>', 'utf-8');
                } else {
                    console.error(`[ERROR] 读取文件失败 ${filePath}:`, error.message);
                    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`服务器错误: ${error.code}`, 'utf-8');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    });
    
    server.listen(PORT, () => {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`  🚀 服务器已启动`);
        console.log(`  📍 访问地址: http://localhost:${PORT}`);
        console.log(`  🔄 自动更新: 已启用`);
        console.log(`  ⏹  按 Ctrl+C 停止服务器`);
        console.log(`${'='.repeat(50)}\n`);
    });
}

/**
 * 主函数
 */
function main() {
    console.log('================================');
    console.log('  Dr.Qiu\'s Blog 自动更新服务器');
    console.log('================================\n');
    
    // 检查 context 目录
    if (!fs.existsSync(CONTEXT_DIR)) {
        console.error(`[ERROR] ${CONTEXT_DIR} 目录不存在`);
        process.exit(1);
    }
    
    // 首次生成配置
    console.log('[INIT] 正在初始化配置...');
    regenerateConfig();
    
    // 启动文件监控
    watchContextDir();
    
    // 启动服务器
    startServer();
}

// 优雅退出
process.on('SIGINT', () => {
    console.log('\n\n[EXIT] 正在关闭服务器...');
    console.log('[EXIT] 再见！\n');
    process.exit(0);
});

// 运行
main();

