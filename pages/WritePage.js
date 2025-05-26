import { getChampions } from "../services/State.js";

let selectedChampions = [];
let traitsData = {};

function renderAuthArea() {
  const authArea = document.getElementById("auth-area");
  const username = sessionStorage.getItem("username");

  if (username) {
    authArea.innerHTML = `<span style="font-weight: bold;">${username} 님 안뇽하세용 👋</span>`;
  } else {
    authArea.innerHTML = `
      <button id="login-btn">로그인</button>
      <button id="signup-btn">회원가입</button>
    `;
    document.getElementById("login-btn").addEventListener("click", showLoginModal);
    document.getElementById("signup-btn").addEventListener("click", showSignupModal);
  }
}

function showLoginModal() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal">
      <h3>로그인</h3>
      <input type="text" id="login-username" placeholder="아이디" />
      <input type="password" id="login-password" placeholder="비밀번호" />
      <button id="login-submit">로그인</button>
      <button id="login-cancel">취소</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("login-submit").addEventListener("click", () => {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    fetch("http://localhost:8080/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("로그인 실패");
        return res.text();
      })
      .then(() => {
        sessionStorage.setItem("username", username);
        renderAuthArea();
        document.body.removeChild(modal);
        alert("로그인 성공!");
      })
      .catch(() => alert("로그인 실패!"));
  });

  document.getElementById("login-cancel").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
}

function showSignupModal() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal">
      <h3>회원가입</h3>
      <input type="text" id="signup-username" placeholder="아이디" />
      <input type="password" id="signup-password" placeholder="비밀번호" />
      <input type="password" id="signup-password-confirm" placeholder="비밀번호 확인" />
      <button id="signup-submit">가입하기</button>
      <button id="signup-cancel">취소</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("signup-submit").addEventListener("click", () => {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-password-confirm").value;

    if (password !== confirm) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }

    fetch("http://localhost:8080/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("회원가입 실패");
        return res.text();
      })
      .then(() => {
        alert("회원가입 성공! 로그인 해주세요.");
        document.body.removeChild(modal);
      })
      .catch(() => alert("회원가입 실패"));
  });

  document.getElementById("signup-cancel").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
}

function createChampionCard(champion) {
  const card = document.createElement("div");
  card.className = `champion-card cost-${champion.cost}`;

  card.innerHTML = `
    <div class="champion-image-wrapper">
      <img class="champion-image" src="${champion.image}" alt="${champion.name}" />
      <div class="champion-cost-tag">$${champion.cost}</div>
      <div class="champion-name">${champion.name}</div>
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
    ensureTraitsAndRenderAll();
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
      <div class="selected-card cost-${champion.cost}">
        <div class="selected-image-wrapper">
          <img src="${champion.image}" class="selected-image" alt="${champion.name}" />
          <div class="selected-traits">
            ${champion.traits
              .map(
                (trait) => `
              <div class="trait-icon-wrapper">
                <img src="assets/traits/${traitsData[trait]?.icon || "default.svg"}" class="trait-icon" alt="${trait}" />
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        <div class="selected-name-tag">${champion.name}</div>
      </div>
    `;

    slot.addEventListener("click", () => {
      selectedChampions.splice(index, 1);
      ensureTraitsAndRenderAll();
    });

    container.appendChild(slot);
  });
}

export async function renderWritePage() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div id="auth-area" style="display: flex; justify-content: flex-end; margin-bottom: 10px;"></div> <!-- ✅ 로그인 영역 -->
    <h1>챔피언 선택</h1>
    <input id="deck-name" type="text" placeholder="덱 이름을 입력하세요" />
    <h3>선택한 챔피언 (최대 10명)</h3>
    <div id="synergy-bar" class="synergy-bar"></div>
    <div id="selected-champions" class="selected-container"></div>
    <h3>챔피언 목록</h3>
    <div id="champion-list" class="champion-list"></div>
  `;

  renderAuthArea(); // ✅ 로그인 UI 표시

  const champions = await getChampions();
  const list = document.getElementById("champion-list");
  champions.forEach((champ) => {
    const card = createChampionCard(champ);
    list.appendChild(card);
  });
}

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

  traitArray.sort((a, b) => {
    if (a.tierOrder !== b.tierOrder) return a.tierOrder - b.tierOrder;
    if (a.count !== b.count) return b.count - a.count;
    return a.name.localeCompare(b.name, "ko");
  });

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

    const header = document.createElement("div");
    header.className = "synergy-header";

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "synergy-icon-wrapper";
    iconWrapper.style.position = "relative";
    iconWrapper.style.width = "28px";
    iconWrapper.style.height = "28px";

    const bgImg = document.createElement("img");
    bgImg.src = tierIndex === -1 ? `assets/trait-backgrounds/darken.svg` : bgSrc;
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

    if (tierIndex === -1) {
      const nameSpan = document.createElement("span");
      nameSpan.className = "synergy-name";
      nameSpan.textContent = `${trait} ${count} / ${thresholds[0]}`;
      header.appendChild(iconWrapper);
      header.appendChild(nameSpan);
      block.appendChild(header);
    } else {
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
    }

    synergyBar.appendChild(block);
  });
}

async function ensureTraitsAndRenderAll() {
  if (!traitsData || Object.keys(traitsData).length === 0) {
    const res = await fetch("data/traits.json");
    traitsData = await res.json();
  }

  renderSelectedChampions();
  renderSynergyBar();
}
