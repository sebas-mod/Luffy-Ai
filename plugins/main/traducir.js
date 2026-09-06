import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "traducir",
  alias: ["translate", "tr", "trad", "traductor"],
  category: "main",
  description: "Traduce texto a cualquier idioma con la API yosoyyo",
  usage: ".traducir <idioma> <texto>",
  example: ".traducir en Hola como estas",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  carne: 1,
  isEnabled: true,
};

const API_BASE = "https://api-yosoyyo-api-ofc.onrender.com/api/translate";

const LANG_ALIAS = {
  es: "es", espanol: "es", "español": "es", spanish: "es", castellano: "es",
  en: "en", ingles: "en", "inglés": "en", english: "en", inglês: "en",
  pt: "pt", portugues: "pt", "portugués": "pt", portuguese: "pt", "português": "pt",
  fr: "fr", frances: "fr", "francés": "fr", french: "fr",
  de: "de", aleman: "de", "alemán": "de", german: "de",
  it: "it", italiano: "it", italian: "it",
  ja: "ja", japones: "ja", "japonés": "ja", japanese: "ja",
  ko: "ko", coreano: "ko", korean: "ko",
  zh: "zh", chino: "zh", chinese: "zh",
  ru: "ru", ruso: "ru", russian: "ru",
  ar: "ar", arabe: "ar", "árabe": "ar", arabic: "ar",
  id: "id", indonesio: "id", indonesian: "id",
  nl: "nl", holandes: "nl", "holandés": "nl", dutch: "nl",
  vi: "vi", vietnamita: "vi", vietnamese: "vi",
  th: "th", tailandes: "th", "tailandés": "th", thai: "th",
  hi: "hi", hindi: "hi",
  tr: "tr", turco: "tr", turkish: "tr",
  pl: "pl", polaco: "pl", polish: "pl",
  sw: "sw", swahili: "sw",
  "zh-cn": "zh-cn", "zh-tw": "zh-tw",
};

const LANG_NAME = {
  es: "Español", en: "Inglés", pt: "Portugués", fr: "Francés",
  de: "Alemán", it: "Italiano", ja: "Japonés", ko: "Coreano",
  zh: "Chino", ru: "Ruso", ar: "Árabe", id: "Indonesio",
  nl: "Holandés", vi: "Vietnamita", th: "Tailandés", hi: "Hindi",
  tr: "Turco", pl: "Polaco", sw: "Swahili",
};

function getApiKey() {
  return (
    config.downloader?.spotifySearchKey ||
    config.downloader?.apiKey ||
    "sebasapi2024"
  );
}

function resolveLang(token) {
  const t = String(token || "").toLowerCase().trim();
  if (!t) return null;
  if (LANG_ALIAS[t]) return LANG_ALIAS[t];
  if (/^[a-z][a-z-]*$/.test(t)) return t;
  return null;
}

function parseArgs(args) {
  let to = null;
  let text = "";

  if (!args || !args.length) return { to, text };

  const first = resolveLang(args[0]);
  if (first) {
    to = first;
    text = args.slice(1).join(" ");
    if (!text) return { to, text };
    return { to, text };
  }

  const toIdx = args.findIndex((a) => /^to:|lang=|idioma:/i.test(a));
  if (toIdx >= 0) {
    const m = args[toIdx].match(/^(?:to:|lang=|idioma:)(.*)$/i);
    to = resolveLang(m?.[1] || "");
    const rest = [...args.slice(0, toIdx), ...args.slice(toIdx + 1)];
    text = rest.join(" ").trim();
    return { to, text };
  }

  return { to: null, text: args.join(" ").trim() };
}

async function translate(text, to) {
  const params = { text, to, apiKey: getApiKey() };
  const res = await axios.get(API_BASE, { params, timeout: 35000 });
  const body = res.data;

  if (!body?.status) {
    throw new Error(body?.message || "La API no pudo traducir");
  }

  const r = body.result || {};
  return {
    translatedText: r.translatedText || r.translation || "",
    from: r.from || "auto",
    to: r.to || to,
    provider: r.provider || "yosoyyo",
  };
}

async function handler(m, { sock }) {
  const args = m.args || [];
  const { to, text } = parseArgs(args);

  let target = to;
  if (!target) target = "es";

  const trimmed = (text || "").trim();
  if (!trimmed) {
    return m.reply(
      `── .✦ 𝗧𝗥𝗔𝗗𝗨𝗖𝗧𝗢𝗥 ✦. ── 𝜗ৎ\n\n` +
        `¡Traduce texto a cualquier idioma!\n\n` +
        `╭─〔 Uso 〕───⬣\n` +
        `│  ✦ ${m.prefix}traducir <idioma> <texto>\n` +
        `╰──────────────⬣\n\n` +
        `*${m.prefix}traducir en Hola como estas*\n` +
        `*${m.prefix}traducir ja ありがとう*\n\n` +
        `Idiomas: es, en, pt, fr, de, it, ja, ko, zh, ru, ar, id, nl, vi, th, hi, tr, pl, sw .☘︎ ݁˖`,
    );
  }

  await m.react("🕕");

  try {
    const result = await translate(trimmed, target);

    if (!result.translatedText) {
      await m.react("✘");
      return m.reply(
        `── .☽◯☾ ──\n\n> No se pudo traducir el texto .☘︎ ݁˖`,
      );
    }

    const txt =
      `── .✦ 𝗧𝗥𝗔𝗗𝗨𝗖𝗧𝗢𝗥 ✦. ── 𝜗ৎ\n\n` +
      `*Texto original:*\n${trimmed}\n\n` +
      `*Traducción (${LANG_NAME[target] || target.toUpperCase()}):*\n${result.translatedText}\n\n` +
      `Detectado: ${result.from} → ${result.to}\n` +
      `.☘︎ ݁˖`;

    await m.reply(txt);
    await m.react("✅");
  } catch (error) {
    console.error("[Traducir] Error:", error.message);
    await m.react("✘");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };