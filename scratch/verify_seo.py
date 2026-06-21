import os
import re
import urllib.request
import urllib.error
import sys

def check_local_server():
    print("Checking local developer server connection...")
    urls = [
        "http://localhost:8000/",
        "http://localhost:8000/biography",
        "http://localhost:8000/homies",
        "http://localhost:8000/swadesh",
        "http://localhost:8000/support",
        "http://localhost:8000/privacy-policy",
        "http://localhost:8000/terms-of-use",
        "http://localhost:8000/projects",
        "http://localhost:8000/contact",
        "http://localhost:8000/android-xr-research",
        "http://localhost:8000/robots.txt",
        "http://localhost:8000/sitemap.xml",
    ]
    
    all_ok = True
    for url in urls:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                status = response.getcode()
                if status == 200:
                    print(f"  [OK] {url} -> 200 OK")
                else:
                    print(f"  [WARN] {url} -> Status: {status}")
                    all_ok = False
        except urllib.error.URLError as e:
            print(f"  [ERROR] {url} -> Failed to connect: {e}")
            all_ok = False
    return all_ok

def inspect_html_files():
    print("\nInspecting HTML files in workspace directory...")
    files = [
        "index.html",
        "biography.html",
        "homies.html",
        "swadesh.html",
        "support.html",
        "privacy-policy.html",
        "terms-of-use.html",
        "projects.html",
        "contact.html",
        "android-xr-research.html"
    ]
    
    all_ok = True
    for f in files:
        path = os.path.join(".", f)
        if not os.path.exists(path):
            print(f"  [ERROR] File missing: {f}")
            all_ok = False
            continue
            
        with open(path, "r", encoding="utf-8") as file:
            content = file.read()
            
        # Check title
        title_match = re.search(r"<title>(.*?)</title>", content, re.IGNORECASE)
        title = title_match.group(1) if title_match else None
        
        # Check description
        desc_match = re.search(r'<meta name="description" content="(.*?)"', content, re.IGNORECASE)
        desc = desc_match.group(1) if desc_match else None
        
        # Check robots
        robots_match = re.search(r'<meta name="robots" content="(.*?)"', content, re.IGNORECASE)
        robots = robots_match.group(1) if robots_match else None
        
        # Check canonical
        canonical_match = re.search(r'<link rel="canonical" href="(.*?)"', content, re.IGNORECASE)
        canonical = canonical_match.group(1) if canonical_match else None
        
        # Check schema
        has_schema = "application/ld+json" in content
        
        # Check relative links
        has_relative_links = False
        relative_matches = re.findall(r'href=["\'](biography\.html|homies\.html|swadesh\.html|support\.html|privacy-policy\.html|terms-of-use\.html)["\']', content)
        if relative_matches:
            has_relative_links = True
            
        print(f"  File: {f}")
        if title:
            print(f"    Title: {title}")
        else:
            print(f"    [ERROR] Missing Title")
            all_ok = False
            
        if desc:
            print(f"    Description: {desc[:50]}...")
        else:
            print(f"    [ERROR] Missing Description")
            all_ok = False
            
        if robots:
            print(f"    Robots: {robots}")
        else:
            print(f"    [ERROR] Missing Robots")
            all_ok = False
            
        if canonical:
            print(f"    Canonical: {canonical}")
        else:
            print(f"    [ERROR] Missing Canonical URL")
            all_ok = False
            
        if has_schema:
            print(f"    JSON-LD Schema: Found")
        else:
            print(f"    [WARN] Missing JSON-LD Schema")
            
        if has_relative_links:
            print(f"    [ERROR] Found relative links: {relative_matches}")
            all_ok = False
        else:
            print(f"    Clean Routes: All links are root-relative")
            
    return all_ok

if __name__ == "__main__":
    local_ok = check_local_server()
    html_ok = inspect_html_files()
    
    if local_ok and html_ok:
        print("\n[SUCCESS] All checks passed successfully. SEO metadata is correct and all server pages are reachable.")
        sys.exit(0)
    else:
        print("\n[FAILED] Some checks failed. Review errors above.")
        sys.exit(1)
