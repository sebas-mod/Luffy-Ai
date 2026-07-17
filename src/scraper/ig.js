const API_BASE = "https://apiyosoyyo-ofc.onrender.com";
const API_KEY = "Sebas-api2026";

async function instagramDownloader(url) {
  const res = await fetch(
    `${API_BASE}/api/instagram?url=${encodeURIComponent(url)}&apiKey=${API_KEY}`,
  );
  const json = await res.json();

  if (!json.status) {
    throw new Error("No se encontraron resultados.");
  }

  const { result } = json;
  const media = result.media || [];

  if (!media.length) {
    throw new Error("No se encontró URL de descarga.");
  }

  return {
    username: result.username || "-",
    title: result.title || "-",
    likes: result.likes || "-",
    media: media.map((item) => ({
      type: item.type === "video" ? "video" : "image",
      url: item.url,
    })),
  };
}

export default instagramDownloader;
