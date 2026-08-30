import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import config from "../../config.js"

const pluginConfig = {
    name: "sc",
    alias: ["script"],
    category: "main",
    description: "Enlace del script del bot WA más reciente",
    usage: ".sc",
    example: ".sc",
    isPremium: false,
    isOwner: false,
    isBanned: false,
    isAdmin: false,
    cooldown: 10,
    carne: 0,
    isBotAdmin: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    return await sock.sendMessage(m.chat, {
        image: getAssetBuffer("luffy"),
        caption: `☽◯☾ ╭━ ♰ 🌾 SCRIPT ♰ ━╮ ☽◯☾\n\n🌾 Hola, *${m.pushName}*

♰ ──────── ♱

El original de este bot lo consigues mediante el enlace; luego solo busca la palabra clave *Luffy-Ai MD*`,
        footer: "💬 Este enlace te llevará al Youtube *Zanspiw*",
        interactiveButtons: [
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "🥐 Visita el canal de Youtube Zanspiw",
                    url: "https://youtube.com/@JanpiwWok",
                    merchant_url: "https://youtube.com/@JanpiwWok"
                })
            }
        ]

    }, { quoted: m })
}

export { pluginConfig as config, handler }