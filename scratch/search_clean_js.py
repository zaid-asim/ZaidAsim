import os

js_files = [
    "js/nav.js",
    "js/main.js",
    "js/v2-upgrades.js",
    "js/atm.js",
    "js/theme.js",
    "js/command-palette.js",
    "js/hud.js",
    "js/loader.js",
    "js/scroll-animations.js"
]

search_terms = ["location", "replace", "redirect", "href"]

for rel_path in js_files:
    path = os.path.join(r"C:\Users\ADMIN\Documents\Zaid Asim", rel_path.replace("/", os.sep))
    if os.path.exists(path):
        print(f"\n--- Checking {rel_path} ---")
        with open(path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f, 1):
                found = [term for term in search_terms if term in line]
                if found:
                    print(f"  Line {i}: {line.strip()} (Matched: {found})")
    else:
        print(f"File not found: {rel_path}")
