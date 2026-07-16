import config from "../../config.js"
import { getDatabase } from "../../src/lib/ourin-database.js"
import { getAssetBuffer } from "../../src/lib/ourin-asset-manager.js"

const pluginConfig = {
    name: "rulesgrup",
    alias: ["grouprules", "aturangrup", "grules"],
    category: "group",
    description: "Mostrar reglas y normas del grupo de forma completa",
    usage: ".rulesgrup",
    example: ".rulesgrup",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
}

const DEFAULT_GROUP_RULES = `📜 *REGLAS DEL GRUPO*

¡Bienvenidos a este grupo! Para que el ambiente sea agradable y propicio para todos, por favor cumple con las siguientes normas.

🔹 *ÉTICA EN LA COMUNICACIÓN*

- Usa un *lenguaje respetuoso* y valora a los demás. No se toleran groserías ni discurso de odio.
- Está prohibido hacer *spam* de mensajes repetitivos, incluyendo stickers, imágenes y notas de voz de forma excesiva.
- Está prohibido difundir *contenido SARA, pornografía y violencia* en cualquier forma.
- No *insultes, acoses o avergüences* a otros miembros del grupo.

🔹 *CONTENIDO Y ENLACES*

- Está prohibido *promocionar* productos, servicios o redes sociales sin autorización del admin del grupo.
- Está prohibido *difundir enlaces* sin aprobación del admin, incluyendo enlaces de otros grupos de WhatsApp.
- Está prohibido difundir *noticias falsas* o información no verificada.
- Está prohibido enviar *documentos o archivos sospechosos* que contengan virus.

🔹 *USO DEL BOT*

- Usa los comandos del bot *con moderación*, no hagas spam de comandos repetitivos.
- *Obedece las instrucciones del admin* en todo momento. La decisión del admin es definitiva.
- Si hay algún problema, comunícalo con el admin de buena forma, no en el grupo.

🔹 *CONSECUENCIAS*

- Las infracciones leves obtienen una *advertencia* del admin
- Las infracciones graves o reiteradas resultarán en *expulsión* del grupo
- El admin puede expulsar a un miembro en cualquier momento sin previo aviso

_Al unirte a este grupo, se considera que aceptas todas las normas anteriores._
>_¡Shishishi! ¡Soy Luffy, y estas reglas son para que todos se diviertan!_`

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const customRules = groupData.groupRules
    const rulesText = customRules || DEFAULT_GROUP_RULES

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

export { pluginConfig as config, handler, DEFAULT_GROUP_RULES }
