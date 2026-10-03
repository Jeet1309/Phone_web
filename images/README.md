# Product images

Drop product photos in this folder. The website loads them automatically.

## Naming convention

Every product in `phones.json` has a `slug` field. Name your image files after it:

- First image:  `<slug>.jpg`
- Second image: `<slug>-2.jpg`
- Third image:  `<slug>-3.jpg` (up to 6)

Example: product `iPhone 15 128 BLACK PACK` (brand Apple) has slug
`apple-iphone-15-128-black-pack`, so:

- `images/apple-iphone-15-128-black-pack.jpg`
- `images/apple-iphone-15-128-black-pack-2.jpg`

Extensions `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` all work — the site tries
them in that order, so you don't have to convert anything.

If a product has more than one image, the card becomes a swipeable / scrollable
strip with dots.

## Optional: set the file in phones.json instead

You can also point a product at an explicit file (bare filenames are looked up
in this folder):

```json
{ "name": "iPhone 15", "image": "my-photo.jpg" }
```

or several:

```json
{ "name": "iPhone 15", "images": ["my-photo-1.jpg", "my-photo-2.jpg"] }
```
