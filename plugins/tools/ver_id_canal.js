import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'

const pluginConfig = {
    name: 'ver_id_canal',
    alias: ['idch', 'channelid', 'infoch', 'channelinfo'],
    category: 'tools',
    description: 'Comprueba el ID e información completa del canal desde un enlace',
    usage: '.cekidch <enlace del canal>',
    example: '.cekidch https://whatsapp.com/channel/xxxxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

function formatDate(timestamp) {
    if (!timestamp) return '—'
    const d = new Date(typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : timestamp)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatSubs(count) {
    if (!count || count === 0) return '0'
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (count >= 1_000) return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
    return String(count)
}

async function handler(m, { sock }) {
    const text = m.text?.trim()

    if (!text) {
        return m.reply(
            `ℹ️ *INFORMACIÓN DE USO*\n\n` +
            `Ingresa el enlace del canal de WhatsApp cuya información deseas consultar en detalle.\n\n` +
            `*EJEMPLO DE USO:*\n` +
            `• \`${m.prefix}ver_id_canal https://whatsapp.com/channel/xxxxx\``
        )
    }

    if (!text.includes('https://whatsapp.com/channel/')) {
        return m.reply(`❌ *ENLACE NO VÁLIDO*\n\nAsegúrate de que el enlace que ingresaste sea un enlace de canal de WhatsApp válido y correcto.`)
    }

    m.react('🕕')

    try {
        const metadata = await sock.cekIDSaluran(text)

        if (!metadata?.id) {
            m.react('❌')
            return m.reply(`❌ *CANAL NO ENCONTRADO*\n\nLo siento, el sistema no pudo encontrar información de ese canal. Quizás el enlace caducó o el canal fue eliminado.`)
        }

        const chName = metadata.name || 'Unknown'
        const chId = metadata.id
        const chSubs = metadata.subscribers ?? metadata.subscribers_count ?? 0
        const chDesc = metadata.description || '—'
        const chVerified = metadata.verification === 'VERIFIED' ? '✓ Verificado' : 'No verificado'
        const chCreated = formatDate(metadata.creation_time)
        const chPicUrl = metadata.preview === "https://mmg.whatsapp.net" ? "https://files.catbox.moe/lp9tpd.jpg" : metadata.preview

        const descPreview = chDesc.length > 120 ? chDesc.slice(0, 120) + '...' : chDesc

        const infoText =
            `Estos son los detalles completos de información del canal que estás buscando:\n\n` +
            `*DETALLES DEL CANAL:*\n` +
            `• Nombre: *${chName}*\n` +
            `• ID del Canal: \`${chId}\`\n` +
            `• Suscriptores: *${formatSubs(chSubs)}*\n` +
            `• Estado: *${chVerified}*\n` +
            `• Creado el: *${chCreated}*\n\n` +
            `*DESCRIPCIÓN:*\n` +
            `${descPreview}`

        const buttons = [
            {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                    display_text: '📋 Obtener el ID del canal',
                    copy_code: chId
                })
            },
            {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: '🔗 Abrir el canal',
                    url: text
                })
            }
        ]

        await sock.sendButton(m.chat, chPicUrl, infoText, m, {
            buttons: buttons,
            footer: `© ${config.bot?.name || 'Luffy-Ai'}`,
        })

        m.react('✅')

    } catch (error) {
        console.error('[CekIdCh] Error:', error.message)
        m.react('❌')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }