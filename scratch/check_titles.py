import re

with open('projects.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all cards and their links
cards = re.findall(r'<article class="portfolio-card[^"]*".*?</article>', content, re.DOTALL)
print(f"Found {len(cards)} projects in projects.html:")
for card in cards:
    title_m = re.search(r'<h3 class="portfolio-title">(.*?)</h3>', card)
    hrefs = re.findall(r'href="([^"]+)"', card)
    title = title_m.group(1) if title_m else "Unknown"
    print(f"  - Title: {title}, Hrefs: {hrefs}")
