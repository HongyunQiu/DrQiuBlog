// 博客内容配置文件
// 此文件由 generate-config.py 自动生成
// 生成时间: 2025-10-01 22:11:51

const blogConfig = {
    // 内容目录的基础路径
    basePath: 'context/',
    
    // 缩略内容的字符数限制
    previewLength: 200,
    
    // 目录和文件结构
    categories: [
        {
                id: 'home',
                name: '首页',
                icon: '',
                isStatic: true,
                order: 0
        },
        {
                id: 'ChangeSiLLM',
                name: 'ChangeSiLLM',
                icon: '',
                path: 'ChangeSiLLM/',
                description: '长思LLM模型的相关内容',
                files: [
                {
                        id: 'ChangeSiLLM-古文',
                        name: '古文',
                        filename: '古文.txt',
                        description: '于此偕州山石间，朝露未揩。烟霞漫天。时会中鼓，新晴尚白，醉雨垂杨。上有树荫曰“朝霞浸城”，下有草树曰...',
                        type: 'text'
                    },
                {
                        id: 'ChangeSiLLM-和着风中的你',
                        name: '和着风中的你',
                        filename: '和着风中的你.txt',
                        description: '和着风中的你',
                        type: 'text'
                    },
                {
                        id: 'ChangeSiLLM-我看到骆驼',
                        name: '我看到骆驼',
                        filename: '我看到骆驼.txt',
                        description: '看，还有一个影子——一只骆驼。我是头一次看到骆驼，但我认出了它，每当我坐在蓝色的海岸上望着那一长排漂...',
                        type: 'text'
                    },
                {
                        id: 'ChangeSiLLM-我问佛',
                        name: '我问佛',
                        filename: '我问佛.txt',
                        description: '我问佛：如何认识未来佛，怎样才能得到证果？佛曰：没有缘法',
                        type: 'text'
                    },
                {
                        id: 'ChangeSiLLM-描绘梦境',
                        name: '描绘梦境',
                        filename: '描绘梦境.txt',
                        description: '现实和梦境刚刚结束！',
                        type: 'text'
                    },
                {
                        id: 'ChangeSiLLM-有感',
                        name: '有感',
                        filename: '有感.txt',
                        description: '该不被所有的光年禁锢，不被山峦阻绝，吹天而汗地的也即是归，莫名地沉沦，不会被月亮放弃，注定了它美丽的...',
                        type: 'text'
                    },
                {
                        id: 'ChangeSiLLM-梦境有一千万里路',
                        name: '梦境有一千万里路',
                        filename: '梦境有一千万里路.txt',
                        description: '梦境有一千万里路，那足迹罕至。而所有梦境在那里都是千万里的长途。那是活着的感觉，而且只有活着的时候，...',
                        type: 'text'
                    },
                {
                        id: 'ChangeSiLLM-菲舍尔花园',
                        name: '菲舍尔花园',
                        filename: '菲舍尔花园.txt',
                        description: '300年后的1982年12月23日，一个晴朗的上午，在菲舍尔花园之中，我正在散步，刚才从菲舍尔花园走...',
                        type: 'text'
                    }
            ],
                order: 1
        },
        {
                id: 'tech',
                name: '技术文章',
                icon: '',
                path: 'tech/',
                description: '技术相关的文章和笔记',
                files: [
                {
                        id: 'tech-readme',
                        name: 'readme',
                        filename: 'readme.md',
                        description: '# Dr.Qiu\'s Blog',
                        type: 'markdown'
                    },
                {
                        id: 'tech-关于长思llm模型',
                        name: '关于长思LLM模型',
                        filename: '关于长思LLM模型.txt',
                        description: '去年夏天开始训练的LLM模型cn_dict_novel终于有了正式的名字，在chatGPT建议的几个...',
                        type: 'text'
                    }
            ],
                order: 2
        },
        {
                id: 'life',
                name: '生活随笔',
                icon: '',
                path: 'life/',
                description: '生活感悟和随笔',
                files: [],
                order: 3
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
    ],
    
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
}