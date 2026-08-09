import axios from "axios";

const pluginConfig = {
  name: "topanime",
  alias: ["top-anime", "waifutop"],
  category: "anime",
  description: "Ver la lista de personajes de anime / waifu más populares",
  usage: ".topanime",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  await m.react("🕕");
  
  try {
    const response = await axios.get("https://my.izuka-api.xyz/api/anime/top-anime");
    const data = response.data;
    
    if (!data.status || !data.result || !data.result.result) {
      await m.react("❌");
      return m.reply(`Lo sentimos, el sistema no pudo obtener la lista del Top Anime.`);
    }

    const list = data.result.result;
    
    let txt = `🏆 *TOP ANIME CHARACTERS (WAIFU LIST)* 🏆\n\n`;
    txt += `Esta es la lista de personajes más populares y queridos actualmente:\n\n`;
    
    const maxItems = Math.min(list.length, 10);
    
    for (let i = 0; i < maxItems; i++) {
      const char = list[i];
      txt += `*${char.rank} - ${char.name}*\n`;
      txt += `- *Japonés:* ${char.japanese}\n`;
      txt += `- *Anime:* ${char.anime}\n`;
      txt += `- *Favoritos:* ${char.favorites} | *Votos:* ${char.votes}\n\n`;
    }
    
    txt += `_Mostrando los ${maxItems} personajes principales._`;
    
    await m.react("✅");
    
    if (list.length > 0 && list[0].image) {
      await sock.sendMessage(m.chat, { image: { url: list[0].image }, caption: txt }, { quoted: m });
    } else {
      await m.reply(txt);
    }
    
  } catch (error) {
    console.error("[TOPANIME Plugin Error]", error);
    await m.react("❌");
    m.reply(`Lo sentimos, ocurrió un error al conectar con el servidor. Inténtalo de nuevo.`);
  }
}

export { pluginConfig as config, handler };
