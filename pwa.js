/* =========================================================
   PWA CLIENT LOGIC
   Install + Update Alerts + Offline UX
   Frontend-only | LocalStorage-based
========================================================= */

(() => {

  /* =====================================================
     INSTALL PROMPT HANDLING
  ===================================================== */
  let deferredInstallPrompt = null;
  let installBanner = null;

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showInstallBanner();
  });

  function showInstallBanner(){
    if (installBanner) return;

    installBanner = document.createElement("div");
    installBanner.style.cssText = `
      position:fixed;
      bottom:16px;
      left:16px;
      right:16px;
      background:#020617;
      color:#e5e7eb;
      padding:14px;
      border-radius:12px;
      box-shadow:0 10px 40px rgba(0,0,0,.5);
      display:flex;
      gap:12px;
      align-items:center;
      z-index:9999;
    `;

    installBanner.innerHTML = `
      <span style="flex:1">
        Install <b>Sitemap Generator</b> for offline access
      </span>
      <button id="pwaInstallBtn"
        style="background:#2563eb;color:#fff;border:none;
               padding:8px 12px;border-radius:8px;cursor:pointer">
        Install
      </button>
      <button id="visitProjectHubSiteBtn"
        style="background:#10b981;color:#fff;border:none;
               padding:8px 12px;border-radius:8px;cursor:pointer">
        Project Hub
      </button>
      <button id="pwaDismissBtn"
        style="background:none;color:#94a3b8;border:none;
               cursor:pointer">
        ✕
      </button>
    `;

    document.body.appendChild(installBanner);

    document.getElementById("pwaInstallBtn").onclick = async () => {
      installBanner.remove();
      installBanner = null;

      if (!deferredInstallPrompt) return;

      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    };

    document.getElementById("visitProjectHubSiteBtn").onclick = () => {
      window.open(
        "https://akshat-881236.github.io/sitemapjs/",
        "_blank",
        "noopener"
      );
    }

    document.getElementById("pwaDismissBtn").onclick = () => {
      installBanner.remove();
      installBanner = null;
      deferredInstallPrompt = null;
    };
  }

  /* =====================================================
     SERVICE WORKER UPDATE ALERT
  ===================================================== */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", event => {
      if (!event.data) return;

      if (event.data.type === "SW_UPDATED") {
        showUpdateToast(event.data.version);
      }
    });
  }

  function showUpdateToast(version){
    const toast = document.createElement("div");
    toast.style.cssText = `
      position:fixed;
      top:16px;
      right:16px;
      background:#020617;
      color:#e5e7eb;
      padding:14px;
      border-radius:12px;
      box-shadow:0 10px 40px rgba(0,0,0,.5);
      max-width:320px;
      z-index:9999;
    `;

    toast.innerHTML = `
      <div style="font-weight:600;margin-bottom:6px">
        Update Available
      </div>
      <div style="font-size:13px;color:#94a3b8;margin-bottom:10px">
        Version ${version} is ready.
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="reloadAppBtn"
          style="background:#22c55e;color:#022c22;border:none;
                 padding:6px 10px;border-radius:6px;cursor:pointer">
          Reload
        </button>
        <button id="laterBtn"
          style="background:none;color:#94a3b8;border:none;cursor:pointer">
          Later
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    document.getElementById("reloadAppBtn").onclick = () => {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      });
      location.reload();
    };

    document.getElementById("laterBtn").onclick = () => {
      toast.remove();
    };
  }

  /* =====================================================
     OFFLINE UX STRATEGY (FRONTEND-ONLY)
  ===================================================== */
  let offlineBanner = null;

  function showOfflineBanner(){
    if (offlineBanner) return;

    offlineBanner = document.createElement("div");
    offlineBanner.style.cssText = `
      position:fixed;
      top:0;
      left:0;
      right:0;
      background:#7c2d12;
      color:#fff;
      padding:8px 12px;
      text-align:center;
      font-size:13px;
      z-index:9998;
    `;

    offlineBanner.textContent =
      "You are offline. All local features are available.";

    document.body.appendChild(offlineBanner);
  }

  function hideOfflineBanner(){
    if (!offlineBanner) return;
    offlineBanner.remove();
    offlineBanner = null;
  }

  function handleConnectivity(){
    if (!navigator.onLine) {
      showOfflineBanner();
    } else {
      hideOfflineBanner();
    }
  }

  window.addEventListener("offline", handleConnectivity);
  window.addEventListener("online", handleConnectivity);

  // Initial check
  handleConnectivity();

  /* =====================================================
     OPTIONAL: LOG OFFLINE EVENTS
     (Safe for LocalStorage system)
  ===================================================== */
  try {
    const email = localStorage.getItem("active_session");
    if (email) {
      const db = JSON.parse(localStorage.getItem("users_db") || "{}");
      const user = db[email];
      if (user) {
        user.logs = user.logs || [];
        user.logs.unshift(
          new Date().toLocaleString() +
          (navigator.onLine ? " — Online" : " — Offline")
        );
        localStorage.setItem("users_db", JSON.stringify(db));
      }
    }
  } catch (_) {}

})();