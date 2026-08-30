import config from "../../config.js"
import { getDatabase } from "../../src/lib/luffy-database.js"
import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js"

const pluginConfig = {
    name: "reglas_grupo",
    alias: ["grouprules", "grules"],
    category: "group",
    description: "Mostrar las reglas del grupo en detalle",
    usage: ".reglas_grupo",
    example: ".reglas_grupo",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true,
}

const DEFAULT_GROUP_RULES = `📜 *REGLAS DEL GRUPO*

Bienvenido a este grupo! Para que el ambiente siga siendo agradable y armonioso para todos los miembros, por favor respeta las siguientes reglas.

🔹 *ETIQUETA AL COMUNICARSE*

- Usa *un lenguaje educado* y respeta a los demás. No hay tolerancia para palabras groseras o discursos de odio.
- Prohibido hacer *spam* de mensajes repetidos, incluyendo stickers, imágenes y notas de voz en exceso.
- Prohibido difundir *contenido SARA, pornografía y violencia* en cualquier forma.
- No *insultar, acosar ni humillar* a los demás miembros del grupo.

🔹 *CONTENIDO Y ENLACES*

- Prohibida la *promoción* de productos, servicios o cuentas de redes sociales sin permiso de los admins del grupo.
- Prohibido *compartir enlaces* sin la aprobación de los admins, incluyendo enlaces de otros grupos de WhatsApp.
- Prohibido difundir *noticias falsas (hoax)* o información no verificada.
- Prohibido enviar *documentos o archivos sospechosos* que puedan contener virus.

🔹 *USO DEL BOT*

- Usa los comandos del bot *con moderación*, no hagas spam de comandos repetidos.
- *Sigue las instrucciones de los admins* en todo momento. La decisión de los admins es definitiva.
- Si tienes un problema, coméntalo respetuosamente con los admins, no en el grupo.

🔹 *CONSECUENCIAS*

- Las faltas leves reciben *advertencias (warning)* de los admins
- Las faltas graves o repetidas serán motivo de *expulsión (kick)* del grupo
- Los admins se reservan el derecho de expulsar miembros en cualquier momento sin previo aviso

_Al unirte a este grupo, se considera que aceptas todas las reglas anteriores._`

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const customRules = groupData.groupRules
    const rulesText = customRules || DEFAULT_GROUP_RULES

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

export { pluginConfig as config, handler, DEFAULT_GROUP_RULES }
