import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-Luffy-Ai";

const pluginConfig = {
    name: "countrystalk",
    alias: ["stalknegara", "infonegara"],
    category: "stalker",
    description: "Buscar información detallada sobre un país",
    usage: ".country <nombre del país>",
    example: ".country indonesia",
    cooldown: 5,
    carne: 1,
    isEnabled: true,
};

async function handler(m, { sock, text }) {
    if (!text) {
        return m.reply(`☽◯☾ ♰ 🌍 ¡Por favor, ingresa el nombre de un país!\nEjemplo: \`${m.prefix}${m.command} indonesia\``);
    }

    await m.react("🕕");

    try {
        const query = encodeURIComponent(text.trim());
        const url = `https://api.neoxr.eu/api/country?q=${query}&apikey=${NEOXR_APIKEY}`;
        const response = await axios.get(url, { timeout: 30000 });
        const data = response.data;

        if (!data || !data.status || !data.data) {
            await m.react("❌");
            return m.reply(`☽◯☾ ♰ Lo siento, no se encontraron datos del país "${text}".`);
        }

        const c = data.data;
        const name = c.names?.common || text;
        const officialName = c.names?.official || "-";

        const population = c.population ? c.population.toLocaleString('id-ID') : "-";
        const capitals = c.capitals && c.capitals.length > 0 ? c.capitals.map(cap => cap.name).join(", ") : "-";
        const currencies = c.currencies && c.currencies.length > 0 ? c.currencies.map(cur => `${cur.name} (${cur.symbol})`).join(", ") : "-";
        const languages = c.languages && c.languages.length > 0 ? c.languages.map(l => l.name).join(", ") : "-";
        const timezones = c.timezones && c.timezones.length > 0 ? c.timezones.join(", ") : "-";

        let txt = `☽◯☾ ╭━ ♰ 🌍 INFORMACIÓN DEL PAÍS ♰ ━╮ ☽◯☾\n\n☽◯☾ ♰ 🌐 *${name.toUpperCase()}*\n──────────\n`;
        txt += `☽◯☾ ♰ 🏢 *Capital:* ${capitals}\n`;
        txt += `☽◯☾ ♰ 📜 *Nombre Oficial:* ${officialName}\n`;
        txt += `☽◯☾ ♰ 🗺️ *Región:* ${c.region || "-"} (${c.subregion || "-"})\n`;
        txt += `☽◯☾ ♰ 🗣️ *Idiomas Oficiales:* ${languages}\n`;
        txt += `☽◯☾ ♰ 👥 *Población:* ${population} habitantes\n`;
        txt += `☽◯☾ ♰ 💰 *Moneda:* ${currencies}\n`;
        txt += `☽◯☾ ♰ 🕰️ *Zona Horaria:* ${timezones}\n`;
        txt += `☽◯☾ ♰ 🚗 *Lado de Conducción:* ${c.cars?.driving_side || "-"}\n`;

        if (c.flag?.emoji) {
            txt += `\n──────────\n✦ *Bandera:* ${c.flag.emoji}\n\n╰━ ⊱༺༒༻⊰ ━╯`;
        }

        await m.react("✅");

        if (c.flag?.url_png) {
            await sock.sendMessage(m.chat, {
                image: { url: c.flag.url_png },
                caption: txt
            }, { quoted: m });
        } else {
            await m.reply(txt);
        }

    } catch (error) {
        console.error("[Country Plugin Error]", error);
        await m.react("☢");
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler };
