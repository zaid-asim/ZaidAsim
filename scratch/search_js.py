import os

js_dir = "js"
search_terms = ["canvasContainer", "three-canvas-container", "z-index", "zIndex", "pointer-events", "pointerEvents", "preventDefault"]

for filename in os.listdir(js_dir):
    if filename.endswith(".js"):
        filepath = os.path.join(js_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for i, line in enumerate(lines):
                for term in search_terms:
                    if term in line:
                        print(f"{filename}:{i+1}: {line.strip()}")
