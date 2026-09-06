import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'setcatalogo',
    alias: ["setcatalogo", "setlinkcatalogo", "catalogolink"],
    category: 'owner',
    description: 'Configurar el link de la página web del catálogo',
    usage: '.setcatalogo <link>',
    example: '.setcatalogo https://mipagina.com/catalogo',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true,
}

function handler(m) {
    const db = getDatabase()

    const input = m.args.join(' ').trim()

    if (!input) {
        m.react('❌')
        return m.reply(
            `👑•─────•👑\n🌐 *CONFIGURAR CATÁLOGO*\n\n` +
            `Poné el link de tu página web:\n\n` +
            `*${m.prefix}setcatalogo <link>*\n\n` +
            `*EJEMPLO:*\n` +
            `• ${m.prefix}setcatalogo https://mipagina.com/catalogo\n\n` +
            `💡 Así, cuando alguien escriba *${m.prefix}catalogo*, el bot envía el link\n` +
            `♰ ──────── ♱`
        )
    }

    const url = input.startsWith('http') ? input : `https://${input}`

    db.setting('catalogoLink', url)
    db.db.write()

    m.react('✅')
    return m.reply(
        `👑•─────•👑\n🌐 *CATÁLOGO CONFIGURADO*\n\n` +
        `Link guardado:\n${url}\n\n` +
        `Cuando alguien escriba *${m.prefix}catalogo* se enviará este enlace.` +
        `\n♰ ──────── ♱`
    )
}

export { pluginConfig as config, handler }