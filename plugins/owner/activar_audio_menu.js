import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'activar_audio_menu',
    alias: ["audiomenu", "toggleaudiomenu"],
    category: 'owner',
    description: 'Activar/desactivar el audio al mostrar el menú',
    usage: '.activar_audio_menu si/no',
    example: '.activar_audio_menu si',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const option = args[0]?.toLowerCase()

    const current = db.setting('audioMenu') !== false

    if (!option) {
        return m.reply(
            `🔊 *ᴄᴏɴꜰɪɢᴜʀᴀᴄɪóɴ ᴅᴇʟ ᴀᴜᴅɪᴏ ᴅᴇʟ ᴍᴇɴú*\n\n` +
            `> Estado: *${current ? '✅ Activo' : '❌ Inactivo'}*\n\n` +
            `*Cómo usar:*\n` +
            `> \`${m.prefix}activar_audio_menu si\` - Activar el audio\n` +
            `> \`${m.prefix}activar_audio_menu no\` - Desactivar el audio`
        )
    }

    if (option === 'si' || option === 'on' || option === '1' || option === 'activo') {
        if (current) {
            return m.reply(`╰┈➤ ⚠️ El audio del menú ya está activo!`)
        }
        db.setting('audioMenu', true)
        await db.save()
        await m.react('✅')
        return m.reply(`👑•─────•👑\n✅ Audio del menú *activado*!\n\n> Ahora cuando alguien escriba \`.menu\`, el audio aparecerá.\n✦────────✦`)
    }

    if (option === 'no' || option === 'off' || option === '0' || option === 'inactivo') {
        if (!current) {
            return m.reply(`╰┈➤ ⚠️ El audio del menú ya está inactivo!`)
        }
        db.setting('audioMenu', false)
        await db.save()
        await m.react('✅')
        return m.reply(`👑•─────•👑\n❌ Audio del menú *desactivado*!\n\n> Ahora \`.menu\` no tendrá audio.\n✦────────✦`)
    }

    return m.reply(`👑•─────•👑\n❌ ¡Opción no válida!\n\nUsa: \`si\` o \`no\`\n✦────────✦`)
}

export { pluginConfig as config, handler }