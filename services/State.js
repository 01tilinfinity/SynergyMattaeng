// services/State.js
export async function getChampions() {
  const response = await fetch("data/champions.json");
  const data = await response.json();

  return data.map((champion) => ({
    ...champion,
    image: `assets/images/${champion.id}.jpg`, // 수정
  }));
}
