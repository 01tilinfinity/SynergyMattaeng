import { getChampions } from "../services/State.js";

let selectedChampions = [];

function createChampionCard(champion) {
  const card = document.createElement("div");
  card.className = "champion-card";

  const img = document.createElement("img");
  img.src = champion.image;
  img.alt = champion.name;

  const name = document.createElement("p");
  name.textContent = champion.name;

  const cost = document.createElement("p");
  cost.textContent = `Cost: ${champion.cost}`;

  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(cost);

  // 🟡 카드 클릭 시 선택 처리
  card.addEventListener("click", () => {
    const alreadySelected = selectedChampions.find((c) => c.id === champion.id);
    if (alreadySelected) {
      alert("이미 덱에 포함된 챔피언입니다!");
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
  const container = document.getElementById("selected-champions");
  container.innerHTML = ""; // 초기화

  selectedChampions.forEach((champion, index) => {
    const slot = document.createElement("div");
    slot.className = "selected-slot";

    const img = document.createElement("img");
    img.src = champion.image;
    img.alt = champion.name;

    const name = document.createElement("p");
    name.textContent = champion.name;

    slot.appendChild(img);
    slot.appendChild(name);

    // 🟠 클릭하면 제거
    slot.addEventListener("click", () => {
      selectedChampions.splice(index, 1);
      renderSelectedChampions();
    });

    container.appendChild(slot);
  });
}

export async function renderWritePage() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h1>챔피언 선택</h1>
    <input id="deck-name" type="text" placeholder="덱 이름을 입력하세요" />
    <h3>선택한 챔피언 (최대 10명)</h3>
    <div id="selected-champions" class="selected-container"></div>
    <h3>챔피언 목록</h3>
    <div id="champion-list" class="champion-list"></div>
  `;

  console.log("[DEBUG] renderWritePage 시작");

  const champions = await getChampions();
  console.log("[DEBUG] 불러온 챔피언 수:", champions.length);
  console.log(champions); // 챔피언 데이터 확인

  const list = document.getElementById("champion-list");

  champions.forEach((champ) => {
    const card = createChampionCard(champ);
    list.appendChild(card);
  });
}
