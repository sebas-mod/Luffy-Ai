import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "tourl",
  alias: ["todourl", "disupload", "filetohost"],
  category: "tools",
  description: "Sube media o una URL a múltiples hosts y obtén enlaces",
  usage: ".tourl <url> o responde un media",
  example: ".tourl https://ejemplo.com/imagen.png",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  carne: 1,
  isEnabled: true,
};

const API_URL =
  "https://api-yosoyyo-api-ofc.onrender.com/api/tourl";

function getApiKey() {
  return (
    config.downloader?.spotifySearchKey ||
    config.downloader?.apiKey ||
    "sebasapi2024"
  );
}

function getMediaInfo(m) {
  const msg = m.quoted?.message || m.message || {};
  const type =
    Object.keys(msg).find((k) => k.endsWith("Message") && k !== "conversation" && k !== "extendedTextMessage") ||
    null;
  if (!type) return null;
  const content = msg[type];
  const mimetype = content?.mimetype || content?.mediaType || "";
  const fileName = content?.fileName || `file.${type.replace("Message", "")}`;
  return { type, mimetype, fileName };
}

async function uploadViaBase64(buffer) {
  const res = await axios.post(
    API_URL,
    { base64: buffer.toString("base64") },
    {
      params: { apiKey: getApiKey() },
      timeout: 60000,
    },
  );
  return res.data;
}

async function uploadViaUrl(url) {
  const res = await axios.post(
    API_URL,
    { url },
    {
      params: { apiKey: getApiKey() },
      timeout: 60000,
    },
  );
  return res.data;
}

async function handler(m, { sock }) {
  const input = m.args?.join(" ")?.trim();

  if (!input && !m.quoted?.isMedia && !m.isMedia) {
    return m.reply(
      `── .☽◯☾ ──\n\n> *TO URL* — sube media a múltiples hosts\n\n` +
        `╭─〔 Uso 〕───⬣\n` +
        `│  ✦ ${m.prefix}tourl <url>\n` +
        `│  ✦ ${m.prefix}tourl (respondiendo un media)\n` +
        `╰──────────────⬣\n\n` +
        `*${m.prefix}tourl https://ejemplo.com/img.png* .☘︎ ݁˖`,
    );
  }

  await m.react("🕕");

  try {
    let data;

    if (m.quoted?.isMedia || m.isMedia) {
      const isQuoted = !!m.quoted?.isMedia;
      const info = getMediaInfo(m);
      const fileName = info?.fileName || "file";
      const buffer = isQuoted ? await m.quoted.download() : await m.download();
      if (!buffer || !buffer.length) {
        await m.react("✘");
        return m.reply(
          `── .☽◯☾ ──\n\n> No se pudo leer el media .☘︎ ݁˖`,
        );
      }
      data = await uploadViaBase64(buffer);
      if (data?.status) data._fileName = fileName;
    } else {
      const isUrl = /^https?:\/\//i.test(input);
      if (!isUrl) {
        await m.react("✘");
        return m.reply(
          `── .☽◯☾ ──\n\n> *${input}* no parece una URL válida .☘︎ ݁˖`,
        );
      }
      data = await uploadViaUrl(input);
    }

    if (!data?.status || !Array.isArray(data?.result?.results)) {
      const msg = data?.message || data?.error || "No se pudo subir";
      await m.react("✘");
      return m.reply(
        `── .☽◯☾ ──\n\n> ${msg} .☘︎ ݁˖`,
      );
    }

    const fileName = data._fileName || null;
    const results = data.result.results;

    let txt = `── .☽◯☾ ──\n\n`;
    txt += `> 🚀 *SUBIDA EXITOSA*\n`;
    if (fileName) txt += `> 📦 Archivo: *${fileName}*\n`;
    txt += `> Resultados: *${results.length}* hosts .☘︎ ݁˖\n\n`;

    results.forEach((r, i) => {
      const expires = /permanente|permanent/i.test(r.expires || "")
        ? "∞ Permanente"
        : r.expires || "?";
      txt += `☁️ *${r.host || "Host " + (i + 1)}*\n`;
      txt += `⏳ Expira: ${expires}\n`;
      txt += `🔗 ${r.url}`;
      if (i < results.length - 1) txt += `\n──────────\n\n`;
    });

    await m.reply(txt);
    await m.react("✅");
  } catch (error) {
    console.error("[ToURL] Error:", error.message);
    await m.react("✘");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };