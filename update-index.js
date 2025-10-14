#!/usr/bin/env node

/**
 * 自动更新 index.html 动态内容
 * 
 * 功能：
 * - 根据 config.js 生成 JSON-LD 结构化数据
 * - 更新 blogPost 列表
 * - 更新版本号
 * 
 * 使用方法：
 *   node update-index.js
 */

const fs = require('fs');
const path = require('path');

// 读取 config.js 获取文章列表
function loadBlogConfig() {
    try {
        const configContent = fs.readFileSync('./config.js', 'utf-8');
        // 执行 config.js 以获取 blogConfig 对象
        const blogConfig = eval(configContent + '; blogConfig;');
        return blogConfig;
    } catch (error) {
        console.error('❌ 读取 config.js 失败:', error.message);
        process.exit(1);
    }
}

/**
 * 生成文章的URL
 */
function generateArticleUrl(categoryId, fileId) {
    return `https://hongyunqiu.github.io/DrQiuBlog/#${fileId}`;
}

/**
 * 获取文件的修改时间（用作发布日期）
 */
function getFileDate(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.mtime.toISOString().split('T')[0];
    } catch (error) {
        return new Date().toISOString().split('T')[0];
    }
}

/**
 * 生成 JSON-LD blogPost 数组
 */
function generateBlogPosts(blogConfig) {
    const blogPosts = [];
    
    // 获取所有动态类别
    const dynamicCategories = blogConfig.categories.filter(cat => !cat.isStatic && cat.files);
    
    // 收集所有文章
    const allArticles = [];
    for (const category of dynamicCategories) {
        if (!category.files || category.files.length === 0) continue;
        
        for (const file of category.files) {
            const filePath = path.join('./context', category.path || '', file.filename);
            const fileDate = getFileDate(filePath);
            
            allArticles.push({
                headline: file.name,
                description: file.description || '暂无描述',
                url: generateArticleUrl(category.id, file.id),
                datePublished: fileDate,
                dateModified: fileDate,
                category: category.name,
                filePath: filePath
            });
        }
    }
    
    // 按修改时间排序，取最新的10篇
    allArticles.sort((a, b) => {
        try {
            const dateA = fs.statSync(a.filePath).mtime;
            const dateB = fs.statSync(b.filePath).mtime;
            return dateB - dateA;
        } catch (error) {
            return 0;
        }
    });
    
    const latestArticles = allArticles.slice(0, 10);
    
    // 生成 JSON-LD blogPost 对象
    for (const article of latestArticles) {
        blogPosts.push({
            "@type": "BlogPosting",
            "headline": article.headline,
            "description": article.description,
            "url": article.url,
            "datePublished": article.datePublished,
            "dateModified": article.dateModified,
            "author": {
                "@type": "Person",
                "name": "Dr.Qiu"
            },
            "publisher": {
                "@type": "Person",
                "name": "Dr.Qiu"
            }
        });
    }
    
    return blogPosts;
}

/**
 * 生成新的 JSON-LD 脚本内容
 */
function generateJsonLd(blogPosts) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Dr.Qiu's Blog",
        "description": "Dr.Qiu的个人博客，分享天文相机技术、LLM模型开发、编程技术见解与生活感悟",
        "url": "https://hongyunqiu.github.io/DrQiuBlog/",
        "author": {
            "@type": "Person",
            "name": "Dr.Qiu",
            "jobTitle": "QHYCCD天文相机创始人 & 技术博主",
            "email": "qiuhy02@gmail.com",
            "sameAs": [
                "https://github.com/HongyunQiu",
                "https://twitter.com/HongyunQiu"
            ]
        },
        "publisher": {
            "@type": "Person",
            "name": "Dr.Qiu"
        },
        "inLanguage": "zh-CN",
        "dateCreated": "2024-01-01",
        "dateModified": new Date().toISOString().split('T')[0],
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://hongyunqiu.github.io/DrQiuBlog/"
        },
        "blogPost": blogPosts,
        "keywords": "天文相机,QHYCCD,LLM模型,长思,技术博客,编程,JavaScript,Vue,天文摄影,深度学习,人工智能"
    };
    
    return '    <script type="application/ld+json">\n    ' + 
           JSON.stringify(jsonLd, null, 4).replace(/\n/g, '\n    ') + 
           '\n    </script>';
}

/**
 * 更新 index.html 中的 JSON-LD
 */
function updateIndexHtml(blogConfig) {
    const indexPath = './index.html';
    
    if (!fs.existsSync(indexPath)) {
        console.error('❌ index.html 不存在');
        process.exit(1);
    }
    
    // 读取 index.html
    let content = fs.readFileSync(indexPath, 'utf-8');
    
    // 生成新的 blogPost 数组
    const blogPosts = generateBlogPosts(blogConfig);
    console.log(`📝 生成了 ${blogPosts.length} 篇文章的结构化数据`);
    
    // 生成新的 JSON-LD 内容
    const newJsonLd = generateJsonLd(blogPosts);
    
    // 替换 JSON-LD 部分
    const jsonLdRegex = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;
    if (jsonLdRegex.test(content)) {
        content = content.replace(jsonLdRegex, newJsonLd);
        console.log('✓ 已更新 JSON-LD 结构化数据');
    } else {
        console.warn('⚠ 未找到 JSON-LD 标签，跳过更新');
    }
    
    // 更新版本号
    const now = new Date();
    const version = now.toISOString().slice(0, 19).replace(/[-:T]/g, '').slice(0, 14);
    const versionPattern = /v=\d+/g;
    
    const beforeVersion = content;
    content = content.replace(versionPattern, `v=${version}`);
    
    if (content !== beforeVersion) {
        console.log(`✓ 已更新版本号到: ${version}`);
    }
    
    // 备份原文件
    const backupPath = `${indexPath}.backup`;
    fs.copyFileSync(indexPath, backupPath);
    
    // 写入更新后的内容
    fs.writeFileSync(indexPath, content, 'utf-8');
    console.log(`💾 已备份原文件到: ${backupPath}`);
    
    return { blogPosts: blogPosts.length, version };
}

/**
 * 主函数
 */
function main() {
    console.log('🚀 开始更新 index.html...\n');
    
    // 加载配置
    const blogConfig = loadBlogConfig();
    console.log(`📚 已加载 ${blogConfig.categories.length} 个类别\n`);
    
    // 更新 index.html
    const result = updateIndexHtml(blogConfig);
    
    console.log('\n✅ index.html 更新完成！');
    console.log(`\n📊 更新统计:`);
    console.log(`   - 文章数: ${result.blogPosts} 篇`);
    console.log(`   - 版本号: ${result.version}`);
    console.log('\n💡 建议刷新浏览器并清除缓存查看更新。');
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = { updateIndexHtml, generateBlogPosts, generateJsonLd };

