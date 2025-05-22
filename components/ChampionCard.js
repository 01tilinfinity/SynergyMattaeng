// components/ChampionCard.js
export function createChampionCard(champion) {
  const card = document.createElement("div");
  card.className = "champion-card";

  const img = document.createElement("img");
  img.src = champion.image;
  img.alt = champion.name;

  const name = document.createElement("p");
  name.textContent = champion.name;

  const cost = document.createElement("p");
  cost.textContent = `Cost: ${champion.cost}`;

  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(cost);

  return card;
}
