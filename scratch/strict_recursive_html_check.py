import os
import glob
from html.parser import HTMLParser

ROOT_DIR = r"C:\Users\ADMIN\Documents\Zaid Asim"

class StrictHTMLParser(HTMLParser):
    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        self.stack = []
        self.errors = []
        self.void_elements = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
        
    def handle_starttag(self, tag, attrs):
        if tag not in self.void_elements:
            self.stack.append((tag, self.getpos()))
            
    def handle_endtag(self, tag):
        if tag in self.void_elements:
            return
            
        if not self.stack:
            self.errors.append(f"Unexpected end tag </{tag}> at line {self.getpos()[0]}")
            return
            
        last_tag, pos = self.stack.pop()
        if last_tag != tag:
            # Re-push to keep stack trace closer to original open
            self.stack.append((last_tag, pos))
            self.errors.append(f"Mismatched tag: expected </{last_tag}> (opened at {pos[0]}), got </{tag}> at {self.getpos()[0]}")
            # Try to resolve by popping until match
            while self.stack:
                t, p = self.stack.pop()
                if t == tag:
                    break

    def get_errors(self):
        if self.stack:
            for tag, pos in self.stack:
                self.errors.append(f"Unclosed tag <{tag}> opened at {pos[0]}")
        return self.errors

html_files = glob.glob(os.path.join(ROOT_DIR, "**", "*.html"), recursive=True)
error_count = 0

for f in html_files:
    if "node_modules" in f or ".git" in f or "scratch" in f or ".gemini" in f:
        continue
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        parser = StrictHTMLParser(os.path.basename(f))
        parser.feed(content)
        errors = parser.get_errors()
        if errors:
            error_count += len(errors)
            print(f"Errors in {os.path.relpath(f, ROOT_DIR)}:")
            for e in errors[:10]:  # Show top 10 errors per file
                print(f"  - {e}")
    except Exception as e:
        print(f"Error parsing file {f}: {e}")

print(f"\nStrict recursive HTML validation complete. Total errors found: {error_count}")
