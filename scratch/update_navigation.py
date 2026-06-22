import os
import re

files_nav_mapping = {
    "index.html": "index",
    "projects.html": "projects",
    "biography.html": "biography",
    "ideas.html": "ideas",
    "youtube.html": "youtube",
    "support.html": "support",
    "contact.html": "contact",
    "homies.html": "none",
    "swadesh.html": "none",
    "android-xr-research.html": "none",
    "privacy-policy.html": "none",
    "terms-of-use.html": "none",
    "404.html": "none"
}

def get_nav_markup(active_page):
    links = [
        ("/", "Home", "index"),
        ("/projects", "Projects", "projects"),
        ("/biography", "Biography", "biography"),
        ("/ideas", "Ideas Lab", "ideas"),
        ("/youtube", "YouTube", "youtube"),
        ("/support", "Support", "support"),
        ("/contact", "Contact", "contact")
    ]
    
    markup_lines = []
    for href, label, name in links:
        active_class = ' active' if name == active_page else ''
        markup_lines.append(f'                    <a href="{href}" class="nav-link{active_class}">{label}</a>')
        
    return '\n'.join(markup_lines)

def update_nav_in_file(filename, active_page):
    if not os.path.exists(filename):
        print(f"Skipping {filename} (not found)")
        return
        
    with open(filename, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Regex to match the nav links block, accounting for linebreaks and variable spacing
    pattern = r'(<nav class="nav-links">)(.*?)(</nav>)'
    
    new_nav_markup = "\n" + get_nav_markup(active_page) + "\n                "
    
    # We use re.DOTALL so .*? matches newlines
    new_content, count = re.subn(pattern, rf'\1{new_nav_markup}\3', content, flags=re.DOTALL)
    
    if count > 0:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Successfully updated navigation in {filename}")
    else:
        print(f"Could not find navigation pattern in {filename}")

if __name__ == "__main__":
    print("Starting navigation unification...")
    for filename, active in files_nav_mapping.items():
        update_nav_in_file(filename, active)
    print("Navigation unification complete.")
