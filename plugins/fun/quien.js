import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: [
        'tonto', 'estupido', 'viuda', 'virgen', 'cerdo', 'bobo', 'idiota',
        'maldito', 'inteligente', 'listo', 'perro', 'mentecato', 'lesbiana',
        'canalla', 'chucho', 'canino', 'rabioso', 'sabueso', 'cabron', 'bastardo',
        'mono', 'maestro', 'novato', 'desgraciado', 'maleante', 'caliente', 'fogoso',
        'baboso', 'excitado', 'otaku', 'demonio', 'diablo', 'lisiado', 'huerfano',
        'huerfana', 'guapo', 'hermosa', 'feo', 'genial', 'soso', 'inadaptado',
        'pro', 'sultan', 'pobre', 'rico', 'quien'
    ],
    alias: [],
    category: 'fun',
    description: 'Elige al azar un miembro para una categoría',
    usage: '.<kategoria>',
    example: '.guapo',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
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
        const positiveWords = ['guapo', 'hermosa', 'genial', 'pro', 'sultan', 'rico', 'inteligente', 'listo', 'maestro']
        const isPositive = positiveWords.includes(command)
        const emoji = isPositive ? '✨' : '😏'
        const label = isPositive ? 'El más' : 'El'
        await m.reply(`*${label} ${command} de aquí es* @${randomMember.split('@')[0]}`, { mentions: [randomMember] })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
