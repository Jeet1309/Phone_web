#!/usr/bin/env python3
"""Resize + compress every image under image/ to keep the site fast.

Run from anywhere:  python optimize-images.py

- Resizes to fit within 700x700 (no upscaling)
- Converts to JPEG (quality 82, progressive) on a white background
- Overwrites the file (changing the extension to .jpg if needed)
"""
import os
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "image")
MAX_W = 700
MAX_H = 700
QUALITY = 82
EXTS = (".jpg", ".jpeg", ".png", ".webp", ".avif")


def flatten(im):
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert("RGB")


def main():
    before_total = after_total = count = 0
    for dirpath, _, files in os.walk(ROOT):
        for fn in sorted(files):
            ext = os.path.splitext(fn)[1].lower()
            if ext not in EXTS:
                continue
            path = os.path.join(dirpath, fn)
            before = os.path.getsize(path)
            try:
                im = Image.open(path)
                im = ImageOps.exif_transpose(im)
                im = flatten(im)
            except Exception as e:
                print("skip", os.path.relpath(path, HERE), "-", e)
                continue
            im.thumbnail((MAX_W, MAX_H), Image.LANCZOS)
            out = os.path.splitext(path)[0] + ".jpg"
            im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            after = os.path.getsize(out)
            if os.path.abspath(out) != os.path.abspath(path):
                os.remove(path)
            before_total += before
            after_total += after
            count += 1
            print(f"{os.path.relpath(path, HERE)}: {before // 1024}KB -> {after // 1024}KB")
    print(f"\nOptimized {count} image(s): {before_total // 1024}KB -> {after_total // 1024}KB")


if __name__ == "__main__":
    main()
