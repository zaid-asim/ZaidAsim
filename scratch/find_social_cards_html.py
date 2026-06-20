import os

for filename in os.listdir("."):
    if filename.endswith(".html"):
        with open(filename, "r", encoding="utf-8") as f:
            content = f.read()
            if "social-card" in content:
                print(f"Found 'social-card' in {filename}")
