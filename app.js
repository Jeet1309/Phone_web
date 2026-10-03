const CFG = window.SITE_CONFIG || {};
const I18N = window.I18N || {};
const I18N_HELPERS = window.I18N_HELPERS || {};

const PAGE_SIZE = 24;

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

const state = {
  phones: [],
  filtered: [],
  shown: 0,
  query: "",
  activeBrand: "All",
  sort: "featured",
  lang: "hi"
};

try {
  const saved = localStorage.getItem("phoneweb_lang");
  if (saved && I18N[saved]) state.lang = saved;
} catch (e) {}

const el = {
  title: document.getElementById("site-title"),
  search: document.getElementById("search-input"),
  refresh: document.getElementById("refresh-btn"),
  langBtn: document.getElementById("lang-btn"),
  menuBtn: document.getElementById("menu-btn"),
  drawer: document.getElementById("drawer"),
  drawerOverlay: document.getElementById("drawer-overlay"),
  drawerClose: document.getElementById("drawer-close"),
  brandList: document.getElementById("brand-list"),
  sort: document.getElementById("sort-select"),
  count: document.getElementById("result-count"),
  filterPill: document.getElementById("filter-pill"),
  status: document.getElementById("status"),
  grid: document.getElementById("grid"),
  loadMore: document.getElementById("load-more"),
  lastUpdated: document.getElementById("last-updated"),
  modeBadge: document.getElementById("mode-badge")
};

const isLiveMode = Boolean(
  (CFG.DATA_SOURCE === "sheets" && CFG.SHEET_ID && CFG.API_KEY) ||
  (CFG.DATA_SOURCE !== "sheets" && CFG.JSON_URL)
);

function t(key) {
  return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
}

function debounce(fn, ms) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

