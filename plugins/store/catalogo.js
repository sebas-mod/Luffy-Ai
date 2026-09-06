import { getDatabase } from '../../src/lib/luffy-database.js'
import { saluranCtx } from '../../src/lib/luffy-context.js'

const pluginConfig = {
    name: 'catalogo',
    alias: ["vercatalogo", "miweb", "linkweb"],
    category: 'store',
    description: 'Ver el catálogo de la página web',
    usage: '.catalogo',
    example: '.catalogo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true,
}

function handler(m, { sock }) {
    const db = getDatabase()
    const url = db.setting('catalogoLink')

    if (!url) {
        m.react('❌')
        return m.reply(
            `👑•─────•👑\n🌐 *CATÁLOGO*\n\n` +
            `El catálogo aún no está disponible.\n\n` +
            `Contacta al owner del bot para más información.` +
            `\n♰ ──────── ♱`
        )
    }

    m.react('✅')

    const text = `*🛍️ CATÁLOGO*\n\n` +
        `Mirá todos nuestros productos en la página web:\n\n` +
        `${url}\n\n` +
        `_Hacé clic en el link para abrirlo_ 🔗`

    if (typeof sock?.sendPreview === 'function') {
        return sock.sendPreview(
            m.chat,
            {
                caption: text,
                url,
                title: '🛍️ Catálogo — Luffy-Ai',
                description: 'Hacé clic para abrir el catálogo',
                previewType: 1,
            },
            {
                quoted: m,
                contextInfo: saluranCtx(),
            },
        ).catch(() => m.reply(text))
    }

    return m.reply(text)
}

export { pluginConfig as config, handler }