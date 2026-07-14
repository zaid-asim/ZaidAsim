import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

transcript_path = r"C:\Users\ADMIN\.gemini\antigravity\brain\8a495b59-372e-458e-a73c-18a07742ca0e\.system_generated\logs\transcript.jsonl"

if not os.path.exists(transcript_path):
    print("Transcript not found")
    sys.exit(1)

lines = []
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            lines.append(json.loads(line))
        except Exception as e:
            pass

print(f"Total parsed lines: {len(lines)}")

# Search for the user inputs complaining about redirects
for idx, entry in enumerate(lines):
    content = str(entry.get("content", ""))
    if "too many redirects" in content.lower() or "err_too_many_redirects" in content.lower():
        print(f"\n=======================================================")
        print(f"FOUND USER INPUT AT INDEX {idx} (Line {idx+1}):")
        print("Content:", content[:300])
        print("-------------------")
        
        # Look forward to find the next few assistant responses and tool calls
        for fwd_idx in range(idx + 1, min(idx + 10, len(lines))):
            fwd_entry = lines[fwd_idx]
            source = fwd_entry.get("source")
            type_ = fwd_entry.get("type")
            print(f"[{source}] [{type_}] (Line {fwd_idx+1})")
            fwd_content = fwd_entry.get("content", "")
            fwd_tool = fwd_entry.get("tool_calls")
            if fwd_tool:
                print("  Tool calls:", json.dumps(fwd_tool, indent=2))
            if fwd_content:
                # Print only the first 400 chars of model response
                print("  Content:", str(fwd_content)[:500] + ("..." if len(str(fwd_content)) > 500 else ""))
            print("")
