const loader = document.getElementById("loader");
const group1El = document.getElementById("group1-count");
const group2El = document.getElementById("group2-count");
const group1NameEl = document.getElementById("group1-name");
const group2NameEl = document.getElementById("group2-name");
const visitsEl = document.getElementById("total-visits");
const ccuEl = document.getElementById("total-ccu");

// Replace with actual universe IDs (not place IDs)
const universeIds = ["383310974","392234119","862011173"]; 
const groupIds = [4413376, 7040243];

function animateCount(el, start, end) {
  const duration = 800, t0 = performance.now();
  (function update(t) {
    const p = Math.min((t - t0) / duration, 1);
    const val = Math.floor(start + (end - start) * p);
    el.textContent = isNaN(val) ? "0" : val.toLocaleString();
    if (p < 1) requestAnimationFrame(update);
  })();
}

async function fetchGroup(id) {
  const r = await fetch(`https://corsproxy.io/?https://groups.roblox.com/v1/groups/${id}`);
  const d = await r.json();
  return { name: d.name || `Group ${id}`, count: d.memberCount || 0 };
}

async function fetchGameStats(univArr) {
  const url = `https://corsproxy.io/?https://games.roblox.com/v1/games?universeIds=${univArr.join(",")}`;
  const r = await fetch(url);
  const j = await r.json();
  let visits = 0, playing = 0;
  (j.data || []).forEach(x => {
    visits += x.visits || 0;
    playing += x.playing || 0;
  });
  return { visits, playing };
}

function getNum(el) {
  return parseInt(el.textContent.replace(/,/g, ""), 10) || 0;
}

async function update() {
  loader.style.display = "block";
  
  const [g1, g2] = await Promise.all(groupIds.map(fetchGroup));
  group1NameEl.textContent = g1.name;
  animateCount(group1El, getNum(group1El), g1.count);
  group2NameEl.textContent = g2.name;
  animateCount(group2El, getNum(group2El), g2.count);

  const stats = await fetchGameStats(universeIds);
  animateCount(visitsEl, getNum(visitsEl), stats.visits);
  animateCount(ccuEl, getNum(ccuEl), stats.playing);

  loader.style.display = "none";
}

window.addEventListener("DOMContentLoaded", () => {
  update();
  setInterval(update, 10000);
});
