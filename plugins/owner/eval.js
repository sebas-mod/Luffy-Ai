import fs from 'fs'
import path from 'path'
import axios from 'axios'
import os from 'os'
import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
import util from 'util'
const pluginConfig = {
    name: 'eval',
    alias: ['$', 'ev', 'evaluate', '=>'],
    category: 'owner',
    description: 'Ejecutar código JavaScript (Solo Owner)',
    usage: '=> <código> o .$ <código>',
    example: '=> m.chat',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    carne: 0,
    isEnabled: true,
    noPrefix: ['=>'],
    customTrigger: (body) => body?.startsWith('=>')
}

async function handler(m, { sock, store }) {
    if (!config.isOwner(m.sender)) {
        return m.reply('☽◯☾ ♰ ❌ *Owner Only!*')
    }

    const code = m.fullArgs?.trim() || m.text?.trim()

    if (!code) {
        return m.reply(
            `⚙️ *ᴇᴠᴀʟ*\n\n` +
            `> ¡Introduce código JavaScript!\n\n` +
            `*Ejemplo:*\n` +
            `> .$ 1 + 1\n` +
            `> .$ m.chat\n` +
            `> .$ db.getUser(m.sender)`
        )
    }

    const db = getDatabase()

    const logs = []
    const original = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug,
    }

    const capture = (level) => (...args) => {
        const txt = args
            .map((a) => {
                try {
                    return typeof a === 'string'
                        ? a
                        : util.inspect(a, { depth: 4, maxArrayLength: 50 })
                } catch {
                    return String(a)
                }
            })
            .join(' ')
        logs.push(`[${level}] ${txt}`)
    }

    console.log = capture('LOG')
    console.error = capture('ERROR')
    console.warn = capture('WARN')
    console.info = capture('INFO')
    console.debug = capture('DEBUG')

    const ctx = { m, sock, store, db, config, fs, path, axios, os, util }
    const scopeNames = Object.keys(ctx).join(', ')

    let result
    let isError = false

    try {
        result = await eval(
            `(async ({ ${scopeNames} }) => { ${code} })(ctx)`
        )
    } catch (e) {
        isError = true
        result = e
    } finally {
        console.log = original.log
        console.error = original.error
        console.warn = original.warn
        console.info = original.info
        console.debug = original.debug
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

    if (logs.length) {
        const logsText = logs.join('\n')
        output = output === 'undefined' && isError === false && logsText
            ? logsText
            : `${logsText}\n\n➤ Retorno:\n${output}`
    }

    if (output.length > 3000) {
        output = output.slice(0, 3000) + '\n\n... (truncated)'
    }

    const status = isError ? '❌ Error' : '✅ Éxito'
    const type = isError ? result?.name || 'Error' : typeof result

    await m.reply(
        `⚙️ *ʀᴇsᴜʟᴛᴀᴅᴏ ᴇᴠᴀʟ*\n\n` +
        `☽◯☾ ♰ 「 📋 *ɪɴғᴏ* 」\n` +
        `┃ ${status}\n` +
        `┃ Tipo: ${type}\n` +
        (logs.length ? `┃ Logs: ${logs.length}\n` : '') +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `\`\`\`${output}\`\`\``
    )
}

export { pluginConfig as config, handler }