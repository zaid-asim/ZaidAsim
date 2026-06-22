import os
import re
from datetime import datetime

root_dir = r"c:\Users\ADMIN\Documents\Zaid Asim"

# List of global keywords
global_kws = ["Zaid Asim", "Zaid Asim Softwares", "Zaid Asim developer", "Zaid Asim software engineer", "Zaid Asim Hyderabad"]
global_kws_lower = [k.lower() for k in global_kws]

html_files = []
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

print(f"Found {len(html_files)} HTML files to process.")

modified_count = 0

for file_path in sorted(html_files):
    rel_path = os.path.relpath(file_path, root_dir).replace('\\', '/')
    print(f"\nProcessing: {rel_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Update Title Tag (for all subpages except index.html)
    if rel_path != 'index.html':
        title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).strip()
            # If title doesn't end with " | Zaid Asim Softwares", append it
            if not title.endswith('| Zaid Asim Softwares'):
                new_title = f"{title} | Zaid Asim Softwares"
                content = re.sub(r'<title>.*?</title>', f'<title>{new_title}</title>', content, flags=re.IGNORECASE)
                print(f"  [Title Updated] -> '{new_title}'")
    
    # 2. Standardize keywords on all pages
    existing_kws = []
    kw_match = re.search(r'<meta\s+name=["\']keywords["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
    if kw_match:
        raw_kws = kw_match.group(1).split(',')
        for kw in raw_kws:
            kw_strip = kw.strip()
            if kw_strip and kw_strip.lower() not in global_kws_lower:
                existing_kws.append(kw_strip)
        
        new_kws = global_kws + existing_kws
        kws_content = ", ".join(new_kws)
        new_tag = f'<meta name="keywords" content="{kws_content}">'
        content = re.sub(r'<meta\s+name=["\']keywords["\']\s+content=["\'](.*?)["\']\s*/?>', new_tag, content, flags=re.IGNORECASE)
        print("  [Keywords Standardized] (Updated existing)")
    else:
        # Create new keywords meta tag
        kws_content = ", ".join(global_kws)
        new_tag = f'<meta name="keywords" content="{kws_content}">'
        # Insert after <head>
        head_match = re.search(r'<head\b[^>]*>', content, re.IGNORECASE)
        if head_match:
            pos = head_match.end()
            nl_pos = content.find('\n', pos)
            if nl_pos != -1:
                pos = nl_pos + 1
            content = content[:pos] + f"    {new_tag}\n" + content[pos:]
            print("  [Keywords Standardized] (Inserted new)")

    # 3. Rectify canonical URL, og:url, twitter:url, and JSON-LD (for all except 404.html)
    if rel_path != '404.html':
        if rel_path == 'index.html':
            route_path = ""
            correct_url = "https://zaidasim.com"
        else:
            route_path = rel_path[:-5] # remove '.html'
            correct_url = f"https://zaidasim.com/{route_path}"
        
        # Rectify Canonical
        canonical_match = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']', content, re.IGNORECASE)
        if canonical_match:
            content = re.sub(
                r'(<link\s+rel=["\']canonical["\']\s+href=["\'])([^"\']*)(["\'])',
                r'\1' + correct_url + r'\3',
                content,
                flags=re.IGNORECASE
            )
            print(f"  [Canonical Rectified] -> {correct_url}")
        
        # Rectify OG URL
        og_url_match = re.search(r'<meta\s+property=["\']og:url["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
        if og_url_match:
            content = re.sub(
                r'(<meta\s+property=["\']og:url["\']\s+content=["\'])([^"\']*)(["\'])',
                r'\1' + correct_url + r'\3',
                content,
                flags=re.IGNORECASE
            )
            print(f"  [OG URL Rectified] -> {correct_url}")

        # Rectify Twitter URL
        twitter_url_match = re.search(r'<meta\s+name=["\']twitter:url["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
        if twitter_url_match:
            content = re.sub(
                r'(<meta\s+name=["\']twitter:url["\']\s+content=["\'])([^"\']*)(["\'])',
                r'\1' + correct_url + r'\3',
                content,
                flags=re.IGNORECASE
            )
            print(f"  [Twitter URL Rectified] -> {correct_url}")

        # Rectify old incorrect short URL in JSON-LD and elsewhere if nested
        parts = route_path.split('/')
        if len(parts) > 1:
            file_name = parts[-1]
            old_incorrect_url = f"https://zaidasim.com/{file_name}"
            if old_incorrect_url in content:
                content = content.replace(old_incorrect_url, correct_url)
                print(f"  [Global Replace of Old URL] {old_incorrect_url} -> {correct_url}")

    # 4. Optimize Image Alt Tags (Logo)
    def repl_img(match):
        tag = match.group(0)
        if 'logo.png' in tag.lower():
            # Standardize alt attributes from "ZA Logo" to "Zaid Asim Softwares Logo"
            tag = re.sub(r'alt=["\']ZA Logo["\']', 'alt="Zaid Asim Softwares Logo"', tag, flags=re.IGNORECASE)
        return tag
    
    new_content = re.sub(r'<img\s+[^>]+>', repl_img, content, flags=re.IGNORECASE)
    if new_content != content:
        content = new_content
        print("  [Logo Alt Tags Optimized]")

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        modified_count += 1
        print("  => File Saved!")

print(f"\nOptimization complete. Modified {modified_count} files.")

# 5. Generate complete, valid sitemap.xml
print("\nGenerating sitemap.xml...")
sitemap_paths = []

# Collect all paths except index.html and 404.html
for file_path in sorted(html_files):
    rel_path = os.path.relpath(file_path, root_dir).replace('\\', '/')
    if rel_path == '404.html':
        continue
    if rel_path == 'index.html':
        continue
    
    route_path = rel_path[:-5] # remove '.html'
    sitemap_paths.append(route_path)

# Ensure 'projects/titan-nano' is in the sitemap_paths (it should be since it is an HTML file now)
if 'projects/titan-nano' not in sitemap_paths:
    sitemap_paths.append('projects/titan-nano')

sitemap_paths = sorted(list(set(sitemap_paths)))

today = datetime.now().strftime('%Y-%m-%d')

sitemap_content = []
sitemap_content.append('<?xml version="1.0" encoding="UTF-8"?>')
sitemap_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

# Root URL
sitemap_content.append('  <url>')
sitemap_content.append('    <loc>https://zaidasim.com/</loc>')
sitemap_content.append(f'    <lastmod>{today}</lastmod>')
sitemap_content.append('    <changefreq>weekly</changefreq>')
sitemap_content.append('    <priority>1.0</priority>')
sitemap_content.append('  </url>')

for path in sitemap_paths:
    # Set change frequency and priority
    if path in ['projects', 'ideas']:
        changefreq = 'weekly'
        priority = '0.8'
    elif path in ['biography', 'contact']:
        changefreq = 'monthly'
        priority = '0.8'
    elif path == 'support':
        changefreq = 'monthly'
        priority = '0.6'
    elif path.startswith('legal/'):
        changefreq = 'yearly'
        priority = '0.4'
    elif path.startswith('projects/'):
        changefreq = 'monthly'
        priority = '0.8'
    elif path.startswith('ideas/'):
        changefreq = 'monthly'
        priority = '0.8'
    else:
        changefreq = 'monthly'
        priority = '0.7'

    loc = f"https://zaidasim.com/{path}"
    sitemap_content.append('  <url>')
    sitemap_content.append(f'    <loc>{loc}</loc>')
    sitemap_content.append(f'    <lastmod>{today}</lastmod>')
    sitemap_content.append(f'    <changefreq>{changefreq}</changefreq>')
    sitemap_content.append(f'    <priority>{priority}</priority>')
    sitemap_content.append('  </url>')

sitemap_content.append('</urlset>\n')

sitemap_xml_path = os.path.join(root_dir, 'sitemap.xml')
with open(sitemap_xml_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sitemap_content))

print(f"Generated sitemap.xml with {len(sitemap_paths) + 1} paths.")

# 6. Update robots.txt to link to sitemap.xml
robots_txt_path = os.path.join(root_dir, 'robots.txt')
robots_content = ""
if os.path.exists(robots_txt_path):
    with open(robots_txt_path, 'r', encoding='utf-8') as f:
        robots_content = f.read()

sitemap_line = "Sitemap: https://zaidasim.com/sitemap.xml"
if sitemap_line not in robots_content:
    if robots_content and not robots_content.endswith('\n'):
        robots_content += '\n'
    robots_content += sitemap_line + '\n'
    with open(robots_txt_path, 'w', encoding='utf-8') as f:
        f.write(robots_content)
    print("Updated robots.txt to link to sitemap.xml.")
else:
    print("robots.txt already links to sitemap.xml.")
