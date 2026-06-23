import re
with open('biography.html', 'r', encoding='utf-8') as f:
    html = f.read()
print("=== Nav Links ===")
for m in re.finditer(r'<nav.*?>.*?</nav>', html, re.DOTALL):
    print(m.group(0))
