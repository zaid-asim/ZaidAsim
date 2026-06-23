import shutil

# Copy original to assets/redhat-logo-dark.svg (with black text)
with open('assets/redhat-logo.svg', 'r', encoding='utf-8') as f:
    svg = f.read()

# Make sure dark version has black text (#000 or currentColor)
# In our previous step, we changed fill="#000" to fill="currentColor".
# Let's write one with explicit black text (#111111) for light theme and one with white text (#ffffff) for dark theme.
svg_dark_theme = svg.replace('fill="currentColor"', 'fill="#111111"')
with open('assets/redhat-logo-dark.svg', 'w', encoding='utf-8') as f:
    f.write(svg_dark_theme)

svg_light_theme = svg.replace('fill="currentColor"', 'fill="#ffffff"')
with open('assets/redhat-logo-light.svg', 'w', encoding='utf-8') as f:
    f.write(svg_light_theme)

print("Created redhat-logo-dark.svg and redhat-logo-light.svg successfully!")
