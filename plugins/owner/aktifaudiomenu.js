import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'activoaudiomenu',
    alias: ['audiomenu', 'setaudiomenu', 'toggleaudiomenu'],
    category: 'owner',
    description: 'Activa o desactiva el audio al mostrar el menú',
    usage: '.activoaudiomenu ya/gak',
    example: '.activoaudiomenu ya',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const option = args[0]?.toLowerCase()

    const current = db.setting('audioMenu') !== false

    if (!option) {
        return m.reply(
            `🔊 *ᴀᴜᴅɪᴏ ᴍᴇɴᴜ sᴇᴛᴛɪɴɢ*\n\n` +
            `> Status: *${current ? '✅ Aktif' : '❌ Nonaktif'}*\n\n` +
            `*Forma de uso:*\n` +
            `> \`${m.prefix}activoaudiomenu ya\` - Activokan audio\n` +
            `> \`${m.prefix}activoaudiomenu gak\` - Nonactivokan audio`
        )
    }

    if (option === 'ya' || option === 'on' || option === '1' || option === 'activo') {
        if (current) {
            return m.reply(`⚠️ Audio menu ya activo!`)
        }
        db.setting('audioMenu', true)
        await db.save()
        await m.react('✅')
        return m.reply(`✅ Audio menu *diactivokan*!\n\n> Ahora cuando alguien escriba \`.menu\`, el audio aparecerá.`)
    }

    if (option === 'gak' || option === 'off' || option === '0' || option === 'nonactivo') {
        if (!current) {
            return m.reply(`⚠️ Audio menu ya inactivo!`)
        }
        db.setting('audioMenu', false)
        await db.save()
        await m.react('✅')
        return m.reply(`❌ Audio menu *dinonactivokan*!\n\n> Ahora \`.menu\` no tendrá audio.`)
    }

    return m.reply(`❌ ¡Opción no válida!\n\nUsa: \`ya\` o \`gak\``)
}

export { pluginConfig as config, handler }
