import os
import json

transcript_path = r"C:\Users\ADMIN\.gemini\antigravity\brain\8a495b59-372e-458e-a73c-18a07742ca0e\.system_generated\logs\transcript.jsonl"

search_terms = ["redirect", "loop", "too many redirects", "trick", "routing", "_redirects"]

if not os.path.exists(transcript_path):
    print("Transcript not found at:", transcript_path)
    # Check parent dirs
    parent = os.path.dirname(transcript_path)
    if os.path.exists(parent):
        print("Files in logs dir:", os.listdir(parent))
else:
    print("Searching transcript...")
    match_count = 0
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            try:
                data = json.loads(line)
                content_str = str(data.get("content", "")) + str(data.get("tool_calls", ""))
                # Search case-insensitive
                found = [term for term in search_terms if term.lower() in content_str.lower()]
                if found:
                    match_count += 1
                    print(f"\n--- Match {match_count} at line {i+1} (Matched terms: {found}) ---")
                    # Print preview of the content, truncate if too long
                    content_preview = data.get("content", "")
                    if content_preview:
                        print("Content Snippet:", content_preview[:500] + ("..." if len(content_preview) > 500 else ""))
                    if "tool_calls" in data:
                        print("Tool calls:", json.dumps(data["tool_calls"])[:500])
            except Exception as e:
                print(f"Error parsing line {i+1}: {e}")

print("Search finished.")
