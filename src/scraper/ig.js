const API_URL = "https://apiyosoyyo-ofc.onrender.com/api/instagram";

async function instagramDownloader(url) {
  const res = await fetch(
    `${API_URL}?url=${encodeURIComponent(url)}&apiKey=Sebas-api2026`,
  );
  const json = await res.json();

  if (!json.result?.success) {
    throw new Error("No se pudo obtener el contenido de Instagram.");
  }

  const { data } = json.result;

  const media = [];

  if (data.mediaUrls?.length > 0) {
    for (const item of data.mediaUrls) {
      media.push({
        type: item.type === "video" ? "video" : "image",
        url: item.url,
      });
    }
  } else if (data.downloadUrl) {
    const hasVideoType = data.mediaUrls?.some((m) => m.type === "video");
    media.push({
      type: hasVideoType ? "video" : "image",
      url: data.downloadUrl,
    });
  }

  if (!media.length) {
    throw new Error("No se encontró URL de descarga.");
  }

  return {
    username: data.author || "-",
    title: data.title || "-",
    thumbnail: data.thumbnail || "-",
    likes: data.likes ?? "-",
    comment: data.comments ?? "-",
    media,
  };
}

export default instagramDownloader;
