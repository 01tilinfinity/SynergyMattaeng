document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:8080/api/decks")
    .then((res) => res.json())
    .then((decks) => {
      const tbody = document.getElementById("deck-tbody");

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

        row.appendChild(numberCell);
        row.appendChild(titleCell);
        row.appendChild(authorCell);
        row.appendChild(dateCell);

        tbody.appendChild(row);
      });
    })
    .catch((err) => {
      console.error("덱 불러오기 실패:", err);
      const tbody = document.getElementById("deck-tbody");
      tbody.innerHTML = "<tr><td colspan='4'>덱 목록을 불러오는 데 실패했습니다.</td></tr>";
    });
});
