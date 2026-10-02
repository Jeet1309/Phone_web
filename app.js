const CFG = window.SITE_CONFIG || {};

const DEMO_PHONES = [
  { name: "iPhone 15 Pro", brand: "Apple", price: 129900, stock: "In Stock", image: "" },
  { name: "iPhone 14", brand: "Apple", price: 59900, stock: "In Stock", image: "" },
  { name: "Samsung Galaxy S24 Ultra", brand: "Samsung", price: 129999, stock: "In Stock", image: "" },
  { name: "Samsung Galaxy A54", brand: "Samsung", price: 28999, stock: "In Stock", image: "" },
  { name: "Google Pixel 8", brand: "Google", price: 75999, stock: "Out of Stock", image: "" },
  { name: "OnePlus 12", brand: "OnePlus", price: 64999, stock: "In Stock", image: "" },
  { name: "Xiaomi Redmi Note 13 Pro", brand: "Xiaomi", price: 23999, stock: "In Stock", image: "" },
  { name: "Nothing Phone (2)", brand: "Nothing", price: 44999, stock: "Out of Stock", image: "" },
  { name: "Vivo V30 Pro", brand: "Vivo", price: 42999, stock: "In Stock", image: "" },
  { name: "Oppo Reno 11", brand: "Oppo", price: 29999, stock: "In Stock", image: "" },
  { name: "Realme 12 Pro+", brand: "Realme", price: 31999, stock: "In Stock", image: "" },
  { name: "Asus ROG Phone 8", brand: "Asus", price: 94999, stock: "Out of Stock", image: "" }
];

const PLACEHOLDER_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">' +
      '<rect width="400" height="400" fill="#eef1f6"/>' +
      '<text x="200" y="200" font-size="140" text-anchor="middle" dominant-baseline="central">📱</text>' +
    "</svg>"
  );

const state = {
  phones: [],
  filtered: [],
  query: "",
  activeBrand: "All",
  sort: "featured"
};

const el = {
  title: document.getElementById("site-title"),
  search: document.getElementById("search-input"),
  refresh: document.getElementById("refresh-btn"),
  chips: document.getElementById("brand-chips"),
  sort: document.getElementById("sort-select"),
  count: document.getElementById("result-count"),
  status: document.getElementById("status"),
  grid: document.getElementById("grid"),
  lastUpdated: document.getElementById("last-updated"),
  modeBadge: document.getElementById("mode-badge")
};

const isLiveMode = Boolean(
  (CFG.DATA_SOURCE === "sheets" && CFG.SHEET_ID && CFG.API_KEY) ||
  (CFG.DATA_SOURCE !== "sheets" && CFG.JSON_URL)
);

function setStatus(text, type) {
  if (!text) {
    el.status.className = "status";
    return;
  }
  el.status.textContent = text;
  el.status.className = "status show " + (type || "info");
}

function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return CFG.CURRENCY + " —";
  return CFG.CURRENCY + num.toLocaleString("en-IN");
}

function phonePlaceholder() {
  const img = document.createElement("div");
  img.className = "placeholder";
  img.textContent = "📱";
  return img;
}

function handleImageError(img) {
  img.remove();
}

function render() {
  el.title.textContent = CFG.SITE_TITLE || "PhonePrice";
  document.title = CFG.SITE_TITLE || "PhonePrice";

  const list = applyFilters();
  el.grid.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.query || state.activeBrand !== "All"
      ? "No phones match your search."
      : "No phones in the catalog yet.";
    el.grid.appendChild(empty);
    el.count.textContent = "0 phones";
    return;
  }

  el.count.textContent = list.length + (list.length === 1 ? " phone" : " phones");

  for (const phone of list) {
    const card = document.createElement("article");
    card.className = "card";

    const media = document.createElement("div");
    media.className = "card-media";

    if (phone.image) {
      const img = document.createElement("img");
      img.src = phone.image;
      img.alt = phone.name + " photo";
      img.loading = "lazy";
      img.onerror = () => handleImageError(img);
      media.appendChild(img);
    } else {
      media.appendChild(phonePlaceholder());
    }

    if (phone.brand) {
      const badge = document.createElement("span");
      badge.className = "brand-badge";
      badge.textContent = phone.brand;
      media.appendChild(badge);
    }

    const body = document.createElement("div");
    body.className = "card-body";

    const name = document.createElement("div");
    name.className = "card-name";
    name.textContent = phone.name || "Unnamed phone";

    const price = document.createElement("div");
    price.className = "card-price";
    price.textContent = formatPrice(phone.price);

    const stock = document.createElement("div");
    stock.className = "card-stock " + (/out/i.test(phone.stock) ? "out" : "in");
    stock.textContent = phone.stock || "In Stock";

    body.appendChild(name);
    body.appendChild(price);
    body.appendChild(stock);

    card.appendChild(media);
    card.appendChild(body);
    el.grid.appendChild(card);
  }
}

