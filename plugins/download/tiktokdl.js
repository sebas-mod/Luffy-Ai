import axios from "axios";
import config from "../../config.js";
import { card, fail, usage, progressChain } from "../../src/lib/luffy-dl-ui.js";
import { trackStats } from "../../src/lib/luffy-dl-core.js";

async function tiktokDl(url) {
  function formatNumber(integer) {
    let numb = parseInt(integer);
    return Number(numb).toLocaleString().replace(/,/g, ".");
  }

  function formatDate(n, locale = "en") {
    let d = new Date(n);
    return d.toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  }

  let data = [];
  const domain = "https://www.tikwm.com/api/";
  const res = (
    await axios.post(
      domain,
      {},
      {
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: "https://www.tikwm.com",
          Referer: "https://www.tikwm.com/",
          "Sec-Ch-Ua": '"Not)A;Brand" ;v="24" , "Chromium" ;v="116"',
          "Sec-Ch-Ua-Mobile": "?1",
          "Sec-Ch-Ua-Platform": "Android",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
        },
        params: { url, count: 12, cursor: 0, web: 1, hd: 1 },
      },
    )
  ).data.data;

  if (res?.duration == 0) {
    res.images.forEach((v) => data.push({ type: "photo", url: v }));
  } else {
    data.push(
      {
        type: "watermark",
        url: "https://www.tikwm.com" + res?.wmplay || "/undefined",
      },
      {
        type: "nowatermark",
        url: "https://www.tikwm.com" + res?.play || "/undefined",
      },
      {
        type: "nowatermark_hd",
        url: "https://www.tikwm.com" + res?.hdplay || "/undefined",
      },
    );
  }

  return {
    status: true,
    title: res.title,
    taken_at: formatDate(res.create_time).replace("1970", ""),
    region: res.region,
    id: res.id,
    durations: res.duration,
    duration: res.duration + " Seconds",
    cover: "https://www.tikwm.com" + res.cover,
    size_wm: res.wm_size,
    size_nowm: res.size,
    size_nowm_hd: res.hd_size,
    data,
    music_info: {
      id: res.music_info.id,
      title: res.music_info.title,
      author: res.music_info.author,
      album: res.music_info.album || null,
      url: "https://www.tikwm.com" + res.music || res.music_info.play,
    },
    stats: {
      views: formatNumber(res.play_count),
      likes: formatNumber(res.digg_count),
      comment: formatNumber(res.comment_count),
      share: formatNumber(res.share_count),
      download: formatNumber(res.download_count),
    },
    author: {
      id: res.author.id,
      fullname: res.author.unique_id,
      nickname: res.author.nickname,
      avatar: "https://www.tikwm.com" + res.author.avatar,
    },
  };
}

const pluginConfig = {
  name: ["tiktok", "tt"],
  alias: ["tiktokdl", "ttdown"],
  category: "download",
  description: "Descarga videos/diapositivas de TikTok sin marca de agua",
  usage: ".tiktok <url>",
  example: ".tiktok https://vt.tiktok.com/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();
  const prefix = m.prefix;
  const command = m?.command;
  if (!text) {
    m.react("❌");
    return m.reply(
      `🎵 *𝗧𝗜𝗞𝗧𝗢𝗞 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔*\n` +
        `> Descarga videos, diapositivas o audio de TikTok sin marca de agua.` +
        usage(prefix, "tiktok", "https://vt.tiktok.com/xxx"),
    );
  }
  if (!text.match(/tiktok\.com|vt\.tiktok/i)) {
    await m.react("❌");
    return m.reply(fail("TIKTOK", "URL no válida. Usa un enlace de TikTok."));
  }
  await progressChain(sock, m, ["🕕", "🎶"]);

  try {
    const result = await tiktokDl(text);

    const musicButton = {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "🎵 Tomar Música",
        id: `${prefix}ttmp3 ${text}`,
      }),
    };

    const music = result.music_info || {};
    const baseFields = [
      ["Autor", result.author?.nickname ? `${result.author.nickname} (${result.author.fullname})` : undefined],
      ["Descripción", result.title || "-"],
      ["Música", music.title ? `${music.title} - ${music.author}` : undefined],
      ["Duración", result.duration !== "0 Seconds" ? result.duration : undefined],
      ["Subido", result.taken_at],
      ["Región", result.region],
    ];
    const statsFields = [
      ["Vistas", result.stats?.views],
      ["Me gusta", result.stats?.likes],
      ["Comentarios", result.stats?.comment],
      ["Compartidos", result.stats?.share],
      ["Descargas", result.stats?.download],
    ];

    if (result.durations > 0 && result.duration !== "0 Seconds") {
      const videoItem = result.data.find(
        (e) => e.type === "nowatermark_hd" || e.type === "nowatermark",
      ) || result.data[0];

      const caption = card({
        emoji: "🎵",
        title: "𝗧𝗜𝗞𝗧𝗢𝗞 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔",
        fields: [...baseFields, ...statsFields],
        footer: config.downloader?.footer || "⚓ Luffy-Ai Downloader",
      });

      await sock.sendButton(m.chat, videoItem.url, caption, m, {
        type: "video",
        buttons: [musicButton],
      });
    } else {
      const caption = card({
        emoji: "📸",
        title: "𝗧𝗜𝗞𝗧𝗢𝗞 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔",
        fields: [...baseFields, ...statsFields],
        footer: config.downloader?.footer || "⚓ Luffy-Ai Downloader",
      });

      const slides = result.data?.map((zan, idx) => ({
        image: { url: zan.url },
        caption: idx === 0 ? caption : "",
      })) || [];
      await sock.sendMessage(
        m.chat,
        {
          albumMessage: slides,
        },
        { quoted: m },
      );

      await sock.sendButton(m.chat, null, `♰ ┄ ── ☽◯☾ ── ┄ ♰\n📸 ¡Diapositivas enviadas con éxito!\n☽◯☾ ♰ Pulsa el botón de abajo para tomar la música.`, m, {
        buttons: [musicButton],
      });
    }
    trackStats("tiktok");
    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("❌");
    m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n❌ Inténtalo de nuevo más tarde, o prueba " + m.prefix + "tt2");
  }
}

export { pluginConfig as config, handler };
