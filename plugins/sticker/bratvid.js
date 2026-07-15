import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
import { bratVid } from 'brat-canvas/video'
import fs from 'fs'
import path from 'path'
import os from 'os'

const pluginConfig = {
    name: 'bratvid',
    alias: ['bratgif', 'bratvideo'],
    category: 'sticker',
    description: 'Membuat sticker brat animated',
    usage: '.bratvid <text>',
    example: '.bratvid Hai semua',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    if (!text) {
        return m.reply(`🎬 *ʙʀᴀᴛ ᴀɴɪᴍᴀᴛᴇᴅ*\n\n> Masukkan teks\n\n\`Contoh: ${m.prefix}bratvid Hai semua\``)
    }
    
    m.react('🕕')
    
    const tempFile = path.join(os.tmpdir(), `brat-${Date.now()}.webp`)
    try {
        const url = await bratVid(text, {
            outputFormat: 'mp4',
        })
        await fs.promises.writeFile(tempFile, url)
        await sock.sendVideoAsSticker(m.chat, tempFile, m, {
            packname: config.sticker.packname,
            author: config.sticker.author
        })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    } finally {
        try { await fs.promises.unlink(tempFile); } catch {}
    }
}

export { pluginConfig as config, handler }