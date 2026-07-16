import config from "../../config.js"
import { getDatabase } from "../../src/lib/ourin-database.js"
import { getAssetBuffer } from "../../src/lib/ourin-asset-manager.js"

const pluginConfig = {
    name: "rules",
    alias: ["aturanbot", "botrules", "peraturanbot"],
    category: "main",
    description: "Mostrar reglas y normas de uso del bot de forma completa",
    usage: ".rules",
    example: ".rules",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
}

function buildDefaultRules(botName, prefix) {
    return `📜 *REGLAS DE ${botName.toUpperCase()}*

¡Hola! Antes de usar todas las funciones disponibles, asegúrate de comprender y cumplir con las siguientes reglas. Estas reglas se crearon para que todos los usuarios se sientan cómodos y el bot funcione sin problemas.

🔹 *REGLAS GENERALES*

- Está estrictamente prohibido hacer *spam de comandos* repetidamente en poco tiempo. El sistema anti-spam está activo y los infractores pueden ser baneados automáticamente por el bot.
- Usa todas las funciones del bot de forma *responsable*. No abuses de las funciones para perjudicar a otros.
- Está prohibido usar el bot para distribuir *contenido SARA, discurso de odio o contenido ilegal* en cualquier forma.
- *Respeta a los demás usuarios* del bot. No uses las funciones para molestar, acosar o perjudicar a otros usuarios.
- No envíes *contenido NSFW* en grupos sin la aprobación previa del admin del grupo.

🔹 *REGLAS DE USO DE FUNCIONES*

- Cada uso de un comando requiere *energía*. Usa tu energía con prudencia para que no se agote rápido.
- Las funciones *premium* solo están disponibles para usuarios con suscripción. Escribe *${prefix}benefitpremium* para info completa.
- Si encuentras un *bug o error*, repórtalo al owner del bot a través de *${prefix}owner*. No lo mal uses.
- Está prohibido hacer *solicitudes de funciones sin sentido* o forzar al owner a agregar funciones específicas.

🔹 *CONSECUENCIAS DE INFRACCIONES*

- Las infracciones leves recibirán una *advertencia* del admin o owner
- Las infracciones graves o recurrentes pueden resultar en un *baneo permanente* del uso del bot
- El owner tiene derecho a decidir sanciones sin previo aviso

_Al usar este bot, se considera que has leído y aceptado todas las reglas anteriores._`
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const botName = config.bot?.name || "Luffy-AI"
    const customRules = db.setting("botRules")

    let rulesText
    if (customRules && typeof customRules === "string" && customRules.trim().length > 0) {
        rulesText = customRules
    } else if (Array.isArray(customRules) && customRules.length > 0) {
        rulesText = `📜 *REGLAS DE ${botName.toUpperCase()}*\n\n`
        customRules.forEach((rule, i) => {
            rulesText += `${i + 1}. ${rule}\n`
        })
    } else {
        rulesText = buildDefaultRules(botName, m.prefix)
    }

    const imageBuffer = getAssetBuffer("ourin-rules")

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