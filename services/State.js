export async function getChampions() {
  const response = await fetch("data/champions.json");
  const data = await response.json();

  return data.map((champion) => ({
    ...champion,
    image: `assets/images/${champion.id}.jpg`,                    // 후보용
    hqImage: `assets/images/selected/${champion.id}.jpg`,         // 선택용
  }));
}
