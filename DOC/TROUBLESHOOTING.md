# 故障排查指南

## 问题：监控模式下出现 "加载文件失败: HTTP 404: Not Found"

### 可能的原因

#### 1. 文件名编码问题 ✅ 已修复

**症状：** 中文文件名无法加载

**原因：** URL 编码导致文件路径不匹配

**修复：** 已在 `auto-server.js` 中添加 URL 解码处理

```javascript
// URL 解码（处理中文文件名）
filePath = decodeURIComponent(filePath);
```

#### 2. 文件路径不正确

**症状：** 某些文件 404，但文件确实存在

**检查步骤：**

1. 查看服务器控制台日志
   ```
   [REQUEST] GET /context/tech/文章.txt -> ./context/tech/文章.txt
   [404] 文件未找到: ./context/tech/文章.txt
   ```

2. 检查实际文件路径
   ```bash
   dir context\tech\文章.txt
   ```

3. 确认文件名完全一致（包括空格、特殊字符）

**解决方法：**
- 确保 `config.js` 中的 `filename` 与实际文件名完全一致
- 重新运行 `python generate-config.py` 自动生成配置

#### 3. config.js 未更新

**症状：** 新添加的文件显示 404

**原因：** `config.js` 中没有注册该文件

**解决方法：**

```bash
# 方法1：手动更新
双击 update-config-py.bat

# 方法2：自动监控会自动更新（如果启用）
# 检查控制台是否显示：
# [AUTO] 检测到文件变化，正在重新生成配置...
# [SUCCESS] 配置已自动更新！
```

#### 4. 文件编码问题 ✅ 已修复

**症状：** 文件内容显示乱码或无法读取

**原因：** 服务器读取文件时未指定正确编码

**修复：** 已在 `auto-server.js` 中为文本文件指定 UTF-8 编码

```javascript
const readOptions = isTextFile ? { encoding: 'utf-8' } : {};
```

---

## 调试步骤

### 步骤 1：查看服务器日志

启动自动监控服务器后，控制台会显示详细日志：

```
================================
  Dr.Qiu's Blog 自动更新服务器
================================

[INIT] 正在初始化配置...
[+] 发现 3 个类别目录: ChangeSiLLM, life, tech
  [OK] ChangeSiLLM: 5 个文件
  [OK] tech: 1 个文件
[SUCCESS] 配置已自动更新！

[WATCH] 开始监控 ./context 目录...
[OK] 文件监控已启动

==================================================
  🚀 服务器已启动
  📍 访问地址: http://localhost:8000
  🔄 自动更新: 已启用
==================================================

[REQUEST] GET /context/ChangeSiLLM/古文.txt -> ./context/ChangeSiLLM/古文.txt
[REQUEST] GET /context/ChangeSiLLM/我问佛.txt -> ./context/ChangeSiLLM/我问佛.txt
[404] 文件未找到: ./context/ChangeSiLLM/有感.txt  ← 发现问题！
```

### 步骤 2：检查文件是否存在

```bash
# Windows
dir context\ChangeSiLLM\有感.txt

# 应该显示：
# 2024/10/01  19:00    xxx 有感.txt
```

### 步骤 3：检查 config.js 配置

打开 `config.js`，搜索相关文件：

```javascript
{
    id: 'ChangeSiLLM-有感',
    name: '有感',
    filename: '有感.txt',  ← 检查这里的文件名是否正确
    description: '...'
}
```

### 步骤 4：验证文件名匹配

```bash
# 实际文件名
dir context\ChangeSiLLM\有感.txt

# config.js 中的配置
filename: '有感.txt'

# 必须完全一致！
```

### 步骤 5：强制重新生成配置

```bash
# 停止服务器 (Ctrl+C)

# 重新生成配置
python generate-config.py

# 检查输出中是否包含该文件
# [OK] ChangeSiLLM: 5 个文件

# 重启服务器
node auto-server.js
```

---

## 常见问题与解决方案

### Q1: 所有文件都 404

**原因：** 服务器当前工作目录不正确

**解决：**
```bash
# 确保在项目根目录运行
cd E:\workspace\DrQiuBlog
node auto-server.js
```

### Q2: 只有中文文件名 404

**原因：** URL 编码问题（已修复）

**解决：**
```bash
# 使用最新版本的 auto-server.js
# 如果问题仍存在，尝试重命名文件为英文
ren "context\tech\中文名.txt" "context\tech\english-name.txt"
```

