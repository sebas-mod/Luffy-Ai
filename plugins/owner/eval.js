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

const PROMPT_HELP = [
    '⚙️ *ᴇᴠᴀʟ*',
    '',
    '> ¡Introduce código JavaScript!',
    '',
    '*Ejemplos:*',
    '> .$ 1 + 1',
    '> .$ m.chat',
    '> .$ db.getUser(m.sender)',
    '> .$ await sock.sendMessage(m.chat, { text: "hola" })',
    '',
    '*Multilínea (bloque ```):*',
    '> .$ ```',
    '> const a = 2;',
    '> return a * 5',
    '> ```',
    '',
    '*Helpers:* send · reply · readFile · writeFile · settle · getUsers · loadPlugin',
].join('\n')

function formatValue(v) {
    if (v === undefined) return 'undefined'
    if (v === null) return 'null'
    if (typeof v === 'object') {
        try {
            return util.inspect(v, { depth: 3, maxArrayLength: 60 })
        } catch {
            return String(v)
        }
    }
    return String(v)
}

function extractCode(raw) {
    let code = String(raw ?? '').trim()
    const fence = /^```(?:js|javascript)?\s*\n?([\s\S]*?)\n?```\s*$/i
    const fenceMatch = code.match(fence)
    if (fenceMatch) return fenceMatch[1].trim()
    return code
}

async function handler(m, { sock, store }) {
    if (!config.isOwner(m.sender)) {
        return m.reply('☽◯☾ ♰ ❌ *Owner Only!*')
    }

    const code = extractCode(m.fullArgs?.trim() || m.text?.trim())

    if (!code) {
        return m.reply(PROMPT_HELP)
    }

    const db = getDatabase()

    const logs = []
    const original = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug,
        table: console.table,
    }

    const capture = (level) => (...args) => {
        const txt = args
            .map((a) => (typeof a === 'string' ? a : formatValue(a)))
            .join(' ')
        logs.push(`[${level}] ${txt}`)
        if (level === 'ERROR' || level === 'WARN') original[level === 'ERROR' ? 'error' : 'warn'](...args)
    }

    console.log = capture('LOG')
    console.error = capture('ERROR')
    console.warn = capture('WARN')
    console.info = capture('INFO')
    console.debug = capture('DEBUG')

    // Helpers de conveniencia expuestos al código evaluado
    const helpers = {
        send: (text) => sock.sendMessage(m.chat, { text: String(text) }, { quoted: m }),
        reply: (text) => m.reply(String(text)),
        readFile: (p) => fs.readFileSync(path.resolve(p), 'utf-8'),
        writeFile: (p, data) => fs.writeFileSync(path.resolve(p), data, 'utf-8'),
        settle: async (promises) =>
            Promise.allSettled(Array.isArray(promises) ? promises : [promises]),
        getUsers: () => {
            try {
                const store = db.getStore && db.getStore()
                const list = store && store.data && store.data.users
                return Object.keys(list || {}).map((j) => list[j])
            } catch {
                return []
            }
        },
        loadPlugin: async (name) => {
            try {
                const mod = await import(`../../plugins/${name}.js`)
                return { config: mod.config, handler: typeof mod.handler }
            } catch (e) {
                return { error: e.message }
            }
        },
    }

    const ctx = { m, sock, store, db, config, fs, path, axios, os, util, ...helpers }
    const scopeNames = Object.keys(ctx).join(', ')

    let result
    let isError = false

    try {
        // 1º intento: expresión (retorno implícito → permite `. $ 1 + 2` sin `return`)
        try {
            result = await eval(
                `(async ({ ${scopeNames} }) => (${code}))(ctx)`
            )
        } catch (e1) {
            // 2º intento: bloque de statements (código multilínea con return/if/for...)
            result = await eval(
                `(async ({ ${scopeNames} }) => { ${code} })(ctx)`
            )
        }
        // Si el código retorna un array de promesas, esperarlas todas
        if (Array.isArray(result) && result.some((p) => p && typeof p.then === 'function')) {
            result = await Promise.all(result)
        }
    } catch (e) {
        isError = true
        result = e
    } finally {
        console.log = original.log
        console.error = original.error
        console.warn = original.warn
        console.info = original.info
        console.debug = original.debug
        console.table = original.table
    }

    // --- Log de auditoría ---
    try {
        const audit = db.setting('evalLog') || []
        audit.push({
            ts: Date.now(),
            sender: m.sender,
            status: isError ? 'error' : 'ok',
            code: code.length > 200 ? code.slice(0, 200) + '…' : code,
        })
        db.setting('evalLog', audit.slice(-50))
    } catch {}

    // --- Envío de respuestas directas (multimedia/custom) ---
    let sentDirect = false
    if (!isError && result !== undefined && result !== null) {
        const direct = await trySendDirect(m, sock, result)
        if (direct) sentDirect = true
    }

    // --- Formateo de texto/resumen ---
    let output = formatValue(result)
    if (isError && result instanceof Error) {
        output = `${result.stack || result.message}`
    }

    const logsText = logs.join('\n')
    if (logs.length) {
        output = output === 'undefined' && !isError && logsText
            ? logsText
            : `${logsText}\n\n➤ Retorno:\n${output}`
    }

    if (output.length > 3000) {
        output = output.slice(0, 3000) + '\n\n... (truncated)'
    }

    const status = isError ? '❌ Error' : '✅ Éxito'
    const type = isError ? (result?.name || 'Error') : (Array.isArray(result) ? 'Array' : typeof result)

    // Si ya se envió una respuesta directa, solo responder con el resumen
    await m.reply(
        `${status} · ${type}${sentDirect ? ' · 📎 respuesta enviada' : ''}\n` +
        (logs.length ? `🧾 ${logs.length} log(s)\n` : '') +
        `\`\`\`${output}\`\`\``
    )
}

const MEDIA_KEYS = ['text', 'image', 'video', 'audio', 'document', 'sticker', 'caption', 'mimetype', 'fileName', 'url', 'viewOnce', 'fileName', 'jpegThumbnail', 'ptt']

async function trySendDirect(m, sock, result) {
    // Buffer → enviar como imagen
    if (Buffer.isBuffer(result)) {
        try {
            await sock.sendMessage(m.chat, {
                image: result,
                caption: '📦 resultado (buffer)',
            }, { quoted: m })
            return true
        } catch {
            return false
        }
    }

    // Objeto estilo mensaje → enviar directo
    if (result && typeof result === 'object' && !Array.isArray(result)) {
        const isMessageLike =
            typeof result.text === 'string' ||
            result.image || result.video || result.audio ||
            result.document || result.sticker
        if (!isMessageLike) return false

        const content = {}
        for (const key of MEDIA_KEYS) {
            if (result[key] !== undefined) content[key] = result[key]
        }
        if (!content.caption && result.text) content.caption = content.caption ?? content.text

        try {
            await sock.sendMessage(m.chat, content, { quoted: m })
            return true
        } catch {
            return false
        }
    }

    return false
}

export { pluginConfig as config, handler }