import os
import re

snippet = "<script>(function(){var t=localStorage.getItem('za_theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();</script>"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if snippet in content:
        print(f"Skipping {filepath} (already injected)")
        return
    
    # We want to place it right after <head>
    pattern = re.compile(r'(<head\b[^>]*>)', re.IGNORECASE)
    match = pattern.search(content)
    if not match:
        print(f"Warning: <head> not found in {filepath}")
        return
    
    pos = match.end()
    # Insert newline + snippet
    new_content = content[:pos] + "\n    " + snippet + content[pos:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Injected FOUC fix into {filepath}")

# Crawl files
directories = ['.', 'projects', 'ideas', 'legal']
for d in directories:
    dir_path = d
    if d != '.':
        dir_path = os.path.join('.', d)
    for f in os.listdir(dir_path):
        if f.endswith('.html'):
            process_file(os.path.join(dir_path, f))
