// pages/MyPage.js

document.addEventListener("DOMContentLoaded", () => {
  const username = sessionStorage.getItem("username");
  const tbody = document.getElementById("deck-tbody");

  if (!username) {
    tbody.innerHTML = `
      <tr><td colspan="4">로그인한 사용자만 접근할 수 있습니다.</td></tr>
    `;
    return;
  }

  fetch("http://localhost:8080/api/decks")
    .then((res) => res.json())
    .then((allDecks) => {
      const userDecks = allDecks.filter(deck => deck.username === username);

      if (userDecks.length === 0) {
        tbody.innerHTML = `
          <tr><td colspan="4">작성한 덱이 없습니다.</td></tr>
        `;
        return;
      }

      // 최신순 정렬
      userDecks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      userDecks.forEach((deck, index) => {
        const row = document.createElement("tr");

        // 번호
        const numberCell = document.createElement("td");
        numberCell.textContent = userDecks.length - index;

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

        // 작성일
        const dateCell = document.createElement("td");
        dateCell.textContent = new Date(deck.createdAt).toLocaleDateString();

        // 추천수
        const likesCell = document.createElement("td");
        likesCell.textContent = deck.likes ?? 0;

        row.appendChild(numberCell);
        row.appendChild(titleCell);
        row.appendChild(dateCell);
        row.appendChild(likesCell);

        tbody.appendChild(row);
      });
    })
    .catch((err) => {
      console.error("마이페이지 덱 조회 실패:", err);
      tbody.innerHTML = `
        <tr><td colspan="4">덱 데이터를 불러오지 못했습니다.</td></tr>
      `;
    });
});
