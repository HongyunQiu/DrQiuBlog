# 快速开始指南

## 1. 启动博客

由于博客需要读取本地文件，必须通过本地服务器运行：

```bash
# 最简单的方式（需要Python）
python -m http.server 8000
```

然后打开浏览器访问：http://localhost:8000

## 2. 添加你的第一篇文章

⚠️ **重要提示**：系统**不会**自动扫描目录中的文件。添加新文章需要**两个步骤**：
1. 创建文本文件
2. 在 `config.js` 中注册该文件

### 步骤 1：创建文本文件

在 `context/tech/` 目录下创建一个新的 `.txt` 文件，例如 `我的第一篇文章.txt`

```
这是我的第一篇博客文章。

今天我学习了如何使用这个静态博客系统。它非常简单易用！

主要特点：
- 简洁的设计
- 自动加载文件
- 支持文件预览
```

### 步骤 2：在配置文件中注册（必须！）

⚠️ **这一步是必需的**，否则新文件不会显示在博客中。

编辑 `config.js` 文件，找到 `tech` 类别，在 `files` 数组中添加：

```javascript
{
    id: 'tech',
    name: '技术文章',
    icon: '💻',
    path: 'tech/',
    files: [
        {
            id: 'changesillm-intro',
            name: '关于长思LLM模型',
            filename: '关于长思LLM模型.txt',
            description: '长思LLM模型的介绍'
        },
        // 👇 添加你的新文章
        {
            id: 'my-first-article',
            name: '我的第一篇文章',
            filename: '我的第一篇文章.txt',
            description: '学习使用博客系统'
        }
    ],
    order: 2
}
```

### 步骤 3：刷新浏览器

刷新浏览器页面，你就能在"技术文章"栏目中看到你的新文章了！

## 3. 创建新的类别

### 步骤 1：创建目录

在 `context/` 下创建新目录，例如 `context/projects/`

### 步骤 2：添加配置

在 `config.js` 的 `categories` 数组中添加：

```javascript
{
    id: 'projects',
    name: '项目作品',
    icon: '🚀',
    path: 'projects/',
    description: '我的项目和作品展示',
    files: [],
    order: 4
}
```

### 步骤 3：添加文件

在 `context/projects/` 中添加文件，并在配置中注册。

## 4. 调整缩略字数

编辑 `config.js`，修改 `previewLength`：

```javascript
const blogConfig = {
    basePath: 'context/',
    previewLength: 300,  // 默认是200，改成300显示更多内容
    // ...
}
```

## 5. 自定义样式

编辑 `styles.css`，修改主色调：

```css
/* 找到这些地方并修改颜色 */
.sidebar {
    background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

## 常见问题

### Q: 页面显示"加载失败"
A: 确保：
1. 使用本地服务器运行（不是直接打开HTML文件）
2. 文件路径和文件名在 `config.js` 中配置正确
3. 文件确实存在于指定的目录中

### Q: 中文文件名显示乱码
A: 确保：
1. 文本文件使用 UTF-8 编码保存
2. 服务器正确处理 UTF-8 编码

### Q: 如何修改首页内容
A: 编辑 `index.html` 文件中 `id="home"` 的 section 部分

### Q: 能否支持 Markdown 格式
A: 当前版本只支持纯文本。如需 Markdown 支持，需要集成 Markdown 解析库（如 marked.js）

## 下一步

- 查看 `readme.md` 了解更多详细信息
- 自定义 CSS 样式，打造独特外观
- 添加更多内容和类别
- 考虑部署到 GitHub Pages 或其他静态托管服务

祝你使用愉快！🎉

