with open("css/v2-upgrades.css", "r", encoding="utf-8") as f:
    lines = f.readlines()
    for idx, line in enumerate(lines):
        if "pointer-events" in line:
            print(f"--- Line {idx+1} ---")
            start = max(0, idx - 4)
            end = min(len(lines), idx + 5)
            for j in range(start, end):
                print(f"{j+1}: {lines[j].strip()}")
