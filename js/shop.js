(() => {
  const PAGE_SIZE = 72;
  const root = document.querySelector("[data-shop]");
  if (!root || !window.KQS) return;

  const slug = root.getAttribute("data-shop") || "jackets";
  const isAll = slug === "finds";
  const cat = KQS.findCategory(slug) || { slug, label: slug };
  const title = isAll ? "All Products" : cat.label;
  const params = new URLSearchParams(location.search);
  const q = (params.get("q") || "").trim().toLowerCase();

  const grid = document.querySelector("[data-product-grid]");
  if (grid) grid.innerHTML = `<p class="shop-count">Loading products…</p>`;

  document.title = `${title} – Kakobuy Spreadsheet 2026-2027`;
  KQS.mountLayout && KQS.mountLayout(isAll ? "home" : slug);

  const crumb = document.querySelector("[data-breadcrumb]");
  if (crumb) {
    crumb.innerHTML = `
      <a href="${KQS.href("index.html")}">Home</a>
      <span>/</span>
      <a href="${KQS.href("shop/finds/")}">shop</a>
      <span>/</span>
      <span>${title}</span>
    `;
  }

  const heading = document.querySelector("[data-shop-title]");
  if (heading) heading.textContent = title;

  (async () => {
    let products = isAll ? await KQS.loadAllProducts() : await KQS.loadCategory(slug);
    KQS.products = products;

    if (q) {
      products = products.filter((p) => {
        const hay = `${p.title || ""} ${p.category || ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    let page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
    const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
    if (page > pages) page = pages;

    const start = (page - 1) * PAGE_SIZE;
    const slice = products.slice(start, start + PAGE_SIZE);

    const count = document.querySelector("[data-shop-count]");
    if (count) {
      if (!products.length) count.textContent = q ? `No results for “${q}”` : "No products found";
      else {
        const from = start + 1;
        const to = Math.min(start + PAGE_SIZE, products.length);
        count.textContent = `Showing ${from}–${to} of ${products.length} results`;
      }
    }

    if (grid) {
      grid.innerHTML = slice
        .map((p) => {
          const opts = Math.max(1, Number(p.options) || 1);
          const label = opts > 1 ? `${opts} OPTIONS` : p.title;
          return `
        <a class="product-card" href="${KQS.productHref(p.id, p.category)}">
          <span class="product-media">
            <img src="${KQS.productImg(p.image, p.local)}" alt="${p.title}" loading="lazy" decoding="async" width="400" height="400" />
          </span>
          <h2>${label}</h2>
          <p class="price">${KQS.money(p.price)}</p>
        </a>`;
        })
        .join("");
    }

    const pager = document.querySelector("[data-pager]");
    if (pager) {
      if (pages <= 1) {
        pager.innerHTML = "";
      } else {
        const items = [];
        const qs = (n) => {
          const sp = new URLSearchParams();
          if (q) sp.set("q", q);
          if (n > 1) sp.set("page", String(n));
          const s = sp.toString();
          return s ? `?${s}` : "?";
        };
        for (let i = 1; i <= pages; i++) {
          items.push(`<a class="${i === page ? "is-current" : ""}" href="${qs(i)}">${i}</a>`);
        }
        if (page < pages) items.push(`<a href="${qs(page + 1)}" aria-label="Next">→</a>`);
        pager.innerHTML = items.join("");
      }
    }
  })().catch((err) => {
    console.error(err);
    if (grid) grid.innerHTML = `<p class="shop-count">Failed to load products.</p>`;
  });
})();
