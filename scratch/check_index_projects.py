import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find all hrefs in index.html to see what projects are linked
hrefs = re.findall(r'href="([^"]+)"', content)
print("All hrefs in index.html:")
for href in set(hrefs):
    if "/projects/" in href or "/ideas/" in href or href == "/atm":
        print(f"  - {href}")

# Find any section that looks like projects
print("\nScanning for project headings in index.html:")
headings = re.findall(r'<h[23][^>]*>(.*?)</h[23]>', content)
for heading in headings:
    print(f"  - Heading: {heading.strip()}")
