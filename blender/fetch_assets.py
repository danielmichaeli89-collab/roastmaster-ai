#!/usr/bin/env python3
"""
Fetch real photoscanned assets for Nocture from Polyhaven + ambientCG into
blender/assets/. Safe to re-run (skips files already present). Requires the
environment network policy to allow:
    api.polyhaven.com  dl.polyhaven.org  ambientcg.com  *.backblazeb2.com

Run:  python3 blender/fetch_assets.py
"""
import os, sys, json, urllib.request, zipfile, io, ssl

ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
os.makedirs(ASSETS, exist_ok=True)
CTX = ssl.create_default_context()

def get(url, timeout=120):
    req = urllib.request.Request(url, headers={"User-Agent": "nocture/1.0"})
    return urllib.request.urlopen(req, timeout=timeout, context=CTX).read()

def save(path, data):
    with open(path, "wb") as f:
        f.write(data)
    print(f"  saved {os.path.basename(path)} ({len(data)//1024} KB)")

# ---- Poly Haven HDRIs --------------------------------------------------------
# A dim, neutral indoor HDRI is ideal for a dark bar. These slugs exist on PH.
PH_HDRIS = {
    "studio_small_09": "env_studio_4k.hdr",      # soft neutral studio
    "brown_photostudio_02": "env_warm_4k.hdr",   # warm low-key studio
}

def fetch_polyhaven_hdris(res="4k"):
    print("[polyhaven] HDRIs")
    for slug, out in PH_HDRIS.items():
        dst = os.path.join(ASSETS, out)
        if os.path.exists(dst):
            print(f"  have {out}"); continue
        try:
            files = json.loads(get(f"https://api.polyhaven.com/files/{slug}"))
            url = files["hdri"][res]["hdr"]["url"]
            save(dst, get(url))
        except Exception as e:
            print(f"  !! {slug}: {e}")

# ---- Poly Haven texture sets (PBR) ------------------------------------------
# slug -> (our prefix). We pull Diffuse/AO/Rough/Normal/Displacement at 2k.
PH_TEX = {
    "concrete_wall_008": "concrete",
    "marble_01": "marble",
    "brushed_iron_01": "iron",
}

def fetch_polyhaven_tex(res="2k"):
    print("[polyhaven] textures")
    maps = {"Diffuse": "diff", "Rough": "rough", "nor_gl": "nor", "AO": "ao", "Displacement": "disp"}
    for slug, prefix in PH_TEX.items():
        try:
            files = json.loads(get(f"https://api.polyhaven.com/files/{slug}"))
            for ph_key, suffix in maps.items():
                node = files.get(ph_key, {})
                if res in node:
                    fmt = "jpg" if "jpg" in node[res] else list(node[res].keys())[0]
                    url = node[res][fmt]["url"]
                    out = os.path.join(ASSETS, f"{prefix}_{suffix}.{url.split('.')[-1]}")
                    if os.path.exists(out): continue
                    save(out, get(url))
        except Exception as e:
            print(f"  !! {slug}: {e}")

# ---- ambientCG fallback (zip per material) ----------------------------------
ACG = ["Tiles101", "Fabric045", "Leather037", "Wood062", "Metal032"]

def fetch_ambientcg(res="2K-JPG"):
    print("[ambientcg] textures")
    for mat in ACG:
        try:
            url = f"https://ambientcg.com/get?file={mat}_{res}.zip"
            data = get(url)
            z = zipfile.ZipFile(io.BytesIO(data))
            for name in z.namelist():
                low = name.lower()
                if any(k in low for k in ("color", "rough", "normalgl", "ambientoc", "displacement")):
                    out = os.path.join(ASSETS, f"acg_{mat}_{os.path.basename(name)}")
                    if os.path.exists(out): continue
                    save(out, z.read(name))
        except Exception as e:
            print(f"  !! {mat}: {e}")

if __name__ == "__main__":
    print("Fetching real assets into", ASSETS)
    fetch_polyhaven_hdris()
    fetch_polyhaven_tex()
    fetch_ambientcg()
    print("done. assets:")
    for f in sorted(os.listdir(ASSETS)):
        print("  ", f)
