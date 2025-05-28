import { getChampions } from "../services/State.js";

let selectedChampions = [];
let traitsData = {};
let allChampions = [];
let currentSort = "cost";
let currentSortButton = null;

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
    document
      .getElementById("login-btn")
      .addEventListener("click", showLoginModal);
    document
      .getElementById("signup-btn")
      .addEventListener("click", showSignupModal);
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
        if (!res.ok) throw new Error("HTTP 오류"); // HTTP 오류 처리
        return res.json(); // ✅ JSON 파싱
      })
      .then((data) => {
        if (data.status === "ok") {
          sessionStorage.setItem("username", username);
          renderAuthArea();
          document.body.removeChild(modal);
          alert("로그인 성공!");
        } else {
          throw new Error("로그인 실패"); // 서버에서 status: error 받은 경우
        }
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
      <div id="username-error" class="error-msg" style="color: red; font-size: 13px; display: none;"></div>

      <input type="password" id="signup-password" placeholder="비밀번호" />
      <input type="password" id="signup-password-confirm" placeholder="비밀번호 확인" />
      <div id="password-error" class="error-msg" style="color: red; font-size: 13px; display: none;"></div>

      <button id="signup-submit">가입하기</button>
      <button id="signup-cancel">취소</button>
    </div>
  `;
  document.body.appendChild(modal);

  const usernameInput = document.getElementById("signup-username");
  const passwordInput = document.getElementById("signup-password");
  const confirmInput = document.getElementById("signup-password-confirm");
  const usernameError = document.getElementById("username-error");
  const passwordError = document.getElementById("password-error");

  document.getElementById("signup-submit").addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    usernameError.style.display = "none";
    passwordError.style.display = "none";

    if (password !== confirm) {
      passwordError.textContent = "비밀번호가 달라요.";
      passwordError.style.display = "block";
      return;
    }

    fetch("http://localhost:8080/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "회원가입 실패");
        alert("회원가입 성공! 로그인 해주세요.");
        document.body.removeChild(modal);
      })
      .catch((err) => {
        if (err.message === "이미 존재하는 닉네임입니다.") {
          usernameError.textContent = err.message;
          usernameError.style.display = "block";
        } else {
          alert("회원가입 실패");
        }
      });
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
      <img src="${champion.image}" class="champion-image" alt="${champion.name}" />
      <div class="champion-hover-overlay"></div>
    </div>
    <p class="champion-name">${champion.name}</p>
    <div class="champion-cost-tag">$${champion.cost}</div>
  `;

  const overlay = card.querySelector(".champion-hover-overlay");
  const traitGroup = document.createElement("div");
  traitGroup.className = "hover-trait-group";

  champion.traits.forEach((trait) => {
    const traitInfo = traitsData[trait];
    if (!traitInfo) return;

    const row = document.createElement("div");
    row.className = "hover-trait-row";

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "hover-trait-icon-wrapper";

    const icon = document.createElement("img");
    icon.className = "hover-trait-icon";
    icon.src = `assets/traits/${traitInfo.icon}`;
    icon.alt = trait;
    icon.title = trait;

    const label = document.createElement("span");
    label.className = "hover-trait-label";
    label.textContent = trait;

    iconWrapper.appendChild(icon);
    row.appendChild(iconWrapper);
    row.appendChild(label);
    traitGroup.appendChild(row);
  });

  overlay.appendChild(traitGroup);

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

function renderChampionList() {
  const list = document.getElementById("champion-list");
  list.className = "champion-list price-mode"; // 💡 가격/이름순용
  list.innerHTML = "";

  let sorted = [...allChampions];
  if (currentSort === "cost") {
    sorted.sort(
      (a, b) => a.cost - b.cost || a.name.localeCompare(b.name, "ko")
    );
  } else if (currentSort === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }

  sorted.forEach((champ) => {
    const card = createChampionCard(champ);
    list.appendChild(card);
  });
}

// 특성별 정렬 챔피언 목록 렌더링 함수 (아이콘 클래스 분리)
function renderTraitSortedChampions() {
  const list = document.getElementById("champion-list");
  list.className = "champion-list trait-mode"; // 💡 특성별용
  list.innerHTML = "";

  const traitMap = {};
  allChampions.forEach((champion) => {
    champion.traits.forEach((trait) => {
      if (!traitMap[trait]) traitMap[trait] = [];
      traitMap[trait].push(champion);
    });
  });

  const traitNames = Object.keys(traitMap).sort((a, b) =>
    a.localeCompare(b, "ko")
  );

  traitNames.forEach((trait) => {
    const group = document.createElement("div");
    group.className = "trait-group";

    const traitInfo = traitsData[trait];
    const header = document.createElement("div");
    header.className = "trait-header";

    const icon = document.createElement("img");
    icon.className = "trait-section-icon";
    icon.src = `assets/traits/${traitInfo.icon}`;
    icon.alt = trait;

    const title = document.createElement("div");
    title.className = "trait-title";
    title.textContent = `${trait} (${traitInfo.thresholds.join(" / ")})`;

    header.appendChild(icon);
    header.appendChild(title);
    group.appendChild(header);

    const champList = document.createElement("div");
    champList.className = "trait-champion-list";
    champList.style.marginBottom = "16px";

    traitMap[trait]
      .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name, "ko"))
      .forEach((champion) => {
        const card = createChampionCard(champion);
        champList.appendChild(card);
      });

    group.appendChild(champList);
    list.appendChild(group);
  });
}

