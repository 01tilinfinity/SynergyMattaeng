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
    <h1 id="deck-title">덱 상세 보기</h1>
    <div id="likes-info" style="margin-bottom: 10px; font-size: 16px; font-weight: bold;"></div>
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

  // ✅ 제목 업데이트
  document.getElementById("deck-title").textContent = deck.name;

  // ✅ 추천 수 표시
  const likesInfo = document.getElementById("likes-info");
  likesInfo.textContent = `❤️ 추천 수: ${deck.likes}`;

  // ✅ 추천 버튼 조건부 노출
  const username = sessionStorage.getItem("username");
  const likeBtn = document.getElementById("like-button");
  const likedKey = `liked_${deckId}`;

  if (username && username !== deck.username) {
    const alreadyLiked = localStorage.getItem(likedKey);

    if (alreadyLiked) {
      likeBtn.disabled = true;
      likeBtn.textContent = "❤️ 이미 추천함";
      likeBtn.style.display = "inline-block";
    } else {
      likeBtn.style.display = "inline-block";
      likeBtn.onclick = () => {
        if (localStorage.getItem(likedKey)) {
          alert("이미 좋아요 한 게시글입니다.");
          return;
        }

        fetch(`http://localhost:8080/api/decks/${deckId}/like`, {
          method: "POST"
        })
          .then((res) => {
            if (!res.ok) throw new Error("추천 실패");
            return res.json();
          })
          .then((updatedDeck) => {
            localStorage.setItem(likedKey, "true");
            document.getElementById("likes-info").textContent = `❤️ 추천 수: ${updatedDeck.likes}`;
            likeBtn.textContent = "❤️ 이미 추천함";
            likeBtn.disabled = true;
            alert("추천했습니다!");
          })
          .catch(() => alert("추천에 실패했습니다."));
      };
    }
  } else if (username === deck.username) {
    likeBtn.style.display = "inline-block";
    likeBtn.onclick = () => {
      alert("내 게시글에는 좋아요를 누를 수 없어요!");
    };
  }

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

  // ← 목록으로 돌아가기 버튼은 유지하지 않음 (요청에 따라 주석 처리된 상태)
}
