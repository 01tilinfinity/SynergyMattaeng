document.addEventListener("DOMContentLoaded", () => {
  let allDecks = [];
  let currentSort = "latest"; // 기본 정렬 기준

  // ✅ 로그인/회원가입 or 사용자 이름 렌더링 함수 추가
  function renderAuthArea() {
    const authArea = document.getElementById("auth-area");
    const username = sessionStorage.getItem("username");

    if (username) {
      authArea.innerHTML = `
        <span id="my-nickname" style="font-weight: bold; cursor: pointer; text-decoration: underline;">${username}</span> 님
        <button id="logout-btn">로그아웃</button>
      `;
      document.getElementById("logout-btn").addEventListener("click", () => {
        sessionStorage.removeItem("username");
        renderAuthArea();
        alert("로그아웃 되었습니다!");
      });

      // ✅ 닉네임 클릭 시 마이페이지로 이동
      document.getElementById("my-nickname").addEventListener("click", () => {
        window.location.href = "mypage.html";
      });

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
          if (!res.ok) throw new Error("HTTP 오류");
          return res.json();
        })
        .then((data) => {
          if (data.status === "ok") {
            sessionStorage.setItem("username", username);
            renderAuthArea();
            document.body.removeChild(modal);
            alert("로그인 성공!");
          } else {
            throw new Error("로그인 실패");
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

  // ✅ 실행
  renderAuthArea();

  const fetchAndRenderDecks = () => {
    fetch("http://localhost:8080/api/decks")
      .then((res) => res.json())
      .then((decks) => {
        allDecks = decks;
        applySortAndRender();
      })
      .catch((err) => {
        console.error("덱 불러오기 실패:", err);
        const tbody = document.getElementById("deck-tbody");
        tbody.innerHTML = "<tr><td colspan='5'>덱 목록을 불러오는 데 실패했습니다.</td></tr>";
      });
  };

  const applySortAndRender = () => {
    const decks = [...allDecks];

    if (currentSort === "latest") {
      decks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === "likes") {
      decks.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    } else if (currentSort === "name") {
      decks.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }

    renderDecks(decks);
  };

  const renderDecks = (decks) => {
    const tbody = document.getElementById("deck-tbody");
    tbody.innerHTML = "";

    decks.forEach((deck, index) => {
      const row = document.createElement("tr");

      const numberCell = document.createElement("td");
      numberCell.textContent = decks.length - index;

      const titleCell = document.createElement("td");
      const titleLink = document.createElement("a");
      titleLink.href = `doc.html?id=${deck.id}`;
      titleLink.textContent = deck.name;
      titleLink.style.color = "#207ac7";
      titleLink.style.textDecoration = "none";
      titleLink.style.fontWeight = "bold";
      titleLink.addEventListener("mouseover", () => titleLink.style.textDecoration = "underline");
      titleLink.addEventListener("mouseout", () => titleLink.style.textDecoration = "none");
      titleCell.appendChild(titleLink);

      const authorCell = document.createElement("td");
      authorCell.textContent = deck.username;

      const dateCell = document.createElement("td");
      const formattedDate = new Date(deck.createdAt).toLocaleDateString();
      dateCell.textContent = formattedDate;

      const likeCell = document.createElement("td");
      likeCell.textContent = deck.likes ?? 0;

      row.appendChild(numberCell);
      row.appendChild(titleCell);
      row.appendChild(authorCell);
      row.appendChild(dateCell);
      row.appendChild(likeCell);

      tbody.appendChild(row);
    });
  };

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allDecks.filter(
      (deck) =>
        deck.name.toLowerCase().includes(keyword) ||
        deck.username.toLowerCase().includes(keyword)
    );
    renderDecks(filtered);
  });

  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const keyword = searchInput.value.toLowerCase();
      const filtered = allDecks.filter(
        (deck) =>
          deck.name.toLowerCase().includes(keyword) ||
          deck.username.toLowerCase().includes(keyword)
      );
      renderDecks(filtered);
    });
  }

  const latestBtn = document.getElementById("sort-latest");
  const likesBtn = document.getElementById("sort-likes");
  const nameBtn = document.getElementById("sort-name");

  if (latestBtn) {
    latestBtn.addEventListener("click", () => {
      currentSort = "latest";
      applySortAndRender();
    });
  }

  if (likesBtn) {
    likesBtn.addEventListener("click", () => {
      currentSort = "likes";
      applySortAndRender();
    });
  }

  if (nameBtn) {
    nameBtn.addEventListener("click", () => {
      currentSort = "name";
      applySortAndRender();
    });
  }

  fetchAndRenderDecks();
});