function renderSortButtons() {
  const list = document.getElementById("champion-list");
  const buttonWrap = document.createElement("div");
  buttonWrap.style.display = "flex";
  buttonWrap.style.gap = "6px";
  buttonWrap.style.marginBottom = "12px";

  const costBtn = document.createElement("button");
  costBtn.textContent = "가격순";
  costBtn.className = "sort-button";
  costBtn.onclick = () => {
    currentSort = "cost";
    updateSortButtonStyle(costBtn);
    renderChampionList();
  };

  const nameBtn = document.createElement("button");
  nameBtn.textContent = "이름순";
  nameBtn.className = "sort-button";
  nameBtn.onclick = () => {
    currentSort = "name";
    updateSortButtonStyle(nameBtn);
    renderChampionList();
  };

  const traitBtn = document.createElement("button");
  traitBtn.textContent = "특성별";
  traitBtn.className = "sort-button";
  traitBtn.onclick = () => {
    currentSort = "trait";
    updateSortButtonStyle(traitBtn);
    renderTraitSortedChampions(); // 이 함수가 방금 추가된 핵심!
  };

  buttonWrap.appendChild(costBtn);
  buttonWrap.appendChild(nameBtn);
  buttonWrap.appendChild(traitBtn);
  list.before(buttonWrap);

  // 기본 선택 강조 초기화
  updateSortButtonStyle(costBtn);
}

function updateSortButtonStyle(activeButton) {
  if (currentSortButton) {
    currentSortButton.classList.remove("active-sort-button");
  }
  activeButton.classList.add("active-sort-button");
  currentSortButton = activeButton;
}

function renderSelectedChampions() {
  const container = document.getElementById("selected-champions");
  container.innerHTML = "";

  // 정렬: cost 오름차순 → 이름 오름차순
  const sorted = [...selectedChampions].sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    return a.name.localeCompare(b.name, "ko");
  });

  sorted.forEach((champion, index) => {
    const slot = document.createElement("div");
    slot.className = "selected-slot";

    slot.innerHTML = `
      <div class="selected-card cost-${champion.cost}">
        <div class="selected-image-wrapper">
          <img src="${
            champion.hqImage || champion.image
          }" class="selected-image" alt="${champion.name}" />
          <div class="selected-traits">
            ${champion.traits
              .map(
                (trait) => `
              <div class="trait-icon-wrapper">
                <img src="assets/traits/${
                  traitsData[trait]?.icon || "default.svg"
                }" class="trait-icon" alt="${trait}" />
              </div>`
              )
              .join("")}
          </div>
        </div>
        <div class="selected-name-tag">${champion.name}</div>
      </div>
    `;

    slot.addEventListener("click", () => {
      selectedChampions = selectedChampions.filter((c) => c.id !== champion.id);
      ensureTraitsAndRenderAll();
    });

    container.appendChild(slot);
  });
}

