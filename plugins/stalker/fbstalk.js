import axios from 'axios'
import te from '../../src/lib/luffy-error.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'fbstalk',
    alias: ['facebookstalk', 'fbstalking'],
    category: 'stalker',
    description: 'Buscar perfil de Facebook',
    usage: '.fbstalk <usuario|url>',
    example: '.fbstalk zuck',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

function getApiKey() {
    return (
        config.downloader?.spotifySearchKey ||
        config.downloader?.apiKey ||
        'sebasapi2024'
    )
}

function cleanUrl(input) {
    if (/^https?:\/\//i.test(input)) return input.trim()
    return `https://www.facebook.com/${input.replace(/^@/, '').trim()}`
}

function buildProfileUrl(url, title, description, thumbnail) {
    const base = title || description?.split('\n')[0] || url
    const header =
        `☽◯☾ ╭━ ♰ 👤 ғᴀᴄᴇʙᴏᴏᴋ sᴛᴀʟᴋ ♰ ━╮ ☽◯☾\n\n` +
        `☽◯☾ ♰ 📛 *Nombre:* ${title || '-'}\n──────────\n` +
        `📝 *Bio:*\n${description || '-'}\n──────────\n` +
        `🔗 ${url}\n\n╰━ ⊱༺༒༻⊰ ━╯`
    return { header, title: base, url, thumbnail }
}

async function handler(m, { sock }) {
    const query = m.args?.join(' ')?.trim()

    if (!query) {
        return m.reply(
            `☽◯☾ ╭━ ♰ 📘 ғᴀᴄᴇʙᴏᴏᴋ sᴛᴀʟᴋ ♰ ━╮ ☽◯☾\n\n` +
                `> Ingresa el nombre o URL del perfil de Facebook\n\n` +
                `\`Ejemplo: ${m.prefix}fbstalk zuck\`\n` +
                `\`Ejemplo: ${m.prefix}fbstalk https://www.facebook.com/zuck\`\n\n╰━ ⊱༺༒༻⊰ ━╯`
        )
    }

    m.react('🔍')

    try {
        const target = cleanUrl(query)
        const res = await axios.get(
            `https://api-yosoyyo-api-ofc.onrender.com/api/facebook?url=${encodeURIComponent(target)}&apiKey=${encodeURIComponent(getApiKey())}`,
            { timeout: 35000 }
        )

        const d = res.data?.result
        if (!res.data?.status || !d) {
            m.react('❌')
            return m.reply(`☽◯☾ ♰ ❌ No se pudo obtener el perfil de Facebook`)
        }

        const { header, title, url, thumbnail } = buildProfileUrl(
            target,
            d.title || null,
            d.description || null,
            d.thumbnail || null
        )

        const extraLines = []
        if (d.duration) extraLines.push(`☽◯☾ ♰ ⏱️ *Duración:* ${d.duration}`)
        if (d.author?.name) extraLines.push(`☽◯☾ ♰ 👤 *Autor:* ${d.author.name}`)

        const caption =
            header +
            (extraLines.length
                ? `──────────\n${extraLines.join('\n')}\n`
                : ``) +
            `\n╰━ ⊱༺༒༻⊰ ━╯`

        m.react('✅')

        if (thumbnail) {
            await sock.sendMessage(m.chat, {
                image: { url: thumbnail },
                caption
            }, { quoted: m })
        } else {
            await m.reply(caption)
        }
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }