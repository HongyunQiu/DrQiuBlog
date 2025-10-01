// 辅助功能和增强功能
document.addEventListener('DOMContentLoaded', function() {
    // 动态加载器会处理导航，这里只处理辅助功能
    
    // 表单提交处理
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // 简单的表单验证
            if (!name || !email || !message) {
                alert('请填写所有必填字段');
                return;
            }
            
            if (!isValidEmail(email)) {
                alert('请输入有效的邮箱地址');
                return;
            }
            
            // 模拟发送消息（实际项目中这里应该发送到服务器）
            alert('消息发送成功！我会尽快回复您。');
            this.reset();
        });
    }
    
    // 邮箱格式验证
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // 平滑滚动效果
    function smoothScroll() {
        // 为页面内链接添加平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // 初始化平滑滚动
    smoothScroll();
    
    // 添加页面加载动画
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // 移动端菜单切换（如果需要）
    function initMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const toggleButton = document.createElement('button');
        toggleButton.innerHTML = '☰';
        toggleButton.className = 'mobile-menu-toggle';
        toggleButton.style.cssText = `
            display: none;
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 1000;
            background: #667eea;
            color: white;
            border: none;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 1.2rem;
            cursor: pointer;
        `;
        
        document.body.appendChild(toggleButton);
        
        toggleButton.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
        });
        
        // 媒体查询检测
        function checkMobile() {
            if (window.innerWidth <= 768) {
                toggleButton.style.display = 'block';
                sidebar.classList.add('mobile-sidebar');
            } else {
                toggleButton.style.display = 'none';
                sidebar.classList.remove('mobile-sidebar', 'mobile-open');
            }
        }
        
        window.addEventListener('resize', checkMobile);
        checkMobile();
    }
    
    // 初始化移动端菜单
    initMobileMenu();
    
    // 滚动条状态检测
    function initScrollbarDetection() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        function checkScrollable() {
            if (sidebar.scrollHeight > sidebar.clientHeight) {
                sidebar.classList.add('scrollable');
            } else {
                sidebar.classList.remove('scrollable');
            }
        }
        
        // 初始检测
        checkScrollable();
        
        // 监听窗口大小变化
        window.addEventListener('resize', checkScrollable);
        
        // 监听内容变化（如果有动态内容加载）
        const observer = new MutationObserver(checkScrollable);
        observer.observe(sidebar, { 
            childList: true, 
            subtree: true 
        });
    }
    
    // 初始化滚动条检测
    initScrollbarDetection();
    
    // 添加键盘导航支持
    document.addEventListener('keydown', function(e) {
        if (e.altKey) {
            const keyMap = {
                '1': 'home',
                '2': 'about',
                '3': 'tech',
                '4': 'life',
                '5': 'projects',
                '6': 'contact'
            };
            
            if (keyMap[e.key]) {
                e.preventDefault();
                switchContent(keyMap[e.key]);
            }
        }
    });
    
    // 添加滚动到顶部功能
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.style.cssText = `
        display: none;
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 1000;
        background: #667eea;
        color: white;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 1.2rem;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 显示/隐藏滚动到顶部按钮
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
    
    // 添加鼠标悬停效果
    scrollToTopBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.backgroundColor = '#764ba2';
    });
    
    scrollToTopBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.backgroundColor = '#667eea';
    });
});

// 添加一些实用的工具函数
const BlogUtils = {
    // 格式化日期
    formatDate: function(date) {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    },
    
    // 截断文本
    truncateText: function(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    // 防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 导出工具函数供全局使用
window.BlogUtils = BlogUtils;
