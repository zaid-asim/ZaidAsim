import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

transcript_path = r"C:\Users\ADMIN\.gemini\antigravity\brain\8a495b59-372e-458e-a73c-18a07742ca0e\.system_generated\logs\transcript.jsonl"

if not os.path.exists(transcript_path):
    print("Transcript not found")
    sys.exit(1)

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        try:
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            content = str(data.get("content", ""))
            
            # Check if _redirects was modified
            modified = False
            for call in tool_calls:
                args_str = str(call.get("args", ""))
                if "_redirects" in args_str:
                    print(f"\n[Line {i}] Tool Call: {call['name']}")
                    print(f"Args: {json.dumps(call['args'], indent=2)}")
                    modified = True
            
            # If the output or response mentions _redirects
            if not modified and ("_redirects" in content.lower() and ("loop" in content.lower() or "too many" in content.lower() or "redirect" in content.lower())):
                print(f"\n[Line {i}] Text Content Mentioning _redirects:")
                print(content[:500] + ("..." if len(content) > 500 else ""))
                
        except Exception as e:
            pass
