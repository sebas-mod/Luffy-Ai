import te from "../../src/lib/ourin-error.js"

const pluginConfig = {
    name: "antispam",
    alias: ["antispamgc"],
    category: "group",
    description: "Configura la protección del grupo contra mensajes spam de forma agresiva",
    usage: ".antispam <on/off/action/delay>",
    example: ".antispam on\n.antispam warning\n.antispam 2",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
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
            `Esta función protege al grupo de miembros que envían mensajes repetidamente muy rápido y de forma agresiva, molestando la comodidad de los demás miembros.\n\n` +
            `*Cómo usar:*\n` +
            `> \`${m.prefix}antispam on\` (Activar antispam)\n` +
            `> \`${m.prefix}antispam off\` (Desactivar antispam)\n\n` +
            `*Elige el método de castigo:*\n` +
            `> \`${m.prefix}antispam warning\` (Advertencia fuerte hasta 3 veces)\n` +
            `> \`${m.prefix}antispam kick\` (Expulsar al spammer automáticamente sin piedad)\n` +
            `> \`${m.prefix}antispam delete\` (Borrar todos los mensajes de spam enviados)\n\n` +
            `*Configurar la sensibilidad del intervalo:*\n` +
            `> \`${m.prefix}antispam 2\` (Intervalo máximo de 2 segundos entre mensajes)\n` +
            `> \`${m.prefix}antispam 1500\` (Intervalo de 1500 milisegundos)`
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
            `> Intervalo Máximo: *${delayMs} ms* (${(delayMs/1000).toFixed(1)} segundos)\n\n` +
            `El sistema ahora considerará como spam si un miembro envía varios mensajes con un intervalo inferior a *${(delayMs/1000).toFixed(1)} segundos* entre ellos`
        )
    }

    if (action === "on" || action === "off") {
        const isEnable = action === "on"
        if (groupData.antispam === isEnable) {
            return m.reply(`✅ La función antispam ya está ${isEnable ? "activa" : "inactiva"} en este grupo, no hay cambios que hacer`)
        }
        
        groupData.antispam = isEnable
        db.setGroup(m.chat, groupData)
        
        await m.reply(
            `🛡️ *ANTI SPAM ACTUALIZADO*\n\n` +
            `> Estado: *${isEnable ? "ACTIVO ✅" : "INACTIVO ❌"}*\n\n` +
            `El sistema del bot ahora ${isEnable ? "supervisará rigurosamente" : "dejará de supervisar"} cada actividad de spam o flood de mensajes realizada por los miembros en este grupo`
        )
    } else {
        groupData.antispamAction = action
        db.setGroup(m.chat, groupData)
        
        let textAction = ""
        if (action === "warning") textAction = "Dar advertencias fuertes gradualmente"
        if (action === "kick") textAction = "Expulsar a miembros tercos automáticamente"
        if (action === "delete") textAction = "Borrar mensajes de spam molestos"
        
        await m.reply(
            `🛡️ *ACCIÓN ANTI SPAM ACTUALIZADA*\n\n` +
            `> Método de Castigo: *${action.toUpperCase()}*\n\n` +
            `El sistema del bot tomará medidas de *${textAction}* si algún miembro es detectado realizando spam agresivo`
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
                `⚠️ *MÁXIMO DE ADVERTENCIAS POR SPAM*\n\n` +
                `> Para: @${senderId.split("@")[0]}\n\n` +
                `Has recibido 3 advertencias por enviar mensajes de spam continuamente. ¡Por favor detente o los admins del grupo tomarán medidas firmes! ¡Shishishi!`,
                { mentions: [senderId] }
            )
            userData.warnings = 0 
            userData.count = 0
            spamTracker.set(chatKey, userData)
        } else {
            await m.reply(
                `⚠️ *ADVERTENCIA POR SPAM DETECTADA*\n\n` +
                `> Advertencia ${userData.warnings} de máximo 3\n\n` +
                `Hola @${senderId.split("@")[0]}, ¡por favor no envíes mensajes repetidos tan rápido en este grupo! Nuestro sistema detectó tu actividad como spam. Respeta la comodidad de los demás miembros, ¡shishishi!`,
                { mentions: [senderId] }
            )
            userData.count = 0 
            spamTracker.set(chatKey, userData)
        }
    } else if (action === "kick") {
        if (m.isBotAdmin) {
            await m.reply(
                `🛑 *SPAMMER EXPULSADO*\n\n` +
                `Lo siento mucho @${senderId.split("@")[0]}, serás expulsado por el sistema porque fuiste detectado haciendo spam agresivo en este grupo. ¡Shishishi!`, 
                { mentions: [senderId] }
            )
            await sock.groupParticipantsUpdate(m.chat, [senderId], "remove")
            spamTracker.delete(chatKey)
        } else {
            await m.reply(
                `⚠️ *SPAM DETECTADO*\n\n` +
                `Se detectó spam agresivo de @${senderId.split("@")[0]}, pero el bot no puede expulsar a ese miembro porque no tiene permisos de admin. ¡Haz admin al bot para que funcione al máximo!`, 
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
