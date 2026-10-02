# PhonePrice — live phone price website

A free, static website that shows phone prices with search, brand filters and photos. Prices come from a data source only you (the admin) can edit. Anyone with the website link can view and search, but nobody can change prices.

- **Bilingual, Hindi-first**: the site opens in Hindi by default; visitors tap the **English** button to switch (choice is remembered on their phone).
- **Mobile-first**: 2-column grid on phones, big tap targets, works well on low-end devices.
- **Company picker**: tap the ☰ **कंपनियाँ / Companies** button to open a slide-in list of brands (keeps the header small).
- **Fast with big catalogs**: search is debounced, results load 24 at a time ("Load more" + auto-load on scroll), images are lazy-loaded, and off-screen cards are skipped during rendering. Comfortable into the thousands.

## Two ways to store prices — pick one

### Option A — JSON file (simplest, recommended if you use GitHub)
- Prices live in `phones.json` in this repo.
- You edit that file (on GitHub.com click the file → pencil icon → edit → save, or on your computer) and push a commit.
- No API keys, no Google account, no extra setup. The site just reads the JSON file.

### Option B — Google Sheet (best if a non-technical person is the admin)
- Prices live in a Google Sheet. Admin edits the spreadsheet in the browser.
- Slightly more setup: enable the Sheets API + create a read-only API key.
- Even if someone finds your Sheet ID or API key, the key is **read-only** — it cannot edit the sheet.

## Config (`config.js`)

```js
window.SITE_CONFIG = {
  SITE_TITLE: "PhonePrice",
  CURRENCY: "\u20B9",
  DATA_SOURCE: "json",          // "json" or "sheets"
  JSON_URL: "phones.json",      // used when DATA_SOURCE is "json"
  SHEET_ID: "",                 // used when DATA_SOURCE is "sheets"
  API_KEY: "",                  // used when DATA_SOURCE is "sheets"
  SHEET_RANGE: "Sheet1!A:E"
};
```

- `DATA_SOURCE: "json"` + `JSON_URL: "phones.json"` → reads the JSON file. Just edit the JSON to change prices.
- `DATA_SOURCE: "sheets"` + fill `SHEET_ID` and `API_KEY` → reads a Google Sheet.

## JSON format (`phones.json`)

A list of objects. All fields optional except keeping the structure:

```json
[
  {
    "name": "iPhone 15 Pro",
    "brand": "Apple",
    "price": 129900,
    "stock": "In Stock",
    "image": "https://example.com/iphone.jpg"
  }
]
```

- `price` should be a number.
- `stock`: `In Stock` or `Out of Stock` (anything with "out" shows as Out of Stock).
- `image`: leave empty (`""`) to show a phone placeholder. Use any public image link (GSMArena, manufacturer sites, Imgur, Cloudinary...).

## Google Sheet option (only if you pick Option B)

1. Create a Google Sheet with headers in row 1: `Name | Brand | Price | ImageURL | Stock`.
2. Copy the Sheet ID from the URL (the long text between `/d/` and `/edit`).
3. https://console.cloud.google.com/ → project → **APIs & Services** → enable **Google Sheets API**.
4. **Credentials** → **Create credentials** → **API key** → copy it. Optionally restrict the key to the Sheets API.
5. Put both into `config.js` and set `DATA_SOURCE: "sheets"`.

## Publish it so anyone can use the link (free)

**GitHub Pages:**
1. Create a GitHub repo and push all files in this folder (see below).
2. Repo → **Settings** → **Pages** → Source: **Deploy from a branch** → `main`, root `/` → Save.
3. Live at `https://<your-username>.github.io/<repo-name>/` within a minute.
4. To change prices later: edit `phones.json` (or the sheet) — the site updates on the next refresh.

**Netlify (alternative):** drag the folder onto https://app.netlify.com/drop → instant `*.netlify.app` link.

## Upload to GitHub from this folder

```bash
git init
git add .
git commit -m "Initial phone price site"
git branch -M main
git remote add origin https://github.com/<your-username>/phone_web.git
git push -u origin main
```

(Or create an empty repo on github.com first and follow its instructions.)