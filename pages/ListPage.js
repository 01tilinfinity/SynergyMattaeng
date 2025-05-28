document.addEventListener("DOMContentLoaded", () => {
  let allDecks = [];
  let currentSort = "latest"; // 기본 정렬 기준

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

      // 번호
      const numberCell = document.createElement("td");
      numberCell.textContent = decks.length - index;

      // 덱 제목
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

      // 작성자
      const authorCell = document.createElement("td");
      authorCell.textContent = deck.username;

      // 작성일
      const dateCell = document.createElement("td");
      const formattedDate = new Date(deck.createdAt).toLocaleDateString();
      dateCell.textContent = formattedDate;

      // ✅ 추천 수
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

  // 🔍 검색 필터링 기능 추가
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

  // ✅ [추가] 검색 버튼 클릭 시도 동일한 필터링 수행
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

  // ✅ 정렬 버튼 이벤트 추가
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
