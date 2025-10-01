# Dr.Qiu's Blog

这是一个简洁美观的静态个人博客网页，采用左右布局设计：左侧导航栏，右侧内容区域。

## 功能特点

- 🎨 **简洁美观的设计** - 采用现代化UI设计，渐变色彩搭配
- 📱 **响应式布局** - 完美适配桌面端和移动端设备
- 🧭 **单页应用** - 无需页面刷新，流畅的导航体验
- 📁 **动态内容加载** - 自动从 context 目录读取文件并显示
- 📝 **多栏目支持** - 首页、关于我、技术文章、生活随笔等可扩展栏目
- 🔍 **文件预览** - 自动生成文件内容缩略，点击查看全文
- ✨ **动画效果** - 平滑的过渡动画和交互效果
- 🗂️ **分类管理** - 支持多级目录结构，可折叠展开
- 💾 **智能缓存** - 已加载的文件自动缓存，提升性能
- 🎯 **用户体验优化** - 键盘导航、滚动到顶部、表单验证等功能

## 文件结构

```
DrQiuBlog/
├── index.html              # 主页面文件
├── styles.css              # 样式文件
├── config.js               # 配置文件（可自动生成）
├── dynamic-loader.js       # 动态内容加载器
├── script.js               # 辅助功能脚本
├── generate-config.py      # 🆕 自动生成配置（Python）
├── generate-config.js      # 🆕 自动生成配置（Node.js）
├── update-config-py.bat    # 🆕 一键更新配置（Python）
├── update-config.bat       # 🆕 一键更新配置（Node.js）
├── start-server.bat        # 启动本地服务器
├── readme.md               # 说明文档
├── AUTO_SCAN_GUIDE.md      # 🆕 自动扫描指南
└── context/                # 内容目录
    ├── ChangeSiLLM/        # ChangeSiLLM 相关文章
    │   ├── 古文.txt
    │   ├── 我看到骆驼.txt
    │   ├── 我问佛.txt
    │   └── 描绘梦境.txt
    ├── tech/               # 技术文章
    │   └── 关于长思LLM模型.txt
    └── life/               # 生活随笔
```

## 使用方法

⚠️ **重要提示**：由于博客使用了 Fetch API 读取本地文件，**必须**通过本地服务器运行，直接双击打开 HTML 文件会因为跨域限制无法加载内容。

### 启动本地服务器

#### 方式 1：自动更新启动（推荐）⭐

每次启动时自动扫描文件并更新配置：

```bash
# 双击运行
start-with-auto-update.bat

# 自动完成：扫描 → 更新配置 → 启动服务器
```

#### 方式 2：手动启动

```bash
# 使用Python 3
python -m http.server 8000

# 使用Python 2
python -m SimpleHTTPServer 8000

# 或双击运行
start-server.bat
```

#### 方式 3：自动监控模式（高级）

启动后自动监控文件变化，实时更新配置：

```bash
# 需要 Node.js
node auto-server.js

# 或双击运行
start-auto-server.bat
```

然后在浏览器中访问：`http://localhost:8000`

详见 [AUTO_EXECUTION_GUIDE.md](AUTO_EXECUTION_GUIDE.md)

## 自定义内容

### 添加新文章

有两种方式添加新文章：

#### 方式 1：自动扫描（推荐）⚡

1. 在 `context/` 目录下的相应子目录中添加 `.txt` 文件
2. 运行自动配置生成脚本：
   ```bash
   # 双击运行
   update-config-py.bat
   
   # 或命令行运行
   python generate-config.py
   ```
3. 刷新浏览器（Ctrl + F5）

**优点**：快速、自动、零错误！详见 [AUTO_SCAN_GUIDE.md](AUTO_SCAN_GUIDE.md)

#### 方式 2：手动配置

1. 在 `context/` 目录下的相应子目录中添加 `.txt` 文件
2. 编辑 `config.js` 文件，在对应的类别中添加文件信息：

```javascript
{
    id: 'tech',
    name: '技术文章',
    icon: '💻',
    path: 'tech/',
    files: [
        {
            id: 'my-new-article',           // 唯一标识
            name: '我的新文章',              // 显示名称
            filename: '我的新文章.txt',      // 实际文件名
            description: '文章简介'          // 可选的描述
        }
    ]
}
```

### 添加新类别

在 `config.js` 中的 `categories` 数组中添加新类别：

```javascript
{
    id: 'my-category',              // 唯一标识
    name: '我的分类',               // 显示名称
    icon: '📚',                     // 图标（emoji）
    path: 'my-category/',           // context 下的目录路径
    description: '分类描述',        // 可选的描述
    files: [],                      // 文件列表
    order: 6                        // 排序顺序
}
```

然后在 `context/` 目录下创建对应的子目录。

### 修改个人信息
- 编辑 `index.html` 中的关于我部分和联系方式部分
- 更新社交媒体链接

### 调整样式
- 编辑 `styles.css` 文件自定义颜色、字体和布局
- 主要颜色变量：
  - 主色调：`#667eea` 到 `#764ba2` 的渐变
  - 文字颜色：`#2d3748`（深色）、`#4a5568`（中等）、`#718096`（浅色）

### 配置选项

在 `config.js` 中可以调整以下设置：

```javascript
blogConfig = {
    basePath: 'context/',      // 内容目录的基础路径
    previewLength: 200,        // 缩略内容的字符数（默认200字符）
    // ... 其他配置
}
```

## 工作原理

1. **配置文件** (`config.js`)：定义目录结构和文件列表
2. **动态加载器** (`dynamic-loader.js`)：
   - 根据配置生成导航菜单
   - 使用 Fetch API 读取文件内容
   - 生成文件预览（前N个字符）
   - 管理内容缓存，避免重复加载
3. **单页应用**：所有内容切换都通过 JavaScript 完成，无需刷新页面

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 技术栈

- HTML5
- CSS3 (Flexbox, Grid, 动画)
- 原生JavaScript (ES6+)
- Google Fonts (Inter字体)

## 许可证

MIT License - 可自由使用和修改