export async function renderWritePage() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="auth-area" style="display: flex; justify-content: flex-end; margin-bottom: 10px;"></div>
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
      <div style="
        background-color: #1428a0;
        color: white;
        font-weight: bold;
        font-size: 24px;
        font-family: 'Roboto Condensed', sans-serif;
        padding: 10px 30px;
        border-radius: 50% / 50%;
        transform: skewX(-20deg);
        margin-right: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 48px;
      ">
        <span style="transform: skewX(20deg); display: inline-block;">SynergyMattaeng</span>
      </div>
      <h1 style="margin: 0;">챔피언 선택</h1>
    </div>
    <div style="display: flex; justify-content: center; margin: 40px 0 20px;">
      <input
        id="deck-name"
        type="text"
        placeholder="덱 이름을 입력하세요"
        style="
          padding: 14px 20px;
          font-size: 16px;
          border: 3px solid #1428a0;
          border-radius: 12px;
          width: 80%;
          max-width: 800px;
          box-sizing: border-box;
        "
      />
    </div>

    <h3>선택한 챔피언 (최대 10명)</h3>
    <div id="synergy-bar" class="synergy-bar"></div>
    <div id="selected-champions" class="selected-container"></div>
    <h3>챔피언 목록</h3>
    <div id="champion-list" class="champion-list"></div>
  `;

  renderAuthArea();
  const traitsRes = await fetch("data/traits.json");
  traitsData = await traitsRes.json();
  allChampions = await getChampions(); // 🔹 챔피언 전체 저장
  renderSortButtons(); // 🔹 버튼 먼저
  renderChampionList(); // 🔹 정렬된 챔피언 렌더링
  renderSynergyBar();
  renderSubmitButton(); // 덱 등록 버튼 추가
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
    .filter(Boolean)
    .sort((a, b) => {
      if (a.tierOrder !== b.tierOrder) return a.tierOrder - b.tierOrder;
      if (a.count !== b.count) return b.count - a.count;
      return a.name.localeCompare(b.name, "ko");
    });

  traitArray.forEach(
    ({ name, count, thresholds, tier, activeTierIndex, icon }) => {
      const iconSrc = `assets/traits/${icon}`;
      const bgSrc = `assets/trait-backgrounds/${tier}.svg`;

      const block = document.createElement("div");
      block.className = `synergy-block ${tier}`;

      const iconWrapper = document.createElement("div");
      iconWrapper.className = "synergy-icon-wrapper";
      iconWrapper.style = "position: relative; width: 28px; height: 28px;";

      const bg = document.createElement("img");
      bg.src =
        activeTierIndex === -1 ? `assets/trait-backgrounds/darken.svg` : bgSrc;
      bg.style = "width: 100%; position: absolute;";

      const fg = document.createElement("img");
      fg.src = iconSrc;
      fg.style =
        "width: 75%; height: 75%; position: absolute; top: 12.5%; left: 12.5%;";

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

      synergyBar.append(block);
    }
  );
}

async function ensureTraitsAndRenderAll() {
  if (!traitsData || Object.keys(traitsData).length === 0) {
    const res = await fetch("data/traits.json");
    traitsData = await res.json();
  }

  renderSelectedChampions();
  renderSynergyBar();
}

function renderSubmitButton() {
  const button = document.createElement("button");
  button.textContent = "덱 등록하기";
  button.style.marginTop = "20px";
  button.addEventListener("click", () => {
    const deckName = document.getElementById("deck-name").value.trim();
    const username = sessionStorage.getItem("username");
    if (!username) return alert("로그인이 필요합니다!");
    if (!deckName) return alert("덱 이름을 입력하세요!");
    if (selectedChampions.length === 0) return alert("챔피언을 선택하세요!");

    // 등록 시 → champions를 문자열이 아니라 배열로 그대로 보내야 함
    const deck = {
      name: deckName,
      username,
      champions: selectedChampions.map((c) => c.id), // ✅ JSON.stringify 제거
    };

    fetch("http://localhost:8080/api/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deck),
    })
      .then((res) => {
        if (!res.ok) throw new Error("등록 실패");
        alert("덱이 등록되었습니다!");
        location.href = "list.html";
      })
      .catch(() => alert("덱 등록 실패"));
  });

  document.getElementById("app").appendChild(button);
}
