// 动态内容加载器
// 负责从 context 目录加载文件内容并动态生成页面

class BlogDynamicLoader {
    constructor(config) {
        this.config = config;
        this.fileCache = new Map(); // 缓存已加载的文件内容
        this.currentView = 'home'; // 当前视图
        this.currentCategory = null; // 当前类别
        this.currentFile = null; // 当前文件
    }

    // 初始化博客
    async init() {
        this.renderNavigation();
        this.renderLatestPosts();
        this.bindEvents();

        // 检查URL hash
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.handleHashChange(hash);
        }
    }

    // 渲染首页的最新文章
    renderLatestPosts() {
        const listContainer = document.getElementById('recent-posts-list');
        if (!listContainer || !this.config || typeof this.config.getDynamicCategories !== 'function') {
            return;
        }

        const posts = [];
        const categories = this.config.getDynamicCategories();

        categories.forEach(category => {
            if (!category.files || category.files.length === 0) {
                return;
            }

            category.files.forEach(file => {
                posts.push({
                    categoryId: category.id,
                    categoryName: category.name,
                    fileId: file.id,
                    title: file.name,
                    preview: file.preview || file.description || '',
                    lastModified: file.lastModified,
                    lastModifiedTimestamp: file.lastModifiedTimestamp
                });
            });
        });

        if (posts.length === 0) {
            listContainer.innerHTML = '<p class="no-posts">暂无文章，敬请期待。</p>';
            return;
        }

        posts.sort((a, b) => {
            const getTimestamp = (post) => {
                if (typeof post.lastModifiedTimestamp === 'number') {
                    return post.lastModifiedTimestamp;
                }
                if (post.lastModified) {
                    const parsed = Date.parse(post.lastModified);
                    return isNaN(parsed) ? 0 : parsed;
                }
                return 0;
            };

            return getTimestamp(b) - getTimestamp(a);
        });

        const latestPosts = posts.slice(0, 3);
        listContainer.innerHTML = '';

        const hasBlogUtils = typeof BlogUtils !== 'undefined';

        latestPosts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post-preview';

            const title = document.createElement('h4');
            const link = document.createElement('a');
            link.href = `#${post.categoryId}/${post.fileId}`;
            link.textContent = post.title;
            link.addEventListener('click', (event) => {
                event.preventDefault();
                this.showFileDetail(post.categoryId, post.fileId);

                const navSubLink = document.querySelector(`.nav-sublink[href="#${post.categoryId}/${post.fileId}"]`);
                if (navSubLink) {
                    this.updateActiveSubNav(navSubLink);
                } else {
                    this.updateActiveNav(post.categoryId);
                }
            });

            title.appendChild(link);
            article.appendChild(title);

            const meta = document.createElement('p');
            meta.className = 'post-meta';

            let metaText = '';
            if (post.lastModified) {
                try {
                    if (hasBlogUtils) {
                        metaText = BlogUtils.formatDate(post.lastModified);
                    } else {
                        const dateInstance = new Date(post.lastModified);
                        metaText = isNaN(dateInstance.getTime()) ? '' : dateInstance.toLocaleDateString('zh-CN');
                    }
                } catch (error) {
                    metaText = '';
                }
            }
            if (!metaText) {
                metaText = '更新时间未知';
            }
            if (post.categoryName) {
                metaText += ` · ${post.categoryName}`;
            }
            meta.textContent = metaText;
            article.appendChild(meta);

            const preview = document.createElement('p');
            if (post.preview) {
                preview.textContent = hasBlogUtils
                    ? BlogUtils.truncateText(post.preview, 120)
                    : (post.preview.length > 120 ? `${post.preview.slice(0, 120)}...` : post.preview);
            } else {
                preview.textContent = '暂无摘要';
            }
            article.appendChild(preview);

            listContainer.appendChild(article);
        });
    }

    // 渲染导航菜单
    renderNavigation() {
        const navMenu = document.getElementById('nav-menu');
        if (!navMenu) return;

        const categories = this.config.getCategories();
        const ul = document.createElement('ul');

        categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'nav-category';
            li.dataset.categoryId = category.id;

            // 主导航链接
            const link = document.createElement('a');
            link.href = `#${category.id}`;
            link.className = 'nav-link';
            if (category.id === 'home') {
                link.classList.add('active');
            }

            // 图标（已移除）
            // const icon = document.createElement('span');
            // icon.className = 'icon';
            // icon.textContent = category.icon || '📄';
            // link.appendChild(icon);

            // 标题
            const text = document.createElement('span');
            text.textContent = category.name;
            link.appendChild(text);

            // 如果有子文件，添加展开/收起图标
            if (category.files && category.files.length > 0) {
                const toggle = document.createElement('span');
                toggle.className = 'category-toggle';
                toggle.textContent = '▶';
                link.appendChild(toggle);
            }

            li.appendChild(link);

            // 如果有子文件，渲染子菜单
            if (category.files && category.files.length > 0) {
                const submenu = document.createElement('ul');
                submenu.className = 'nav-submenu';

                category.files.forEach(file => {
                    const subLi = document.createElement('li');
                    const subLink = document.createElement('a');
                    subLink.href = `#${category.id}/${file.id}`;
                    subLink.className = 'nav-sublink';
                    subLink.textContent = file.name;
                    subLink.dataset.fileId = file.id;
                    subLink.dataset.categoryId = category.id;
                    subLi.appendChild(subLink);
                    submenu.appendChild(subLi);
                });

                li.appendChild(submenu);
            }

            ul.appendChild(li);
        });

        navMenu.innerHTML = '';
        navMenu.appendChild(ul);
    }

    // 绑定事件
    bindEvents() {
        // 导航链接点击事件
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = e.currentTarget.getAttribute('href').substring(1);
                const category = this.config.getCategoryById(categoryId);
                
                // 如果有子文件，展开/收起子菜单
                if (category && category.files && category.files.length > 0) {
                    const li = e.currentTarget.parentElement;
                    li.classList.toggle('expanded');
                }
                
                // 如果是静态页面，显示静态内容
                if (category && category.isStatic) {
                    this.showStaticContent(categoryId);
                } else {
                    this.showCategoryContent(categoryId);
                }
                
                this.updateActiveNav(categoryId);
            });
        });

        // 子链接点击事件
        document.querySelectorAll('.nav-sublink').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = link.dataset.categoryId;
                const fileId = link.dataset.fileId;
                this.showFileDetail(categoryId, fileId);
                this.updateActiveSubNav(link);
            });
        });

        // 浏览器前进/后退
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.handleHashChange(hash);
            }
        });
    }

    // 处理URL hash变化
    handleHashChange(hash) {
        const parts = hash.split('/');
        const categoryId = parts[0];
        const fileId = parts[1];

        if (fileId) {
            this.showFileDetail(categoryId, fileId);
        } else {
            const category = this.config.getCategoryById(categoryId);
            if (category && category.isStatic) {
                this.showStaticContent(categoryId);
            } else {
                this.showCategoryContent(categoryId);
            }
        }
    }

    // 更新导航活动状态
    updateActiveNav(categoryId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll('.nav-sublink').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav-link[href="#${categoryId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // 更新子导航活动状态
    updateActiveSubNav(subLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll('.nav-sublink').forEach(link => {
            link.classList.remove('active');
        });
        
        subLink.classList.add('active');
        
        // 激活父类别
        const categoryId = subLink.dataset.categoryId;
        const parentLink = document.querySelector(`.nav-link[href="#${categoryId}"]`);
        if (parentLink) {
            parentLink.classList.add('active');
            parentLink.parentElement.classList.add('expanded');
        }
    }

    // 显示静态内容
    showStaticContent(categoryId) {
        const mainContent = document.getElementById('main-content');
        
        // 移除所有动态生成的内容（不是 content-section 的内容）
        const dynamicContent = mainContent.querySelectorAll('.category-content, .file-detail, .loading-indicator, .error-message');
        dynamicContent.forEach(element => {
            element.remove();
        });
        
        // 隐藏所有静态内容区域
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // 显示对应的静态内容
        const section = document.getElementById(categoryId);
        if (section) {
            section.style.display = 'block';
            section.classList.add('active');
        }

        this.currentView = 'static';
        this.currentCategory = categoryId;
    }

    // 显示类别内容（文件列表）
    async showCategoryContent(categoryId) {
        const category = this.config.getCategoryById(categoryId);
        if (!category) return;

        const mainContent = document.getElementById('main-content');
        
        // 移除所有动态生成的内容
        const dynamicContent = mainContent.querySelectorAll('.category-content, .file-detail, .loading-indicator, .error-message');
        dynamicContent.forEach(element => {
            element.remove();
        });
        
        // 隐藏所有静态内容
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // 创建并显示加载指示器
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = '<p>⏳ 加载中...</p>';
        mainContent.appendChild(loadingDiv);

        try {
            let html = `
                <div class="category-content">
                    <h2>${category.name}</h2>
            `;

            if (category.description) {
                html += `<div class="category-description">${category.description}</div>`;
            }

            if (category.files && category.files.length > 0) {
                html += '<div class="file-list">';
                
                // 加载所有文件的预览
                for (const file of category.files) {
                    const preview = await this.loadFilePreview(categoryId, file);
                    html += this.renderFileCard(categoryId, file, preview);
                }
                
                html += '</div>';
            } else {
                html += '<p style="color: #718096; text-align: center; padding: 2rem;">此类别暂无内容</p>';
            }

            html += '</div>';
            
            // 移除加载指示器
            loadingDiv.remove();
            
            // 创建内容容器并插入
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = html;
            mainContent.appendChild(contentDiv.firstElementChild);

            // 绑定文件卡片点击事件
            this.bindFileCardEvents(categoryId);

        } catch (error) {
            console.error('加载类别内容失败:', error);
            
            // 移除加载指示器
            loadingDiv.remove();
            
            // 显示错误信息
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<p>❌ 加载失败: ${error.message}</p>`;
            mainContent.appendChild(errorDiv);
        }

        this.currentView = 'category';
        this.currentCategory = categoryId;
    }

    // 加载文件预览
    async loadFilePreview(categoryId, file) {
        const filePath = this.config.getFilePath(categoryId, file.filename);
        if (!filePath) return '';

        try {
            // 检查缓存
            if (this.fileCache.has(filePath)) {
                const content = this.fileCache.get(filePath);
                const preview = this.truncateText(content, this.config.previewLength);
                // 对于Markdown文件，移除Markdown语法标记以显示纯文本预览
                if (file.type === 'markdown') {
                    return preview.replace(/[#*_`\[\]]/g, '');
                }
                return preview;
            }

            // 加载文件
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            
            // 缓存内容
            this.fileCache.set(filePath, content);
            
            const preview = this.truncateText(content, this.config.previewLength);
            // 对于Markdown文件，移除Markdown语法标记以显示纯文本预览
            if (file.type === 'markdown') {
                return preview.replace(/[#*_`\[\]]/g, '');
            }
            return preview;
        } catch (error) {
            console.error(`加载文件失败 ${filePath}:`, error);
            return '无法加载文件预览...';
        }
    }

    // 截断文本
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // 渲染文件卡片
    renderFileCard(categoryId, file, preview) {
        const wordCount = preview.length;
        const fileIcon = file.type === 'markdown' ? '📝' : '📄';
        const fileTypeBadge = file.type === 'markdown' ? '<span class="file-type-badge">Markdown</span>' : '';
        return `
            <div class="file-card" data-category-id="${categoryId}" data-file-id="${file.id}">
                <div class="file-card-header">
                    <h3 class="file-card-title">${file.name}</h3>
                    <div>
                        ${fileTypeBadge}
                        <span class="file-card-icon">${fileIcon}</span>
                    </div>
                </div>
                ${file.description ? `<p style="color: #718096; font-size: 0.9rem; margin-bottom: 1rem;">${file.description}</p>` : ''}
                <div class="file-card-preview">${this.escapeHtml(preview)}</div>
                <div class="file-card-meta">
                    <span>约 ${wordCount} 字</span>
                    <a href="#${categoryId}/${file.id}" class="read-more-btn">阅读全文 →</a>
                </div>
            </div>
        `;
    }

    // 绑定文件卡片事件
    bindFileCardEvents(categoryId) {
        document.querySelectorAll('.file-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // 如果点击的是链接，让链接自己处理
                if (e.target.classList.contains('read-more-btn')) {
                    return;
                }
                
                const fileId = card.dataset.fileId;
                const categoryId = card.dataset.categoryId;
                this.showFileDetail(categoryId, fileId);
                window.location.hash = `${categoryId}/${fileId}`;
            });
        });

        // 绑定"阅读全文"链接
        document.querySelectorAll('.read-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const href = btn.getAttribute('href');
                const parts = href.substring(1).split('/');
                this.showFileDetail(parts[0], parts[1]);
                window.location.hash = href;
            });
        });
    }

    // 显示文件详情
    async showFileDetail(categoryId, fileId) {
        const category = this.config.getCategoryById(categoryId);
        if (!category) return;

        const file = category.files?.find(f => f.id === fileId);
        if (!file) return;

        const mainContent = document.getElementById('main-content');
        
        // 移除所有动态生成的内容
        const dynamicContent = mainContent.querySelectorAll('.category-content, .file-detail, .loading-indicator, .error-message');
        dynamicContent.forEach(element => {
            element.remove();
        });
        
        // 隐藏所有静态内容
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // 创建并显示加载指示器
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = '<p>⏳ 加载中...</p>';
        mainContent.appendChild(loadingDiv);

        try {
            const filePath = this.config.getFilePath(categoryId, file.filename);
            let content;

            // 检查缓存
            if (this.fileCache.has(filePath)) {
                content = this.fileCache.get(filePath);
            } else {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                content = await response.text();
                this.fileCache.set(filePath, content);
            }

            const wordCount = content.length;
            const renderedContent = this.renderContent(content, file.type);
            const contentClass = file.type === 'markdown' ? 'file-detail-content markdown-content' : 'file-detail-content';
            
            const html = `
                <div class="file-detail">
                    <a href="#${categoryId}" class="back-button">
                        ← 返回 ${category.name}
                    </a>
                    <div class="file-detail-header">
                        <h1 class="file-detail-title">${file.name}</h1>
                        <div class="file-detail-meta">
                            <span>📁 ${category.name}</span>
                            <span>${file.type === 'markdown' ? '📝' : '📄'} 约 ${wordCount} 字</span>
                            ${file.type === 'markdown' ? '<span class="file-type-badge">Markdown</span>' : ''}
                            ${file.description ? `<span>📝 ${file.description}</span>` : ''}
                        </div>
                    </div>
                    <div class="${contentClass}">${renderedContent}</div>
                </div>
            `;

            // 移除加载指示器
            loadingDiv.remove();
            
            // 创建内容容器并插入
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = html;
            mainContent.appendChild(contentDiv.firstElementChild);

            // 绑定返回按钮事件
            const backBtn = document.querySelector('.back-button');
            if (backBtn) {
                backBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showCategoryContent(categoryId);
                    window.location.hash = categoryId;
                    this.updateActiveNav(categoryId);
                });
            }

        } catch (error) {
            console.error('加载文件详情失败:', error);
            
            // 移除加载指示器
            loadingDiv.remove();
            
            // 显示错误信息
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <p>❌ 加载文件失败: ${error.message}</p>
                <p style="margin-top: 1rem;">
                    <a href="#${categoryId}" class="back-button">← 返回</a>
                </p>
            `;
            mainContent.appendChild(errorDiv);
        }

        this.currentView = 'file';
        this.currentCategory = categoryId;
        this.currentFile = fileId;
    }

    // HTML转义（防止XSS）
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 渲染内容（支持Markdown和纯文本）
    renderContent(content, fileType) {
        if (fileType === 'markdown' && typeof marked !== 'undefined') {
            try {
                // 配置 marked 选项
                marked.setOptions({
                    breaks: true,        // 支持GFM换行
                    gfm: true,          // GitHub Flavored Markdown
                    headerIds: true,    // 为标题添加ID
                    mangle: false,      // 不混淆邮箱地址
                    highlight: function(code, lang) {
                        // 如果有语言标识符，使用highlight.js进行语法高亮
                        if (lang && typeof hljs !== 'undefined') {
                            try {
                                return hljs.highlight(code, { language: lang }).value;
                            } catch (error) {
                                console.warn('语法高亮失败:', error);
                                return hljs.highlightAuto(code).value;
                            }
                        }
                        // 如果没有语言标识符，尝试自动检测
                        if (typeof hljs !== 'undefined') {
                            return hljs.highlightAuto(code).value;
                        }
                        return code;
                    }
                });
                
                const html = marked.parse(content);
                
                // 确保highlight.js已加载并初始化
                if (typeof hljs !== 'undefined') {
                    // 延迟执行highlightAll以确保DOM已更新
                    setTimeout(() => {
                        document.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightBlock(block);
                        });
                    }, 100);
                }
                
                return html;
            } catch (error) {
                console.error('Markdown渲染失败:', error);
                return this.escapeHtml(content);
            }
        }
        // 默认使用纯文本显示
        return this.escapeHtml(content);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    const loader = new BlogDynamicLoader(blogConfig);
    await loader.init();
    
    // 将loader实例挂载到window供调试使用
    window.blogLoader = loader;
});
