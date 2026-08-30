import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import { card, fail, usage } from "../../src/lib/luffy-dl-ui.js";

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
        let help = `♰ ┄ ── ☽◯☾ ── ┄ ♰\n📽️ *𝗔 𝗟 𝗜 𝗚 𝗛 𝗧 𝗠 𝗢 𝗧 𝗜 𝗢 𝗡*\n──────────\n`
        help += `> *${config.bot?.name}* descarga proyectos y presets de Alight Motion\n`
        help += `> Solo pasa el enlace de *alight.link*\n\n`
        help += usage(m.prefix, m.command, "https://alight.link/xxxxx")
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
            return m.reply(fail("ALIGHT MOTION", "Enlace no válido o el proyecto fue eliminado."));
        }

        const downloadUrl = data.data.url;

        const caption = card({
            emoji: "📽️",
            title: "𝗔𝗟𝗜𝗚𝗛𝗧 𝗠𝗢𝗧𝗜𝗢𝗡",
            fields: [
                ["Tipo", "Proyecto/Preset (.zip)"],
                ["Enlace", targetUrl],
            ],
            footer: `Descarga directa de ${config.bot?.name} 🚀`,
        });

        await sock.sendMessage(m.chat, {
            document: { url: downloadUrl },
            mimetype: "application/zip",
            fileName: `AlightMotion_${config.bot.name}.zip`,
            caption
        }, { quoted: m });

        await m.react("✅");

    } catch (error) {
        console.error("[AMDL Plugin Error]", error);
        await m.react("☢");
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler };
