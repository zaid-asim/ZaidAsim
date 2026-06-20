import os
import sys
import urllib.parse
from http.server import SimpleHTTPRequestHandler, HTTPServer

class RedirectHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL and get clean path
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path
        
        # If the path has a trailing slash (except root), check without it
        if clean_path != '/' and clean_path.endswith('/'):
            clean_path = clean_path[:-1]

        # Standardize directory check: check if file exists locally
        # Remove leading slash to get relative path
        local_path = clean_path.lstrip('/')
        
        # If clean_path is root, serve index.html
        if not local_path:
            local_path = 'index.html'

        # If file exists locally, let the default handler serve it
        if os.path.exists(local_path) and os.path.isfile(local_path):
            return super().do_GET()

        # Define redirect mapping based on _redirects config
        redirects = {
            '/biography': '/biography.html',
            '/swadesh': '/swadesh.html',
            '/homies': '/homies.html',
            '/support': '/support.html',
            '/privacy-policy': '/privacy-policy.html',
            '/terms-of-use': '/terms-of-use.html',
            '/udyam-certificate': '/assets/udyam-registration-certificate.pdf'
        }

        if clean_path in redirects:
            print(f"[Redirect] {clean_path} -> {redirects[clean_path]}")
            self.path = redirects[clean_path]
        else:
            # Catch-all: rewrite to index.html
            print(f"[Fallback] {clean_path} -> /index.html")
            self.path = '/index.html'

        return super().do_GET()

def run(port=8000):
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
