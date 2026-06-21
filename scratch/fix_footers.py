import os

files = [
    "index.html",
    "biography.html",
    "homies.html",
    "swadesh.html",
    "support.html",
    "privacy-policy.html",
    "terms-of-use.html",
    "projects.html",
    "contact.html"
]

replacements = {
    'href="terms-of-use.html"': 'href="/terms-of-use"',
    "href='terms-of-use.html'": 'href="/terms-of-use"',
    'href="privacy-policy.html"': 'href="/privacy-policy"',
    "href='privacy-policy.html'": 'href="/privacy-policy"',
    'href="support.html"': 'href="/support"',
    "href='support.html'": 'href="/support"',
    'href="swadesh.html"': 'href="/swadesh"',
    "href='swadesh.html'": 'href="/swadesh"',
    'href="biography.html"': 'href="/biography"',
    "href='biography.html'": 'href="/biography"',
    'href="index.html"': 'href="/"',
    "href='index.html'": 'href="/"',
}

for f in files:
    path = os.path.join(".", f)
    if not os.path.exists(path):
        continue
        
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
        
    original = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    if content != original:
        with open(path, "w", encoding="utf-8") as file:
            file.write(content)
        print(f"Fixed footer/relative links in: {f}")
    else:
        print(f"No changes needed for: {f}")
