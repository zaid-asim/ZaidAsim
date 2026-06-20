import os

css_dir = "css"
search_terms = ["three-canvas-container", "canvasContainer"]

for filename in os.listdir(css_dir):
    if filename.endswith(".css"):
        filepath = os.path.join(css_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            # Find index of any term
            for term in search_terms:
                start = 0
                while True:
                    idx = content.find(term, start)
                    if idx == -1:
                        break
                    # print 100 chars before and after
                    snippet = content[max(0, idx - 50):min(len(content), idx + 150)]
                    print(f"--- Found '{term}' in {filename} ---")
                    print(snippet)
                    print("-" * 30)
                    start = idx + len(term)
