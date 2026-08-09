import { findParticipantByNumber } from "../../src/lib/luffy-lid.js";

const pluginConfig = {
    name: ['buatgrup', 'creategroup', 'newgroup'],
    alias: [],
    category: 'owner',
    description: 'Buat grup baru',
    usage: '.buatgrup <nama>|<nomor1,nomor2,...>|<durasi_menit>',
    example: '.buatgrup Grup Baru|628xxx,628yyy|60',
    isOwner: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim() || ''
    const args = text.split('|')

    if (args.length < 2) {
        let txt = `👥 *CREAR NUEVO GRUPO* 👥\n\n`
        txt += `¡Hola jefe Owner! ¿Quieres crear un grupo nuevo al instante?\n\n`
        txt += `*Cómo Usar:*\n`
        txt += `👉 \`${m.prefix}buatgrup Nombre del Grupo | 628xxx,628yyy | Duración(minutos)\`\n\n`
        txt += `*Detalles:*\n`
        txt += `• Usa \`|\` para separar el nombre, los participantes y la duración\n`
        txt += `• Separa los números de participantes con comas\n`
        txt += `• Si se establece una duración, el bot expulsará a todos los miembros y eliminará el grupo cuando expire el tiempo!\n`
        txt += `• El bot se vuelve admin automáticamente\n\n`
        txt += `*Ejemplo Sin Duración:*\n`
        txt += `\`${m.prefix}buatgrup Equipo Alfa | 628123,628456\`\n\n`
        txt += `*Ejemplo Con Duración (Periodo Activo 60 Minutos):*\n`
        txt += `\`${m.prefix}buatgrup Equipo Beta | 628123,628456 | 60\``
        return m.reply(txt)
    }

    const name = args[0].trim()
    const participantsStr = args[1].trim()
    const durationStr = args[2] ? args[2].trim() : ''

    if (!name || name.length < 2) {
        return m.reply('❌ ¡Vaya jefe, el nombre del grupo es muy corto! Mínimo 2 caracteres.')
    }

    const participants = participantsStr
        .split(/[,;\s]+/)
        .map(n => n.replace(/[^0-9]/g, ''))
        .filter(n => n.length >= 5)
        .map(n => n + '@s.whatsapp.net')

    if (participants.length === 0) {
        return m.reply('❌ ¡Eh jefe, dónde están los números de los participantes? Introduce al menos 1 número.')
    }

    let durationMs = 0
    let durationMins = 0
    if (durationStr) {
        durationMins = parseInt(durationStr.replace(/[^0-9]/g, ''))
        if (!isNaN(durationMins) && durationMins > 0) {
            durationMs = durationMins * 60 * 1000
        }
    }

    try {
        await m.react('🕕')
        const group = await sock.groupCreate(name, participants)
        
        let successTxt = `👥 *GRUPO CREADO CON ÉXITO* 👥\n\n`
        successTxt += `✨ *Nombre:* ${name}\n`
        successTxt += `🆔 *ID:* ${group.id}\n`
        successTxt += `👤 *Participantes:* ${participants.length} personas\n`
        
        if (durationMs > 0) {
            successTxt += `⏳ *Periodo Activo:* ${durationMins} Minutos\n`
            successTxt += `\n⚠️ _Este grupo se eliminará automáticamente y todos los miembros serán expulsados cuando expire el periodo activo!_\n`
        }

        successTxt += `\n_El bot se volvió admin de este grupo automáticamente, jefe!_`
        await m.reply(successTxt)

        if (durationMs > 0) {
            setTimeout(async () => {
                try {
                    const groupMeta = await sock.groupMetadata(group.id)
                    const botNum = sock.user?.id?.split(":")[0] || ""
                    const botLid = sock.user?.lid ? String(sock.user.lid).replace(/@.+/g, "") : null
                    const botJid = botNum ? botNum + "@s.whatsapp.net" : ""
                    const botParticipant = botJid
                        ? findParticipantByNumber(groupMeta.participants || [], botJid)
                        : null
                    const botId = botParticipant?.id || botJid
                    
                    const membersToKick = groupMeta.participants
                        .map(p => p.id)
                        .filter(id => id !== botId && (!botLid || !String(id).includes(botLid)))

                    if (membersToKick.length > 0) {
                        await sock.sendMessage(group.id, { text: `⏳ *EL PERIODO ACTIVO DEL GRUPO EXPIRÓ* ⏳\n\nPor orden del Owner, el tiempo de este grupo ha terminado. ¡Adiós a todos! 👋` })
                        await sock.groupParticipantsUpdate(group.id, membersToKick, 'remove')
                    }
                    
                    await sock.groupLeave(group.id)
                } catch (e) {
                    console.log(`Fallo al eliminar el grupo automáticamente (${group.id}):`, e)
                }
            }, durationMs)
        }

        await m.react('✅')
    } catch (err) {
        await m.react('❌')
        return m.reply(`❌ ¡Lo siento jefe, falló la creación del grupo! 😭\nError: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
