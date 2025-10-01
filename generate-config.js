#!/usr/bin/env node

/**
 * 自动生成配置文件脚本
 * 扫描 context 目录下的所有文件，自动生成 config.js
 * 
 * 使用方法：
 *   node generate-config.js
 * 
 * 功能：
 * - 自动扫描 context 目录的所有子目录
 * - 自动发现所有 .txt 和 .md 文件
 * - 生成或更新 config.js 文件
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    contextDir: './context',
    outputFile: './config.js',
    previewLength: 200,
    
    // 类别配置（可自定义）
    categorySettings: {
        'ChangeSiLLM': {
            name: 'ChangeSiLLM',
            icon: '',
            description: '长思LLM模型的相关内容',
            order: 1
        },
        'tech': {
            name: '技术文章',
            icon: '',
            description: '技术相关的文章和笔记',
            order: 2
        },
        'life': {
            name: '生活随笔',
            icon: '',
            description: '生活感悟和随笔',
            order: 3
        }
    },
    
    // 静态页面配置
    staticPages: [
        {
            id: 'home',
            name: '首页',
            icon: '',
            isStatic: true,
            order: 0
        },
        {
            id: 'about',
            name: '关于我',
            icon: '',
            isStatic: true,
            order: 4
        },
        {
            id: 'contact',
            name: '联系方式',
            icon: '',
            isStatic: true,
            order: 5
        }
    ]
};

/**
 * 扫描目录获取所有文件
 */
function scanDirectory(dirPath) {
    const categories = {};
    
    try {
        const subdirs = fs.readdirSync(dirPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        console.log(`📁 发现 ${subdirs.length} 个类别目录:`, subdirs.join(', '));
        
        for (const subdir of subdirs) {
            const subdirPath = path.join(dirPath, subdir);
            const files = fs.readdirSync(subdirPath, { withFileTypes: true })
                .filter(dirent => dirent.isFile() && (dirent.name.endsWith('.txt') || dirent.name.endsWith('.md')))
                .map(dirent => dirent.name);
            
            if (files.length > 0) {
                categories[subdir] = files;
                console.log(`  ✓ ${subdir}: ${files.length} 个文件`);
            } else {
                console.log(`  ⚠ ${subdir}: 空目录`);
                categories[subdir] = [];
            }
        }
        
        return categories;
    } catch (error) {
        console.error('❌ 扫描目录失败:', error.message);
        process.exit(1);
    }
}

/**
 * 生成文件 ID
 */
function generateFileId(categoryId, filename) {
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const slug = basename
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `${categoryId}-${slug}`;
}

/**
 * 读取文件内容获取描述（前50个字符）
 */
function getFileDescription(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const firstLine = content.split('\n')[0].trim();
        if (firstLine.length > 50) {
            return firstLine.substring(0, 50) + '...';
        }
        return firstLine || '暂无描述';
    } catch (error) {
        return '暂无描述';
    }
}

/**
 * 生成类别配置
 */
function generateCategories(scannedFiles) {
    const categories = [];
    
    // 添加静态页面
    categories.push(...CONFIG.staticPages);
    
    // 处理动态类别
    for (const [categoryId, files] of Object.entries(scannedFiles)) {
        const setting = CONFIG.categorySettings[categoryId] || {
            name: categoryId,
            icon: '📄',
            description: `${categoryId} 相关内容`,
            order: 99
        };
        
        const fileConfigs = files.map(filename => {
            const filePath = path.join(CONFIG.contextDir, categoryId, filename);
            const ext = path.extname(filename);
            const basename = path.basename(filename, ext);
            
            return {
                id: generateFileId(categoryId, filename),
                name: basename,
                filename: filename,
                description: getFileDescription(filePath),
                type: ext === '.md' ? 'markdown' : 'text'
            };
        });
        
        categories.push({
            id: categoryId,
            name: setting.name,
            icon: setting.icon,
            path: `${categoryId}/`,
            description: setting.description,
            files: fileConfigs,
            order: setting.order
        });
    }
    
    return categories.sort((a, b) => a.order - b.order);
}

/**
 * 生成配置文件内容
 */
function generateConfigContent(categories) {
    return `// 博客内容配置文件
// 此文件由 generate-config.js 自动生成
// 生成时间: ${new Date().toLocaleString('zh-CN')}

const blogConfig = {
    // 内容目录的基础路径
    basePath: 'context/',
    
    // 缩略内容的字符数限制
    previewLength: ${CONFIG.previewLength},
    
    // 目录和文件结构
    categories: ${JSON.stringify(categories, null, 8).replace(/"(\w+)":/g, '$1:')},
    
    // 获取所有类别（按顺序排序）
    getCategories: function() {
        return this.categories.sort((a, b) => a.order - b.order);
    },
    
    // 根据ID获取类别
    getCategoryById: function(id) {
        return this.categories.find(cat => cat.id === id);
    },
    
    // 获取文件的完整路径
    getFilePath: function(categoryId, filename) {
        const category = this.getCategoryById(categoryId);
        if (category && category.path) {
            return this.basePath + category.path + filename;
        }
        return null;
    },
    
    // 获取所有动态类别（从文件加载的类别）
    getDynamicCategories: function() {
        return this.categories.filter(cat => !cat.isStatic);
    }
};

// 导出配置供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = blogConfig;
}`;
}

/**
 * 主函数
 */
function main() {
    console.log('🚀 开始扫描目录并生成配置文件...\n');
    
    // 检查 context 目录是否存在
    if (!fs.existsSync(CONFIG.contextDir)) {
        console.error(`❌ 错误: ${CONFIG.contextDir} 目录不存在`);
        process.exit(1);
    }
    
    // 扫描目录
    const scannedFiles = scanDirectory(CONFIG.contextDir);
    
    // 生成类别配置
    const categories = generateCategories(scannedFiles);
    
    // 生成配置文件内容
    const configContent = generateConfigContent(categories);
    
    // 备份现有配置文件
    if (fs.existsSync(CONFIG.outputFile)) {
        const backupFile = `${CONFIG.outputFile}.backup`;
        fs.copyFileSync(CONFIG.outputFile, backupFile);
        console.log(`\n💾 已备份原配置文件到: ${backupFile}`);
    }
    
    // 写入新配置文件
    fs.writeFileSync(CONFIG.outputFile, configContent, 'utf-8');
    console.log(`\n✅ 配置文件已生成: ${CONFIG.outputFile}`);
    
    // 统计信息
    const dynamicCategories = categories.filter(cat => !cat.isStatic);
    const totalFiles = dynamicCategories.reduce((sum, cat) => sum + (cat.files?.length || 0), 0);
    
    console.log('\n📊 统计信息:');
    console.log(`   - 静态页面: ${CONFIG.staticPages.length} 个`);
    console.log(`   - 动态类别: ${dynamicCategories.length} 个`);
    console.log(`   - 文章总数: ${totalFiles} 篇`);
    
    console.log('\n🎉 完成！现在可以刷新浏览器查看更新。');
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = { scanDirectory, generateCategories, generateConfigContent };

