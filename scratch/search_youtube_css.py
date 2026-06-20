import os

css_dir = "css"

for filename in os.listdir(css_dir):
    if filename.endswith(".css"):
        filepath = os.path.join(css_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for idx, line in enumerate(lines):
                if "youtube-card" in line or "youtube-video-grid" in line:
                    print(f"{filename}:{idx+1}: {line.strip()}")
