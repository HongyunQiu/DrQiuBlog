#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
简化版sitemap.xml自动生成脚本
基于config.js的内容自动生成sitemap.xml文件

使用方法：
    python generate-sitemap-simple.py

功能：
- 直接解析config.js文件内容
- 自动生成包含所有页面和文章的sitemap.xml
- 支持静态页面和动态内容
- 自动设置合适的优先级和更新频率
"""

import os
import re
from datetime import datetime
from pathlib import Path

# 配置
CONFIG = {
    'base_url': 'https://hongyunqiu.github.io/DrQiuBlog/',
    'config_file': './config.js',
    'sitemap_file': './sitemap.xml',
    'lastmod': datetime.now().strftime('%Y-%m-%d'),
    
    # 优先级设置
    'priorities': {
        'home': 1.0,
        'category': 0.9,
        'article': 0.8,
        'about': 0.8,
        'contact': 0.7
    },
    
    # 更新频率设置
    'changefreq': {
        'home': 'weekly',
        'category': 'weekly', 
        'article': 'monthly',
        'about': 'monthly',
        'contact': 'monthly'
    }
}


def extract_categories_from_config(config_file):
    """从config.js文件中提取类别和文章信息"""
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        categories = []
        
        # 查找所有类别定义（包括静态和动态）
        # 匹配模式：{ id: 'xxx', name: 'xxx', ... }
        category_blocks = re.findall(r'{\s*id:\s*[\'"]([^\'"]+)[\'"].*?order:\s*(\d+)\s*}', content, re.DOTALL)
        
        for category_id, order in category_blocks:
            # 查找类别的详细信息
            category_pattern = rf'{{\s*id:\s*[\'"]{re.escape(category_id)}[\'"].*?order:\s*{re.escape(order)}\s*}}'
            category_match = re.search(category_pattern, content, re.DOTALL)
            
            if category_match:
                category_content = category_match.group(0)
                
                # 提取基本信息
                name_match = re.search(r'name:\s*[\'"]([^\'"]+)[\'"]', category_content)
                is_static_match = re.search(r'isStatic:\s*(true|false)', category_content)
                
                name = name_match.group(1) if name_match else category_id
                is_static = is_static_match.group(1) == 'true' if is_static_match else False
                
                category = {
                    'id': category_id,
                    'name': name,
                    'isStatic': is_static,
                    'order': int(order),
                    'files': []
                }
                
                # 如果不是静态页面，查找文件列表
                if not is_static:
                    # 查找files数组
                    files_pattern = r'files:\s*\[(.*?)\]'
                    files_match = re.search(files_pattern, category_content, re.DOTALL)
                    
                    if files_match:
                        files_content = files_match.group(1)
                        
                        # 查找每个文件
                        # 匹配模式：{ id: 'xxx', name: 'xxx', filename: 'xxx', ... }
                        file_pattern = r'{\s*id:\s*[\'"]([^\'"]+)[\'"].*?lastModified:\s*[\'"]([^\'"]+)[\'"]'
                        file_matches = re.findall(file_pattern, files_content, re.DOTALL)
                        
                        for file_id, last_modified in file_matches:
                            # 提取文件名
                            filename_pattern = rf'id:\s*[\'"]{re.escape(file_id)}[\'"].*?filename:\s*[\'"]([^\'"]+)[\'"]'
                            filename_match = re.search(filename_pattern, files_content)
                            filename = filename_match.group(1) if filename_match else file_id
                            
                            category['files'].append({
                                'id': file_id,
                                'filename': filename,
                                'lastModified': last_modified
                            })
                
                categories.append(category)
        
        # 按order排序
        categories.sort(key=lambda x: x['order'])
        return categories
        
    except Exception as e:
        print(f"[ERROR] 读取配置文件失败: {e}")
        return []


def generate_url_entry(loc, changefreq, priority, lastmod=None):
    """生成单个URL条目"""
    if lastmod is None:
        lastmod = CONFIG['lastmod']
    
    return f"""    <url>
        <loc>{loc}</loc>
        <lastmod>{lastmod}</lastmod>
        <changefreq>{changefreq}</changefreq>
        <priority>{priority}</priority>
    </url>"""


def generate_sitemap_content(categories):
    """生成sitemap.xml内容"""
    urls = []
    
    # 首页
    urls.append(generate_url_entry(
        CONFIG['base_url'],
        CONFIG['changefreq']['home'],
        CONFIG['priorities']['home']
    ))
    
    # 处理所有类别
    for category in categories:
        category_id = category['id']
        is_static = category['isStatic']
        
        # 跳过首页（已经添加）
        if category_id == 'home':
            continue
        
        # 类别页面
        category_url = f"{CONFIG['base_url']}#{category_id}"
        
        if is_static:
            # 静态页面（关于我、联系方式等）
            if category_id == 'about':
                priority = CONFIG['priorities']['about']
                changefreq = CONFIG['changefreq']['about']
            elif category_id == 'contact':
                priority = CONFIG['priorities']['contact']
                changefreq = CONFIG['changefreq']['contact']
            else:
                priority = CONFIG['priorities']['category']
                changefreq = CONFIG['changefreq']['category']
        else:
            # 动态类别页面
            priority = CONFIG['priorities']['category']
            changefreq = CONFIG['changefreq']['category']
        
        urls.append(generate_url_entry(category_url, changefreq, priority))
        
        # 处理类别下的文章
        for file_info in category['files']:
            file_id = file_info['id']
            last_modified = file_info['lastModified']
            
            # 生成文章URL
            article_url = f"{CONFIG['base_url']}#{file_id}"
            
            # 使用文件的最后修改时间作为lastmod
            file_lastmod = CONFIG['lastmod']
            if last_modified:
                try:
                    # 解析ISO格式的时间戳
                    dt = datetime.fromisoformat(last_modified.replace('Z', '+00:00'))
                    file_lastmod = dt.strftime('%Y-%m-%d')
                except:
                    file_lastmod = CONFIG['lastmod']
            
            urls.append(generate_url_entry(
                article_url,
                CONFIG['changefreq']['article'],
                CONFIG['priorities']['article'],
                file_lastmod
            ))
    
    # 生成完整的sitemap.xml内容
    sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

{chr(10).join(urls)}

</urlset>"""
    
    return sitemap_content


