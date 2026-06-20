import os
import shutil

artifact_dir = r"C:\Users\ADMIN\.gemini\antigravity\brain\8a495b59-372e-458e-a73c-18a07742ca0e"
assets_dir = r"c:\Users\ADMIN\Documents\Zaid Asim\assets"

for filename in os.listdir(artifact_dir):
    if filename.startswith("chronos_observability_") and filename.endswith(".png"):
        src = os.path.join(artifact_dir, filename)
        dst = os.path.join(assets_dir, "chronos.png")
        shutil.copy(src, dst)
        print(f"Copied {filename} to assets/chronos.png")
        
    if filename.startswith("titan_operating_system_") and filename.endswith(".png"):
        src = os.path.join(artifact_dir, filename)
        dst = os.path.join(assets_dir, "titan.png")
        shutil.copy(src, dst)
        print(f"Copied {filename} to assets/titan.png")
