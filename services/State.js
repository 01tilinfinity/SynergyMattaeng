export async function getChampions() {
  const response = await fetch("./data/champions.json");
  const data = await response.json();
  return data;
}
