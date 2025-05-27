document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:8080/api/decks")
    .then((res) => res.json())
    .then((decks) => {
      const list = document.getElementById("deck-list");

      decks.forEach((deck) => {
        const item = document.createElement("div");
        item.style.border = "1px solid #ccc";
        item.style.padding = "10px";
        item.style.marginBottom = "10px";
        item.style.backgroundColor = "#fff";
        item.style.borderRadius = "8px";
        item.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";

        // ✅ 제목 링크
        const titleLink = document.createElement("a");
        titleLink.href = `doc.html?id=${deck.id}`;
        titleLink.textContent = deck.name;
        titleLink.style.fontSize = "18px";
        titleLink.style.fontWeight = "bold";
        titleLink.style.color = "#207ac7";
        titleLink.style.textDecoration = "none";
        titleLink.addEventListener("mouseover", () => titleLink.style.textDecoration = "underline");
        titleLink.addEventListener("mouseout", () => titleLink.style.textDecoration = "none");

        // ✅ 작성자
        const author = document.createElement("p");
        author.innerHTML = `<strong>작성자:</strong> ${deck.username}`;

        // ✅ 작성일
        const date = document.createElement("p");
        const formattedDate = new Date(deck.createdAt).toLocaleDateString();
        date.innerHTML = `<strong>작성일:</strong> ${formattedDate}`;

        item.appendChild(titleLink);
        item.appendChild(author);
        item.appendChild(date);

        list.appendChild(item);
      });
    })
    .catch((err) => {
      console.error("덱 불러오기 실패:", err);
      const list = document.getElementById("deck-list");
      list.innerHTML = "<p>덱 목록을 불러오는 데 실패했습니다.</p>";
    });
});
