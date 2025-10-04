#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
自动生成配置文件脚本 (Python 版本)
扫描 context 目录下的所有文件，自动生成 config.js

使用方法：
    python generate-config.py

功能：
- 自动扫描 context 目录的所有子目录
- 自动发现所有 .txt 和 .md 文件
- 生成或更新 config.js 文件
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path

# 配置
CONFIG = {
    'context_dir': './context',
    'output_file': './config.js',
    'preview_length': 200,
    
    # 类别配置
    'category_settings': {
        'ChangeSiLLM': {
            'name': 'ChangeSiLLM',
            'icon': '',
            'description': '长思LLM模型的相关内容',
            'order': 1
        },
        'tech': {
            'name': '技术文章',
            'icon': '',
            'description': '技术相关的文章和笔记',
            'order': 2
        },
        'life': {
            'name': '生活随笔',
            'icon': '',
            'description': '生活感悟和随笔',
            'order': 3
        }
    },
    
    # 静态页面配置
    'static_pages': [
        {
            'id': 'home',
            'name': '首页',
            'icon': '',
            'isStatic': True,
            'order': 0
        },
        {
            'id': 'about',
            'name': '关于我',
            'icon': '',
            'isStatic': True,
            'order': 4
        },
        {
            'id': 'contact',
            'name': '联系方式',
            'icon': '',
            'isStatic': True,
            'order': 5
        }
    ]
}


def scan_directory(dir_path):
    """扫描目录获取所有文件"""
    categories = {}
    
    try:
        context_path = Path(dir_path)
        if not context_path.exists():
            print(f"[ERROR] {dir_path} 目录不存在")
            return categories
        
        subdirs = [d for d in context_path.iterdir() if d.is_dir()]
        print(f"[+] 发现 {len(subdirs)} 个类别目录: {', '.join([d.name for d in subdirs])}")
        
        for subdir in subdirs:
            files = [f.name for f in subdir.iterdir() if f.is_file() and f.suffix in ['.txt', '.md']]
            
            if files:
                categories[subdir.name] = files
                print(f"  [OK] {subdir.name}: {len(files)} 个文件")
            else:
                print(f"  [WARN] {subdir.name}: 空目录")
                categories[subdir.name] = []
        
        return categories
    except Exception as e:
        print(f"[ERROR] 扫描目录失败: {e}")
        return {}


def generate_file_id(category_id, filename):
    """生成文件 ID"""
    basename = Path(filename).stem
    # 简化处理，保留中文和字母数字
    slug = re.sub(r'[^\w\u4e00-\u9fa5]+', '-', basename.lower()).strip('-')
    return f"{category_id}-{slug}"


def get_file_description(file_path):
    """读取文件内容获取描述（前50个字符）"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
            if len(first_line) > 50:
                return first_line[:50] + '...'
            return first_line or '暂无描述'
    except Exception:
        return '暂无描述'


def get_file_preview(file_path, length):
    """读取文件内容生成预览文本"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # 读取比预览长度稍长的内容，确保足够的文本
            content = f.read(length * 4)

        # 将换行和多余空白替换为单个空格
        cleaned = re.sub(r'\s+', ' ', content).strip()
        if not cleaned:
            return '暂无摘要'

        if len(cleaned) > length:
            return cleaned[:length].rstrip() + '...'
        return cleaned
    except Exception:
        return '暂无摘要'


def generate_categories(scanned_files):
    """生成类别配置"""
    categories = []
    
    # 添加静态页面
    categories.extend(CONFIG['static_pages'])
    
    # 处理动态类别
    for category_id, files in scanned_files.items():
        setting = CONFIG['category_settings'].get(category_id, {
            'name': category_id,
            'icon': '📄',
            'description': f'{category_id} 相关内容',
            'order': 99
        })
        
        file_configs = []
        for filename in files:
            file_path = os.path.join(CONFIG['context_dir'], category_id, filename)
            file_ext = Path(filename).suffix
            basename = Path(filename).stem

            try:
                last_modified_ts = os.path.getmtime(file_path)
                last_modified_iso = datetime.fromtimestamp(last_modified_ts).isoformat()
            except OSError:
                last_modified_ts = None
                last_modified_iso = ''

            file_configs.append({
                'id': generate_file_id(category_id, filename),
                'name': basename,
                'filename': filename,
                'description': get_file_description(file_path),
                'preview': get_file_preview(file_path, CONFIG['preview_length']),
                'lastModified': last_modified_iso,
                'lastModifiedTimestamp': last_modified_ts,
                'type': 'markdown' if file_ext == '.md' else 'text'
            })
        
        categories.append({
            'id': category_id,
            'name': setting['name'],
            'icon': setting['icon'],
            'path': f'{category_id}/',
            'description': setting['description'],
            'files': file_configs,
            'order': setting['order']
        })
    
    # 按 order 排序
    categories.sort(key=lambda x: x['order'])
    return categories


