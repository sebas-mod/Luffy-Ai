import crypto from "crypto";
import axios from "axios";
import yts from "yt-search";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const run = promisify(exec);
const pluginConfig = {
  name: "playch",
  alias: ["pch", "playsaluran"],
  category: "search",
  description: "Reproduce música en el canal (convertir a opus)",
  usage: ".playch <query> atau .playch --idch <id> <query>",
  example: ".playch komang",
  cooldown: 15,
  carne: 1,
  isEnabled: true,
};

function pickVideo(search) {
  const v = search?.videos || [];
  return v.find((x) => x.seconds && x.seconds < 900) || v[0] || null;
}

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function toOggOpus(mp3Buf) {
  const tmp = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
  const id = crypto.randomBytes(6).toString("hex");
  const inp = path.join(tmp, `in_${id}.mp3`);
  const out = path.join(tmp, `out_${id}.ogg`);
  fs.writeFileSync(inp, mp3Buf);
  await run(
    `ffmpeg -y -i "${inp}" -vn -map_metadata -1 -ac 1 -ar 48000 -c:a libopus -b:a 96k -vbr on -application audio -f ogg "${out}"`,
  );
  const buf = fs.readFileSync(out);
  try {
    fs.unlinkSync(inp);
  } catch { }
  try {
    fs.unlinkSync(out);
  } catch { }
  return buf;
}

function generateWaveform(audioBuf, samples = 64) {
  const waveform = new Uint8Array(samples);
  const chunkSize = Math.floor(audioBuf.length / samples);
  for (let i = 0; i < samples; i++) {
    const offset = i * chunkSize;
    let sum = 0;
    const len = Math.min(chunkSize, audioBuf.length - offset);
    for (let j = 0; j < len; j++) {
      sum += Math.abs(audioBuf[offset + j] - 128);
    }
    waveform[i] = Math.min(255, Math.floor((sum / len) * 2.5));
  }
  return waveform;
}

async function handler(m, { sock }) {
  const raw = m.text?.trim() || "";
  let chId = config?.saluran?.id;
  let chName = config?.saluran?.name || config?.bot?.name || "Luffy-Ai";
  let q = raw;

  const idchMatch = raw.match(/--idch\s+(\S+)/);
  if (idchMatch) {
    chId = idchMatch[1];
    chName = chId;
    q = raw.replace(/--idch\s+\S+/, "").trim();
  }

  if (!q)
    return m.reply(
      `🎵 *REPRODUCIR EN CANAL*\n\n\`${m.prefix}playch <título de la canción>\`\n\`${m.prefix}playch --idch <id_canal> <título de la canción>\``,
    );
  if (!chId)
    return m.reply(
      `❌ El canal no está configurado. Usa \`--idch <id>\` o configúralo en config.js`,
    );

  m.react("🔎");
  try {
    const { videos } = await yts(q);
    const video = pickVideo({ videos });
    if (!video) return m.reply(`❌ Video no encontrado`);

    const ytChannel = video.author?.name || video.author?.username || "Unknown";
    
    const res = await axios.get(`https://apiyosoyyo-ofc.onrender.com/api/youtube/v2?url=${encodeURIComponent(video.url)}&format=mp3&apiKey=Sebas-api2026`, { timeout: 60000 });
    const data = res.data;
    if (!data.status || !data.result?.results?.length) {
       throw new Error("Error al obtener el audio de la API");
    }
    const downloadUrl = data.result.results[0].download;

    let info = `🎵 *SONANDO AHORA (CANAL)*\n\n`;
    info += `📌 *Título:* ${video.title}\n\n`;
    info += `*DETALLE*\n`;
    info += `👤 Canal: *${ytChannel}*\n`;
    info += `⏱️ Duración: *${video.duration.timestamp}*\n`;
    info += `👀 Vistas: *${formatViews(video.views)}*\n`;
    info += `📅 Subido: *${video.ago}*\n`;
    info += `🆔 ID: \`${video.videoId}\`\n\n`;
    if (video.description) {
      const desc = video.description.substring(0, 150).replace(/\n/g, " ");
      info += `*Descripción:*\n_${desc}${video.description.length > 150 ? "..." : ""}_\n\n`;
    }
    info += `📡 Canal: \`${chId}\`\n`;
    info += `🔗 ${video.url}\n\n`;
    info += `_⏳ enviando audio al canal, por favor espera..._`;

    await sock.sendMedia(m.chat, video.thumbnail, info, m, { type: "image" });

    m.react("🎵");

    const audioRes = await axios.get(downloadUrl, { responseType: "arraybuffer", timeout: 60000 });
    const mp3Buf = Buffer.from(audioRes.data);

    if (mp3Buf.length < 50000) throw new Error("El audio es demasiado pequeño");
    const opusBuf = await toOggOpus(mp3Buf);
    if (opusBuf.length < 10000) throw new Error("Falló la conversión a opus");
    const title = video.title;

    const waveform = generateWaveform(opusBuf);
    await sock.sendMessage(chId, {
      audio: opusBuf,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
      waveform: Array.from(waveform),
    });
    m.react("✅");
    m.reply(`✅ *${title}* enviado correctamente al canal`);
  } catch (e) {
    console.error("[PlayCh]", e);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}
export { pluginConfig as config, handler };
