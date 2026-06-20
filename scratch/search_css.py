import os

css_dir = "css"
search_terms = ["cursor-ring", "cursor-dot", "three-canvas-container", "canvasContainer", "pointer-events"]

for filename in os.listdir(css_dir):
    if filename.endswith(".css"):
        filepath = os.path.join(css_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for i, line in enumerate(lines):
                for term in search_terms:
                    if term in line:
                        print(f"{filename}:{i+1}: {line.strip()}")
