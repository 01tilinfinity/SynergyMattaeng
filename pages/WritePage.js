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
    if (selectedChampions.find((c) => c.id === champion.id)) return;

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
  const container = document.getElementById("selected-champions");
  container.innerHTML = "";

  selectedChampions.forEach((champion, index) => {
    const slot = document.createElement("div");
    slot.className = "selected-slot";
    slot.innerHTML = `
      <img src="${champion.image}" alt="${champion.name}" />
      <p>${champion.name}</p>
    `;

    slot.addEventListener("click", () => {
      selectedChampions.splice(index, 1);
      renderSelectedChampions();
    });

    container.appendChild(slot);
  });
}

export function renderWritePage() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>덱 이름 작성</h2>
    <input id="deck-name" type="text" placeholder="덱 이름을 입력하세요" />
    <h3>선택한 챔피언 (최대 10명)</h3>
    <div id="selected-champions" class="selected-container"></div>
    <h3>챔피언 목록</h3>
    <div id="champion-list" class="champion-list"></div>
  `;

  getChampions().then((champions) => {
    const list = document.getElementById("champion-list");
    champions.forEach((champ) => {
      const card = createChampionCard(champ);
      list.appendChild(card);
    });
  });
}
