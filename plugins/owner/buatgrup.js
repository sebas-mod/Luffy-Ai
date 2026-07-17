const pluginConfig = {
    name: ['buatgrup', 'creategroup', 'newgroup'],
    alias: ['creargrupo', 'newgroup'],
    category: 'owner',
    description: 'Crea un grupo nuevo',
    usage: '.buatgrup <nombre>|<número1,número2,...>|<durasi_minuto>',
    example: '.buatgrup Grup Nuevo|628xxx,628yyy|60',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim() || ''
    const args = text.split('|')

    if (args.length < 2) {
        let txt = `👥 *CREAR GRUPO NUEVO* 👥\n\n`
        txt += `¡Hola Owner! ¿Quieres crear un grupo nuevo de forma instantánea?\n\n`
        txt += `*Modo de Uso:*\n`
        txt += `👉 \`${m.prefix}buatgrup Nombre Grup | 628xxx,628yyy | Durasi(minuto)\`\n\n`
        txt += `*Detail:*\n`
        txt += `• Usa \`|\` para separar nombre, participantes y duración\n`
        txt += `• Separa los números de participantes con coma\n`
        txt += `• Si se indica duración, el bot expulsará a todos los miembros y eliminará el grupo cuando el tiempo termine!\n`
        txt += `• El bot será automáticamente admin\n\n`
        txt += `*Ejemplo Sin Duracion:*\n`
        txt += `\`${m.prefix}buatgrup Tim Alpha | 628123,628456\`\n\n`
        txt += `*Ejemplo Con Duracion (Periodo Activo 60 Minutos):*\n`
        txt += `\`${m.prefix}buatgrup Tim Beta | 628123,628456 | 60\``
        return m.reply(txt)
    }

    const name = args[0].trim()
    const participantsStr = args[1].trim()
    const durationStr = args[2] ? args[2].trim() : ''

    if (!name || name.length < 2) {
        return m.reply('❌ ¡Vaya, el nombre del grupo es muy corto! Debe tener al menos 2 caracteres.')
    }

    const participants = participantsStr
        .split(/[,;\s]+/)
        .map(n => n.replace(/[^0-9]/g, ''))
        .filter(n => n.length >= 5)
        .map(n => n + '@s.whatsapp.net')

    if (participants.length === 0) {
        return m.reply('❌ ¡Oye, ¿dónde están los números de participantes? Ingresa al menos 1 número.')
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
        successTxt += `👤 *Participantes:* ${participants.length} persona(s)\n`
        
        if (durationMs > 0) {
            successTxt += `⏳ *Periodo Activo:* ${durationMins} Minutos\n`
            successTxt += `\n⚠️ _¡Este grupo será automáticamente eliminado y todos los miembros serán expulsados cuando el tiempo activo termine!_\n`
        }

        successTxt += `\n_¡El bot será automáticamente admin de este grupo!_`
        await m.reply(successTxt)

        if (durationMs > 0) {
            setTimeout(async () => {
                try {
                    const groupMeta = await sock.groupMetadata(group.id)
                    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
                    
                    const membersToKick = groupMeta.participants
                        .map(p => p.id)
                        .filter(id => id !== botJid)

                    if (membersToKick.length > 0) {
                        await sock.sendMessage(group.id, { text: `⏳ *TIEMPO ACTIVO DEL GRUPO AGOTADO* ⏳\n\nSegún el comando del Owner, el tiempo de este grupo ha terminado. ¡Adiós a todos! 👋` })
                        await sock.groupParticipantsUpdate(group.id, membersToKick, 'remove')
                    }
                    
                    await sock.groupLeave(group.id)
                } catch (e) {
                    console.log(`Error al eliminar grup automáticamente (${group.id}):`, e)
                }
            }, durationMs)
        }

        await m.react('✅')
    } catch (err) {
        await m.react('❌')
        return m.reply(`❌ Lo siento, error al crear el grupo! 😭\nError: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
