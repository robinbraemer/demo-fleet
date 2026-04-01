/**
 * Fleet Dashboard — main application logic
 */

const API = "http://localhost:5000/api";

// ── State ──────────────────────────────────────────────
let vehicles = [];
let selectedId = null;

// ── DOM refs ───────────────────────────────────────────
const vehicleList = document.getElementById("vehicle-list");
const detailPanel = document.getElementById("detail-panel");
const statsBar = document.getElementById("stats-bar");
const filterBtns = document.querySelectorAll(".filter-btn");
const addBtn = document.getElementById("add-btn");
const modal = document.getElementById("add-modal");
const modalClose = document.getElementById("modal-close");
const addForm = document.getElementById("add-form");

// ── Fetch helpers ──────────────────────────────────────
async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

// ── Data loading ───────────────────────────────────────
async function loadVehicles(filter = "") {
  const qs = filter ? `?status=${filter}` : "";
  vehicles = await fetchJSON(`${API}/vehicles${qs}`);
  renderList();
  if (selectedId) renderDetail(vehicles.find((v) => v.id === selectedId));
}

async function loadStats() {
  const s = await fetchJSON(`${API}/stats`);
  statsBar.innerHTML = `
    <div class="stat"><span class="stat-value">${s.total}</span><span class="stat-label">Total</span></div>
    <div class="stat"><span class="stat-value">${s.active}</span><span class="stat-label">Active</span></div>
    <div class="stat"><span class="stat-value">${s.idle}</span><span class="stat-label">Idle</span></div>
    <div class="stat"><span class="stat-value">${s.maintenance}</span><span class="stat-label">Maint.</span></div>
    <div class="stat"><span class="stat-value">${s.avg_fuel}%</span><span class="stat-label">Avg Fuel</span></div>
  `;
}

// ── Rendering ──────────────────────────────────────────
function statusColor(status) {
  return { active: "#22c55e", idle: "#eab308", maintenance: "#ef4444" }[status] || "#94a3b8";
}

function typeIcon(type) {
  return { truck: "🚛", van: "🚐", sedan: "🚗" }[type] || "🚙";
}

function renderList() {
  vehicleList.innerHTML = vehicles
    .map(
      (v) => `
    <div class="vehicle-card ${v.id === selectedId ? "selected" : ""}" data-id="${v.id}">
      <div class="vehicle-icon">${typeIcon(v.type)}</div>
      <div class="vehicle-info">
        <strong>${v.name}</strong>
        <span class="vehicle-driver">${v.driver}</span>
      </div>
      <span class="status-dot" style="background:${statusColor(v.status)}" title="${v.status}"></span>
    </div>`
    )
    .join("");

  vehicleList.querySelectorAll(".vehicle-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedId = card.dataset.id;
      renderList();
      renderDetail(vehicles.find((v) => v.id === selectedId));
    });
  });
}

function renderDetail(v) {
  if (!v) {
    detailPanel.innerHTML = '<p class="placeholder">Select a vehicle to see details</p>';
    return;
  }
  detailPanel.innerHTML = `
    <h2>${typeIcon(v.type)} ${v.name}</h2>
    <div class="detail-grid">
      <div class="detail-item"><label>Status</label><span class="badge" style="background:${statusColor(v.status)}">${v.status}</span></div>
      <div class="detail-item"><label>Driver</label><span>${v.driver}</span></div>
      <div class="detail-item"><label>Speed</label><span>${v.speed} mph</span></div>
      <div class="detail-item"><label>Fuel</label>
        <div class="fuel-bar"><div class="fuel-fill" style="width:${v.fuel}%;background:${v.fuel < 30 ? "#ef4444" : v.fuel < 60 ? "#eab308" : "#22c55e"}"></div></div>
        <span>${v.fuel}%</span>
      </div>
      <div class="detail-item"><label>Location</label><span>${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}</span></div>
      <div class="detail-item"><label>Type</label><span>${v.type}</span></div>
    </div>
    <div class="detail-actions">
      <button class="btn btn-sm" onclick="toggleStatus('${v.id}', '${v.status}')">${v.status === "active" ? "Set Idle" : "Activate"}</button>
      <button class="btn btn-sm btn-danger" onclick="removeVehicle('${v.id}')">Remove</button>
    </div>
  `;
}

// ── Actions ────────────────────────────────────────────
async function toggleStatus(id, current) {
  const next = current === "active" ? "idle" : "active";
  await fetchJSON(`${API}/vehicles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: next, speed: next === "idle" ? 0 : Math.floor(Math.random() * 60 + 10) }),
  });
  await refresh();
}

async function removeVehicle(id) {
  await fetchJSON(`${API}/vehicles/${id}`, { method: "DELETE" });
  if (selectedId === id) selectedId = null;
  await refresh();
}

async function refresh() {
  const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "";
  await Promise.all([loadVehicles(activeFilter), loadStats()]);
}

// ── Filters ────────────────────────────────────────────
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    loadVehicles(btn.dataset.filter);
  });
});

// ── Add vehicle modal ──────────────────────────────────
addBtn.addEventListener("click", () => modal.classList.add("open"));
modalClose.addEventListener("click", () => modal.classList.remove("open"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("open");
});

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(addForm);
  await fetchJSON(`${API}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: fd.get("name"),
      type: fd.get("type"),
      driver: fd.get("driver"),
      fuel: Number(fd.get("fuel")),
    }),
  });
  modal.classList.remove("open");
  addForm.reset();
  await refresh();
});

// ── Init ───────────────────────────────────────────────
refresh();
// Auto-refresh every 10 seconds
setInterval(refresh, 10000);
