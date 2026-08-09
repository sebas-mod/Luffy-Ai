import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
    name: "alightmotiondl",
    alias: ["alightmotion", "amdl"],
    category: "downloader",
    description: "Descarga proyectos/presets de Alight Motion",
    usage: ".amdl <link>",
    example: ".amdl https://alight.link/...",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 2,
    isEnabled: true,
};

async function handler(m, { sock, text }) {
    if (!text) {
        let help = `📥 *DESCARGADOR DE ALIGHT MOTION*\n\n`
        help += `¡Esta función te ayuda a descargar proyectos o presets de Alight Motion fácilmente!\n\n`
        help += `*Cómo Usar:*\n`
        help += `- Escribe *${m.prefix}amdl <link_alight_motion>*\n\n`
        help += `*Ejemplo:* ${m.prefix}amdl https://alight.link/xxxxx`
        return m.reply(help);
    }

    await m.react("🕕");

    try {
        const targetUrl = text.trim();

        const apiUrl = `https://kyzznekoo.zone.id/api/alightmotion/download?url=${encodeURIComponent(targetUrl)}`;

        const response = await axios.get(apiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
                "Content-Type": "application/json"
            },
            data: {},
            timeout: 60000
        });

        const data = response.data;

        if (!data || !data.status || !data.data || !data.data.url) {
            await m.react("❌");
            return m.reply(`Lo siento, ese enlace de Alight Motion no es válido o el proyecto fue eliminado.`);
        }

        const downloadUrl = data.data.url;

        await sock.sendMessage(m.chat, {
            document: { url: downloadUrl },
            mimetype: "application/zip",
            fileName: `AlightMotion_${config.bot.name}.zip`,
            caption: `✅ Preset de Alight Motion descargado con éxito!`
        }, { quoted: m });

        await m.react("✅");

    } catch (error) {
        console.error("[AMDL Plugin Error]", error);
        await m.react("☢");
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler };
