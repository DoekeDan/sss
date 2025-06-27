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
  const dur = 800, t0 = performance.now();
  (function update(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.floor(start + (end - start) * p).toLocaleString();
    if (p < 1) requestAnimationFrame(update);
  })(t0);
}

async function fetchGroup(groupId) {
  const res = await fetch(`https://corsproxy.io/?https://groups.roblox.com/v1/groups/${groupId}`);
  const data = await res.json();
  return { name: data.name, count: data.memberCount };
}

async function fetchExperience(univIds) {
  const url = `https://corsproxy.io/?https://games.roblox.com/v1/games?universeIds=${univIds.join(',')}`;
  const res = await fetch(url);
  const json = await res.json();
  let visits=0, playing=0;
  json.data.forEach(x => { visits += x.visits || 0; playing += x.playing || 0; });
  return { visits, playing };
}

async function updateStats() {
  loader.style.display = "block";
  try {
    const [g1, g2] = await Promise.all(groupIds.map(fetchGroup));
    group1NameEl.textContent = g1.name;
    animateCount(group1El, +group1El.textContent.replace(/,/g,''), g1.count);

    group2NameEl.textContent = g2.name;
    animateCount(group2El, +group2El.textContent.replace(/,/g,''), g2.count);

    const exp = await fetchExperience(experienceIds);
    animateCount(visitsEl, +visitsEl.textContent.replace(/,/g,''), exp.visits);
    animateCount(ccuEl, +ccuEl.textContent.replace(/,/g,''), exp.playing);
  } catch(e) {
    console.error(e);
  } finally {
    loader.style.display = "none";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  updateStats();
  setInterval(updateStats, 10000);
});
