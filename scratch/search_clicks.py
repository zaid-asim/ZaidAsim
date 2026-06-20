import os
import re

js_dir = "js"

for filename in os.listdir(js_dir):
    if filename.endswith(".js"):
        filepath = os.path.join(js_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            # Find all event listeners
            matches = re.finditer(r'\.addEventListener\(\s*[\'"]([^\'"]+)[\'"]\s*,\s*function\s*\(([^)]*)\)\s*\{([^}]+)\}', content)
            for match in matches:
                event = match.group(1)
                args = match.group(2)
                body = match.group(3)
                if "preventDefault" in body or "stopPropagation" in body:
                    # Print context
                    print(f"--- Event '{event}' in {filename} ---")
                    print(body.strip()[:200] + "...")
                    print("-" * 30)
