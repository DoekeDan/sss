const loader = document.getElementById("loader");
const group1El = document.getElementById("group1-count");
const group2El = document.getElementById("group2-count");
const visitsEl = document.getElementById("total-visits");
const ccuEl = document.getElementById("total-ccu");

const groupIds = [4413376, 7040243];
const experienceIds = [
  "130445913533770",
  "135060580071597",
  "123875295828804",
];

function animateCount(element, start, end) {
  const duration = 800;
  const startTime = performance.now();

  function update(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const value = Math.floor(start + (end - start) * progress);
    element.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

async function fetchGroupMemberCount(groupId) {
  const res = await fetch(`https://corsproxy.io/?https://groups.roblox.com/v1/groups/${groupId}`);
  const data = await res.json();
  return data.memberCount || 0;
}

async function fetchExperienceStats(universeId) {
  const res = await fetch(`https://corsproxy.io/?https://games.roblox.com/v1/games?universeIds=${universeId}`);
  const data = await res.json();
  const game = data.data[0];
  return {
    visits: game.visits || 0,
    playing: game.playing || 0
  };
}

async function updateStats() {
  loader.style.display = "block";

  try {
    const [group1, group2] = await Promise.all(groupIds.map(fetchGroupMemberCount));
    animateCount(group1El, parseInt(group1El.textContent.replace(/,/g, '')) || 0, group1);
    animateCount(group2El, parseInt(group2El.textContent.replace(/,/g, '')) || 0, group2);

    let totalVisits = 0;
    let totalCCU = 0;

    for (let id of experienceIds) {
      const { visits, playing } = await fetchExperienceStats(id);
      totalVisits += visits;
      totalCCU += playing;
    }

    animateCount(visitsEl, parseInt(visitsEl.textContent.replace(/,/g, '')) || 0, totalVisits);
    animateCount(ccuEl, parseInt(ccuEl.textContent.replace(/,/g, '')) || 0, totalCCU);
  } catch (err) {
    console.error("Error fetching stats:", err);
  } finally {
    loader.style.display = "none";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  updateStats();
  setInterval(updateStats, 10000); // every 10s
});
