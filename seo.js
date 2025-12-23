/* =========================================================
   SEO META MANAGER – SITEMAP GENERATOR
   Frontend-only | SPA + Static
   Author: Akshat Prasad
========================================================= */

(function () {

  /* =====================================================
     GLOBAL DEFAULT SEO CONFIG
     (Used when no page-specific override exists)
  ===================================================== */
  const DEFAULT_SEO = {
    title: "Sitemap Generator – XML, PDF & ZIP",
    description:
      "Frontend-only Sitemap Generator to create XML sitemaps, export as PDF or ZIP, and generate robots.txt. Works offline using browser storage.",
    keywords:
      "sitemap generator, xml sitemap, robots.txt generator, seo tools, frontend sitemap, pwa sitemap",
    author: "Akshat Prasad",
    themeColor: "#2563eb",
    locale: "en_US",
    type: "website",
    siteName: "Sitemap Generator",
    twitterCard: "summary_large_image",
    image: "" // optional: add a preview image later
  };

  /* =====================================================
     PAGE / ROUTE SPECIFIC SEO
     (file name OR SPA hash routes)
  ===================================================== */
  const PAGE_SEO = {

    /* ---------- MAIN ---------- */
    "index.html": {
      title: "Sitemap Generator Workspace",
      description:
        "Create and manage multiple sitemaps, export XML, PDF or ZIP, and generate robots.txt — all in the browser."
    },

    /* ---------- SPA ROUTES ---------- */
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

  function setMeta(name, content, attr = "name") {
    if (!content) return;
    let tag = document.querySelector(`meta[${attr}="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function setLink(rel, href) {
    if (!href) return;
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
  }

  /* =====================================================
     APPLY SEO METADATA
  ===================================================== */
  function applySEO() {
    const key = getPageKey();
    const seo = Object.assign(
      {},
      DEFAULT_SEO,
      key ? PAGE_SEO[key] : {}
    );

    /* ---------- BASIC ---------- */
    document.title = seo.title;
    setMeta("description", seo.description);
    setMeta("keywords", seo.keywords);
    setMeta("author", seo.author);
    setMeta("theme-color", seo.themeColor);

    /* ---------- CANONICAL ---------- */
    setLink("canonical", window.location.href.split("#")[0]);

    /* ---------- OPEN GRAPH ---------- */
    setMeta("og:title", seo.title, "property");
    setMeta("og:description", seo.description, "property");
    setMeta("og:type", seo.type, "property");
    setMeta("og:locale", seo.locale, "property");
    setMeta("og:url", window.location.href, "property");
    setMeta("og:site_name", seo.siteName, "property");
    if (seo.image) setMeta("og:image", seo.image, "property");

    /* ---------- TWITTER ---------- */
    setMeta("twitter:card", seo.twitterCard);
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);
    if (seo.image) setMeta("twitter:image", seo.image);

    /* ---------- VIEWPORT SAFETY ---------- */
    if (!document.querySelector('meta[name="viewport"]')) {
      setMeta(
        "viewport",
        "width=device-width, initial-scale=1, maximum-scale=5"
      );
    }
  }

  /* =====================================================
     INIT + SPA SUPPORT
  ===================================================== */
  applySEO();
  window.addEventListener("hashchange", applySEO);
  window.addEventListener("popstate", applySEO);

})();