function setStatus(text, type) {
  if (!text) {
    el.status.className = "status";
    el.status.textContent = "";
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

function placeholderNode() {
  const div = document.createElement("div");
  div.className = "placeholder";
  div.textContent = "📱";
  return div;
}

function buildCard(phone) {
  const card = document.createElement("article");
  card.className = "card";

  const media = document.createElement("div");
  media.className = "card-media";

  const href = String(phone.link || phone.image || "").trim();
  const hit = document.createElement(href ? "a" : "div");
  if (href) {
    hit.className = "media-link";
    hit.href = href;
    hit.target = "_blank";
    hit.rel = "noopener noreferrer";
    hit.setAttribute("aria-label", (phone.name || "") + " \u2014 open link");
  } else {
    hit.className = "media-plain";
  }

  if (phone.image) {
    const img = document.createElement("img");
    img.src = phone.image;
    img.alt = (phone.name || "") + " photo";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 400;
    img.height = 400;
    img.referrerPolicy = "no-referrer";
    img.onerror = () => {
      const ph = placeholderNode();
      if (img.parentNode) img.parentNode.replaceChild(ph, img);
    };
    hit.appendChild(img);
  } else {
    hit.appendChild(placeholderNode());
  }

  media.appendChild(hit);

  if (href) {
    const cue = document.createElement("span");
    cue.className = "media-cue";
    cue.textContent = "\u2197";
    cue.setAttribute("aria-hidden", "true");
    media.appendChild(cue);
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
  name.textContent = phone.name || "—";

  const price = document.createElement("div");
  price.className = "card-price";
  price.textContent = formatPrice(phone.price);

  const stock = document.createElement("div");
  stock.className = "card-stock " + (/out/i.test(phone.stock) ? "out" : "in");
  stock.textContent = I18N_HELPERS.badge(phone.stock, state.lang);

  body.appendChild(name);
  body.appendChild(price);
  body.appendChild(stock);
  card.appendChild(media);
  card.appendChild(body);
  return card;
}

function appendCards(list) {
  const frag = document.createDocumentFragment();
  for (const phone of list) {
    frag.appendChild(buildCard(phone));
  }
  el.grid.appendChild(frag);
}

function showSkeletons(count) {
  el.grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML =
      '<div class="skeleton-media shimmer"></div>' +
      '<div class="skeleton-line shimmer"></div>' +
      '<div class="skeleton-line short shimmer"></div>';
    frag.appendChild(card);
  }
  el.grid.appendChild(frag);
}

function updateCount() {
  el.count.textContent = I18N_HELPERS.count(state.filtered.length, state.lang);
  if (state.activeBrand !== "All") {
    el.filterPill.hidden = false;
    el.filterPill.textContent = state.activeBrand;
  } else {
    el.filterPill.hidden = true;
    el.filterPill.textContent = "";
  }
}

function updateLoadMore() {
  const more = state.shown < state.filtered.length;
  el.loadMore.hidden = !more;
}

function render(reset) {
  el.title.textContent = CFG.SITE_TITLE || "PhonePrice";
  document.title = CFG.SITE_TITLE || "PhonePrice";

  applyFilters();

  if (reset) {
    state.shown = 0;
    el.grid.innerHTML = "";
  }

  if (!state.filtered.length) {
    if (reset) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = state.query || state.activeBrand !== "All"
        ? t("noMatch")
        : t("empty");
      el.grid.appendChild(empty);
    }
    updateCount();
    updateLoadMore();
    return;
  }

  const next = state.filtered.slice(state.shown, state.shown + PAGE_SIZE);
  appendCards(next);
  state.shown += next.length;

  updateCount();
  updateLoadMore();
}

function loadMore() {
  if (state.shown >= state.filtered.length) {
    updateLoadMore();
    return;
  }
  const next = state.filtered.slice(state.shown, state.shown + PAGE_SIZE);
  appendCards(next);
  state.shown += next.length;
  updateLoadMore();
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
}

function renderBrandList() {
  const counts = {};
  for (const p of state.phones) {
    const b = (p.brand || "").trim();
    if (b) counts[b] = (counts[b] || 0) + 1;
  }
  const brands = Object.keys(counts).sort((a, b) => a.localeCompare(b));

  el.brandList.innerHTML = "";
  const frag = document.createDocumentFragment();

  const allItem = document.createElement("button");
  allItem.className = "brand-item" + (state.activeBrand === "All" ? " active" : "");
  allItem.innerHTML =
    '<span>' + t("allCompanies") + '</span>' +
    '<span class="brand-count">' + state.phones.length + '</span>';
  allItem.addEventListener("click", () => selectBrand("All"));
  frag.appendChild(allItem);

  for (const b of brands) {
    const item = document.createElement("button");
    item.className = "brand-item" + (b === state.activeBrand ? " active" : "");
    item.innerHTML =
      '<span>' + b + '</span>' +
      '<span class="brand-count">' + counts[b] + '</span>';
    item.addEventListener("click", () => selectBrand(b));
    frag.appendChild(item);
  }

  el.brandList.appendChild(frag);
}

function selectBrand(brand) {
  state.activeBrand = brand;
  closeDrawer();
  renderBrandList();
  render(true);
}

function openDrawer() {
  el.drawer.classList.add("open");
  el.drawerOverlay.classList.add("open");
  el.drawer.setAttribute("aria-hidden", "false");
  el.menuBtn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  el.drawer.classList.remove("open");
  el.drawerOverlay.classList.remove("open");
  el.drawer.setAttribute("aria-hidden", "true");
  el.menuBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

function applyLang() {
  document.documentElement.lang = state.lang;
  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = t(node.dataset.i18n);
  }
  el.search.placeholder = t("searchPlaceholder");
  el.langBtn.textContent = t("langToggle");
  const sortOpts = {
    featured: t("sortFeatured"),
    "price-asc": t("sortPriceAsc"),
    "price-desc": t("sortPriceDesc"),
    "name-asc": t("sortNameAsc")
  };
  for (const opt of el.sort.options) {
    opt.textContent = sortOpts[opt.value] || opt.value;
  }
  renderBrandList();
  render(true);
}

function parseRows(rows) {
  if (!rows || !rows.length) return [];
  const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
  const col = {
    name: headers.indexOf("name"),
    brand: headers.indexOf("brand"),
    price: headers.indexOf("price"),
    image: headers.indexOf("imageurl") > -1 ? headers.indexOf("imageurl") : headers.indexOf("image"),
    stock: headers.indexOf("stock"),
    link: headers.indexOf("link") > -1 ? headers.indexOf("link") : headers.indexOf("url")
  };

  return rows.slice(1)
    .filter(r => r.some(c => String(c).trim() !== ""))
    .map(r => ({
      name: col.name > -1 ? String(r[col.name] || "").trim() : "",
      brand: col.brand > -1 ? String(r[col.brand] || "").trim() : "",
      price: col.price > -1 ? r[col.price] : null,
      image: col.image > -1 ? String(r[col.image] || "").trim() : "",
      stock: col.stock > -1 ? String(r[col.stock] || "").trim() : "",
      link: col.link > -1 ? String(r[col.link] || "").trim() : ""
    }))
    .filter(p => p.name || p.brand || p.price !== null);
}

async function fetchFromJson() {
  const res = await fetch(CFG.JSON_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("HTTP " + res.status);
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
    throw new Error("HTTP " + res.status);
  }
  const data = await res.json();
  return parseRows(data.values || []);
}

async function load() {
  if (!isLiveMode) {
    state.phones = DEMO_PHONES.slice();
    el.modeBadge.textContent = t("demo");
    el.modeBadge.className = "mode-badge demo";
    setStatus(t("demoMsg"), "info");
  } else {
    const source = CFG.DATA_SOURCE === "sheets" ? "Google Sheet" : "JSON";
    el.modeBadge.textContent = t("live");
    el.modeBadge.className = "mode-badge live";
    setStatus(t("loading"), "loading");
    showSkeletons(PAGE_SIZE > 8 ? 8 : PAGE_SIZE);
    try {
      const phones = CFG.DATA_SOURCE === "sheets"
        ? await fetchFromSheet()
        : await fetchFromJson();
      if (!phones || !phones.length) {
        setStatus(t("emptyMsg"), "info");
      } else {
        setStatus("", "");
      }
      state.phones = Array.isArray(phones) ? phones : [];
    } catch (err) {
      setStatus(t("errMsg") + " " + err.message, "error");
      state.phones = [];
    }
  }

  renderBrandList();
  render(true);
  el.lastUpdated.textContent = t("updated") + " " + new Date().toLocaleString();
}

el.search.addEventListener("input", debounce(() => {
  state.query = el.search.value;
  render(true);
}, 250));

el.sort.addEventListener("change", () => {
  state.sort = el.sort.value;
  render(true);
});

el.refresh.addEventListener("click", () => {
  load();
});

el.loadMore.addEventListener("click", loadMore);

el.menuBtn.addEventListener("click", openDrawer);
el.drawerClose.addEventListener("click", closeDrawer);
el.drawerOverlay.addEventListener("click", closeDrawer);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

el.filterPill.addEventListener("click", () => selectBrand("All"));

el.langBtn.addEventListener("click", () => {
  state.lang = state.lang === "hi" ? "en" : "hi";
  try {
    localStorage.setItem("phoneweb_lang", state.lang);
  } catch (e) {}
  applyLang();
});

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore();
  }, { rootMargin: "400px 0px" });
  io.observe(el.loadMore);
}

setInterval(() => {
  if (isLiveMode) load();
}, 5 * 60 * 1000);

applyLang();
load();