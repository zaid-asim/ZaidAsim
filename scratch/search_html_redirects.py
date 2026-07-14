import os
import glob

html_files = glob.glob(r"C:\Users\ADMIN\Documents\Zaid Asim\**\*.html", recursive=True)

search_terms = ["location", "replace", "redirect", "refresh", "http-equiv"]

for path in html_files:
    if "scratch" in path or ".gemini" in path:
        continue
    rel_path = os.path.relpath(path, r"C:\Users\ADMIN\Documents\Zaid Asim")
    has_matches = False
    matches = []
    with open(path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f, 1):
            found = [term for term in search_terms if term in line.lower()]
            if found:
                # Exclude standard links
                if "a href=" in line.lower() and not any(x in line.lower() for x in ["location", "replace", "redirect", "refresh"]):
                    continue
                matches.append((i, line.strip(), found))
    if matches:
        print(f"\n--- Checking {rel_path} ---")
        for i, line, found in matches[:10]:
            print(f"  Line {i}: {line} (Matched: {found})")
