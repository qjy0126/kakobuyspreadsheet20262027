(() => {
  if (!window.KQS) return;

  function navHtml(active) {
    const links = [
      { href: KQS.href("index.html"), label: "HOME", key: "home" },
      ...KQS.navCats.map((c) => ({ href: KQS.catHref(c.slug), label: c.nav || c.label, key: c.slug })),
      { href: KQS.href("index.html#guides"), label: "Guides", key: "guides" },
      { href: KQS.href("index.html#faq"), label: "About", key: "about" },
    ];
    return links
      .map((l) => `<a href="${l.href}" class="${l.key === active ? "is-current" : ""}">${l.label}</a>`)
      .join("");
  }

  function findsHref(q) {
    const base = KQS.href("shop/finds/");
    return q ? base + "?q=" + encodeURIComponent(q) : base;
  }

  function resolveSearchTarget(q) {
    const raw = String(q || "").trim();
    if (!raw) return findsHref("");

    const key = raw.toLowerCase();
    const aliases = {
      shoes: "shoes",
      shoe: "shoes",
      sneakers: "shoes",
      "t-shirts": "t-shirts",
      "t-shirt": "t-shirts",
      tshirts: "t-shirts",
      tee: "t-shirts",
      hoodies: "hoodies",
      hoodie: "hoodies",
      sweaters: "hoodies",
      jackets: "jackets",
      jacket: "jackets",
      pants: "pants",
      shorts: "pants",
      "pants/shorts": "pants",
      headwear: "headwear",
      caps: "headwear",
      jersey: "jersey",
      accessories: "accessories",
      sets: "sets",
      underwear: "underwear",
      underpants: "underwear",
      other: "other",
      watches: "finds",
      watch: "finds",
      bags: "finds",
      bag: "finds",
    };

    if (aliases[key] && aliases[key] !== "finds") return KQS.catHref(aliases[key]);
    if (aliases[key] === "finds") return findsHref(raw);

    const cat = (KQS.categories || []).find((c) => {
      if (c.all) return false;
      const label = String(c.label || "").toLowerCase();
      const nav = String(c.nav || "").toLowerCase();
      const slug = String(c.slug || "").toLowerCase();
      return label === key || nav === key || slug === key;
    });
    if (cat) return KQS.catHref(cat.slug);

    return findsHref(raw);
  }

  function goSearch(q) {
    location.href = resolveSearchTarget(q);
  }

  function mountHeader(active) {
    const existing = document.querySelector(".site-header");
    if (!existing) return;
    existing.innerHTML = `
      <div class="header-bar">
        <a class="site-logo" href="${KQS.href("index.html")}">Kakobuy Spreadsheet 2026-2027</a>
        <div class="header-actions">
          <button class="search-btn" type="button" data-search-open aria-haspopup="dialog" aria-controls="search-modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
              <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Search</span>
          </button>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" data-nav-toggle>
            <span class="sr-only">Menu</span>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <nav class="primary-nav" id="primary-nav" data-nav aria-label="Primary">${navHtml(active)}</nav>
    `;

    const nav = existing.querySelector("[data-nav]");
    const toggle = existing.querySelector("[data-nav-toggle]");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        nav.classList.toggle("is-open", !open);
      });
    }

    mountSearchModal();
    const openBtn = existing.querySelector("[data-search-open]");
    if (openBtn) openBtn.addEventListener("click", () => openSearch());
  }

  function mountFooter() {
    const el = document.querySelector(".site-footer .wrap") || document.querySelector(".site-footer");
    if (!el) return;
    if (el.classList.contains("wrap")) {
      el.innerHTML = `<p>Copyright © 2026-2027 Kakobuy Spreadsheet. All rights reserved.</p>`;
    } else {
      el.innerHTML = `<div class="wrap"><p>Copyright © 2026-2027 Kakobuy Spreadsheet. All rights reserved.</p></div>`;
    }
  }

  function mountSearchModal() {
    if (document.getElementById("search-modal")) return;

    const popular = [
      "Jordan 4",
      "Moncler",
      "Stone Island",
      "Chrome Hearts",
      "Corteiz",
      "Ralph Lauren",
      "Nike Tech",
      "Trapstar",
    ];

    const cats = [
      { label: "Shoes", href: KQS.catHref("shoes"), icon: "shoe" },
      { label: "T-shirts", href: KQS.catHref("t-shirts"), icon: "shirt" },
      { label: "Hoodies", href: KQS.catHref("hoodies"), icon: "hoodie" },
      { label: "Jackets", href: KQS.catHref("jackets"), icon: "jacket" },
      { label: "Pants", href: KQS.catHref("pants"), icon: "pants" },
      { label: "Bags", href: findsHref("Bag"), icon: "bag" },
      { label: "Watches", href: findsHref("Watch"), icon: "watch" },
      { label: "Accessories", href: KQS.catHref("accessories"), icon: "acc" },
    ];

    const iconSvg = {
      shoe: '<path d="M3 15c2-1 4-2 7-2h7l3 3v2H3v-3z" fill="currentColor"/><path d="M5 13c1-3 3-5 6-5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      shirt: '<path d="M8 4l4 2 4-2 3 3-2 2v9H7V9L5 7l3-3z" fill="currentColor"/>',
      hoodie: '<path d="M9 4c0 2 1.5 3 3 3s3-1 3-3l3 2v3l2 2v8H7v-8l2-2V6l0-2z" fill="currentColor"/>',
      jacket: '<path d="M8 5l4 2 4-2 3 4-2 1v10H7V10L5 9l3-4z" fill="currentColor"/>',
      pants: '<path d="M8 3h8l-1 18h-3l-1-9-1 9H7L8 3z" fill="currentColor"/>',
      bag: '<path d="M7 8h10v12H7V8zm3-3h4l1 3H9l1-3z" fill="currentColor"/>',
      watch: '<circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 3h4v3h-4V3zm0 15h4v3h-4v-3z" fill="currentColor"/><path d="M12 9v3.5l2 1.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
      acc: '<path d="M7 10a5 5 0 0 1 10 0v2H7v-2zm-1 2h12v8H6v-8z" fill="currentColor"/>',
    };

    const modal = document.createElement("div");
    modal.id = "search-modal";
    modal.className = "search-modal";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Search products");
    modal.innerHTML = `
      <div class="search-modal-backdrop" data-search-close></div>
      <div class="search-modal-panel">
        <form class="search-modal-form" data-search-form>
          <svg class="search-modal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <label class="sr-only" for="site-search-input">Search products</label>
          <input id="site-search-input" type="search" placeholder="Search reps, brands, items..." autocomplete="off" data-search-input />
          <button type="button" class="search-clear" data-search-clear aria-label="Clear search" hidden>×</button>
          <button type="button" class="search-esc" data-search-close aria-label="Close search">Esc</button>
        </form>

        <div class="search-browse" data-search-browse>
          <section class="search-section">
            <h3 class="search-section-label">Popular</h3>
            <div class="search-popular">
              ${popular
                .map((t) => `<a href="${findsHref(t)}">${KQS.escapeHtml(t)}</a>`)
                .join("")}
            </div>
          </section>
          <section class="search-section">
            <h3 class="search-section-label">Categories</h3>
            <div class="search-cats">
              ${cats
                .map(
                  (c) => `
                <a class="search-cat" href="${c.href}">
                  <span class="search-cat-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24">${iconSvg[c.icon] || ""}</svg>
                  </span>
                  <span>${c.label}</span>
                </a>`
                )
                .join("")}
            </div>
          </section>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll("[data-search-close]").forEach((el) => {
      el.addEventListener("click", () => closeSearch());
    });

    const form = modal.querySelector("[data-search-form]");
    const input = modal.querySelector("[data-search-input]");
    const clearBtn = modal.querySelector("[data-search-clear]");

    const syncClear = () => {
      if (clearBtn) clearBtn.hidden = !input.value;
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      goSearch(input.value.trim());
    });

    input.addEventListener("input", syncClear);

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        input.value = "";
        syncClear();
        input.focus();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeSearch();
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openSearch();
      }
    });
  }

  function openSearch() {
    const modal = document.getElementById("search-modal");
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("search-open");
    const input = modal.querySelector("[data-search-input]");
    const clearBtn = modal.querySelector("[data-search-clear]");
    if (input) {
      input.focus();
      input.select();
      if (clearBtn) clearBtn.hidden = !input.value;
    }
  }

  function closeSearch() {
    const modal = document.getElementById("search-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("search-open");
  }

  KQS.mountLayout = (active) => {
    mountHeader(active);
    mountFooter();
  };

  KQS.openSearch = openSearch;
  KQS.closeSearch = closeSearch;
  KQS.goSearch = goSearch;

  const firebaseSrc = KQS.href("js/firebase.js");
  if (!document.querySelector(`script[data-kqs-firebase]`)) {
    const s = document.createElement("script");
    s.src = firebaseSrc;
    s.async = true;
    s.dataset.kqsFirebase = "1";
    document.head.appendChild(s);
  }
})();
