import os
import sys
import urllib.parse
from http.server import SimpleHTTPRequestHandler, HTTPServer

# Global redirect rules
redirect_rules = {}

def load_redirects():
    global redirect_rules
    redirect_rules = {}
    if os.path.exists('_redirects'):
        with open('_redirects', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                parts = line.split()
                if len(parts) >= 2:
                    src = parts[0]
                    dst = parts[1]
                    code = int(parts[2]) if len(parts) > 2 else 301
                    redirect_rules[src] = (dst, code)
        print(f"Loaded {len(redirect_rules)} redirect rules from _redirects")

class RedirectHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL and get clean path
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path
        
        # If the path has a trailing slash (except root), remove it
        if clean_path != '/' and clean_path.endswith('/'):
            clean_path = clean_path[:-1]

        # 1. Check if matches redirect rules from _redirects
        if clean_path in redirect_rules:
            dst, code = redirect_rules[clean_path]
            if code == 200:
                print(f"[Rewrite] {clean_path} -> {dst}")
                self.path = dst
                local_path = dst.lstrip('/')
                if os.path.exists(local_path) and os.path.isfile(local_path):
                    return super().do_GET()
            else:
                print(f"[Redirect {code}] {clean_path} -> {dst}")
                self.send_response(code)
                self.send_header('Location', dst)
                self.end_headers()
                return

        # Standardize check: check if file exists locally
        local_path = clean_path.lstrip('/')
        if not local_path:
            local_path = 'index.html'

        # If file exists locally, let the default handler serve it
        if os.path.exists(local_path) and os.path.isfile(local_path):
            return super().do_GET()

        # Natively check if clean path maps to an HTML file (e.g. /biography -> biography.html)
        html_path = local_path + '.html'
        if os.path.exists(html_path) and os.path.isfile(html_path):
            self.path = '/' + html_path
            return super().do_GET()

        # 404 fallback: serve custom 404.html with actual 404 status code
        print(f"[404 Fallback] {clean_path} -> /404.html")
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        try:
            with open('404.html', 'rb') as f:
                self.wfile.write(f.read())
        except Exception:
            self.wfile.write(b"404 Not Found")
        return

def run(port=8000):
    load_redirects()
    server_address = ('', port)
    httpd = HTTPServer(server_address, RedirectHandler)
    print(f"Local Cloudflare Dev Server running on http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down dev server...")
        httpd.server_close()

if __name__ == '__main__':
    port = 8000
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    run(port)
