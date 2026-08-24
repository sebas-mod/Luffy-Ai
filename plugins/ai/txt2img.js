import config from '../../config.js'
import { f } from './../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'text2img3',
    alias: [],
    category: 'ai',
    description: 'Genera imágenes desde texto con IA',
    usage: '.txt2img <prompt> | <style>',
    example: '.txt2img beautiful sunset | anime',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    carne: 1,
    isEnabled: true
}

const STYLES = ['photorealistic', 'digital-art', 'impressionist', 'anime', 'fantasy', 'sci-fi', 'vintage']

async function handler(m, { sock }) {
    const input = m.args.join(' ')
    if (!input) {
        return m.reply(
            `╭━━━〔 ✦ 〕━━━╮\n\n` +
            `🎨 *ᴛᴇxᴛ ᴛᴏ ɪᴍᴀɢᴇ*\n\n` +
            `> Genera imágenes desde texto con IA\n\n` +
            `\`Ejemplo: ${m.prefix}txt2img beautiful sunset | anime\`\n\n` +
            `🎭 *sᴛʏʟᴇs*\n` +
            `> \`${STYLES.join(', ')}\`\n\n` +
            `╰━━━━━━━━━━━━╯`
        )
    }

    const [prompt, styleInput] = input.split('|').map(s => s.trim())
    const style = STYLES.includes(styleInput) ? styleInput : 'anime'

    m.react('🕕')

    try {
        const { data } = await f(`https://api.neoxr.eu/api/stablediff?prompt=${encodeURIComponent(prompt)}&model=default&orientation=potrait&apikey=${config.APIkey.neoxr}`)

        await sock.sendMedia(m.chat, data.url, null, m, {
            type: 'image'
        })

    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }