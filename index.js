/* =========================================================
   GLOBAL STATE & AUTH GUARD
========================================================= */
(function authGuard(){
  const session = localStorage.getItem("active_session");
  if(!session){
    window.location.href = "/SitemapGeneratorXml/AccountSetUp.htm";
  }
})();

const USERS_KEY = "users_db";
const SESSION_KEY = "active_session";

const usersDB = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
const currentUserEmail = localStorage.getItem(SESSION_KEY);
const user = usersDB[currentUserEmail];

if(!user){
  localStorage.removeItem(SESSION_KEY);
  location.href = "/SitemapGeneratorXml/AccountSetUp.htm";
}

/* =========================================================
   INITIALIZE USER STRUCTURE
========================================================= */
user.logs = user.logs || [];
user.folders = user.folders || [];
user.settings = user.settings || {
  theme: "dark"
};

/* =========================================================
   DOM REFERENCES
========================================================= */
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const pages = document.querySelectorAll(".page");

const profileInfo = document.getElementById("profileInfo");
const profilePic = document.getElementById("profilePic");
const profilePicInput = document.getElementById("profilePicInput");

const activityList = document.getElementById("activityList");

const folderNameInput = document.getElementById("folderNameInput");
const exportTypeSelect = document.getElementById("exportType");
const folderContainer = document.getElementById("folderContainer");

const robotsAllow = document.getElementById("robotsAllow");
const robotsDisallow = document.getElementById("robotsDisallow");
const robotsSitemap = document.getElementById("robotsSitemap");
const robotsPreview = document.getElementById("robotsPreview");

/* =========================================================
   UTILITY FUNCTIONS
========================================================= */
function saveDB(){
  usersDB[currentUserEmail] = user;
  localStorage.setItem(USERS_KEY, JSON.stringify(usersDB));
}

function logActivity(message){
  const entry = `${new Date().toLocaleString()} — ${message}`;
  user.logs.unshift(entry);
  saveDB();
  renderActivity();
}

function switchPage(id){
  pages.forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if(window.innerWidth < 900){
    sidebar.classList.add("hidden");
  }
}

/* =========================================================
   SIDEBAR & NAVIGATION
========================================================= */
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

document.querySelectorAll("[data-route]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    switchPage(btn.dataset.route);
  });
});

document.getElementById("logoutBtn").addEventListener("click",()=>{
  localStorage.removeItem(SESSION_KEY);
  location.href = "AccountSetUp.htm";
});

/* =========================================================
   PROFILE
========================================================= */
function renderProfile(){
  profileInfo.innerHTML = `
    <strong>Name:</strong> ${user.name}<br>
    <strong>Email:</strong> ${user.email}<br>
    <strong>DOB:</strong> ${user.dob}
  `;

  if(user.photo){
    profilePic.src = user.photo;
  }
}

profilePicInput.addEventListener("change",()=>{
  const file = profilePicInput.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = ()=>{
    user.photo = reader.result;
    profilePic.src = reader.result;
    saveDB();
    logActivity("Profile photo updated");
  };
  reader.readAsDataURL(file);
});

/* =========================================================
   ACTIVITY LOG
========================================================= */
function renderActivity(){
  activityList.innerHTML = "";
  user.logs.forEach(log=>{
    const li = document.createElement("li");
    li.textContent = log;
    activityList.appendChild(li);
  });
}

/* =========================================================
   ACCOUNT SETTINGS (PASSWORD UPDATE)
========================================================= */
async function hash(text){
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)]
    .map(b => b.toString(16).padStart(2,"0"))
    .join("");
}

document.getElementById("updatePasswordBtn").addEventListener("click", async ()=>{
  const newPass = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if(newPass.length < 8 || newPass !== confirm){
    alert("Password invalid or mismatch");
    return;
  }

  user.pass = await hash(newPass);
  saveDB();
  logActivity("Password updated");
  alert("Password updated successfully");
});

/* =========================================================
   WORKSPACE – FOLDERS & FILES
========================================================= */
document.getElementById("addFolderBtn").addEventListener("click",()=>{
  const name = folderNameInput.value.trim();
  if(!name) return;

  user.folders.push({
    name,
    files: []
  });

  folderNameInput.value = "";
  saveDB();
  renderFolders();
  logActivity(`Folder created: ${name}`);
});

function addFile(folderIndex){
  user.folders[folderIndex].files.push({
    url: "https://example.com/",
    priority: "0.8",
    changefreq: "monthly",
    lastmod: new Date().toISOString().split("T")[0]
  });
  saveDB();
  renderFolders();
  logActivity("Sitemap entry added");
}

