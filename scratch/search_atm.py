import glob
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = "C:/Users/ADMIN/Documents/Zaid Asim"
html_files = glob.glob(os.path.join(ROOT_DIR, "**", "*.html"), recursive=True)

for f in html_files:
    if "scratch" in f or ".gemini" in f or "node_modules" in f:
        continue
    rel_path = os.path.relpath(f, ROOT_DIR)
    with open(f, 'r', encoding='utf-8') as file:
        for i, line in enumerate(file, 1):
            if "time machine" in line.lower() or "atm" in line.lower():
                # Filter out standard keywords or meta unless relevant
                if "meta name" in line or "keywords" in line:
                    continue
                print(f"{rel_path}: Line {i}: {line.strip()}")
