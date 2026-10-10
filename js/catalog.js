/* Categories + helpers for Kakobuy Spreadsheet 2026-2027 */
window.KQS = window.KQS || {};

KQS.sheetOrigin = "https://kakobuysheetlink.com";
KQS.productCdn = "https://cdn.jsdelivr.net/gh/qjy0126/kakobuysheetlink@main/img/products/";

KQS.categories = [
  { slug: "shoes", label: "Shoes", nav: "Shoes", image: "7867051600.webp" },
  { slug: "t-shirts", label: "T-Shirts", nav: "T-Shirts", image: "7794933877.webp" },
  { slug: "hoodies", label: "Hoodies", nav: "Hoodies/Sweaters", image: "7730554390.webp" },
  { slug: "jackets", label: "Jackets", nav: "Jackets", image: "7725799875.webp" },
  { slug: "pants", label: "Pants/Shorts", nav: "Pants/Shorts", image: "7729686412.webp" },
  { slug: "headwear", label: "Headwear", nav: "Headwear", image: "7830650690.webp" },
  { slug: "sets", label: "Sets", nav: "Sets", image: "7730244228.webp" },
  { slug: "underwear", label: "Underpants", nav: "Underpants", image: "7831076862.webp" },
  { slug: "jersey", label: "Jersey", nav: "Jersey", image: "7728715336.webp" },
  { slug: "accessories", label: "Accessories", nav: "Accessories", image: "7830604826.webp" },
  { slug: "other", label: "Other Stuff", nav: "Other Stuff", image: "7772982204.webp" },
  { slug: "finds", label: "ALL PRODUCT", image: "7784475023.webp", all: true },
];

KQS.blurbs = {
  shoes: "Find popular sneaker styles and browse different shoe collections, including running shoes, casual sneakers, basketball shoes, and other popular footwear.",
  "t-shirts": "Discover graphic T-shirts, basic tees, oversized styles, and other popular T-shirt collections.",
  hoodies: "Browse hoodies, sweatshirts, zip-up styles, and other popular streetwear products.",
  jackets: "Browse jackets and outerwear for different seasons and styles.",
  pants: "Find jeans, cargo pants, sweatpants, shorts, and other popular bottoms.",
  headwear: "Browse caps, beanies, and other popular headwear styles.",
  sets: "Explore matching tracksuit and streetwear sets from the product library.",
  underwear: "Browse basics and underpants picks curated from Kakobuy finds.",
  jersey: "Discover sports kits and casual jersey styles for everyday wear.",
  accessories: "Browse accessories including wallets, jewelry, belts, sunglasses, and other popular items.",
  other: "Explore extra finds that do not fit neatly into the main categories.",
};

KQS.navOrder = ["shoes", "hoodies", "t-shirts", "jackets", "pants", "jersey", "accessories", "headwear", "other"];
KQS.navCats = KQS.navOrder.map((slug) => KQS.categories.find((c) => c.slug === slug)).filter(Boolean);

KQS.basePath = (() => {
  const path = location.pathname || "/";
  if (path.includes("/shop/") || path.includes("/product/")) {
    const idx = path.lastIndexOf("/shop/");
    const pidx = path.lastIndexOf("/product/");
    const cut = idx >= 0 ? idx : pidx;
    return path.slice(0, cut) || "";
  }
  return path.replace(/\/index\.html$/i, "").replace(/\/$/, "");
})();

KQS.href = (path) => {
  const clean = String(path || "").replace(/^\//, "");
  const base = String(KQS.basePath || "").replace(/\/$/, "");
  // Always root-absolute so links work from /shop/... and /product/... pages.
  // Relative paths like "shop/shoes/" break once you leave the site root.
  if (!clean) return base ? base + "/" : "/";
  return (base || "") + "/" + clean;
};

KQS.asset = (file) => KQS.href("assets/categories/" + String(file || "").replace(/^\//, ""));
KQS.catHref = (slug) => (slug === "finds" ? KQS.href("shop/finds/") : KQS.href("shop/" + slug + "/"));
KQS.productHref = (id, cat) => {
  const q = "id=" + encodeURIComponent(id) + (cat ? "&cat=" + encodeURIComponent(cat) : "");
  return KQS.href("product/?" + q);
};
KQS.productImg = (file, local) => {
  const name = String(file || "").replace(/^.*\//, "");
  if (!name) return "";
  if (local) return KQS.href("assets/products/" + name);
  return KQS.productCdn + name;
};
KQS.money = (n) => "$" + Number(n || 0).toFixed(2);
KQS.findCategory = (slug) => KQS.categories.find((c) => c.slug === slug);
KQS.affcode = "9v88f";
KQS.escapeHtml = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

KQS.sourceLabel = (link) => {
  const u = String(link || "");
  if (/1688\.com/i.test(u)) return "1688";
  if (/taobao\.com|tmall\.com/i.test(u)) return "Taobao";
  if (/weidian\.com/i.test(u)) return "Weidian";
  return "Link";
};

KQS.kakobuyUrl = (link) => {
  const raw = String(link || "").trim();
  if (!raw) return "https://www.kakobuy.com/?affcode=" + KQS.affcode;
  const m = raw.match(/itemID=(\d+)/i) || raw.match(/weidian\.com\/item\.html\?itemID=(\d+)/i);
  if (m) {
    return (
      "https://www.kakobuy.com/item/details?url=" +
      encodeURIComponent("https://weidian.com/item.html?itemID=" + m[1]) +
      "&affcode=" +
      KQS.affcode
    );
  }
  return "https://www.kakobuy.com/item/details?url=" + encodeURIComponent(raw) + "&affcode=" + KQS.affcode;
};

/** Build gallery URLs: main + optional -2/-3/-4 variants on CDN */
KQS.galleryCandidates = (image) => {
  const name = String(image || "").replace(/^.*\//, "");
  const m = name.match(/^(\d+)(\.webp|\.jpe?g|\.png)?$/i);
  if (!m) return name ? [KQS.productImg(name)] : [];
  const id = m[1];
  const ext = m[2] || ".webp";
  return [KQS.productImg(id + ext), KQS.productImg(id + "-2" + ext), KQS.productImg(id + "-3" + ext), KQS.productImg(id + "-4" + ext)];
};

KQS.probeImages = (urls) =>
  Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => resolve(null);
          img.src = src;
        })
    )
  ).then((list) => list.filter(Boolean));