function editFile(folderIndex, fileIndex){
  const file = user.folders[folderIndex].files[fileIndex];
  const url = prompt("URL", file.url);
  if(!url) return;

  const priority = prompt("Priority (0.1 - 1.0)", file.priority);
  file.url = url;
  file.priority = priority || file.priority;
  file.lastmod = new Date().toISOString().split("T")[0];

  saveDB();
  renderFolders();
  logActivity("Sitemap entry updated");
}

function renderFolders(){
  folderContainer.innerHTML = "";

  user.folders.forEach((folder, i)=>{
    const box = document.createElement("div");
    box.className = "folder";

    box.innerHTML = `
      <b>${folder.name}</b>
      <button onclick="addFile(${i})">+ File</button>
      <button onclick="exportFolder(${i})">Export</button>
    `;

    folder.files.forEach((file, fi)=>{
      const f = document.createElement("div");
      f.className = "file";
      f.innerHTML = `
        ${file.url}<br>
        Priority: ${file.priority} | LastMod: ${file.lastmod}
        <button onclick="editFile(${i},${fi})">Edit</button>
      `;
      box.appendChild(f);
    });

    folderContainer.appendChild(box);
  });
}

/* =========================================================
   EXPORT – XML
========================================================= */
function generateXML(folder){
  let xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  folder.files.forEach(f=>{
    xml += `
  <url>
    <loc>${f.url}</loc>
    <priority>${f.priority}</priority>
    <changefreq>${f.changefreq}</changefreq>
    <lastmod>${f.lastmod}</lastmod>
  </url>`;
  });

  xml += "\n</urlset>";
  return xml;
}

/* =========================================================
   EXPORT – PDF (jsPDF)
========================================================= */
function exportPDF(folder){
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(16);
  pdf.text("Sitemap Report", 14, 15);
  pdf.setFontSize(11);
  pdf.text(`Folder: ${folder.name}`, 14, 25);

  let y = 35;
  folder.files.forEach((f, i)=>{
    if(y > 270){
      pdf.addPage();
      y = 20;
    }
    pdf.text(`${i+1}. ${f.url}`, 14, y);
    pdf.text(`Priority: ${f.priority} | LastMod: ${f.lastmod}`, 14, y+6);
    y += 14;
  });

  pdf.save(folder.name + ".pdf");
  logActivity("PDF exported");
}

/* =========================================================
   EXPORT – ZIP (JSZip)
========================================================= */
async function exportZIP(folder){
  const zip = new JSZip();
  zip.file("sitemap.xml", generateXML(folder));

  if(robotsPreview.textContent){
    zip.file("robots.txt", robotsPreview.textContent);
  }

  zip.file("README.txt",
`Sitemap Folder: ${folder.name}
Generated: ${new Date().toLocaleString()}
Entries: ${folder.files.length}`);

  const blob = await zip.generateAsync({ type:"blob" });
  downloadBlob(blob, folder.name + ".zip");
  logActivity("ZIP exported");
}

/* =========================================================
   EXPORT ROUTER
========================================================= */
function exportFolder(index){
  const folder = user.folders[index];
  const type = exportTypeSelect.value;

  if(type === "xml"){
    downloadBlob(generateXML(folder), folder.name + ".xml", "application/xml");
    logActivity("XML exported");
  }
  if(type === "pdf"){
    exportPDF(folder);
  }
  if(type === "zip"){
    exportZIP(folder);
  }
}

/* =========================================================
   ROBOTS.TXT
========================================================= */
document.getElementById("generateRobotsBtn").addEventListener("click",()=>{
  const txt =
`User-agent: *
Allow: ${robotsAllow.value || "/"}
Disallow: ${robotsDisallow.value || ""}

Sitemap: ${robotsSitemap.value || ""}`;

  robotsPreview.textContent = txt;
  logActivity("robots.txt generated");
});

document.getElementById("downloadRobotsBtn").addEventListener("click",()=>{
  if(!robotsPreview.textContent) return;
  downloadBlob(robotsPreview.textContent, "robots.txt", "text/plain");
  logActivity("robots.txt downloaded");
});

