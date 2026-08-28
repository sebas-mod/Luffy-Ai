import fs from "fs";
import axios from "axios";
import path from "path";
import { queueFFmpeg } from "./../../src/lib/luffy-ffmpeg.js";
import { f } from "../../src/lib/luffy-http.js";
import te from "../../src/lib/luffy-error.js";
import { card, usage } from "../../src/lib/luffy-dl-ui.js";
const pluginConfig = {
  name: "pindl",
  alias: ["pinterestdl", "pindownload", "pintdl"],
  category: "download",
  description: "Busca y descarga imágenes/videos de Pinterest",
  usage: ".pindl <query>",
  example: ".pindl zhao lusi",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};
function buildCaption(query, item, type) {
  const tag = type === "video" ? "𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗩𝗜𝗗𝗘𝗢" : "𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗜𝗠𝗔𝗚𝗘𝗡";
  return card({
    emoji: type === "video" ? "🎬" : "📸",
    title: tag,
    fields: [
      ["Búsqueda", query],
      ["Tipo", type === "video" ? "Video" : "Imagen"],
    ],
    footer: "Descarga lista, a disfrutar! 🚀",
  });
}

async function handler(m, { sock }) {
  const query = m.text?.trim();
  
  if (!query) {
    return m.reply(
      `📌 *𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧*\n` +
        `> Busca y descarga imágenes/videos de Pinterest.` +
        usage(m.prefix, "pindl", "zhao lusi"),
    );
  }
  m.react("🕕");
  try {
    const res = await axios.get(
      `https://apiyosoyyo-ofc.onrender.com/api/pinterest?q=${encodeURIComponent(query)}&limite=3&apiKey=Sebas-api2026`,
      { timeout: 60000 }
    );
    if (!res.data || !res.data.status || !res.data.result || res.data.result.length === 0) {
      throw new Error("Error al obtener los datos de Pinterest.");
    }

    const mediaList = [];
    for (const item of res.data.result) {
      if (item.tipo === "video") {
        mediaList.push({ type: "video", url: item.descarga });
      } else if (item.descarga) {
        mediaList.push({ type: "image", url: item.descarga });
      }
    }

    if (mediaList.length === 0) {
      throw new Error("No se encontró contenido");
    }

    mediaList.forEach((media) => {
      media.caption = buildCaption(query, media, media.type);
    });

    for (const media of mediaList) {
      if (media.type === "video") {
        let masterUrl = media.url;
        if (masterUrl.includes('.mp4')) {
            masterUrl = masterUrl.replace(/720p|480p|360p|240p/g, 'hls').replace('.mp4', '.m3u8');
        }

        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        const timestamp = Date.now();
        const videoTemp = path.join(tempDir, `${timestamp}_v.mp4`);
        const audioTemp = path.join(tempDir, `${timestamp}_a.mp4`);
        const outputFile = path.join(tempDir, `${timestamp}_final.mp4`);

        try {
            const resHls = await axios.get(masterUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.pinterest.com/'
                }
            });
            const text = resHls.data;
            const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

            const baseUrl = masterUrl.substring(0, masterUrl.lastIndexOf("/") + 1);
            let videoStreamUrl = null;
            let audioStreamUrl = null;
            let lastBandwidth = 0;

            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
                const bwMatch = lines[i].match(/BANDWIDTH=(\d+)/);
                const bw = bwMatch ? parseInt(bwMatch[1]) : 0;
                if (bw > lastBandwidth) {
                  lastBandwidth = bw;
                  const u = lines[i + 1];
                  videoStreamUrl = u?.startsWith("http") ? u : baseUrl + u;
                }
              }
              if (lines[i].startsWith("#EXT-X-MEDIA") && lines[i].includes("TYPE=AUDIO")) {
                const mUrl = lines[i].match(/URI="([^"]+)"/);
                if (mUrl) audioStreamUrl = mUrl[1].startsWith("http") ? mUrl[1] : baseUrl + mUrl[1];
              }
            }

            const ffmpegHdr = `-user_agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" -headers "Referer: https://www.pinterest.com/"`;

            if (!videoStreamUrl) {
                await queueFFmpeg(`ffmpeg -y ${ffmpegHdr} -i "${masterUrl}" -c copy "${outputFile}"`);
            } else {
                await queueFFmpeg(`ffmpeg -y ${ffmpegHdr} -i "${videoStreamUrl}" -c copy "${videoTemp}"`);
                if (audioStreamUrl) {
                    await queueFFmpeg(`ffmpeg -y ${ffmpegHdr} -i "${audioStreamUrl}" -c copy "${audioTemp}"`);
                    await queueFFmpeg(`ffmpeg -y -i "${videoTemp}" -i "${audioTemp}" -c copy "${outputFile}"`);
                } else {
                    fs.renameSync(videoTemp, outputFile);
                }
            }
            
            await sock.sendMedia(m.chat, fs.readFileSync(outputFile), media.caption, m, {
                type: "video",
                contextInfo: { forwardingScore: 99, isForwarded: true }
            });

        } catch (err) {
            console.error("[PinDL HLS Error]:", err.message);
            try {
                // Fallback: Pinterest memblokir generic axios (403), jadi download manual pakai User-Agent
                const fallbackBuffer = await axios.get(media.url, { 
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://www.pinterest.com/'
                    }
                });
                await sock.sendMedia(m.chat, Buffer.from(fallbackBuffer.data), media.caption, m, {
                  type: "video",
                  contextInfo: { forwardingScore: 99, isForwarded: true },
                });
            } catch (fallbackErr) {
                console.error("[PinDL Fallback Error]:", fallbackErr.message);
            }
        } finally {
            if (fs.existsSync(videoTemp)) fs.unlinkSync(videoTemp);
            if (fs.existsSync(audioTemp)) fs.unlinkSync(audioTemp);
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
        }
      } else if (media.type === "image") {
        if (media.url.includes("gif")) {
          const tempPath = path.join(process.cwd(), "temp");
          if (!fs.existsSync(tempPath))
            fs.mkdirSync(tempPath, { recursive: true });
          const id = Date.now();
          const gifPath = path.join(tempPath, `pin-${id}.gif`);
          const mp4Path = path.join(tempPath, `pin-${id}.mp4`);
          try {
            const raw = await f(media.url, "buffer");
            if (!raw) throw new Error("Error al descargar el GIF");
            fs.writeFileSync(gifPath, raw);
            await queueFFmpeg(
              `ffmpeg -y -ignore_loop 0 -i "${gifPath}" -t 30 -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -movflags faststart -preset ultrafast -an "${mp4Path}"`,
            );
            if (!fs.existsSync(mp4Path)) throw new Error("Error al convertir el GIF");
            await sock.sendMedia(m.chat, fs.readFileSync(mp4Path), media.caption, m, {
              type: "video",
              gifPlayback: true,
              contextInfo: {
                forwardingScore: 99,
                isForwarded: true,
              },
            });
          } catch (gifErr) {
            console.error("[PinDL] GIF convert error:", gifErr.message);
            await sock.sendMedia(m.chat, media.url, media.caption, m, {
              type: "image",
              contextInfo: { forwardingScore: 99, isForwarded: true },
            });
          } finally {
            if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
            if (fs.existsSync(mp4Path)) fs.unlinkSync(mp4Path);
          }
        } else {
          await sock.sendMedia(m.chat, media.url, media.caption, m, {
            type: "image",
            contextInfo: {
              forwardingScore: 99,
              isForwarded: true,
            },
          });
        }
      }
    }
    m.react("✅");
  } catch (error) {
    console.error("[PinDL] Error:", error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}
export { pluginConfig as config, handler };
