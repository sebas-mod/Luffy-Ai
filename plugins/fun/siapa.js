import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: [
        'tonto', 'idiota', 'viuda', 'virgen', 'cerdo', 'estúpido', 'loco', 
        'malparido', 'listo', 'inteligente', 'perro', 'bruto', 'gay', 'lesbiana',
        'desgraciado', 'perro', 'perro', 'perro', 'perro', 'jodido', 'jodido',
        'mono', 'veterano', 'novato', 'hijo de puta', 'hijo de puta', 'caliente', 'caliente',
        'demonio', 'horny', 'otaku', 'vulva', 'vulva', 'pico', 'perra', 'perra',
        'demonio', 'demonio', 'discapacitado', 'huérfano', 'huérfano', 'guapo', 'bonito',
        'feo', 'genial', 'patético', 'noob', 'pro', 'sultán', 'pobre', 'rico', 'quién'
    ],
    alias: ['quien', 'aleatorio'],
    category: 'fun',
    description: 'Elegir miembro aleatorio para una categoría',
    usage: '.<categoría>',
    example: '.ganteng',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const command = m.command?.toLowerCase()
    m.react('🕕')
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        const members = participants
            .map(p => p.jid)
            .filter(id => id && id !== sock.user?.id?.split(':')[0] + '@s.whatsapp.net')
        if (members.length === 0) {
            return m.reply(`❌ ¡No hay miembros en el grupo!`)
        }
        const randomMember = members[Math.floor(Math.random() * members.length)]
        const positiveWords = ['ganteng', 'cantik', 'keren', 'pro', 'sultan', 'kaya', 'pinter', 'pintar', 'mastah']
        const isPositive = positiveWords.includes(command)
        const emoji = isPositive ? '✨' : '😏'
        const label = isPositive ? 'El más' : 'El niño'
        await m.reply(`*${label} ${command} aquí es* @${randomMember.split('@')[0]}`, { mentions: [randomMember] })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
