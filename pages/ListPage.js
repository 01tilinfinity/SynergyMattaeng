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

        item.innerHTML = `
          <h3>${deck.name}</h3>
          <p><strong>작성자:</strong> ${deck.username}</p>
          <p><strong>작성일:</strong> ${deck.createdAt}</p>
        `;

        list.appendChild(item);
      });
    });
});
