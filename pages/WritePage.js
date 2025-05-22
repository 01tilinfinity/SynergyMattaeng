import { getChampions } from "../services/State.js";
import { createChampionCard } from "../components/ChampionCard.js";

export async function renderWritePage() {
  const listContainer = document.getElementById("champion-list");
  listContainer.innerHTML = "";

  const champions = await getChampions();

  champions.forEach((champion) => {
    const card = createChampionCard(champion);
    listContainer.appendChild(card);
  });
}
