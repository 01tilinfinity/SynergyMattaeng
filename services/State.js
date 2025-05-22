export async function getChampions() {
  const response = await fetch("data/champions.json");
  const data = await response.json();

  // id 기반으로 image 경로 추가
  return data.map((champion) => ({
    ...champion,
    image: `images/${champion.id}.jpg`, // id를 기반으로 경로 생성
  }));
}