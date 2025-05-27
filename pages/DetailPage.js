// ✅ doc.html에 들어갈 doc.js
// 덱 ID 기반으로 챔피언 시너지와 선택된 챔피언들을 WritePage.js와 동일한 형식으로 렌더링

import { getChampions } from "../services/State.js";

let traitsData = {};
let allChampions = [];

function getDeckIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

export async function renderDeckDetailPage() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="auth-area" style="display: flex; justify-content: flex-end; margin-bottom: 10px;"></div>
    <h1>덱 상세 보기</h1>
    <div id="synergy-bar" class="synergy-bar"></div>
    <div id="selected-champions" class="selected-container"></div>
  `;

  const deckId = getDeckIdFromURL();
  if (!deckId) {
    app.innerHTML = "<p>덱 ID가 없습니다.</p>";
    return;
  }

  renderAuthArea();

  const traitsRes = await fetch("data/traits.json");
  traitsData = await traitsRes.json();
  allChampions = await getChampions();

  const res = await fetch(`http://localhost:8080/api/decks/${deckId}`);
  const deck = await res.json();

  let championIds = [];
  try {
    championIds = JSON.parse(deck.champions);
  } catch (e) {
    document.getElementById("synergy-bar").innerHTML = "<p>챔피언 정보 파싱 실패</p>";
    return;
  }

  const selectedChampions = championIds
    .map((id) => allChampions.find((c) => c.id === id))
    .filter(Boolean);

  renderSynergyBar(document.getElementById("synergy-bar"), selectedChampions);
  renderSelectedChampions(document.getElementById("selected-champions"), selectedChampions);
}

function renderSynergyBar(container, selectedChampions) {
  container.innerHTML = "";
  const traitCount = {};

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
    .filter(Boolean)
    .sort((a, b) => {
      if (a.tierOrder !== b.tierOrder) return a.tierOrder - b.tierOrder;
      if (a.count !== b.count) return b.count - a.count;
      return a.name.localeCompare(b.name, "ko");
    });

  traitArray.forEach(({ name, count, thresholds, tier, activeTierIndex, icon }) => {
    const iconSrc = `assets/traits/${icon}`;
    const bgSrc = `assets/trait-backgrounds/${tier}.svg`;

    const block = document.createElement("div");
    block.className = `synergy-block ${tier}`;

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "synergy-icon-wrapper";
    iconWrapper.style = "position: relative; width: 28px; height: 28px;";

    const bg = document.createElement("img");
    bg.src = activeTierIndex === -1 ? `assets/trait-backgrounds/darken.svg` : bgSrc;
    bg.style = "width: 100%; position: absolute;";

    const fg = document.createElement("img");
    fg.src = iconSrc;
    fg.style = "width: 75%; height: 75%; position: absolute; top: 12.5%; left: 12.5%;";

    iconWrapper.append(bg, fg);

    const header = document.createElement("div");
    header.className = "synergy-header";
    header.append(iconWrapper);

    if (activeTierIndex === -1) {
      const nameSpan = document.createElement("span");
      nameSpan.className = "synergy-name";
      nameSpan.textContent = `${name} ${count} / ${thresholds[0]}`;
      header.append(nameSpan);
      block.append(header);
    } else {
      const countSpan = document.createElement("span");
      countSpan.className = "synergy-count";
      countSpan.textContent = count;

      const nameSpan = document.createElement("span");
      nameSpan.className = "synergy-name";
      nameSpan.textContent = name;

      const steps = document.createElement("div");
      steps.className = "synergy-steps";

      thresholds.forEach((step, i) => {
        const s = document.createElement("span");
        s.className = "step";
        s.textContent = step;
        if (i === activeTierIndex) s.classList.add("active");
        steps.appendChild(s);

        if (i < thresholds.length - 1) {
          const arrow = document.createElement("span");
          arrow.textContent = " > ";
          arrow.className = "step-arrow";
          steps.appendChild(arrow);
        }
      });

      header.append(countSpan, nameSpan);
      block.append(header, steps);
    }

    container.appendChild(block);
  });
}

function renderSelectedChampions(container, selectedChampions) {
  container.innerHTML = "";
  const sorted = [...selectedChampions].sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    return a.name.localeCompare(b.name, "ko");
  });

  sorted.forEach((champion) => {
    const slot = document.createElement("div");
    slot.className = "selected-slot";

    slot.innerHTML = `
      <div class="selected-card cost-${champion.cost}">
        <div class="selected-image-wrapper">
          <img src="${champion.hqImage || champion.image}" class="selected-image" alt="${champion.name}" />
          <div class="selected-traits">
            ${champion.traits.map(trait => `
              <div class="trait-icon-wrapper">
                <img src="assets/traits/${traitsData[trait]?.icon || "default.svg"}" class="trait-icon" alt="${trait}" />
              </div>`).join("")}
          </div>
        </div>
        <div class="selected-name-tag">${champion.name}</div>
      </div>
    `;

    container.appendChild(slot);
  });
}

function renderAuthArea() {
  const authArea = document.getElementById("auth-area");
  const username = sessionStorage.getItem("username");

  if (username) {
    authArea.innerHTML = `
      <span style="font-weight: bold;">${username} 님 안뇽하세용 👋</span>
      <button id="logout-btn">로그아웃</button>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => {
      sessionStorage.removeItem("username");
      renderAuthArea();
      alert("로그아웃 되었습니다!");
    });
  } else {
    authArea.innerHTML = `
      <button id="login-btn">로그인</button>
      <button id="signup-btn">회원가입</button>
    `;
    document.getElementById("login-btn").addEventListener("click", () => alert("로그인 기능은 index.html에서 이용해주세요."));
    document.getElementById("signup-btn").addEventListener("click", () => alert("회원가입 기능은 index.html에서 이용해주세요."));
  }
  const backButton = document.createElement("a");
  backButton.href = "list.html";
  backButton.textContent = "← 목록으로 돌아가기";
  backButton.style.display = "inline-block";
  backButton.style.marginTop = "20px";
  backButton.style.fontWeight = "bold";
  backButton.style.color = "#207ac7";
  backButton.style.textDecoration = "none";

  backButton.addEventListener("mouseover", () => {
  backButton.style.textDecoration = "underline";
  });
  backButton.addEventListener("mouseout", () => {
  backButton.style.textDecoration = "none";
  });

  app.appendChild(backButton);

}
