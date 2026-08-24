import fs from 'fs'
import path from 'path'
import axios from 'axios'
import os from 'os'
import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
import util from 'util'
const pluginConfig = {
    name: 'exec',
    alias: ['>', 'run', 'execute'],
    category: 'owner',
    description: 'Ejecutar código JS desde el mensaje respondido (Solo Owner)',
    usage: '.> (responde un mensaje con código)',
    example: '.> (reply)',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock, store }) {
    if (!config.isOwner(m.sender)) {
        return m.reply('╰┈➤ ❌ *Owner Only!*')
    }

    let code = null

    if (m.quoted) {
        code = m.quoted.text || m.quoted.body || m.quoted.caption
    }

    if (!code) {
        code = m.fullArgs?.trim() || m.text?.trim()
    }

    if (!code) {
        return m.reply(
            `⚙️ *ᴇxᴇᴄ*\n\n` +
            `> ¡Responde a un mensaje con código JavaScript!\n\n` +
            `*O:*\n` +
            `> .> <code>\n\n` +
            `*Ejemplo:*\n` +
            `> Responde al mensaje: \`return m.chat\`\n` +
            `> Luego escribe: .>`
        )
    }

    code = code.trim()

    if (code.startsWith('```') && code.endsWith('```')) {
        code = code.slice(3, -3)
        if (code.startsWith('javascript') || code.startsWith('js')) {
            code = code.replace(/^(javascript|js)\n?/, '')
        }
    }

    const db = getDatabase()

    let result
    let isError = false

    try {
        result = await eval(`(async () => { ${code} })()`)
    } catch (e) {
        isError = true
        result = e
    }

    let output
    if (typeof result === 'undefined') {
        output = 'undefined'
    } else if (result === null) {
        output = 'null'
    } else if (typeof result === 'object') {
        try {
            output = util.inspect(result, { depth: 2, maxArrayLength: 50 })
        } catch {
            output = String(result)
        }
    } else {
        output = String(result)
    }

    if (output.length > 3000) {
        output = output.slice(0, 3000) + '\n\n... (truncated)'
    }

    const status = isError ? '❌ Error' : '✅ Éxito'
    const type = isError ? result?.name || 'Error' : typeof result

    const codePreview = code.length > 100 ? code.slice(0, 100) + '...' : code

    await m.reply(
        `⚙️ *ʀᴇsᴜʟᴛᴀᴅᴏ ᴇxᴇᴄ*\n\n` +
        `╭┈┈⬡「 📋 *ᴄᴏᴅɪɢᴏ* 」\n` +
        `┃ \`${codePreview}\`\n` +
        `├┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
        `┃ ${status}\n` +
        `┃ Tipo: ${type}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `\`\`\`${output}\`\`\``
    )
}

export { pluginConfig as config, handler }