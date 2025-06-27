const loader = document.getElementById("loader");
const group1El = document.getElementById("group1-count");
const group2El = document.getElementById("group2-count");
const group1NameEl = document.getElementById("group1-name");
const group2NameEl = document.getElementById("group2-name");
const visitsEl = document.getElementById("total-visits");
const ccuEl = document.getElementById("total-ccu");

const groupIds = [4413376, 7040243];
const experienceIds = ["130445913533770", "135060580071597", "123875295828804"];

function animateCount(el, start, end) {
  const duration = 800;
  const t0 = performance.now();
  (function update(t) {
    const p = Math.min((t - t0) / duration, 1);
    el.textContent = Math.floor(start + (end - start) * p).toLocaleString();
    if (p < 1) requestAnimationFrame(update);
  })();
}

async function fetchGroup(groupId) {
  const res = await fetch(`https://corsproxy.io/?https://groups.roblox.com/v1/groups/${groupId}`);
  const json = await res.json();
  return { name: json.name, count: json.memberCount || 0 };
}

async function fetchExperienceStats(univArgs) {
  const url = `https://corsproxy.io/?https://games.roblox.com/v1/games?universeIds=${univArgs}`;
  const res = await fetch(url);
  const json = await res.json();
  let visits = 0;
  let playing = 0;
  if (Array.isArray(json.data)) {
    json.data.forEach(g => {
      visits += g.visits || 0;
      playing += g.playing || 0;
    });
  }
  return { visits, playing };
}

async function updateStats() {
  loader.style.display = "block";
  try {
    // Groups
    const [g1, g2] = await Promise.all(groupIds.map(fetchGroup));
    group1NameEl.textContent = g1.name;
    animateCount(group1El, +group1El.textContent.replace(/,/g,''), g1.count);
    group2NameEl.textContent = g2.name;
    animateCount(group2El, +group2El.textContent.replace(/,/g,''), g2.count);

    // Experiences
    const runes = experienceIds.join(",");
    const xp = await fetchExperienceStats(runes);
    animateCount(visitsEl, +visitsEl.textContent.replace(/,/g,''), xp.visits);
    animateCount(ccuEl, +ccuEl.textContent.replace(/,/g,''), xp.playing);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    loader.style.display = "none";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  updateStats();
  setInterval(updateStats, 10000); // every 10 sec
});
