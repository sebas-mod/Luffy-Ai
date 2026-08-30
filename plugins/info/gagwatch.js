import axios from "axios";

const pluginConfig = {
  name: "gag2watch",
  alias: ["gag2-watch"],
  category: "info",
  description: "Revisa la información de stock de GAG2 Watch",
  usage: ".gag2-watch",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m) {
  await m.react("🕕");

  try {
    const response = await axios.get("https://my.izuka-api.xyz/api/tools/gag2-watch?watchItems=Seed");
    const data = response.data;

    if (!data.status || !data.data || !data.data.stock) {
      await m.react("❌");
      return m.reply(`Lo siento, los datos de GAG2 no se encontraron o el sistema tiene problemas.`);
    }

    const stock = data.data.stock;
    const weather = stock.weather;

    let txt = `☽◯☾ ╭━ ♰ 🌱 GAG2 STOCK ♰ ━╮ ☽◯☾\n\n🌱 *MONITOR DE STOCK GAG2*\n\n`;
    txt += `*ESTADO:* ${stock.message || '-'}\n`;
    txt += `*REABASTECIMIENTO EN:* ${stock.restockInLabel || '-'}\n\n`;

    if (weather && weather.active) {
      txt += `⛅ *CLIMA:* ${weather.type.toUpperCase()}\n`;
      if (weather.effects && weather.effects.length > 0) {
        txt += `_Efecto:_ ${weather.effects[0]}\n`;
      }
      txt += `\n`;
    }

    txt += `🌱 *SEMILLAS:*\n`;
    stock.seeds.forEach(s => {
      txt += `- ${s.name}: ${s.quantity}\n`;
    });
    txt += `\n`;

    txt += `⚙️ *EQUIPO:*\n`;
    stock.gear.forEach(g => {
      txt += `- ${g.name}: ${g.quantity}\n`;
    });
    txt += `\n`;

    txt += `📦 *CAJAS:*\n`;
    stock.crates.forEach(c => {
      txt += `- ${c.name}: ${c.quantity}\n`;
    });

    await m.react("✅");
    await m.reply(txt + "\n╰━ ⊱༺༒༻⊰ ━╯");
  } catch (error) {
    console.error("[GAG-WATCH Plugin Error]", error);
    await m.react("☢");
    m.reply(`Ocurrió un error al obtener los datos de GAG. Inténtalo de nuevo más tarde.`);
  }
}

export { pluginConfig as config, handler };
