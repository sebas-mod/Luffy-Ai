import axios from "axios";
import config from "../../config.js";
import { getDatabase } from "./luffy-database.js";
import { card } from "./luffy-dl-ui.js";

const DL = config.downloader || {};

const PLATFORM_STYLE = {
  youtube: { emoji: "🎬", title: "𝗬𝗧𝗠𝗣𝟰", color: "#FF0000" },
  youtube_audio: { emoji: "🎵", title: "𝗬𝗧𝗠𝗣𝟯", color: "#FF0000" },
  spotify: { emoji: "🎵", title: "𝗦𝗣𝗢𝗧𝗜𝗙𝗬", color: "#1DB954" },
  instagram: { emoji: "📸", title: "𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠", color: "#E1306C" },
  tiktok: { emoji: "🎶", title: "𝗧𝗜𝗞𝗧𝗢𝗞", color: "#00F2EA" },
  facebook: { emoji: "📘", title: "𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞", color: "#1877F2" },
  twitter: { emoji: "🐦", title: "𝗧𝗪𝗜𝗧𝗧𝗘𝗥", color: "#1DA1F2" },
  spotify_audio: { emoji: "🎵", title: "𝗦𝗣𝗢𝗧𝗜𝗙𝗬", color: "#1DB954" },
  aio: { emoji: "🌐", title: "𝗔𝗟𝗟 𝗜𝗡 𝗢𝗡𝗘", color: "#6c5ce7" },
};

function getStyle(platform = "aio") {
  return PLATFORM_STYLE[platform] || PLATFORM_STYLE.aio;
}

function cloneUrl(template, vars) {
  let out = template;
  for (const [k, v] of Object.entries(vars || {})) {
    out = out.replaceAll(`{${k}}`, encodeURIComponent(v || ""));
  }
  return out;
}

/**
 * Prueba varias fuentes API en orden y devuelve la primera respuesta útil.
 * @param {string[]} sources Plantillas con {key}/{url}/{query}
 * @param {Object} vars
 * @param {(data:any)=>any} pick Transfórmalo a algo truthy (la URL final)
 */
async function trySources(sources, vars, pick, { timeout = 60000 } = {}) {
  const key = vars?.key || DL.apiKey || "";
  if (!Array.isArray(sources) || !sources.length) return null;
  let lastErr = null;
  for (const tmpl of sources) {
    const url = cloneUrl(tmpl, { ...vars, key });
    try {
      const { data } = await axios.get(url, { timeout });
      const picked = pick ? pick(data) : data;
      if (picked) return { data, picked, url };
    } catch (e) {
      lastErr = e;
      console.error(`  ✖  DL   source fail: ${url.slice(0, 90)} (${e.message})`);
    }
  }
  throw lastErr || new Error("Todas las fuentes fallaron");
}

function trackStats(platform, extra = 1) {
  try {
    if (DL.trackStats === false) return;
    getDatabase().incrementStat(`dl_${platform}`, extra);
    getDatabase().incrementStat("dl_total", extra);
  } catch (e) {
    console.error("  ✖  DL   stats fail:", e.message);
  }
}

function buildDlCard(platform, fields, footer) {
  const style = getStyle(platform);
  return card({
    emoji: style.emoji,
    title: style.title,
    fields,
    footer:
      footer ||
      DL.footer ||
      (style.title
        ? `${style.emoji} ${config.bot?.name || "Luffy-Ai"} Downloader`
        : ""),
  });
}

/**
 * Envía un mensaje con botón "cta_url" (enlace directo de descarga).
 * @param {Object} sock
 * @param {string} chat
 * @param {Object} m mensaje origen (quoted)
 * @param {Object} opts { caption? o text?, url, buttonText }
 */
async function sendWithLinkButton(sock, chat, m, opts) {
  const buttons = opts.url
    ? [
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: opts.buttonText || "🔗 Abrir descarga",
            url: opts.url,
          }),
        },
      ]
    : [];
  await sock.sendMessage(
    chat,
    {
      text: opts.caption || opts.text || "",
      ...(buttons.length ? { interactiveButtons: buttons } : {}),
    },
    { quoted: m },
  );
}

export {
  PLATFORM_STYLE,
  getStyle,
  trySources,
  trackStats,
  buildDlCard,
  sendWithLinkButton,
  getDlConfig,
  getDlFooter,
};

function getDlConfig() {
  return DL;
}

function getDlFooter() {
  return DL.footer || "";
}