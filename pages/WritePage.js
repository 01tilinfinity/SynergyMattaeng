import { getChampions } from "../services/State.js";

let selectedChampions = [];

function createChampionCard(champion) {
  const card = document.createElement("div");
  card.className = `champion-card cost-${champion.cost}`; // ✅ 코스트별 클래스

  card.innerHTML = `
    <div class="champion-image-wrapper">
      <img class="champion-image" src="${champion.image}" alt="${champion.name}" />
      <div class="champion-cost-tag">$${champion.cost}</div>  <!-- 우측 상단 -->
      <div class="champion-name">${champion.name}</div>       <!-- 하단 이름 -->
    </div>
  `;

  card.addEventListener("click", () => {
    if (selectedChampions.find((c) => c.id === champion.id)) {
      alert("이미 덱에 포함된 챔피언입니다!");
      return;
    }
    if (selectedChampions.length >= 10) {
      alert("챔피언은 최대 10명까지만 선택할 수 있어요!");
      return;
    }

    selectedChampions.push(champion);
    ensureTraitsAndRenderAll(); // ✅ 이걸로 교체!
  });

  return card;
}

function renderSelectedChampions() {
  const container = document.getElementById("selected-champions");
  container.innerHTML = ""; // 초기화

  selectedChampions.forEach((champion, index) => {
    const slot = document.createElement("div");
    slot.className = "selected-slot";

    slot.innerHTML = `
      <div class="selected-card cost-${champion.cost}">
        <div class="selected-image-wrapper">
          <img src="${champion.image}" class="selected-image" alt="${
      champion.name
    }" />
          <div class="selected-traits">
            ${champion.traits
              .map(
                (trait) => `
              <div class="trait-icon-wrapper">
                <img src="assets/traits/${
                  traitsData[trait]?.icon || "default.svg"
                }" class="trait-icon" alt="${trait}" />
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        <div class="selected-name-tag">${champion.name}</div>
      </div>
    `;

    // 🔁 클릭 시 제거
    slot.addEventListener("click", () => {
      selectedChampions.splice(index, 1);
      ensureTraitsAndRenderAll(); // 여기서도 교체!
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
    <div id="synergy-bar" class="synergy-bar"></div>
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

let traitsData = {};

function loadTraitsAndRenderSynergy() {
  fetch("data/traits.json")
    .then((res) => res.json())
    .then((data) => {
      traitsData = data;
      renderSynergyBar();
    });
}

function renderSynergyBar() {
  const synergyBar = document.getElementById("synergy-bar");
  synergyBar.innerHTML = "";

  const traitCount = {};

  // 1. 특성별 개수 집계
  selectedChampions.forEach((champ) => {
    champ.traits.forEach((trait) => {
      if (!traitCount[trait]) traitCount[trait] = 0;
      traitCount[trait]++;
    });
  });

  const tierPriority = {
    unique: 0,
    chromatic: 1,
    gold: 2,
    silver: 3,
    bronze: 4,
    darken: 5,
  };

  const traitArray = Object.entries(traitCount)
    .map(([trait, count]) => {
      const traitInfo = traitsData[trait];
      if (!traitInfo) return null;

      const thresholds = traitInfo.thresholds;
      const colors = traitInfo.colors;
      const tierIndex = thresholds.findLastIndex((t) => count >= t);
      const tierColor = tierIndex === -1 ? "darken" : colors[tierIndex];

      return {
        name: trait,
        count,
        tier: tierColor,
        tierOrder: tierPriority[tierColor],
        icon: traitInfo.icon,
        thresholds,
        activeTierIndex: tierIndex,
      };
    })
    .filter(Boolean);

  // ✅ 정렬 수행
  traitArray.sort((a, b) => {
    if (a.tierOrder !== b.tierOrder) return a.tierOrder - b.tierOrder;
    if (a.count !== b.count) return b.count - a.count;
    return a.name.localeCompare(b.name, "ko");
  });

  // 2. traits 순회
  traitArray.forEach((traitData) => {
    const {
      name: trait,
      count,
      thresholds,
      tier: tierColor,
      activeTierIndex: tierIndex,
      icon: iconName,
    } = traitData;

    const iconSrc = `assets/traits/${iconName}`;
    const bgSrc = `assets/trait-backgrounds/${tierColor}.svg`;

    const block = document.createElement("div");
    block.className = `synergy-block ${tierColor}`;

    // 🔸 Case 1: 시너지 조건 아직 안 됨
    if (tierIndex === -1) {
      // 🟪 darken 상태일 때 블럭 구성
      const iconWrapper = document.createElement("div");
      iconWrapper.className = "synergy-icon-wrapper";
      iconWrapper.style.position = "relative";
      iconWrapper.style.width = "28px";
      iconWrapper.style.height = "28px";

      const bgImg = document.createElement("img");
      bgImg.src = `assets/trait-backgrounds/darken.svg`;
      bgImg.style.width = "100%";
      bgImg.style.position = "absolute";

      const fgImg = document.createElement("img");
      fgImg.src = iconSrc;
      fgImg.style.width = "75%";
      fgImg.style.height = "75%";
      fgImg.style.position = "absolute";
      fgImg.style.top = "12.5%";
      fgImg.style.left = "12.5%";

      iconWrapper.appendChild(bgImg);
      iconWrapper.appendChild(fgImg);

      const header = document.createElement("div");
      header.className = "synergy-header";

      const nameSpan = document.createElement("span");
      nameSpan.className = "synergy-name";
      nameSpan.textContent = `${trait} ${count} / ${thresholds[0]}`;

      header.appendChild(iconWrapper);
      header.appendChild(nameSpan);

      block.appendChild(header);
      synergyBar.appendChild(block);
    } else {
      // ✅ 조건 만족 시: 기존 UI 렌더
      const header = document.createElement("div");
      header.className = "synergy-header";

      const iconWrapper = document.createElement("div");
      iconWrapper.className = "synergy-icon-wrapper";
      iconWrapper.style.position = "relative";
      iconWrapper.style.width = "28px";
      iconWrapper.style.height = "28px";

      const bgImg = document.createElement("img");
      bgImg.src = bgSrc;
      bgImg.style.width = "100%";
      bgImg.style.position = "absolute";

      const fgImg = document.createElement("img");
      fgImg.src = iconSrc;
      fgImg.style.width = "75%";
      fgImg.style.height = "75%";
      fgImg.style.position = "absolute";
      fgImg.style.top = "12.5%";
      fgImg.style.left = "12.5%";

      iconWrapper.appendChild(bgImg);
      iconWrapper.appendChild(fgImg);

      const countSpan = document.createElement("span");
      countSpan.className = "synergy-count";
      countSpan.textContent = count;

      const nameSpan = document.createElement("span");
      nameSpan.className = "synergy-name";
      nameSpan.textContent = trait;

      header.appendChild(iconWrapper);
      header.appendChild(countSpan);
      header.appendChild(nameSpan);

      const steps = document.createElement("div");
      steps.className = "synergy-steps";

      thresholds.forEach((step, i) => {
        const s = document.createElement("span");
        s.className = "step";
        s.textContent = step;
        if (i === tierIndex) s.classList.add("active");

        steps.appendChild(s);

        if (i < thresholds.length - 1) {
          const arrow = document.createElement("span");
          arrow.textContent = " > ";
          arrow.className = "step-arrow";
          steps.appendChild(arrow);
        }
      });

      block.appendChild(header);
      block.appendChild(steps);
      synergyBar.appendChild(block);
    }
  });
}

async function ensureTraitsAndRenderAll() {
  // traitsData가 비어 있으면 fetch
  if (!traitsData || Object.keys(traitsData).length === 0) {
    const res = await fetch("data/traits.json");
    traitsData = await res.json();
  }

  renderSelectedChampions();
  renderSynergyBar();
}