### Q3: 新添加的文件 404

**原因：** 配置未更新

**解决：**
```bash
# 自动监控模式应该会自动更新
# 如果没有，检查控制台日志

# 或手动更新
python generate-config.py

# 刷新浏览器 (Ctrl+F5)
```

### Q4: 某个特定文件始终 404

**检查清单：**
- [ ] 文件确实存在
- [ ] 文件名没有拼写错误
- [ ] config.js 中有该文件的配置
- [ ] filename 字段与实际文件名完全一致
- [ ] 文件不是隐藏文件
- [ ] 文件有读取权限

**终极解决方案：**
```bash
# 1. 删除该文件
del "context\ChangeSiLLM\问题文件.txt"

# 2. 重新创建
echo 内容 > "context\ChangeSiLLM\问题文件.txt"

# 3. 重新生成配置
python generate-config.py

# 4. 重启服务器
```

---

## 增强日志功能

如果问题仍然存在，可以启用详细日志：

### 修改 auto-server.js

找到这一行：
```javascript
// 记录请求（仅记录非静态资源）
if (!filePath.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/i)) {
    console.log(`[REQUEST] ${req.method} ${req.url} -> ${filePath}`);
}
```

改为（记录所有请求）：
```javascript
// 记录所有请求
console.log(`[REQUEST] ${req.method} ${req.url} -> ${filePath}`);
```

---

## 对比测试

### 使用 Python 服务器测试

```bash
# 使用标准 Python HTTP 服务器
python -m http.server 8000

# 如果 Python 服务器正常，说明问题在 auto-server.js
```

### 使用 start-with-auto-update.bat 测试

```bash
# 使用自动更新启动脚本（使用 Python 服务器）
start-with-auto-update.bat

# 如果这个正常，说明问题在 Node.js 服务器实现
```

---

## 已修复的问题

### ✅ 修复 1: URL 解码

**问题：** 中文文件名编码不正确

**修复：**
```javascript
// 添加 URL 解码
filePath = decodeURIComponent(filePath);
```

### ✅ 修复 2: UTF-8 编码

**问题：** 文本文件读取时编码错误

**修复：**
```javascript
const readOptions = isTextFile ? { encoding: 'utf-8' } : {};
fs.readFile(filePath, readOptions, ...);
```

### ✅ 修复 3: 错误日志

**问题：** 404 错误没有详细日志

**修复：**
```javascript
console.log(`[404] 文件未找到: ${filePath}`);
console.error(`[ERROR] 读取文件失败 ${filePath}:`, error.message);
```

---

## 预防措施

### 1. 使用自动配置生成

```bash
# 不要手动编辑 config.js
# 总是使用脚本生成
python generate-config.py
```

### 2. 文件命名规范

```
✅ 推荐：
- 我的文章.txt
- article-name.txt
- 2024-10-01-note.txt

❌ 避免：
- 文章 (1).txt       # 括号可能有问题
- 文章#标签.txt      # 特殊字符
- 文章?.txt          # 非法字符
```

### 3. 定期检查日志

启动服务器后，注意观察：
```
[OK] ChangeSiLLM: 5 个文件  ← 数量是否正确？
```

### 4. 使用备份

```bash
# config.js 会自动备份到 config.js.backup
# 如果配置出错，可以恢复：
copy config.js.backup config.js
```

---

## 获取帮助

如果问题仍未解决：

1. **查看完整日志**
   - 复制控制台的完整输出
   - 特别注意 [404] 和 [ERROR] 行

2. **检查文件列表**
   ```bash
   dir /s context\*.txt
   ```

3. **验证配置文件**
   ```bash
   # 查看生成的配置
   type config.js | findstr "filename"
   ```

4. **尝试简化测试**
   - 创建一个简单的测试文件
   - 确认基本功能正常
   - 逐步添加复杂文件

---

## 总结

大多数 404 问题的原因：
1. ✅ **文件名不匹配** - 重新生成配置
2. ✅ **URL 编码问题** - 已修复
3. ✅ **配置未更新** - 运行更新脚本
4. ✅ **文件编码问题** - 已修复

**推荐做法：**
- 使用 `python generate-config.py` 自动生成配置
- 定期查看服务器日志
- 遇到问题先检查日志输出

现在的 `auto-server.js` 已经包含了完整的错误处理和日志记录，可以帮助快速定位问题！