def main():
    """主函数"""
    print('[INFO] 开始生成sitemap.xml...\n')
    
    # 检查配置文件是否存在
    if not os.path.exists(CONFIG['config_file']):
        print(f"[ERROR] 配置文件不存在: {CONFIG['config_file']}")
        print("[INFO] 请先运行 generate-config.py 生成配置文件")
        return
    
    # 读取配置
    print(f"[READ] 读取配置文件: {CONFIG['config_file']}")
    categories = extract_categories_from_config(CONFIG['config_file'])
    
    if not categories:
        print("[ERROR] 无法读取博客配置")
        return
    
    # 统计信息
    static_pages = [cat for cat in categories if cat['isStatic']]
    dynamic_categories = [cat for cat in categories if not cat['isStatic']]
    total_articles = sum(len(cat['files']) for cat in dynamic_categories)
    
    print(f"[STATS] 发现 {len(static_pages)} 个静态页面")
    print(f"[STATS] 发现 {len(dynamic_categories)} 个动态类别")
    print(f"[STATS] 发现 {total_articles} 篇文章")
    
    # 生成sitemap内容
    print("\n[GEN] 生成sitemap.xml内容...")
    sitemap_content = generate_sitemap_content(categories)
    
    # 备份现有sitemap（如果存在）
    if os.path.exists(CONFIG['sitemap_file']):
        backup_file = f"{CONFIG['sitemap_file']}.backup"
        with open(CONFIG['sitemap_file'], 'r', encoding='utf-8') as f:
            backup_content = f.read()
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(backup_content)
        print(f"[BACKUP] 已备份原sitemap到: {backup_file}")
    
    # 写入新的sitemap.xml
    with open(CONFIG['sitemap_file'], 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
    
    print(f"\n[SUCCESS] sitemap.xml已生成: {CONFIG['sitemap_file']}")
    print(f"[INFO] 基础URL: {CONFIG['base_url']}")
    print(f"[INFO] 最后更新: {CONFIG['lastmod']}")
    
    # 计算总URL数量
    url_count = 1 + len(categories) + total_articles  # 首页 + 类别页面 + 文章页面
    print(f"[STATS] 总共生成 {url_count} 个URL条目")
    
    print('\n[DONE] sitemap.xml生成完成！')


if __name__ == '__main__':
    main()
