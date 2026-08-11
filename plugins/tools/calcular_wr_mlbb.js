import axios from "axios";

const pluginConfig = {
  name: "calcular_wr_mlbb",
  alias: ["wrml", "wrmlbb", "winrate"],
  category: "tools",
  description: "Calcula las victorias necesarias sin derrotas para alcanzar el win rate objetivo en Mobile Legends.",
  usage: ".hitungwrmlbb <total_partidas> <wr_actual> <wr_objetivo>",
  example: ".hitungwrmlbb 4242 22 88",
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock, args }) {
  if (args.length < 3) {
    return m.reply(
      `Hola *${m.pushName}* 👋\n\n` +
      `Para calcular tu win rate objetivo de MLBB, usa el formato:\n` +
      `- \`${m.prefix}calcular_wr_mlbb <total_partidas> <wr_actual> <wr_objetivo>\`\n\n` +
      `Ejemplo:\n- \`${m.prefix}calcular_wr_mlbb 4242 22 88\``
    );
  }

  const [totalMatch, wrNow, wrTarget] = args;

  if (isNaN(totalMatch) || isNaN(wrNow) || isNaN(wrTarget)) {
    return m.reply("❌ Número no válido. Asegúrate de que todo lo ingresado sean números (sin %).\n\nEjemplo: `.hitungwrmlbb 4242 22 88`");
  }

  m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/tools/winrate-mlbb?total_match=${totalMatch}&wr_now=${wrNow}&wr_target=${wrTarget}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply("⚠️ Error al calcular el Win Rate. Asegúrate de que los números sean razonables o inténtalo más tarde.");
    }

    let info = `🎮 *CALCULADORA DE WINRATE MLBB* 🎮\n\n`;
    info += `📊 Partidas Totales: *${totalMatch}*\n`;
    info += `📉 WR Actual: *${wrNow}%*\n`;
    info += `📈 WR Objetivo: *${wrTarget}%*\n\n`;
    info += `💡 *Resultado del Análisis:*\n${data.result}`;

    await m.reply(info);
    m.react("✅");

  } catch (error) {
    console.error("[WR MLBB Error]", error);
    await m.react("❌");
    m.reply("😔 Ocurrió un error del sistema al calcular el Win Rate. Por favor, inténtalo de nuevo más tarde.");
  }
}

export { pluginConfig as config, handler };
