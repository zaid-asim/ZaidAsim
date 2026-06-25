import os
import re

version = "1.0.7"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace CSS links
    new_content = re.sub(
        r'href="([^"]*css/bundle\.css)(?:\?[^"]*)?"',
        f'href="\\1?v={version}"',
        content
    )
    
    # Replace JS links
    new_content = re.sub(
        r'src="([^"]*js/app\.bundle\.js)(?:\?[^"]*)?"',
        f'src="\\1?v={version}"',
        new_content
    )
    new_content = re.sub(
        r'src="([^"]*js/vendor\.bundle\.js)(?:\?[^"]*)?"',
        f'src="\\1?v={version}"',
        new_content
    )
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated cache-busting in {filepath}")
    else:
        print(f"No changes in {filepath}")

# Crawl files
directories = ['.', 'projects', 'ideas', 'legal']
for d in directories:
    dir_path = d
    if d != '.':
        dir_path = os.path.join('.', d)
    for f in os.listdir(dir_path):
        if f.endswith('.html'):
            process_file(os.path.join(dir_path, f))
