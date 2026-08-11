import axios from "axios";
import yts from "yt-search";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import config from "../../config.js";

const pluginConfig = {
  name: "playcall",
  alias: ["telepon", "call"],
  category: "search",
  description: "Reproduce música de YouTube por llamada",
  usage: ".playcall <query>",
  example: ".playcall komang",
  cooldown: 15,
  carne: 2,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  const query = m.text?.trim();
  if (!query)
    return m.reply(`🎵 *ᴘʟᴀʏ ᴄᴀʟʟ*\n\n> Ingresa el título de la canción\n\`Ejemplo: ${m.prefix}playcall despacito\``);

  if (!global.voipClient) {
    return m.reply("La función de llamada de voz no está activada (VoipClient aún no está listo).");
  }

  m.react("📞");

  try {
    console.log("[PlayCall] Searching for:", query);
    
    const search = await yts(query);
    if (!search.videos.length) throw new Error("Video no encontrado");
    const video = search.videos[0];
    
    const res = await axios.get(`https://apiyosoyyo-ofc.onrender.com/api/youtube/v2?url=${encodeURIComponent(video.url)}&format=mp3&apiKey=Sebas-api2026`, { timeout: 60000 });
    const data = res.data;
    
    if (!data.status || !data.result?.results?.length) {
       throw new Error("Error al obtener el audio de la API");
    }
    const downloadUrl = data.result.results[0].download;
    
    await m.react("🕕")
    
    console.log("[PlayCall] Downloading audio from:", downloadUrl);
    const audioRes = await axios.get(downloadUrl, { responseType: "arraybuffer", timeout: 60000 });
    const audioBuffer = Buffer.from(audioRes.data);
    
    console.log("[PlayCall] Audio downloaded successfully, buffer size:", audioBuffer.length);

    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const tmpFile = path.join(tmpDir, `call_${crypto.randomBytes(4).toString("hex")}.mp3`);
    fs.writeFileSync(tmpFile, audioBuffer);

    let call;
    const targetNumber = m.sender.split("@")[0];

    if (m.isGroup) {
      await m.reply(`_📞 La llamada grupal no está soportada por la librería actualmente. Llamando a tu número de forma privada (${targetNumber})..._`);
    } else {
      await m.reply(`_📞 Llamando a tu número (${targetNumber})..._`);
    }

    call = await global.voipClient.call(targetNumber, {
      audioSource: tmpFile,
      durationMs: 300000
    });

    call.on("connected", () => {
      m.reply(`✅ *CONECTADO*\nLa canción *${video.title}* se está reproduciendo en la llamada!`);
    });

    call.on("ended", (reason) => {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      m.reply(`📵 Llamada finalizada: ${reason}`);
    });

    call.on("error", (err) => {
      console.error("[VoIP Call Error]", err);
    });

  } catch (err) {
    console.error("[PlayCall]", err);
    m.react("😭");
    m.reply(`Error al llamar / reproducir la canción: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
