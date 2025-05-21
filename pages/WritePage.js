import { getChampions } from "../services/State.js";

let selectedChampions = [];

function createChampionCard(champion) {
  const card = document.createElement("div");
  card.className = "champion-card";
  card.innerHTML = `
    <img src="${champion.image}" alt="${champion.name}" />
    <p>${champion.name}</p>
    <p>$${champion.cost}</p>
  `;

  card.addEventListener("click", () => {
    if (selectedChampions.find((c) => c.id === champion.id)) {
      // 이미 선택된 챔피언이면 무시
      return;
    }
    if (selectedChampions.length >= 10) {
      alert("챔피언은 최대 10명까지만 선택할 수 있어요!");
      return;
    }

    selectedChampions.push(champion);
    renderSelectedChampions();
  });

  return card;
}

function renderSelectedChampions() {
  const selectedContainer = document.getElementById("selected-champions");
  selectedContainer.innerHTML = "";

  selectedChampions.forEach((champion, index) => {
    const slot = document.createElement("div");
    slot.className = "selected-slot";
    slot.innerHTML = `
      <img src="${champion.image}" alt="${champion.name}" />
      <p>${champion.name}</p>
    `;

    slot.addEventListener("click", () => {
      selectedChampions.splice(index, 1); // 제거
      renderSelectedChampions();
    });

    selectedContainer.appendChild(slot);
  });
}

export function renderWritePage() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>덱 작성</h2>
    <div id="selected-champions" class="selected-container"></div>
    <div id="champion-list" class="champion-list"></div>
  `;

  getChampions().then((champions) => {
    const championList = document.getElementById("champion-list");
    champions.forEach((champion) => {
      const card = createChampionCard(champion);
      championList.appendChild(card);
    });
  });
}
