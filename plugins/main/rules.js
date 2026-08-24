import config from "../../config.js"
import { getDatabase } from "../../src/lib/luffy-database.js"
import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js"

const pluginConfig = {
    name: "rules",
    alias: ["reglas_bot", "botrules", "reglas_reglas"],
    category: "main",
    description: "Mostrar las reglas y normas de uso del bot",
    usage: ".rules",
    example: ".rules",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true,
}

function buildDefaultRules(botName, prefix) {
    return `╭━━━〔 📜 REGLAS 〕━━━╮\n\n📜 *Rᴇɢʟᴀs ᴅᴇ ${botName.toUpperCase()}*

✦────────✦

¡Hola! Antes de usar todas las funciones disponibles, asegúrate de comprender y cumplir las siguientes reglas. Estas reglas existen para que todos los usuarios estén cómodos y el bot funcione sin problemas.

🔹 *Rᴇɢʟᴀs ɢᴇɴᴇʀᴀʟᴇs*

- Está *prohibido* hacer *spam de comandos* repetidamente en poco tiempo. El sistema anti-spam está activo y los infractores pueden ser bloqueados automáticamente por el bot.
- Usa todas las funciones del bot con *responsabilidad*. No uses las funciones para perjudicar a otros.
- Prohibido usar el bot para difundir *contenido de odio, discriminación o contenido ilegal* de cualquier tipo.
- *Respeta a los demás usuarios* del bot. No uses las funciones para molestar, acosar o perjudicar a otros usuarios.
- No envíes *contenido NSFW* en grupos sin el permiso previo del admin del grupo.

🔹 *Rᴇɢʟᴀs ᴅᴇ ᴜsᴏ ᴅᴇ ғᴜɴᴄɪᴏɴᴇs*

- Cada uso de comando requiere *carne*. Usa tu carne con responsabilidad para que no se acabe rápido.
- Las funciones *premium* solo las usan usuarios suscritos. Escribe *${prefix}benefitpremium* para más información.
- Si encuentras un *bug o error*, repórtalo al capitán del bot con *${prefix}owner*. No lo uses mal.
- Prohibido hacer *solicitudes de funciones irracionales* o presionar al capitán para agregar funciones específicas.

🔹 *Cᴏɴsᴇᴄᴜᴇɴᴄɪᴀs ᴅᴇ ʟᴀs ɪɴғʀᴀᴄᴄɪᴏɴᴇs*

- Las infracciones leves reciben una *advertencia* del admin o del capitán
- Las infracciones graves o repetidas pueden provocar un *baneo permanente* del uso del bot
- El capitán tiene derecho a decidir las sanciones sin previo aviso

✦────────✦

_Al usar este bot, se considera que leíste y aceptaste todas las reglas anteriores._
╰━━━━━━━━━━━━╯`
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const botName = config.bot?.name || "Luffy-Ai"
    const customRules = db.setting("botRules")

    let rulesText
    if (customRules && typeof customRules === "string" && customRules.trim().length > 0) {
        rulesText = customRules
    } else if (Array.isArray(customRules) && customRules.length > 0) {
        rulesText = `╭━━━〔 📜 REGLAS 〕━━━╮\n\n📜 *Rᴇɢʟᴀs ᴅᴇ ${botName.toUpperCase()}*\n\n`
        customRules.forEach((rule, i) => {
            rulesText += `${String(i + 1).padStart(2, '0')} › ${rule}\n`
        })
        rulesText += `\n╰━━━━━━━━━━━━╯`
    } else {
        rulesText = buildDefaultRules(botName, m.prefix)
    }

    const imageBuffer = getAssetBuffer("luffy-rules")

    if (imageBuffer) {
        await sock.sendMessage(m.chat, {
            image: imageBuffer,
            caption: rulesText,
        }, { quoted: m })
    } else {
        await m.reply(rulesText)
    }
}

export { pluginConfig as config, handler }