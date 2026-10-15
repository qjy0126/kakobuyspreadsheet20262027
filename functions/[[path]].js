const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
  "X-Content-Type-Options": "nosniff",
};

function txtPathFor(pathname) {
  if (pathname === "/sitemap.xml") return "/sitemap.txt";
  if (pathname === "/sitemap-pages.xml") return "/sitemap-pages.txt";
  const m = pathname.match(/^\/sitemaps\/(\d{2})\.xml$/);
  if (m) return `/sitemaps/${m[1]}.txt`;
  return null;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const txtPath = txtPathFor(url.pathname);
  if (!txtPath) return context.next();

  try {
    const asset = await context.env.ASSETS.fetch(new URL(txtPath, url.origin));
    if (!asset.ok) return context.next();
    const body = await asset.text();
    if (!body.includes("<urlset") && !body.includes("<sitemapindex")) return context.next();
    return new Response(body, { status: 200, headers: XML_HEADERS });
  } catch {
    return context.next();
  }
}
