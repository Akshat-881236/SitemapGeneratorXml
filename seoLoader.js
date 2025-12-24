/* =========================================================
   SEO META MANAGER – SITEMAP GENERATOR
   Frontend-only | SPA + Static
   Author: Akshat Prasad
========================================================= */

(function () {

  /* =====================================================
     GLOBAL DEFAULT SEO CONFIG
  ===================================================== */
  const DEFAULT_SEO = {
    title: "Sitemap Generator – By Akshat Prasad",
    description:
      "Frontend-only Sitemap Generator to create XML sitemaps, export as PDF or ZIP, and generate robots.txt. Works offline using browser storage.",
    keywords:
      "sitemap generator, xml sitemap, robots.txt generator, seo tools, frontend sitemap, pwa sitemap, Akshat Prasad Portfolio, Portfolio - 881236, Sitemap By Akshat Prasad",
    author: "Akshat Prasad",
    themeColor: "#2563eb",
    locale: "en_US",
    type: "website",
    siteName: "Sitemap Generator",
    twitterCard: "summary_large_image",
    image: "/SitemapGeneratorXml/Assets/icon-192.png"
  };

  /* =====================================================
     PAGE / ROUTE SPECIFIC SEO
  ===================================================== */
  const PAGE_SEO = {

    "index.html": {
      title: "Sitemap Generator - By Akshat Prasad",
      description:
        "Create and manage multiple sitemaps, export XML, PDF or ZIP, and generate robots.txt — all in the browser."
    },

    "#workspace": {
      title: "Sitemap Workspace – Create & Manage Sitemaps",
      description:
        "Organize URLs into folders, edit priorities and metadata, and export SEO-ready sitemaps."
    },

    "#profile": {
      title: "Profile – Sitemap Generator",
      description:
        "Manage your profile, photo, and account information for the Sitemap Generator."
    },

    "#activity": {
      title: "Activity Log – Sitemap Generator",
      description:
        "View activity history including sitemap edits, exports, updates, and offline events."
    },

    "#account": {
      title: "Account Settings – Sitemap Generator",
      description:
        "Update credentials, change password, and manage account security settings."
    },

    "#robots": {
      title: "robots.txt Generator",
      description:
        "Generate and download robots.txt with allow, disallow, and sitemap directives."
    }
  };

  /* =====================================================
     HELPERS
  ===================================================== */
  function getPageKey() {
    const hash = window.location.hash;
    if (hash && PAGE_SEO[hash]) return hash;

    const file = window.location.pathname.split("/").pop();
    if (PAGE_SEO[file]) return file;

    return null;
  }

  /* =====================================================
     INJECT META VIA INNERHTML
  ===================================================== */
  function injectMetaHTML(seo) {

    let container = document.querySelector("head meta[data-seo]");
    if (!container) {
      container = document.createElement("meta");
      container.setAttribute("data-seo", "true");
      document.head.appendChild(container);
    }

    document.title = seo.title;

    container.outerHTML = `
<meta data-seo="true" charset="utf-8">
<meta name="description" content="${seo.description}">
<meta name="keywords" content="${seo.keywords}">
<meta name="author" content="${seo.author}">
<meta name="theme-color" content="${seo.themeColor}">

<link rel="canonical" href="${location.href.split("#")[0]}">

<meta property="og:title" content="${seo.title}">
<meta property="og:description" content="${seo.description}">
<meta property="og:type" content="${seo.type}">
<meta property="og:locale" content="${seo.locale}">
<meta property="og:url" content="${location.href}">
<meta property="og:site_name" content="${seo.siteName}">
${seo.image ? `<meta property="og:image" content="${seo.image}">` : ""}

<meta name="twitter:card" content="${seo.twitterCard}">
<meta name="twitter:title" content="${seo.title}">
<meta name="twitter:description" content="${seo.description}">
${seo.image ? `<meta name="twitter:image" content="${seo.image}">` : ""}
`;
  }

  /* =====================================================
     APPLY SEO
  ===================================================== */
  function applySEO() {
    const key = getPageKey();
    const seo = Object.assign(
      {},
      DEFAULT_SEO,
      key ? PAGE_SEO[key] : {}
    );

    injectMetaHTML(seo);
  }

  /* =====================================================
     INIT + SPA SUPPORT
  ===================================================== */
  applySEO();
  window.addEventListener("hashchange", applySEO);
  window.addEventListener("popstate", applySEO);

})();