def json_to_js_object(obj, indent=0):
    """将 Python 对象转换为 JavaScript 对象字符串"""
    spaces = ' ' * indent
    
    if isinstance(obj, bool):
        return 'true' if obj else 'false'
    elif isinstance(obj, (int, float)):
        return str(obj)
    elif isinstance(obj, str):
        # 转义特殊字符
        escaped = obj.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n')
        return f"'{escaped}'"
    elif isinstance(obj, list):
        if not obj:
            return '[]'
        items = ',\n'.join(f"{spaces}        {json_to_js_object(item, indent + 8)}" for item in obj)
        return f"[\n{items}\n{spaces}    ]"
    elif isinstance(obj, dict):
        if not obj:
            return '{}'
        items = []
        for key, value in obj.items():
            js_value = json_to_js_object(value, indent + 8)
            items.append(f"{spaces}        {key}: {js_value}")
        return "{\n" + ",\n".join(items) + f"\n{spaces}    " + "}"
    return 'null'


def generate_config_content(categories):
    """生成配置文件内容"""
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # 将 categories 转换为 JS 格式
    categories_js = '[\n'
    for i, cat in enumerate(categories):
        categories_js += '        {\n'
        for key, value in cat.items():
            js_value = json_to_js_object(value, 8)
            categories_js += f'                {key}: {js_value},\n'
        categories_js = categories_js.rstrip(',\n') + '\n'
        categories_js += '        }'
        if i < len(categories) - 1:
            categories_js += ','
        categories_js += '\n'
    categories_js += '    ]'
    
    config_template = f"""// 博客内容配置文件
// 此文件由 generate-config.py 自动生成
// 生成时间: {now}

const blogConfig = {{
    // 内容目录的基础路径
    basePath: 'context/',
    
    // 缩略内容的字符数限制
    previewLength: {CONFIG['preview_length']},
    
    // 目录和文件结构
    categories: {categories_js},
    
    // 获取所有类别（按顺序排序）
    getCategories: function() {{
        return this.categories.sort((a, b) => a.order - b.order);
    }},
    
    // 根据ID获取类别
    getCategoryById: function(id) {{
        return this.categories.find(cat => cat.id === id);
    }},
    
    // 获取文件的完整路径
    getFilePath: function(categoryId, filename) {{
        const category = this.getCategoryById(categoryId);
        if (category && category.path) {{
            return this.basePath + category.path + filename;
        }}
        return null;
    }},
    
    // 获取所有动态类别（从文件加载的类别）
    getDynamicCategories: function() {{
        return this.categories.filter(cat => !cat.isStatic);
    }}
}};

// 导出配置供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = blogConfig;
}}"""
    
    return config_template


def main():
    """主函数"""
    print('[INFO] 开始扫描目录并生成配置文件...\n')
    
    # 检查 context 目录
    if not os.path.exists(CONFIG['context_dir']):
        print(f"[ERROR] {CONFIG['context_dir']} 目录不存在")
        return
    
    # 扫描目录
    scanned_files = scan_directory(CONFIG['context_dir'])
    
    if not scanned_files:
        print("[WARN] 没有发现任何文件")
        return
    
    # 生成类别配置
    categories = generate_categories(scanned_files)
    
    # 生成配置文件内容
    config_content = generate_config_content(categories)
    
    # 备份现有配置文件
    if os.path.exists(CONFIG['output_file']):
        backup_file = f"{CONFIG['output_file']}.backup"
        with open(CONFIG['output_file'], 'r', encoding='utf-8') as f:
            backup_content = f.read()
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(backup_content)
        print(f"\n[BACKUP] 已备份原配置文件到: {backup_file}")
    
    # 写入新配置文件
    with open(CONFIG['output_file'], 'w', encoding='utf-8') as f:
        f.write(config_content)
    print(f"\n[SUCCESS] 配置文件已生成: {CONFIG['output_file']}")
    
    # 统计信息
    dynamic_categories = [cat for cat in categories if not cat.get('isStatic')]
    total_files = sum(len(cat.get('files', [])) for cat in dynamic_categories)
    
    print('\n[STATS] 统计信息:')
    print(f"   - 静态页面: {len(CONFIG['static_pages'])} 个")
    print(f"   - 动态类别: {len(dynamic_categories)} 个")
    print(f"   - 文章总数: {total_files} 篇")
    
    print('\n[DONE] 完成！现在可以刷新浏览器查看更新。')
    
    # 自动更新sitemap.xml
    print('\n[SITEMAP] 正在更新sitemap.xml...')
    try:
        import subprocess
        result = subprocess.run(['python', 'generate-sitemap-simple.py'], 
                              capture_output=True, text=True, encoding='utf-8')
        if result.returncode == 0:
            print('[SUCCESS] sitemap.xml已自动更新！')
        else:
            print(f'[WARN] sitemap.xml更新失败: {result.stderr}')
    except Exception as e:
        print(f'[WARN] 无法自动更新sitemap.xml: {e}')
        print('[INFO] 请手动运行: python generate-sitemap.py')


if __name__ == '__main__':
    main()

