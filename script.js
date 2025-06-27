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
  const duration = 1000;
  const t0 = performance.now();
  function update(t) {
    const p = Math.min((t - t0) / duration, 1);
    const value = Math.floor(start + (end - start) * p);
    el.textContent = isNaN(value) ? '0' : value.toLocaleString();
    if (p < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

async function fetchGroup(groupId) {
  try {
    const response = await fetch(`https://corsproxy.io/?https://groups.roblox.com/v1/groups/${groupId}`);
    const data = await response.json();
    return {
      name: data.name || `Group ${groupId}`,
      count: data.memberCount || 0
    };
  } catch (error) {
    console.error("Group fetch failed for ID", groupId, error);
    return { name: `Group ${groupId}`, count: 0 };
  }
}

async function fetchExperienceStats(univIds) {
  try {
    const response = await fetch(`https://corsproxy.io/?https://games.roblox.com/v1/games?universeIds=${univIds.join(',')}`);
    const data = await response.json();
    let visits = 0;
    let playing = 0;

    if (Array.isArray(data.data)) {
      data.data.forEach(game => {
        visits += game.visits || 0;
        playing += game.playing || 0;
      });
    }

    return { visits, playing };
  } catch (error) {
    console.error("Experience stats fetch failed:", error);
    return { visits: 0, playing: 0 };
  }
}

function getNumberFromText(el) {
  const text = el.textContent || '0';
  const num = parseInt(text.replace(/,/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

async function updateStats() {
  loader.style.display = "block";
  try {
    const [group1, group2] = await Promise.all(groupIds.map(fetchGroup));
    group1NameEl.textContent = group1.name;
    group2NameEl.textContent = group2.name;

    animateCount(group1El, getNumberFromText(group1El), group1.count);
    animateCount(group2El, getNumberFromText(group2El), group2.count);

    const { visits, playing } = await fetchExperienceStats(experienceIds);
    animateCount(visitsEl, getNumberFromText(visitsEl), visits);
    animateCount(ccuEl, getNumberFromText(ccuEl), playing);
  } catch (err) {
    console.error("Update error:", err);
  } finally {
    loader.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  setInterval(updateStats, 10000); // Refresh every 10 seconds
});
