/* Lazy product loader — loads only the category files needed */
window.KQS = window.KQS || {};
KQS._catProducts = KQS._catProducts || {};
KQS.products = KQS.products || [];

KQS.productDataBase = (() => {
  const path = location.pathname || "/";
  if (path.includes("/shop/") || path.includes("/product/")) {
    const idx = Math.max(path.lastIndexOf("/shop/"), path.lastIndexOf("/product/"));
    const root = path.slice(0, idx).replace(/\/$/, "");
    return (root || "") + "/js/products/";
  }
  const base = path.replace(/\/index\.html$/i, "").replace(/\/$/, "");
  // Keep root-absolute so nested pages never request /shop/.../js/products/
  return (base || "") + "/js/products/";
})();

KQS.loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-kqs-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(src)));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.kqsSrc = src;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });

KQS.loadCategory = async (slug) => {
  const key = String(slug || "");
  if (KQS._catProducts[key]) return KQS._catProducts[key];
  await KQS.loadScript(KQS.productDataBase + encodeURIComponent(key) + ".js");
  return KQS._catProducts[key] || [];
};

KQS.loadCategories = async (slugs) => {
  const list = [...new Set(slugs.filter(Boolean))];
  await Promise.all(list.map((s) => KQS.loadCategory(s)));
  return list.flatMap((s) => KQS._catProducts[s] || []);
};

KQS.allCategorySlugs = [
  "shoes",
  "t-shirts",
  "hoodies",
  "jackets",
  "pants",
  "headwear",
  "sets",
  "underwear",
  "jersey",
  "accessories",
  "other",
  "glasses",
  "watches",
  "perfume",
  "bricks",
];

KQS.loadAllProducts = async () => {
  const all = await KQS.loadCategories(KQS.allCategorySlugs);
  KQS.products = all;
  return all;
};

KQS.findProduct = async (id) => {
  if (!id) return null;
  for (const cat of Object.keys(KQS._catProducts)) {
    const hit = (KQS._catProducts[cat] || []).find((p) => p.id === id);
    if (hit) return hit;
  }
  // Prefer category hint from URL
  const hint = new URLSearchParams(location.search).get("cat");
  if (hint) {
    const list = await KQS.loadCategory(hint);
    const hit = list.find((p) => p.id === id);
    if (hit) return hit;
  }
  // Fallback: scan id-map then one category
  await KQS.loadScript(KQS.productDataBase + "id-map.js");
  const cat = (KQS.productIdMap || {})[id];
  if (!cat) return null;
  const list = await KQS.loadCategory(cat);
  return list.find((p) => p.id === id) || null;
};
