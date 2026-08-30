import { setNotifMakan, toggleNotif, getNotif, deleteNotif, parseJadwal } from '../../src/lib/luffy-notif-scheduler.js'

const pluginConfig = {
    name: 'notif_comer',
    alias: ['recordatorio_comida', 'alarma_comer'],
    category: 'group',
    description: 'Configura recordatorios automáticos de comida',
    usage: '.notif_comer on <hora1,hora2,...> [menu] / off / edit <hora1,hora2,...> [menu]',
    example: '.notif_comer on 07.00,12.00,19.00 Paella',
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

    const existing = getNotif('makan', sender, chatJid)

    if (!sub || !['on', 'off', 'edit'].includes(sub)) {
        const status = existing
            ? (existing.enabled ? '✅ Activo' : '❌ Inactivo')
            : '⚪ Sin configurar'

        let info = `☽◯☾ ╭━ ♰ 🍖 COMIDA ♰ ━╮ ☽◯☾\n\n🍽️ *RECORDATORIO DE COMIDA*\n\n`
        info += `📌 *Estado:* ${status}\n`

        if (existing) {
            info += `⏰ *Horario:* ${existing.jadwal.map(j => `*${j}* (hora local)`).join(', ')}\n`
            if (existing.menu) info += `🍴 *Menú:* _${existing.menu}_\n`
        }

        info += `\n♰ ──────── ♱\n\n*📋 Cómo Usar:*\n`
        info += `> \`${m.prefix}notif_comer on 07.00,12.00,19.00\`\n`
        info += `> \`${m.prefix}notif_comer on 07.00,12.00 Tortilla\`\n`
        info += `> \`${m.prefix}notif_comer edit 08.00,13.00\`\n`
        info += `> \`${m.prefix}notif_comer off\`\n`
        info += `\n> 💡 _La hora puede ser con punto o dos puntos (07.00 / 07:00)_\n`
        info += `> 💡 _Pueden ser varias horas, sepáralas con comas_\n\n`
        info += `╰━ ⊱༺༒༻⊰ ━╯`

        return m.reply(info)
    }

    if (sub === 'off') {
        if (!existing) {
            return m.reply(`❌ *No hay ningún recordatorio de comida* activo en este chat`)
        }
        toggleNotif('makan', sender, chatJid, false)
        return m.reply(`✅ *Recordatorio de comida desactivado* 🔕\n\n> Escribe \`${m.prefix}notif_comer on\` para activarlo de nuevo`)
    }

    if (sub === 'on') {
        if (existing?.enabled && args.length === 1) {
            return m.reply(`⚠️ *¡El recordatorio de comida ya está activo!*\n\n⏰ Horario: ${existing.jadwal.map(j => `*${j}*`).join(', ')} (hora local)\n\n> Usa \`${m.prefix}notif_comer edit\` para cambiar el horario`)
        }

        if (existing && args.length === 1) {
            toggleNotif('makan', sender, chatJid, true)
            return m.reply(`✅ *¡Recordatorio de comida reactivado!* 🔔\n\n⏰ Horario: ${existing.jadwal.map(j => `*${j}*`).join(', ')} (hora local)`)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *¡Ingresa el horario de comida!*\n\n> Ejemplo: \`${m.prefix}notif_comer on 07.00,12.00,19.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *¡Formato de hora incorrecto!*\n\n> Usa el formato *HH.MM* o *HH:MM*\n> Ejemplo: \`07.00,12.30,19.00\``)
        }

        const menu = args.slice(2).join(' ').trim()
        setNotifMakan(sender, chatJid, jadwal, menu)

        let reply = `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n✅ *¡Recordatorio de comida activo!* 🔔\n\n`
        reply += `⏰ *Horario:*\n`
        for (const j of jadwal) {
            const label = getMealLabel(j)
            reply += `> 🕐 *${j}* (hora local) _(${label})_\n`
        }
        if (menu) reply += `\n🍴 *Menú:* _${menu}_`
        reply += `\n\n> 💡 _La notificación se enviará a este chat todos los días_\n\n╰━ ⊱༺༒༻⊰ ━╯`

        return m.reply(reply)
    }

    if (sub === 'edit') {
        if (!existing) {
            return m.reply(`❌ *No hay ningún recordatorio de comida!*\n\n> Actívalo primero: \`${m.prefix}notif_comer on 07.00,12.00,19.00\``)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *¡Ingresa el nuevo horario!*\n\n> Ejemplo: \`${m.prefix}notif_comer edit 08.00,13.00,20.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *¡Formato de hora incorrecto!*\n\n> Usa el formato *HH.MM* o *HH:MM*\n> Ejemplo: \`08.00,13.00,20.00\``)
        }

        const menu = args.slice(2).join(' ').trim() || existing.menu || ''
        setNotifMakan(sender, chatJid, jadwal, menu)

        let reply = `☽◯☾ ╭━ ♰ ✦ ACTUALIZADO ♰ ━╮ ☽◯☾\n✅ *¡Horario de comida actualizado!* ✏️\n\n`
        reply += `⏰ *Nuevo horario:*\n`
        for (const j of jadwal) {
            const label = getMealLabel(j)
            reply += `> 🕐 *${j}* (hora local) _(${label})_\n`
        }
        if (menu) reply += `\n🍴 *Menú:* _${menu}_`

        return m.reply(reply)
    }
}

function getMealLabel(jam) {
    const hour = parseInt(jam.split(':')[0], 10)
    if (hour >= 4 && hour < 10) return 'mañana'
    if (hour >= 10 && hour < 15) return 'mediodía'
    if (hour >= 15 && hour < 18) return 'tarde'
    return 'noche'
}

export { pluginConfig as config, handler }
