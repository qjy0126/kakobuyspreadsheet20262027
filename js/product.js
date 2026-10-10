(() => {
  const root = document.querySelector("[data-product]");
  if (!root || !window.KQS) return;

  const id = new URLSearchParams(location.search).get("id") || "";
  root.innerHTML = `<div class="wrap"><p class="shop-count">Loading product…</p></div>`;
  KQS.mountLayout && KQS.mountLayout("home");

  const starsHtml = (rating) => {
    const r = Math.max(0, Math.min(5, Number(rating) || 4.5));
    const full = Math.floor(r);
    const half = r - full >= 0.25;
    let out = "";
    for (let i = 0; i < 5; i++) {
      if (i < full) out += '<span class="star is-on">★</span>';
      else if (i === full && half) out += '<span class="star is-half">★</span>';
      else out += '<span class="star">★</span>';
    }
    return `<span class="stars" aria-label="${r.toFixed(1)} out of 5">${out}</span>`;
  };

  (async () => {
    const product = await KQS.findProduct(id);
    KQS.mountLayout && KQS.mountLayout(product ? product.category : "home");

    if (!product) {
      root.innerHTML = `
      <div class="wrap">
        <p class="breadcrumb"><a href="${KQS.href("index.html")}">Home</a> / <span>Product</span></p>
        <h1>Product not found</h1>
        <p><a class="text-link" href="${KQS.href("shop/finds/")}">Back to shop →</a></p>
      </div>`;
      return;
    }

    const cat = KQS.findCategory(product.category) || { slug: product.category, label: product.category };
    const title = product.title || "Product";
    document.title = `${title} – Kakobuy Spreadsheet 2026-2027`;

    const catList = KQS._catProducts[product.category] || [];
    const idx = Math.max(0, catList.findIndex((p) => p.id === product.id));
    const prev = catList.length > 1 ? catList[(idx - 1 + catList.length) % catList.length] : null;
    const next = catList.length > 1 ? catList[(idx + 1) % catList.length] : null;
    const related = catList.filter((p) => p.id !== product.id).slice(0, 12);

    const buy = KQS.kakobuyUrl(product.link);
    const source = KQS.sourceLabel(product.link);
    const rating = 4.3 + ((String(product.id).length + (product.price || 0) * 10) % 7) / 10;
    const desc = `${KQS.escapeHtml(title)} on the Kakobuy Spreadsheet. ${KQS.escapeHtml(cat.label)} find from ${source}, listed at ${KQS.money(product.price)}. Preview QC photos here, then open Kakobuy to order.`;

    const mainSrc = KQS.productImg(product.image, product.local);

    root.innerHTML = `
    <div class="wrap pdp-wrap">
      <div class="pdp-bar">
        <p class="breadcrumb">
          <a href="${KQS.href("index.html")}">Home</a>
          <span>/</span>
          <a href="${KQS.href("shop/finds/")}">Shop</a>
          <span>/</span>
          <a href="${KQS.catHref(cat.slug)}">${KQS.escapeHtml(cat.label)}</a>
          <span>/</span>
          <span>${KQS.escapeHtml(title)}</span>
        </p>
        <div class="pdp-switch">
          ${prev ? `<a href="${KQS.productHref(prev.id, prev.category)}">‹ Previous</a>` : ""}
          ${next ? `<a href="${KQS.productHref(next.id, next.category)}">Next ›</a>` : ""}
        </div>
      </div>

      <div class="pdp-layout">
        <div class="pdp-gallery" data-gallery>
          <div class="pdp-thumbs" data-thumbs></div>
          <div class="pdp-stage">
            <button type="button" class="pdp-arrow pdp-prev is-hidden" data-gal-prev aria-label="Previous photo">‹</button>
            <div class="pdp-main" data-main>
              <img data-main-img src="${mainSrc}" alt="${KQS.escapeHtml(title)}" width="800" height="800" />
            </div>
            <button type="button" class="pdp-arrow pdp-next is-hidden" data-gal-next aria-label="Next photo">›</button>
            <button type="button" class="pdp-expand" data-expand aria-label="Expand image" title="Expand">⤢</button>
          </div>
        </div>

        <aside class="pdp-info">
          <h1>${KQS.escapeHtml(title)}</h1>
          <p class="pdp-price">${KQS.money(product.price)}</p>
          <p class="pdp-meta">
            ${starsHtml(rating)}
            <a class="pdp-qc-link" href="${buy}" target="_blank" rel="noopener">${product.qc ? "QC photos on this find" : "View on Kakobuy"} · ${source}</a>
          </p>
          <a class="btn-buy" href="${buy}" target="_blank" rel="noopener">BUY ON KAKOBUY</a>
          <p class="pdp-desc">${desc}</p>
        </aside>
      </div>

      ${
        related.length
          ? `<section class="related">
              <h2>More in this category</h2>
              <div class="related-grid">
                ${related
                  .map(
                    (p) => `
                  <a class="related-tile" href="${KQS.productHref(p.id, p.category)}" title="${KQS.escapeHtml(p.title)}">
                    <img src="${KQS.productImg(p.image, p.local)}" alt="${KQS.escapeHtml(p.title)}" loading="lazy" decoding="async" width="280" height="280" />
                  </a>`
                  )
                  .join("")}
              </div>
            </section>`
          : ""
      }
    </div>

    <div class="pdp-lightbox" data-lightbox hidden>
      <button type="button" class="pdp-lightbox-close" data-lightbox-close aria-label="Close">×</button>
      <img data-lightbox-img alt="" />
    </div>
  `;

    const galleryEls = {
      thumbs: root.querySelector("[data-thumbs]"),
      mainImg: root.querySelector("[data-main-img]"),
      prev: root.querySelector("[data-gal-prev]"),
      next: root.querySelector("[data-gal-next]"),
      expand: root.querySelector("[data-expand]"),
      lightbox: root.querySelector("[data-lightbox]"),
      lightboxImg: root.querySelector("[data-lightbox-img]"),
      lightboxClose: root.querySelector("[data-lightbox-close]"),
    };

    let gallery = [mainSrc];
    let photo = 0;

    const renderThumbs = () => {
      if (!galleryEls.thumbs) return;
      galleryEls.thumbs.innerHTML = gallery
        .map(
          (src, i) => `
        <button type="button" data-i="${i}" class="${i === photo ? "is-on" : ""}" aria-label="Photo ${i + 1}">
          <img src="${src}" alt="" />
        </button>`
        )
        .join("");
      const multi = gallery.length > 1;
      galleryEls.prev.classList.toggle("is-hidden", !multi);
      galleryEls.next.classList.toggle("is-hidden", !multi);
    };

    const show = (i) => {
      if (!gallery.length) return;
      photo = (i + gallery.length) % gallery.length;
      galleryEls.mainImg.src = gallery[photo];
      renderThumbs();
    };

    galleryEls.thumbs.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-i]");
      if (btn) show(Number(btn.dataset.i));
    });
    galleryEls.prev.addEventListener("click", () => show(photo - 1));
    galleryEls.next.addEventListener("click", () => show(photo + 1));

    const openLb = () => {
      galleryEls.lightboxImg.src = gallery[photo];
      galleryEls.lightboxImg.alt = title;
      galleryEls.lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    };
    const closeLb = () => {
      galleryEls.lightbox.hidden = true;
      document.body.style.overflow = "";
    };
    galleryEls.expand.addEventListener("click", openLb);
    galleryEls.lightboxClose.addEventListener("click", closeLb);
    galleryEls.lightbox.addEventListener("click", (e) => {
      if (e.target === galleryEls.lightbox) closeLb();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !galleryEls.lightbox.hidden) closeLb();
    });

    renderThumbs();

    // Probe extra QC/variant shots in the background
    if (!product.local) {
      KQS.probeImages(KQS.galleryCandidates(product.image)).then((found) => {
        if (found.length > 1) {
          gallery = found;
          renderThumbs();
        }
      });
    }
  })().catch((err) => {
    console.error(err);
    root.innerHTML = `<div class="wrap"><h1>Failed to load product</h1></div>`;
  });
})();
