#!/usr/bin/env node

/**
 * Sitemap.xml自动生成脚本 (JavaScript版本)
 * 基于config.js的内容自动生成sitemap.xml文件
 * 
 * 使用方法：
 *   node generate-sitemap.js
 * 
 * 功能：
 * - 直接解析config.js文件内容
 * - 自动生成包含所有页面和文章的sitemap.xml
 * - 支持静态页面和动态内容
 * - 自动设置合适的优先级和更新频率
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    baseUrl: 'https://hongyunqiu.github.io/DrQiuBlog/',
    configFile: './config.js',
    sitemapFile: './sitemap.xml',
    lastmod: new Date().toISOString().split('T')[0],
    
    // 优先级设置
    priorities: {
        home: 1.0,
        category: 0.9,
        article: 0.8,
        about: 0.8,
        contact: 0.7
    },
    
    // 更新频率设置
    changefreq: {
        home: 'weekly',
        category: 'weekly', 
        article: 'monthly',
        about: 'monthly',
        contact: 'monthly'
    }
};

/**
 * 从config.js文件中提取类别和文章信息
 */
function extractCategoriesFromConfig(configFile) {
    try {
        const content = fs.readFileSync(configFile, 'utf-8');
        const categories = [];
        
        // 查找所有类别定义（包括静态和动态）
        // 匹配模式：{ id: 'xxx', name: 'xxx', ... }
        const categoryBlocks = content.match(/{\s*id:\s*['"]([^'"]+)['"].*?order:\s*(\d+)\s*}/gs);
        
        if (!categoryBlocks) {
            console.error('[ERROR] 无法找到类别定义');
            return [];
        }
        
        for (const block of categoryBlocks) {
            // 提取基本信息
            const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
            const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
            const isStaticMatch = block.match(/isStatic:\s*(true|false)/);
            const orderMatch = block.match(/order:\s*(\d+)/);
            
            if (!idMatch || !orderMatch) continue;
            
            const categoryId = idMatch[1];
            const name = nameMatch ? nameMatch[1] : categoryId;
            const isStatic = isStaticMatch ? isStaticMatch[1] === 'true' : false;
            const order = parseInt(orderMatch[1]);
            
            const category = {
                id: categoryId,
                name: name,
                isStatic: isStatic,
                order: order,
                files: []
            };
            
            // 如果不是静态页面，查找文件列表
            if (!isStatic) {
                // 查找files数组
                const filesMatch = block.match(/files:\s*\[(.*?)\]/s);
                
                if (filesMatch) {
                    const filesContent = filesMatch[1];
                    
                    // 查找每个文件
                    // 匹配模式：{ id: 'xxx', name: 'xxx', filename: 'xxx', ... }
                    const filePattern = /{\s*id:\s*['"]([^'"]+)['"].*?lastModified:\s*['"]([^'"]+)['"]/gs;
                    let fileMatch;
                    
                    while ((fileMatch = filePattern.exec(filesContent)) !== null) {
                        const fileId = fileMatch[1];
                        const lastModified = fileMatch[2];
                        
                        // 提取文件名
                        const filenameMatch = filesContent.match(new RegExp(`id:\\s*['"]${fileId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"].*?filename:\\s*['"]([^'"]+)['"]`));
                        const filename = filenameMatch ? filenameMatch[1] : fileId;
                        
                        category.files.push({
                            id: fileId,
                            filename: filename,
                            lastModified: lastModified
                        });
                    }
                }
            }
            
            categories.push(category);
        }
        
        // 按order排序
        categories.sort((a, b) => a.order - b.order);
        return categories;
        
    } catch (error) {
        console.error('[ERROR] 读取配置文件失败:', error.message);
        return [];
    }
}

/**
 * 生成单个URL条目
 */
function generateUrlEntry(loc, changefreq, priority, lastmod = null) {
    if (lastmod === null) {
        lastmod = CONFIG.lastmod;
    }
    
    return `    <url>
        <loc>${loc}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
    </url>`;
}

/**
 * 生成sitemap.xml内容
 */
function generateSitemapContent(categories) {
    const urls = [];
    
    // 首页
    urls.push(generateUrlEntry(
        CONFIG.baseUrl,
        CONFIG.changefreq.home,
        CONFIG.priorities.home
    ));
    
    // 处理所有类别
    for (const category of categories) {
        const categoryId = category.id;
        const isStatic = category.isStatic;
        
        // 跳过首页（已经添加）
        if (categoryId === 'home') {
            continue;
        }
        
        // 类别页面
        const categoryUrl = `${CONFIG.baseUrl}#${categoryId}`;
        
        let priority, changefreq;
        if (isStatic) {
            // 静态页面（关于我、联系方式等）
            if (categoryId === 'about') {
                priority = CONFIG.priorities.about;
                changefreq = CONFIG.changefreq.about;
            } else if (categoryId === 'contact') {
                priority = CONFIG.priorities.contact;
                changefreq = CONFIG.changefreq.contact;
            } else {
                priority = CONFIG.priorities.category;
                changefreq = CONFIG.changefreq.category;
            }
        } else {
            // 动态类别页面
            priority = CONFIG.priorities.category;
            changefreq = CONFIG.changefreq.category;
        }
        
        urls.push(generateUrlEntry(categoryUrl, changefreq, priority));
        
        // 处理类别下的文章
        for (const fileInfo of category.files) {
            const fileId = fileInfo.id;
            const lastModified = fileInfo.lastModified;
            
            // 生成文章URL
            const articleUrl = `${CONFIG.baseUrl}#${fileId}`;
            
            // 使用文件的最后修改时间作为lastmod
            let fileLastmod = CONFIG.lastmod;
            if (lastModified) {
                try {
                    // 解析ISO格式的时间戳
                    const dt = new Date(lastModified);
                    fileLastmod = dt.toISOString().split('T')[0];
                } catch (error) {
                    fileLastmod = CONFIG.lastmod;
                }
            }
            
            urls.push(generateUrlEntry(
                articleUrl,
                CONFIG.changefreq.article,
                CONFIG.priorities.article,
                fileLastmod
            ));
        }
    }
    
    // 生成完整的sitemap.xml内容
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urls.join('\n')}

</urlset>`;
    
    return sitemapContent;
}

/**
 * 主函数
 */
function main() {
    console.log('[INFO] 开始生成sitemap.xml...\n');
    
    // 检查配置文件是否存在
    if (!fs.existsSync(CONFIG.configFile)) {
        console.error(`[ERROR] 配置文件不存在: ${CONFIG.configFile}`);
        console.log('[INFO] 请先运行 generate-config.js 生成配置文件');
        process.exit(1);
    }
    
    // 读取配置
    console.log(`[READ] 读取配置文件: ${CONFIG.configFile}`);
    const categories = extractCategoriesFromConfig(CONFIG.configFile);
    
    if (categories.length === 0) {
        console.error('[ERROR] 无法读取博客配置');
        process.exit(1);
    }
    
    // 统计信息
    const staticPages = categories.filter(cat => cat.isStatic);
    const dynamicCategories = categories.filter(cat => !cat.isStatic);
    const totalArticles = dynamicCategories.reduce((sum, cat) => sum + cat.files.length, 0);
    
    console.log(`[STATS] 发现 ${staticPages.length} 个静态页面`);
    console.log(`[STATS] 发现 ${dynamicCategories.length} 个动态类别`);
    console.log(`[STATS] 发现 ${totalArticles} 篇文章`);
    
    // 生成sitemap内容
    console.log('\n[GEN] 生成sitemap.xml内容...');
    const sitemapContent = generateSitemapContent(categories);
    
    // 备份现有sitemap（如果存在）
    if (fs.existsSync(CONFIG.sitemapFile)) {
        const backupFile = `${CONFIG.sitemapFile}.backup`;
        fs.copyFileSync(CONFIG.sitemapFile, backupFile);
        console.log(`[BACKUP] 已备份原sitemap到: ${backupFile}`);
    }
    
    // 写入新的sitemap.xml
    fs.writeFileSync(CONFIG.sitemapFile, sitemapContent, 'utf-8');
    
    console.log(`\n[SUCCESS] sitemap.xml已生成: ${CONFIG.sitemapFile}`);
    console.log(`[INFO] 基础URL: ${CONFIG.baseUrl}`);
    console.log(`[INFO] 最后更新: ${CONFIG.lastmod}`);
    
    // 计算总URL数量
    const urlCount = 1 + categories.length + totalArticles; // 首页 + 类别页面 + 文章页面
    console.log(`[STATS] 总共生成 ${urlCount} 个URL条目`);
    
    console.log('\n[DONE] sitemap.xml生成完成！');
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = { extractCategoriesFromConfig, generateSitemapContent };
