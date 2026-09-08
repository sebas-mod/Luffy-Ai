import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const SIM_API = process.env.SIM_API || config.APIkey?.simulacion || "clave-simulacion-2022";
const SIM_BASE = process.env.SIM_BASE || config.APIkey?.simulacion_base || "http://127.0.0.1:8000";

const pluginConfig = {
    name: "infopersona",
    alias: ["buscacurp", "stalkdata", "dt"],
    category: "owner",
    description: "Consultar datos de una persona en la base simulada por CURP",
    usage: ".infopersona <curp>",
    example: ".infopersona FORM831223MCCLYN00",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 2,
    isEnabled: true,
};

async function handler(m, { sock, text }) {
    if (!text) {
        return m.reply(`☽◯☾ ♰ 📄 ¡Ingresa una CURP!\n──────────\n> Ejemplo: \`${m.prefix}${m.command} FORM831223MCCLYN00\``);
    }

    await m.react("🕕");

    try {
        const curp = text.trim().toUpperCase();
        const { data } = await axios.get(`${SIM_BASE}/personas/${curp}`, {
            headers: { "X-API-Key": SIM_API },
            timeout: 30000,
        });

        let txt = `☽◯☾ ╭━ ♰ 📄 DATOS REGISTRADOS ♰ ━╮ ☽◯☾\n\n`;
        txt += `☽◯☾ ♰ 🪪 *CURP:* \`${data.curp}\`\n`;
        txt += `☽◯☾ ♰ 👤 *Nombre:* ${data.nombre} ${data.paterno} ${data.materno}\n`;
        txt += `☽◯☾ ♰ 🧬 *Sexo:* ${data.sexo === "H" ? "Hombre" : "Mujer"}\n`;
        txt += `☽◯☾ ♰ 🎂 *Nacimiento:* ${data.fecnac} (${data.edad} años)\n`;
        txt += `☽◯☾ ♰ 🏠 *Domicilio:* ${data.calle} #${data.ext}${data.int ? `-${data.int}` : ""}\n`;
        txt += `☽◯☾ ♰ 📍 *Colonia:* ${data.colonia}, CP ${data.cp}\n`;
        txt += `☽◯☾ ♰ 🗺️ *Estado:* ${data.estado}\n`;
        txt += `☽◯☾ ♰ 🆔 *Credencial:* ${data.cred}\n`;
        txt += `☽◯☾ ♰ 📑 *Folio:* ${data.folio}\n`;
        txt += `\n╰━ ⊱༺♢༒♢༻⊰ ━╯`;

        await m.react("✅");
        return m.reply(txt);
    } catch (error) {
        if (error.response?.status === 404) {
            await m.react("❌");
            return m.reply(`☽◯☾ ♰ ❌ No se encontró la CURP \`${text.trim().toUpperCase()}\` en la base simulada.`);
        }
        console.error("[InfoPersona Plugin Error]", error);
        await m.react("☢");
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler };