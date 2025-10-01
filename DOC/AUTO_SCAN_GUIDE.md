# 自动扫描配置指南

## 🎉 好消息！

虽然浏览器端无法自动扫描文件系统，但我为您创建了**自动配置生成脚本**，让添加新文章变得非常简单！

## 工作原理

```
┌─────────────────┐
│ 1. 添加文本文件  │
│  到 context/    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ 2. 运行生成脚本  │ ───> │ 自动扫描目录  │
│  (一键运行)      │      │ 发现所有文件  │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│ 3. 自动更新      │
│  config.js      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. 刷新浏览器    │
│  看到新文章！    │
└─────────────────┘
```

## 使用方法

### 方法 1：使用 Python 脚本（推荐）

**步骤：**

1. **添加新文章**
   ```
   # 在任意类别目录下添加 .txt 文件
   context/ChangeSiLLM/我的新文章.txt
   context/tech/另一篇文章.txt
   ```

2. **运行脚本**
   
   双击运行：`update-config-py.bat`
   
   或在命令行运行：
   ```bash
   python generate-config.py
   ```

3. **刷新浏览器**
   ```
   按 Ctrl + F5（强制刷新）
   ```

就这么简单！✨

### 方法 2：使用 Node.js 脚本

如果您安装了 Node.js：

双击运行：`update-config.bat`

或在命令行运行：
```bash
node generate-config.js
```

## 脚本功能

### ✅ 自动完成的任务

1. **扫描所有目录**
   - 自动发现 `context/` 下的所有子目录
   - 列出每个目录中的所有 `.txt` 文件

2. **生成配置**
   - 为每个文件自动生成唯一 ID
   - 使用文件名作为显示名称
   - 读取文件首行作为描述（前50字符）

3. **备份保护**
   - 自动备份原有的 `config.js` 到 `config.js.backup`
   - 不会丢失您的自定义配置

4. **统计报告**
   - 显示扫描到的文件数量
   - 列出所有类别和文件

### 📊 示例输出

```
[INFO] 开始扫描目录并生成配置文件...

[+] 发现 3 个类别目录: ChangeSiLLM, life, tech
  [OK] ChangeSiLLM: 4 个文件
  [WARN] life: 空目录
  [OK] tech: 1 个文件

[BACKUP] 已备份原配置文件到: ./config.js.backup

[SUCCESS] 配置文件已生成: ./config.js

[STATS] 统计信息:
   - 静态页面: 3 个
   - 动态类别: 3 个
   - 文章总数: 5 篇

[DONE] 完成！现在可以刷新浏览器查看更新。
```

## 自定义配置

如果您想自定义类别的显示名称、图标等，可以编辑脚本中的配置：

### Python 版本 (generate-config.py)

```python
'category_settings': {
    'ChangeSiLLM': {
        'name': 'ChangeSiLLM',
        'icon': '🤖',
        'description': '长思LLM模型的相关内容',
        'order': 1
    },
    'tech': {
        'name': '技术文章',
        'icon': '💻',
        'description': '技术相关的文章和笔记',
        'order': 2
    },
    # 添加新类别配置...
}
```

### Node.js 版本 (generate-config.js)

```javascript
categorySettings: {
    'ChangeSiLLM': {
        name: 'ChangeSiLLM',
        icon: '🤖',
        description: '长思LLM模型的相关内容',
        order: 1
    },
    // 添加新类别配置...
}
```

## 完整工作流程

### 日常添加文章

```bash
# 1. 创建新文章
echo "文章内容..." > context/tech/新文章.txt

# 2. 运行生成脚本
python generate-config.py

# 3. 刷新浏览器
# Ctrl + F5
```

### 批量添加文章

```bash
# 1. 添加多篇文章
context/tech/文章1.txt
context/tech/文章2.txt
context/ChangeSiLLM/文章3.txt

# 2. 运行一次生成脚本（会扫描所有文件）
python generate-config.py

# 3. 刷新浏览器
```

## 优势对比

### ❌ 之前（手动配置）

```
1. 创建 .txt 文件
2. 打开 config.js
3. 找到对应类别
4. 手动添加配置对象
   - 编写 id
   - 编写 name
   - 编写 filename
   - 编写 description
5. 保存文件
6. 刷新浏览器
```

### ✅ 现在（自动扫描）

```
1. 创建 .txt 文件
2. 双击运行脚本
3. 刷新浏览器
```

**节省 80% 的时间！** 🚀

## 高级用法

### 定时自动运行

您可以设置 Windows 任务计划程序，每次启动服务器时自动运行脚本：

创建 `start-with-update.bat`：

```batch
@echo off
echo 正在更新配置...
python generate-config.py
echo.
echo 正在启动服务器...
python -m http.server 8000
```

### Git 集成

如果使用 Git，可以添加 pre-commit hook：

`.git/hooks/pre-commit`：
```bash
#!/bin/sh
python generate-config.py
git add config.js
```

## 常见问题

### Q: 脚本会覆盖我的自定义配置吗？

A: 会的。脚本会完全重新生成 `config.js`。但是：
- 原文件会备份到 `config.js.backup`
- 类别的名称、图标等可以在脚本中配置
- 静态页面（首页、关于我等）会保留

### Q: 我想自定义某篇文章的描述怎么办？

A: 两个方法：
1. 把描述写在文件的第一行（脚本会自动读取）
2. 运行脚本后手动编辑 `config.js` 中的该文章描述

### Q: 脚本运行失败怎么办？

A: 检查：
1. 是否安装了 Python 3
2. `context/` 目录是否存在
3. 文件编码是否为 UTF-8

### Q: 能否只扫描特定目录？

A: 可以，编辑脚本中的 `CONFIG` 部分，添加过滤逻辑。

## 文件清单

```
📁 DrQiuBlog/
├── generate-config.py          # Python 生成脚本
├── generate-config.js          # Node.js 生成脚本
├── update-config-py.bat        # Python 一键运行（Windows）
├── update-config.bat           # Node.js 一键运行（Windows）
├── config.js                   # 自动生成的配置文件
├── config.js.backup            # 自动备份（运行脚本时创建）
└── context/                    # 内容目录
```

## 总结

使用自动配置生成脚本后：

✅ **更快**：几秒钟完成配置  
✅ **更简单**：只需双击运行  
✅ **更安全**：自动备份原配置  
✅ **更灵活**：支持自定义  
✅ **零错误**：避免手动配置的拼写错误  

现在您可以专注于创作内容，让脚本处理配置！🎨

---

**快速开始：**
1. 添加 `.txt` 文件到 `context/` 的任意子目录
2. 双击 `update-config-py.bat`
3. 刷新浏览器 (Ctrl+F5)

就是这么简单！😊

