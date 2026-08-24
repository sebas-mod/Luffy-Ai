import { setNotifTidur, toggleNotif, getNotif, deleteNotif, parseJadwal } from '../../src/lib/luffy-notif-scheduler.js'

const pluginConfig = {
    name: 'notif_dormir',
    alias: ['recordatorio_dormir', 'alarma_dormir'],
    category: 'group',
    description: 'Configura recordatorios automáticos de la hora de dormir',
    usage: '.notif_dormir on <hora1,hora2,...> / off / edit <hora1,hora2,...>',
    example: '.notif_dormir on 22.00',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

function handler(m) {
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    const chatJid = m.chat
    const sender = m.sender

    const existing = getNotif('tidur', sender, chatJid)

    if (!sub || !['on', 'off', 'edit'].includes(sub)) {
        const status = existing
            ? (existing.enabled ? '✅ Activo' : '❌ Inactivo')
            : '⚪ Sin configurar'

        let info = `╭━━━〔 🌙 DORMIR 〕━━━╮\n\n🌙 *RECORDATORIO DE SUEÑO*\n\n`
        info += `📌 *Estado:* ${status}\n`

        if (existing) {
            info += `⏰ *Horario:* ${existing.jadwal.map(j => `*${j}* (hora local)`).join(', ')}\n`
        }

        info += `\n✦────────✦\n\n*📋 Cómo Usar:*\n`
        info += `> \`${m.prefix}notif_dormir on 22.00\`\n`
        info += `> \`${m.prefix}notif_dormir on 22.00,23.30\`\n`
        info += `> \`${m.prefix}notif_dormir edit 23.00\`\n`
        info += `> \`${m.prefix}notif_dormir off\`\n`
        info += `\n> 💡 _La hora puede ser con punto o dos puntos (22.00 / 22:00)_\n`
        info += `> 💡 _Pueden ser varias horas, sepáralas con comas_\n\n`
        info += `╰━━━━━━━━━━━━╯`

        return m.reply(info)
    }

    if (sub === 'off') {
        if (!existing) {
            return m.reply(`❌ *No hay ningún recordatorio de sueño* activo en este chat`)
        }
        toggleNotif('tidur', sender, chatJid, false)
        return m.reply(`✅ *Recordatorio de sueño desactivado* 🔕\n\n> Escribe \`${m.prefix}notif_dormir on\` para activarlo de nuevo`)
    }

    if (sub === 'on') {
        if (existing?.enabled && args.length === 1) {
            return m.reply(`⚠️ *¡El recordatorio de sueño ya está activo!*\n\n⏰ Horario: ${existing.jadwal.map(j => `*${j}*`).join(', ')} (hora local)\n\n> Usa \`${m.prefix}notif_dormir edit\` para cambiar el horario`)
        }

        if (existing && args.length === 1) {
            toggleNotif('tidur', sender, chatJid, true)
            return m.reply(`✅ *¡Recordatorio de sueño reactivado!* 🔔\n\n⏰ Horario: ${existing.jadwal.map(j => `*${j}*`).join(', ')} (hora local)`)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *¡Ingresa el horario de sueño!*\n\n> Ejemplo: \`${m.prefix}notif_dormir on 22.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *¡Formato de hora incorrecto!*\n\n> Usa el formato *HH.MM* o *HH:MM*\n> Ejemplo: \`22.00\` o \`23.30\``)
        }

        setNotifTidur(sender, chatJid, jadwal)

        let reply = `╭━━━〔 ✦ ÉXITO 〕━━━╮\n✅ *¡Recordatorio de sueño activo!* 🔔\n\n`
        reply += `⏰ *Horario:*\n`
        for (const j of jadwal) {
            reply += `> 🕐 *${j}* (hora local)\n`
        }
        reply += `\n> 💡 _La notificación se enviará a este chat todos los días_\n\n╰━━━━━━━━━━━━╯`

        return m.reply(reply)
    }

    if (sub === 'edit') {
        if (!existing) {
            return m.reply(`❌ *No hay ningún recordatorio de sueño!*\n\n> Actívalo primero: \`${m.prefix}notif_dormir on 22.00\``)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *¡Ingresa el nuevo horario!*\n\n> Ejemplo: \`${m.prefix}notif_dormir edit 23.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *¡Formato de hora incorrecto!*\n\n> Usa el formato *HH.MM* o *HH:MM*\n> Ejemplo: \`23.00\` o \`22.30\``)
        }

        setNotifTidur(sender, chatJid, jadwal)

        let reply = `╭━━━〔 ✦ ACTUALIZADO 〕━━━╮\n✅ *¡Horario de sueño actualizado!* ✏️\n\n`
        reply += `⏰ *Nuevo horario:*\n`
        for (const j of jadwal) {
            reply += `> 🕐 *${j}* (hora local)\n`
        }

        return m.reply(reply)
    }
}

export { pluginConfig as config, handler }
