#!/usr/bin/env python3
"""Regenerate image-manifest.json (a flat list of every image under image/).

The site reads this file instead of calling the GitHub API, so it scales to many
visitors without hitting rate limits. Run after adding images:

    python build-manifest.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "image")
EXTS = (".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif")


def main():
    paths = []
    for dirpath, _, files in os.walk(ROOT):
        for f in files:
            if f.lower().endswith(EXTS):
                rel = os.path.relpath(os.path.join(dirpath, f), HERE).replace("\\", "/")
                paths.append(rel)
    paths.sort()
    with open(os.path.join(HERE, "image-manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(paths, fh, ensure_ascii=False)
    print("wrote image-manifest.json with", len(paths), "paths")


if __name__ == "__main__":
    main()
