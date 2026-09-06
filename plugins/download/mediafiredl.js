import te from "../../src/lib/luffy-error.js";
import mediafire from "../../src/scraper/mediafire.js";
import config from "../../config.js";
import { card, fail, usage } from "../../src/lib/luffy-dl-ui.js";
import { trackStats, getDlConfig, trySources } from "../../src/lib/luffy-dl-core.js";

const pluginConfig = {
  name: "mediafiredl",
  alias: ["mfdl", "mediafire", "mf"],
  category: "download",
  description: "Descarga archivos de MediaFire",
  usage: ".mfdl <url>",
  example: ".mfdl https://www.mediafire.com/file/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  carne: 1,
  isEnabled: true,
};

function getApiKey() {
  return (
    config.downloader?.spotifySearchKey ||
    config.downloader?.apiKey ||
    "sebasapi2024"
  );
}

function normalizeYosoyyo(result) {
  const r = result || {};
  const url =
    r.url ||
    r.link ||
    r.download_url ||
    r.downloadUrl ||
    r.link_download ||
    r.download?.link_download ||
    r.file?.url ||
    "";
  if (!url || !url.startsWith("http")) {
    return { status: false };
  }
  return {
    status: true,
    title: r.title || r.name || r.filename || "MediaFire",
    size: r.size || r.filesize || r.type_size || r.download?.size || "",
    url,
    mimetype: r.mimetype || r.type || "",
  };
}

async function getMediafireData(url) {
  const sources =
    getDlConfig()?.mediafire?.sources || [
      "https://api-yosoyyo-api-ofc.onrender.com/api/mediafire?url={url}&apiKey={key}",
    ];

  try {
    const { picked } = await trySources(
      sources,
      { url, key: getApiKey() },
      (data) => {
        if (data?.status && data?.result) {
          const norm = normalizeYosoyyo(data.result);
          return norm.status ? { ...norm, raw: data.result } : false;
        }
        return false;
      },
      { timeout: 45000 },
    );
    if (picked?.status) return { source: "yosoyyo", ...picked };
  } catch (e) {
    console.error("[MediaFiredl] yosoyyo:", e.message);
  }

  try {
    const result = await mediafire(url);
    return {
      source: "scraper",
      status: true,
      title: result.meta?.title || "MediaFire",
      size: result.download?.size || "",
      url: result.download.link_download,
      mimetype: result.download.mimetype || "",
    };
  } catch (e) {
    console.error("[MediaFiredl] scraper fallback:", e.message);
    return null;
  }
}

function getFileName(data) {
  const urlName = decodeURIComponent(
    data.url?.split("/").pop()?.split("?")[0] || "",
  );
  const extension = urlName.includes(".")
    ? `.${urlName.split(".").pop()}`
    : "";
  const directName = data.title?.trim();
  if (directName && extension && !directName.includes("."))
    return `${directName}${extension}`;
  return directName || urlName || `mediafire_${Date.now()}${extension}`;
}

async function handler(m, { sock }) {
  const url = m.text?.trim();

  if (!url) {
    return m.reply(
      `📦 *𝗠𝗘𝗗𝗜𝗔𝗙𝗜𝗥𝗘*\n──────────\n` +
        `> Descarga archivos de *MediaFire* directamente al chat.\n\n` +
        usage(m.prefix, m.command, "https://www.mediafire.com/file/xxx"),
    );
  }

  if (!url.match(/mediafire\.com/i)) {
    return m.reply(fail("MEDIAFIRE", "URL no válida. Usa un enlace de MediaFire."));
  }
  await m.react("🕕");

  try {
    const data = await getMediafireData(url);

    if (!data?.status || !data?.url) {
      await m.react("❌");
      return m.reply(
        fail(
          "MEDIAFIRE",
          "No se pudo obtener el archivo. Verifica que la URL sea válida y pública.",
        ),
      );
    }

    const caption = card({
      emoji: "📦",
      title: "𝗠𝗘𝗗𝗜𝗔𝗙𝗜𝗥𝗘",
      fields: [
        ["Archivo", data.title],
        ["Tamaño", data.size],
        ["Fuente", data.source === "yosoyyo" ? "API yosoyyo" : "Scraper"],
      ],
      footer: config.downloader?.footer || "⚓ Luffy-Ai Downloader",
    });

    await sock.sendMessage(
      m.chat,
      {
        document: { url: data.url },
        fileName: getFileName(data),
        mimetype: data.mimetype,
        caption,
        contextInfo: {
          forwardingScore: 99,
          isForwarded: true,
        },
      },
      { quoted: m },
    );
    trackStats("mediafire");
    await m.react("✅");
  } catch (err) {
    m.react("❌");
    return m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };