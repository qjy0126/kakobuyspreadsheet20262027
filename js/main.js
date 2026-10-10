(() => {
  if (!window.KQS) return;

  if (typeof KQS.mountLayout === "function") {
    KQS.mountLayout("home");
  }

  const grid = document.querySelector("#category-grid");
  const detail = document.querySelector("#category-detail-list");
  const searchForm = document.querySelector("[data-search-form]");
  const searchInput = document.querySelector("#product-search");

  if (grid) {
    grid.innerHTML = KQS.categories
      .map((c) => {
        const href = KQS.catHref(c.slug);
        const cls = c.all ? "cat-tile is-all" : "cat-tile";
        return `
      <a class="${cls}" href="${href}">
        <img src="${KQS.asset(c.image)}" alt="${c.label}" loading="lazy" decoding="async" width="320" height="320" />
        <span>${c.label}</span>
      </a>`;
      })
      .join("");
  }

  if (detail) {
    detail.className = "cat-detail";
    detail.innerHTML = KQS.categories
      .filter((c) => !c.all)
      .map(
        (c) => `
      <article id="${c.slug}">
        <h3>${c.label}</h3>
        <p>${KQS.blurbs[c.slug] || "Browse curated Kakobuy Spreadsheet finds in this category."}</p>
        <p><a class="text-link" href="${KQS.catHref(c.slug)}">Explore Kakobuy Spreadsheet ${c.label} →</a></p>
      </article>`
      )
      .join("");
  }

  document.querySelectorAll("[data-keyword]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = btn.getAttribute("data-keyword") || "";
      if (typeof KQS.goSearch === "function") {
        KQS.goSearch(q);
        return;
      }
      location.href = KQS.href("shop/finds/") + "?q=" + encodeURIComponent(q);
    });
  });

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const q = searchInput.value.trim();
      if (typeof KQS.goSearch === "function") {
        KQS.goSearch(q);
        return;
      }
      location.href = q
        ? KQS.href("shop/finds/") + "?q=" + encodeURIComponent(q)
        : KQS.href("shop/finds/");
    });
  }
})();

