import te from "../../src/lib/luffy-error.js"

const pluginConfig = {
    name: "antispam",
    alias: ["antispamgc"],
    category: "group",
    description: "Configura la protección del grupo contra mensajes spam",
    usage: ".antispam <on/off/action/delay>",
    example: ".antispam on\n.antispam warning\n.antispam 2",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isAdmin: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

const spamTracker = new Map()

async function handler(m, { sock, db }) {
    const args = m.args
    const action = args[0]?.toLowerCase()
    const delayMatch = action?.match(/^(\d+)(s|ms)?$/)
    
    if (!action || (!["on", "off", "warning", "kick", "delete"].includes(action) && !delayMatch)) {
        return m.reply(
            `🛡️ *ANTI SPAM GRUPO*\n\n` +
            `Esta función protege el grupo de miembros que envían mensajes repetidos muy rápido, perturbando la comodidad de los demás\n\n` +
            `*Cómo usar:*\n` +
            `> \`${m.prefix}antispam on\` (Activar antispam)\n` +
            `> \`${m.prefix}antispam off\` (Desactivar antispam)\n\n` +
            `*Elige el método de castigo:*\n` +
            `> \`${m.prefix}antispam warning\` (Advertencia dura hasta 3 avisos)\n` +
            `> \`${m.prefix}antispam kick\` (Expulsa al spammer automáticamente)\n` +
            `> \`${m.prefix}antispam delete\` (Elimina todos los mensajes spam)\n\n` +
            `*Configura la sensibilidad (delay):*\n` +
            `> \`${m.prefix}antispam 2\` (Máximo 2 segundos entre mensajes)\n` +
            `> \`${m.prefix}antispam 1500\` (Establecer a 1500 milisegundos)`
        )
    }

    const groupData = db.getGroup(m.chat) || {}
    
    if (delayMatch) {
        let delayMs = parseInt(delayMatch[1])
        if (delayMatch[2] === "s" || (delayMs >= 1 && delayMs <= 10)) {
            delayMs = delayMs * 1000
        }
        
        if (delayMs < 500) delayMs = 500
        if (delayMs > 10000) delayMs = 10000
        
        groupData.antispamDelay = delayMs
        db.setGroup(m.chat, groupData)
        
        return m.reply(
            `🛡️ *SENSIBILIDAD ANTI SPAM ACTUALIZADA*\n\n` +
            `> Juego Máximo: *${delayMs} ms* (${(delayMs/1000).toFixed(1)} segundos)\n\n` +
            `El sistema considerará spam si un miembro envía varios mensajes con un intervalo menor a *${(delayMs/1000).toFixed(1)} segundos*`
        )
    }

    if (action === "on" || action === "off") {
        const isEnable = action === "on"
        if (groupData.antispam === isEnable) {
            return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n"+`✅ El antispam ya está ${isEnable ? "activado" : "desactivado"} en este grupo, no se hizo ningún cambio`+"\n╰━━━━━━━━━━━━╯")
        }
        
        groupData.antispam = isEnable
        db.setGroup(m.chat, groupData)
        
        await m.reply(
            `🛡️ *ANTI SPAM ACTUALIZADO*\n\n` +
            `> Estado: *${isEnable ? "ACTIVO ✅" : "DESACTIVADO ❌"}*\n\n` +
            `El bot ahora ${isEnable ? "vigilará estrictamente" : "dejará de vigilar"} cualquier actividad de spam o flood de mensajes de los miembros del grupo`
        )
    } else {
        groupData.antispamAction = action
        db.setGroup(m.chat, groupData)
        
        let textAction = ""
        if (action === "warning") textAction = "Dar advertencias duras de forma progresiva"
        if (action === "kick") textAction = "Expulsar automáticamente a los miembros reincidentes"
        if (action === "delete") textAction = "Eliminar los mensajes spam que molestan"
        
        await m.reply(
            `🛡️ *ACCIÓN ANTI SPAM ACTUALIZADA*\n\n` +
            `> Método de castigo: *${action.toUpperCase()}*\n\n` +
            `El bot tomará la acción *${textAction}* cuando detecte a un miembro realizando spam en el grupo`
        )
    }
}

async function checkSpam(m, sock, db) {
    if (!m.isGroup || m.isAdmin || m.isOwner || m.fromMe) return false
    
    const groupData = db.getGroup(m.chat)
    if (!groupData || !groupData.antispam) return false

    const senderId = m.sender
    const chatKey = `${m.chat}_${senderId}`
    const now = Date.now()
    const delayThreshold = groupData.antispamDelay || 2000

    const userData = spamTracker.get(chatKey) || { count: 0, lastMessage: 0, warnings: 0 }
    
    if (now - userData.lastMessage < delayThreshold) {
        userData.count += 1
    } else {
        if (now - userData.lastMessage > delayThreshold + 1000) {
            userData.count = 1
        } else {
            userData.count = Math.max(1, userData.count - 1)
        }
    }
    
    userData.lastMessage = now
    spamTracker.set(chatKey, userData)

    if (userData.count >= 5) {
        return true
    }
    
    return false
}

async function handleSpamAction(m, sock, db) {
    const groupData = db.getGroup(m.chat)
    const action = groupData.antispamAction || "warning"
    const senderId = m.sender
    const chatKey = `${m.chat}_${senderId}`
    const userData = spamTracker.get(chatKey)

    if (action === "warning") {
        userData.warnings += 1
        spamTracker.set(chatKey, userData)
        
        if (userData.warnings >= 3) {
            await m.reply(
                `⚠️ *AVISO DE SPAM MÁXIMO*\n\n` +
                `> Para: @${senderId.split("@")[0]}\n\n` +
                `Has recibido 3 advertencias por enviar mensajes spam de forma continua. ¡Deja de hacer spam o los admins del grupo tomarán medidas firmes contra esta violación!`,
                { mentions: [senderId] }
            )
            userData.warnings = 0 
            userData.count = 0
            spamTracker.set(chatKey, userData)
        } else {
            await m.reply(
                `⚠️ *SPAM DETECTADO*\n\n` +
                `> Aviso ${userData.warnings} de máximo 3 avisos\n\n` +
                `Hola @${senderId.split("@")[0]}, por favor no envíes mensajes repetidos muy rápido en este grupo. Nuestro sistema detectó tu actividad como spam. Respeta la comodidad de los demás miembros`,
                { mentions: [senderId] }
            )
            userData.count = 0 
            spamTracker.set(chatKey, userData)
        }
    } else if (action === "kick") {
        if (m.isBotAdmin) {
            await m.reply(
                `🛑 *SPAMMER EXPULSADO*\n\n` +
                `Lo sentimos @${senderId.split("@")[0]}, serás expulsado por el sistema por hacer spam en este grupo.`, 
                { mentions: [senderId] }
            )
            await sock.groupParticipantsUpdate(m.chat, [senderId], "remove")
            spamTracker.delete(chatKey)
        } else {
            await m.reply(
                `⚠️ *SPAM DETECTADO*\n\n` +
                `Se detectó spam de @${senderId.split("@")[0]}, pero el bot no puede expulsarlo porque no es admin del grupo. Haz al bot admin para que esta función funcione correctamente`, 
                { mentions: [senderId] }
            )
            userData.count = 0
            spamTracker.set(chatKey, userData)
        }
    } else if (action === "delete") {
        if (m.isBotAdmin) {
            await sock.sendMessage(m.chat, { delete: m.key })
        } else {
            userData.count = 0
            spamTracker.set(chatKey, userData)
        }
    }
}

export { pluginConfig as config, handler, checkSpam, handleSpamAction }
