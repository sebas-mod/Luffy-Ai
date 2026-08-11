import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'onlyadmin',
    alias: ['selfadmin', 'publicadmin', 'adminonly'],
    category: 'owner',
    description: 'Solo los admins del grupo pueden usar los comandos del bot',
    usage: '.onlyadmin on/off',
    example: '.onlyadmin on',
    isOwner: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const args = m.args[0]?.toLowerCase()
    const cmd = m.command.toLowerCase()
    const current = db.setting('onlyAdmin') || false

    if (cmd === 'selfadmin') {
        if (current) {
            db.setting('onlyAdmin', false)
            await m.react('❌')
            return m.reply('❌ *sᴏʟᴏᴀᴅᴍɪɴ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot puede ser usado por todos')
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *sᴏʟᴏᴀᴅᴍɪɴ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴄᴄᴇsᴏ* 」\n' +
            '┃ ✅ Admin del grupo\n' +
            '┃ ✅ Owner del bot\n' +
            '┃ ❌ Miembros normales\n' +
            '╰┈┈⬡\n\n' +
            '> Usa `.onlyadmin off` para desactivar'
        )
    }

    if (cmd === 'publicadmin') {
        if (current) {
            db.setting('onlyAdmin', false)
            await m.react('❌')
            return m.reply('❌ *sᴏʟᴏᴀᴅᴍɪɴ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot puede ser usado por todos')
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *sᴏʟᴏᴀᴅᴍɪɴ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴄᴄᴇsᴏ* 」\n' +
            '┃ ✅ Admin del grupo\n' +
            '┃ ✅ Owner del bot\n' +
            '┃ ✅ Chat privado (todos)\n' +
            '┃ ❌ Miembros normales en el grupo\n' +
            '╰┈┈⬡\n\n' +
            '> Usa `.onlyadmin off` para desactivar'
        )
    }

    if (!args || args === 'status') {
        return m.reply(
            `🔒 *sᴏʟᴏᴀᴅᴍɪɴ*\n\n` +
            `> Estado: ${current ? '✅ Activo' : '❌ Inactivo'}\n\n` +
            `*Uso:*\n` +
            `> \`.onlyadmin on\` — Activar\n` +
            `> \`.onlyadmin off\` — Desactivar\n\n` +
            `_Solo los admins del grupo, el owner y los chats privados pueden usar el bot_`
        )
    }

    if (args === 'on') {
        if (current) return m.reply('⚠️ SoloAdmin ya está activo.')
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *sᴏʟᴏᴀᴅᴍɪɴ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴄᴄᴇsᴏ* 」\n' +
            '┃ ✅ Admin del grupo\n' +
            '┃ ✅ Owner del bot\n' +
            '┃ ✅ Chat privado (todos)\n' +
            '┃ ❌ Miembros normales en el grupo\n' +
            '╰┈┈⬡'
        )
    }

    if (args === 'off') {
        if (!current) return m.reply('⚠️ SoloAdmin ya está inactivo.')
        db.setting('onlyAdmin', false)
        await m.react('❌')
        return m.reply('❌ *sᴏʟᴏᴀᴅᴍɪɴ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot puede ser usado por todos')
    }

    return m.reply('❌ Argumento no válido. Usa: `on` u `off`')
}

export { pluginConfig as config, handler }