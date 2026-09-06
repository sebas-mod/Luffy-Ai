import _sharp from 'sharp'
import axios from "axios";
import config from "../../config.js";

function getSharp() {

  return _sharp;
}
import te from "../../src/lib/luffy-error.js";
import { addExifToWebp } from "../../src/lib/luffy-exif.js";

const pluginConfig = {
  name: "stickerpackdetail",
  alias: ["spdetail", "packdetail", "side"],
  category: "sticker",
  description: "Muestra y envía los stickers de un sticker pack (Sticker Pack Detail)",
  usage: ".stickerpackdetail <slug>",
  example: ".stickerpackdetail anime-pack",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 20,
  carne: 2,
  isEnabled: true,
};

const API_BASE = "https://api-yosoyyo-api-ofc.onrender.com/api";

function getApiKey() {
  return (
    config.downloader?.spotifySearchKey ||
    config.downloader?.apiKey ||
    "sebasapi2024"
  );
}

async function fetchStickerPackDetail(slug) {
  const res = await axios
    .get(`${API_BASE}/stickerpack/detail?slug=${encodeURIComponent(slug)}&apiKey=${encodeURIComponent(getApiKey())}`, {
      timeout: 25000,
    })
    .then((r) => r.data);

  const payload = res?.result ?? res?.data ?? res ?? {};
  const title = payload.title || payload.name || payload.packname || slug;
  const description = payload.description || payload.desc || null;
  const author = payload.author || payload.publisher || null;

  let stickers = [];
  if (Array.isArray(payload.stickers)) stickers = payload.stickers;
  else if (Array.isArray(payload.images)) stickers = payload.images;
  else if (Array.isArray(payload.media)) stickers = payload.media;
  else if (Array.isArray(payload.result)) stickers = payload.result;

  stickers = stickers.map((s, i) => {
    if (typeof s === "string") return { index: i, url: s };
    const url = s.url || s.image || s.imageUrl || s.download || s.file || null;
    return { index: s.index ?? i, url, animated: s.is_animated === 1 || s.animated === true || false };
  }).filter((s) => s.url);

  return {
    title,
    author,
    description,
    packname: payload.packname || title,
    stickers,
    raw: payload,
  };
}

const MAX_STICKERS = 20;
const DOWNLOAD_DELAY = 700;

async function downloadBuffer(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 15000,
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  return Buffer.from(res.data);
}

async function toWebpSticker(buffer) {
  return (await getSharp())(buffer)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 80 })
    .toBuffer();
}

async function handler(m, { sock }) {
  const slug = m.args?.join(" ")?.trim();

  if (!slug) {
    return m.reply(
      `── .✦ 𝗦𝗧𝗜𝗖𝗞𝗘𝗥 𝗣𝗔𝗖𝗞 𝗗𝗘𝗧𝗔𝗜𝗟 ✦. ── 𝜗ৎ\n\n` +
        `¡Descarga los stickers de un sticker pack por su slug!\n\n` +
        `╭─〔 Cómo Usarlo 〕───⬣\n` +
        `│  ✦ ${m.prefix}stickerpackdetail <slug>\n` +
        `╰──────────────⬣\n\n` +
        `*${m.prefix}stickerpackdetail anime-pack*\n\n` +
        `💡 Usa *${m.prefix}stickerpack* primero para ver qué packs existen.\n\n` +
        `.☘︎ ݁˖`,
    );
  }

  await m.react("🕕");

  try {
    const pack = await fetchStickerPackDetail(slug);

    if (!pack.stickers?.length) {
      await m.react("✘");
      return m.reply(
        `── .☽◯☾ ──\n\n> No se encontró el sticker pack: *${slug}* .☘︎ ݁˖`,
      );
    }

    await m.reply(
      `── .☽◯☾ ──\n\n> Descargando *${pack.title}*\n> ${Math.min(pack.stickers.length, MAX_STICKERS)} stickers${pack.author ? `\n> Autor: ${pack.author}` : ""} .☘︎ ݁˖`,
    );

    const limited = pack.stickers.slice(0, MAX_STICKERS);
    const stickerBuffers = [];

    for (const s of limited) {
      try {
        const buf = await downloadBuffer(s.url);
        const webp = await toWebpSticker(buf);
        stickerBuffers.push(webp);
        await new Promise((r) => setTimeout(r, DOWNLOAD_DELAY));
      } catch {
        continue;
      }
    }

    if (!stickerBuffers.length) {
      await m.react("✘");
      return m.reply(`── .☽◯☾ ──\n\n> No se pudo descargar los stickers .☘︎ ݁˖`);
    }

    const packname = pack.packname || config.sticker?.packname || "Luffy-Ai";
    const author = pack.author || config.bot?.developer || config.sticker?.author || "Bot";

    try {
      await sock.sendStickerPack(m.chat, stickerBuffers, m, {
        name: packname,
        packname,
        publisher: author,
        author,
        description: pack.description || `Sticker pack: ${packname}`,
        emojis: ["❤"],
      });
      await m.react("✓");
    } catch (packErr) {
      console.error("[StickerPackDetail] Pack send failed:", packErr.message);
      await m.reply(
        `── .☽◯☾ ──\n\n> El pack falló, enviando uno por uno... .☘︎ ݁˖`,
      );

      let sent = 0;
      for (const buf of stickerBuffers) {
        try {
          let exifBuf = buf;
          try {
            exifBuf = await addExifToWebp(buf, {
              packname,
              author,
              emojis: ["❤"],
            });
          } catch {}
          await sock.sendMessage(
            m.chat,
            {
              sticker: exifBuf,
              contextInfo: { isForwarded: true, forwardingScore: 1 },
            },
            { quoted: m },
          );
          sent++;
          await new Promise((r) => setTimeout(r, 500));
        } catch {
          continue;
        }
      }

      if (sent > 0) {
        await m.react("✓");
        await m.reply(
          `── .☽◯☾ ──\n\n> Se enviaron *${sent}* stickers de *${packname}* .☘︎ ݁˖`,
        );
      } else {
        await m.react("✘");
        await m.reply(`── .☽◯☾ ──\n\n> No se pudo enviar los stickers .☘︎ ݁˖`);
      }
    }
  } catch (error) {
    console.error("[StickerPackDetail] Error:", error.message);
    await m.react("✘");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };