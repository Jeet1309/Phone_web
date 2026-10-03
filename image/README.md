# Product images

Put product photos here. The website reads this folder automatically (via GitHub's
file tree), so **no `phones.json` edits and no slugs are needed** — just add files
and push.

## Folder structure

```
image/
  <Brand>/
    <Product>/
      1.jpg
      2.jpg
      ...
```

Example for the Poco M7 6/128 PACK (brand **Poco**, product name **M7 6/128 PACK**):

```
image/Poco/M7 6-128 PACK/1.jpg
image/Poco/M7 6-128 PACK/2.jpg
```

- A product folder can hold any number of images — **all of them are shown**.
- Most products have **2**; the card then becomes a swipeable strip with dots.
- Any of `.jpg .jpeg .png .webp .avif .gif` works; no need to convert.
- Images are ordered by filename (`1`, `2`, `3`, … `10` sorts correctly).

## Optimize before pushing

Large originals are slow on mobile data. Compress everything first:

```
python optimize-images.py
```

It resizes each image to fit within 700×700 and saves it as a compressed JPEG
(~20–30 KB), overwriting the original. Run it whenever you add new photos.

The site reads `image-manifest.json` (a list of all images) so it scales without
hitting GitHub API limits. That file is **rebuilt automatically by GitHub Actions**
when you push changes under `image/`. If you ever need to rebuild it manually:

```
python build-manifest.py
```

## Matching rules (forgiving)

- Folder names are matched to the product by **brand + product name**, ignoring
  case, spaces and punctuation. So `M7 6-128 PACK`, `m7 6 128 pack` and
  `M7 6/128 PACK` all match (a `/` can't be used in a folder name — use `-`).
- The brand folder is matched the same way, so `Poco`, `poco` both work.

## Optional override

You can still point a single product at explicit files in `phones.json`:

```json
{ "name": "M7 6/128 PACK", "brand": "Poco", "images": ["image/Poco/M7 6-128 PACK/1.jpg", "image/Poco/M7 6-128 PACK/2.jpg"] }
```

An explicit `image` / `images` value always wins over the folder scan.
