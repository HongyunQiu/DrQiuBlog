// SEO配置文件
// 用于管理网站的SEO相关设置

const seoConfig = {
    // 网站基本信息
    site: {
        name: "Dr.Qiu's Blog",
        title: "Dr.Qiu's Blog - 技术见解与生活感悟",
        description: "Dr.Qiu的个人博客，分享天文相机技术、LLM模型开发、编程技术见解与生活感悟。QHYCCD天文相机创始人，专注于技术研究和创新。",
        url: "https://hongyunqiu.github.io/DrQiuBlog/",
        language: "zh-CN",
        author: "Dr.Qiu",
        email: "qiuhy02@gmail.com"
    },
    
    // 关键词
    keywords: [
        "天文相机",
        "QHYCCD", 
        "LLM模型",
        "长思",
        "技术博客",
        "编程",
        "JavaScript",
        "Vue",
        "天文摄影",
        "深度学习",
        "人工智能",
        "Dr.Qiu",
        "个人博客",
        "技术分享"
    ],
    
    // 社交媒体
    social: {
        github: "https://github.com/HongyunQiu",
        twitter: "https://twitter.com/HongyunQiu",
        email: "qiuhy02@gmail.com"
    },
    
    // SEO设置
    seo: {
        robots: "index, follow",
        revisitAfter: "7 days",
        themeColor: "#667eea",
        msTileColor: "#667eea"
    },
    
    // Open Graph设置
    openGraph: {
        type: "website",
        locale: "zh_CN",
        siteName: "Dr.Qiu's Blog"
    },
    
    // Twitter Card设置
    twitter: {
        card: "summary_large_image",
        creator: "@HongyunQiu"
    },
    
    // 结构化数据
    structuredData: {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Dr.Qiu's Blog",
        "description": "Dr.Qiu的个人博客，分享天文相机技术、LLM模型开发、编程技术见解与生活感悟",
        "url": "https://hongyunqiu.github.io/DrQiuBlog/",
        "author": {
            "@type": "Person",
            "name": "Dr.Qiu",
            "jobTitle": "QHYCCD天文相机创始人 & 技术博主",
            "email": "qiuhy02@gmail.com"
        },
        "publisher": {
            "@type": "Person", 
            "name": "Dr.Qiu"
        },
        "inLanguage": "zh-CN"
    },
    
    // 获取完整的meta标签配置
    getMetaTags: function() {
        return {
            description: this.site.description,
            keywords: this.keywords.join(","),
            author: this.site.author,
            robots: this.seo.robots,
            language: this.site.language,
            revisitAfter: this.seo.revisitAfter,
            themeColor: this.seo.themeColor,
            msTileColor: this.seo.msTileColor
        };
    },
    
    // 获取Open Graph配置
    getOpenGraphTags: function() {
        return {
            title: this.site.title,
            description: this.site.description,
            type: this.openGraph.type,
            url: this.site.url,
            siteName: this.openGraph.siteName,
            locale: this.openGraph.locale
        };
    },
    
    // 获取Twitter Card配置
    getTwitterTags: function() {
        return {
            card: this.twitter.card,
            title: this.site.title,
            description: this.site.description,
            creator: this.twitter.creator
        };
    }
};

// 导出配置供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = seoConfig;
}

// 全局可用
window.seoConfig = seoConfig;