function applyFilters() {
  const q = state.query.trim().toLowerCase();
  let list = state.phones;

  if (state.activeBrand !== "All") {
    list = list.filter(p => (p.brand || "").toLowerCase() === state.activeBrand.toLowerCase());
  }

  if (q) {
    list = list.filter(p =>
      ((p.name || "") + " " + (p.brand || "")).toLowerCase().includes(q)
    );
  }

  const sorted = list.slice();
  switch (state.sort) {
    case "price-asc":
      sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      break;
    case "price-desc":
      sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      break;
    case "name-asc":
      sorted.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      break;
    default:
      break;
  }

  state.filtered = sorted;
  return sorted;
}

function renderChips() {
  const brands = ["All"];
  for (const p of state.phones) {
    const b = (p.brand || "").trim();
    if (b && !brands.includes(b)) brands.push(b);
  }
  brands.sort((a, b) => a.localeCompare(b));

  el.chips.innerHTML = "";
  for (const b of brands) {
    const chip = document.createElement("button");
    chip.className = "chip" + (b === state.activeBrand ? " active" : "");
    chip.textContent = b;
    chip.addEventListener("click", () => {
      state.activeBrand = b;
      renderChips();
      render();
    });
    el.chips.appendChild(chip);
  }
}

function parseRows(rows) {
  if (!rows || !rows.length) return [];
  const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
  const col = {
    name: headers.indexOf("name"),
    brand: headers.indexOf("brand"),
    price: headers.indexOf("price"),
    image: headers.indexOf("imageurl") > -1 ? headers.indexOf("imageurl") : headers.indexOf("image"),
    stock: headers.indexOf("stock")
  };

  return rows.slice(1)
    .filter(r => r.some(c => String(c).trim() !== ""))
    .map(r => ({
      name: col.name > -1 ? String(r[col.name] || "").trim() : "",
      brand: col.brand > -1 ? String(r[col.brand] || "").trim() : "",
      price: col.price > -1 ? r[col.price] : null,
      image: col.image > -1 ? String(r[col.image] || "").trim() : "",
      stock: col.stock > -1 ? String(r[col.stock] || "").trim() : ""
    }))
    .filter(p => p.name || p.brand || p.price !== null);
}

async function fetchFromJson() {
  const res = await fetch(CFG.JSON_URL);
  if (!res.ok) {
    throw new Error("JSON fetch returned " + res.status);
  }
  return await res.json();
}

async function fetchFromSheet() {
  const url =
    "https://sheets.googleapis.com/v4/spreadsheets/" +
    encodeURIComponent(CFG.SHEET_ID) +
    "/values/" +
    encodeURIComponent(CFG.SHEET_RANGE) +
    "?key=" +
    encodeURIComponent(CFG.API_KEY);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Google Sheets returned " + res.status);
  }
  const data = await res.json();
  return parseRows(data.values || []);
}

async function load() {
  if (!isLiveMode) {
    state.phones = DEMO_PHONES.slice();
    el.modeBadge.textContent = "Demo data — add a JSON_URL or Sheet ID & API key in config.js";
    el.modeBadge.className = "mode-badge demo";
    setStatus("Showing sample catalog. Set up your data source in config.js to go live.", "info");
  } else {
    const source = CFG.DATA_SOURCE === "sheets" ? "Google Sheet" : "JSON";
    el.modeBadge.textContent = "Live prices (" + source + ")";
    el.modeBadge.className = "mode-badge live";
    setStatus("Loading prices...", "loading");
    try {
      const phones = CFG.DATA_SOURCE === "sheets"
        ? await fetchFromSheet()
        : await fetchFromJson();
      if (!phones || !phones.length) {
        setStatus("No phones found in the " + source + ". Add some entries.", "info");
      } else {
        setStatus("", "");
      }
      state.phones = Array.isArray(phones) ? phones : [];
    } catch (err) {
      setStatus("Could not load prices: " + err.message + ". Check your " + source + " configuration.", "error");
      state.phones = [];
    }
  }

  renderChips();
  render();
  el.lastUpdated.textContent = "Updated " + new Date().toLocaleString();
}

el.search.addEventListener("input", () => {
  state.query = el.search.value;
  render();
});

el.sort.addEventListener("change", () => {
  state.sort = el.sort.value;
  render();
});

el.refresh.addEventListener("click", () => {
  setStatus("Refreshing...", "loading");
  load();
});

setInterval(() => {
  if (isLiveMode) load();
}, 5 * 60 * 1000);

load();