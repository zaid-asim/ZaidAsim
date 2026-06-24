with open('js/app.bundle.js', 'r', encoding='utf-8') as f:
    js = f.read()

import re
for m in re.finditer(r'hudEngine', js, re.IGNORECASE):
    idx = m.start()
    line_num = js.count('\n', 0, idx) + 1
    print(f"Match at line {line_num}:")
    print(js[idx-100:idx+200].strip())
    print("="*40)
