import os
import re
import sys

# Set standard output encoding to UTF-8
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

css_dir = "css"

for filename in os.listdir(css_dir):
    if filename.endswith(".css"):
        filepath = os.path.join(css_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            matches = re.finditer(r'([^{]+)\{[^}]+z-index\s*:\s*([^;}]+)[^}]*\}', content)
            for match in matches:
                selector = match.group(1).strip().replace('\n', ' ')
                z_index = match.group(2).strip()
                rule_block = match.group(0)
                has_pointer_none = "pointer-events" in rule_block and "none" in rule_block
                
                # Check if it has positive z-index or variable
                if not has_pointer_none:
                    # Clean special characters just in case
                    cleaned_selector = selector.encode('ascii', errors='ignore').decode('ascii')
                    print(f"{filename}: {cleaned_selector} -> z-index: {z_index}")
