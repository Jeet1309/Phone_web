window.I18N = {
  hi: {
    langName: "हिंदी",
    tagline: "हर फ़ोन की लाइव कीमत, एक ही जगह",
    searchPlaceholder: "फ़ोन का नाम या ब्रांड खोजें...",
    refresh: "रिफ़्रेश",
    menu: "कंपनियाँ",
    chooseCompany: "कंपनी चुनें",
    allCompanies: "सभी कंपनियाँ",
    loadMore: "और देखें",
    all: "सभी",
    sortFeatured: "फ़ीचर्ड",
    sortPriceAsc: "कीमत: कम से ज़्यादा",
    sortPriceDesc: "कीमत: ज़्यादा से कम",
    sortNameAsc: "नाम A-Z",
    noMatch: "आपकी खोज से मेल खाता कोई फ़ोन नहीं मिला।",
    empty: "अभी कैटलॉग में कोई फ़ोन नहीं है।",
    inStock: "स्टॉक में",
    outStock: "स्टॉक खत्म",
    updated: "अपडेट:",
    demo: "डेमो डेटा",
    live: "लाइव कीमतें",
    loading: "कीमतें लोड हो रही हैं...",
    demoMsg: "यह सैंपल कैटलॉग है। लाइव करने के लिए config.js में JSON_URL या Sheet ID और API key भरें।",
    emptyMsg: "डेटा में अभी कोई फ़ोन नहीं मिला।",
    errMsg: "कीमतें लोड नहीं हो पाईं:",
    countOne: "फ़ोन",
    countMany: "फ़ोन"
  },
  en: {
    langName: "English",
    tagline: "Live phone prices, all in one place",
    searchPlaceholder: "Search phone name or brand...",
    refresh: "Refresh",
    menu: "Companies",
    chooseCompany: "Choose company",
    allCompanies: "All companies",
    loadMore: "Load more",
    all: "All",
    sortFeatured: "Featured",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortNameAsc: "Name A-Z",
    noMatch: "No phones match your search.",
    empty: "No phones in the catalog yet.",
    inStock: "In Stock",
    outStock: "Out of Stock",
    updated: "Updated",
    demo: "Demo data",
    live: "Live prices",
    loading: "Loading prices...",
    demoMsg: "Showing sample catalog. Set JSON_URL or Sheet ID & API key in config.js to go live.",
    emptyMsg: "No phones found in the data source.",
    errMsg: "Could not load prices:",
    countOne: "phone",
    countMany: "phones"
  }
};

window.I18N_HELPERS = {
  count: function (n, lang) {
    const t = window.I18N[lang];
    return n + " " + (n === 1 ? t.countOne : t.countMany);
  },
  badge: function (stock, lang) {
    const t = window.I18N[lang];
    return /out/i.test(stock || "") ? t.outStock : t.inStock;
  }
};