/* =========================================================
   DOWNLOAD HELPER
========================================================= */
function downloadBlob(data, filename, type){
  const blob = data instanceof Blob
    ? data
    : new Blob([data], { type: type || "text/plain" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* =========================================================
   INIT
========================================================= */
renderProfile();
renderActivity();
renderFolders();
logActivity("Session started");

/* =========================================================
   ADDITIONAL FEATURES BLOCK
   Offline Lock + Storage Warning + Backup + Version History
========================================================= */

/* ===============================
   APP VERSION (SYNC WITH SW)
=============================== */
const APP_VERSION = "v1.0.0";

/* ===============================
   VERSION HISTORY INIT
=============================== */
user.versionHistory = user.versionHistory || [];

function logVersion(action){
  user.versionHistory.unshift({
    version: APP_VERSION,
    action,
    time: new Date().toLocaleString()
  });
  saveDB();
}

/* Log app load */
logVersion("App Loaded");

/* =========================================================
   OFFLINE READ-ONLY LOCK
========================================================= */
function applyOfflineLock(isOffline){
  const disableSelectors = [
    "#addFolderBtn",
    "#updatePasswordBtn",
    "#generateRobotsBtn"
  ];

  disableSelectors.forEach(sel=>{
    const el = document.querySelector(sel);
    if(el){
      el.disabled = isOffline;
      el.style.opacity = isOffline ? "0.6" : "1";
      el.style.pointerEvents = isOffline ? "none" : "auto";
    }
  });

  if(isOffline){
    logActivity("Offline mode: Read-only enabled");
  } else {
    logActivity("Online mode: Editing enabled");
  }
}

function monitorOfflineLock(){
  applyOfflineLock(!navigator.onLine);
}

window.addEventListener("offline", monitorOfflineLock);
window.addEventListener("online", monitorOfflineLock);

/* Initial state */
monitorOfflineLock();

/* =========================================================
   STORAGE QUOTA WARNING SYSTEM
========================================================= */
async function checkStorageQuota(){
  if(!navigator.storage || !navigator.storage.estimate) return;

  const { usage, quota } = await navigator.storage.estimate();
  const percent = Math.round((usage / quota) * 100);

  if(percent >= 80){
    showStorageWarning(percent);
  }
}

function showStorageWarning(percent){
  const warn = document.createElement("div");
  warn.style.cssText = `
    position:fixed;
    bottom:16px;
    right:16px;
    background:#7c2d12;
    color:#fff;
    padding:12px 14px;
    border-radius:12px;
    max-width:280px;
    font-size:13px;
    z-index:9999;
    box-shadow:0 10px 30px rgba(0,0,0,.5);
  `;

  warn.innerHTML = `
    <b>Storage Warning</b><br>
    ${percent}% of storage used.<br>
    Consider exporting backup.
    <div style="text-align:right;margin-top:6px">
      <button id="closeStorageWarn"
        style="background:none;border:none;color:#fde68a;cursor:pointer">
        Dismiss
      </button>
    </div>
  `;

  document.body.appendChild(warn);

  document.getElementById("closeStorageWarn").onclick = () => {
    warn.remove();
  };
}

/* Run check once per session */
checkStorageQuota();

/* =========================================================
   DATA EXPORT (FULL BACKUP)
========================================================= */
function exportFullBackup(){
  const backup = {
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    userData: user
  };

  downloadBlob(
    JSON.stringify(backup, null, 2),
    `sitemap-backup-${Date.now()}.json`,
    "application/json"
  );

  logActivity("Full backup exported");
  logVersion("Backup Exported");
}

/* =========================================================
   DATA IMPORT (RESTORE)
========================================================= */
function importFullBackup(file){
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      if(!data.userData){
        alert("Invalid backup file");
        return;
      }

      // Restore user data safely
      Object.assign(user, data.userData);
      saveDB();

      renderProfile();
      renderActivity();
      renderFolders();

      logActivity("Backup imported");
      logVersion("Backup Imported");

      alert("Backup restored successfully");
    } catch(e){
      alert("Failed to restore backup");
    }
  };
  reader.readAsText(file);
}

/* =========================================================
   VERSION HISTORY VIEW (ACTIVITY EXTENSION)
========================================================= */
function renderVersionHistory(){
  const section = document.createElement("div");
  section.className = "card";
  section.innerHTML = `<h3>Version History</h3>`;

  const ul = document.createElement("ul");
  ul.className = "activity-list";

  user.versionHistory.forEach(v=>{
    const li = document.createElement("li");
    li.textContent =
      `${v.time} — ${v.action} (${v.version})`;
    ul.appendChild(li);
  });

  section.appendChild(ul);

  // Append to Activity page
  const activityPage = document.getElementById("activity");
  activityPage.appendChild(section);
}

/* Render version history once */
renderVersionHistory();

/* =========================================================
   OPTIONAL: UI HOOKS (SAFE)
========================================================= */
/*
You may later connect these to buttons in index.html:

<button onclick="exportFullBackup()">Export Backup</button>
<input type="file" onchange="importFullBackup(this.files[0])">

No HTML dependency enforced here.
*/

/* =========================================================
   FINAL INIT LOG
========================================================= */
logVersion("Additional systems initialized");
