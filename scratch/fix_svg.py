with open('assets/redhat-logo.svg', 'r', encoding='utf-8') as f:
    svg = f.read()

# Replace fill="#000" with fill="currentColor"
svg_new = svg.replace('fill="#000"', 'fill="currentColor"')

with open('assets/redhat-logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_new)

print("SVG successfully updated with currentColor fill.")
