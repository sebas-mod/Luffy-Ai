import fs from 'fs'
import path from 'path'
import config from '../../config.js'
const PREF_DB_PATH = path.join(process.cwd(), 'database', 'prefix.json')

function loadPrefixes() {
    try {
        if (fs.existsSync(PREF_DB_PATH)) {
            return JSON.parse(fs.readFileSync(PREF_DB_PATH, 'utf8'))
        }
    } catch {}
    return { prefixes: [], noprefix: false }
}

function savePrefixes(data) {
    const dir = path.dirname(PREF_DB_PATH)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(PREF_DB_PATH, JSON.stringify(data, null, 2), 'utf8')
}

function getAllPrefixes() {
    const dbPrefixes = loadPrefixes().prefixes || []
    const configPrefix = config.command?.prefix || '.'
    const combined = [configPrefix, ...dbPrefixes]
    return [...new Set(combined)]
}

function isNoPrefix() {
    const data = loadPrefixes()
    return data.noprefix === true
}

const pluginConfig = {
    name: ['addprefix', 'gantiprefix', 'setprefix', 'delprefix', 'listprefix', 'resetprefix'],
    alias: [],
    category: 'owner',
    description: 'Manajemen prefix bot',
    usage: '.addprefix <prefix1> <prefix2>...',
    example: '.addprefix ! # $',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const cmd = m.command?.toLowerCase()
    const args = m.args || []
    
    const data = loadPrefixes()
    if (!data.prefixes) data.prefixes = []
    if (data.noprefix === undefined) data.noprefix = false
    
    switch (cmd) {
        case 'addprefix': {
            if (args.length === 0) {
                return m.reply(
                    `✏️ *ᴀɢʀᴇɢᴀʀ ᴘʀᴇғɪᴊᴏ*\n\n` +
                    `> Agrega un nuevo prefijo para el bot\n\n` +
                    `*Formato:*\n` +
                    `> \`${m.prefix}addprefix <prefijo1> <prefijo2> ...\`\n\n` +
                    `*Ejemplo:*\n` +
                    `> \`${m.prefix}addprefix ! # $ 😚\`\n\n` +
                    `*Especial:*\n` +
                    `> \`${m.prefix}addprefix <noprefix>\` - Sin prefijo`
                )
            }
            
            if (args.includes('<noprefix>') || args.includes('noprefix')) {
                data.noprefix = true
                savePrefixes(data)
                return m.reply(
                    `✅ *sɪɴ ᴘʀᴇғɪᴊᴏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n` +
                    `> El bot ahora puede ejecutarse sin prefijo\n` +
                    `> Escribe directamente el nombre del comando (ej: \`menu\`)`
                )
            }
            
            const newPrefixes = args.filter(p => {
                if (!p || p.length > 5) return false
                if (data.prefixes.includes(p)) return false
                return true
            })
            
            if (newPrefixes.length === 0) {
                return m.reply(`❌ ¡No hay prefijos nuevos válidos!`)
            }
            
            data.prefixes = [...new Set([...data.prefixes, ...newPrefixes])]
            savePrefixes(data)
            
            m.reply(
                `✅ *ᴘʀᴇғɪᴊᴏ ᴀɢʀᴇɢᴀᴅᴏ*\n\n` +
                `> Agregado: \`${newPrefixes.join('` `')}\`\n\n` +
                `*Todos los prefijos activos:*\n` +
                `> \`${getAllPrefixes().join('` `')}\`` +
                `${data.noprefix ? '\n> + *sin prefijo* activo' : ''}`
            )
            break
        }
        
        case 'setprefix':
        case 'gantiprefix': {
            if (args.length === 0) {
                return m.reply(
                    `🔄 *ᴄᴀᴍʙɪᴀʀ/cᴏɴғɪɢᴜʀᴀʀ ᴘʀᴇғɪᴊᴏ*\n\n` +
                    `> Reemplaza todos los prefijos por los nuevos\n\n` +
                    `*Formato:*\n` +
                    `> \`${m.prefix}${cmd} <prefijo1> <prefijo2> ...\`\n\n` +
                    `*Ejemplo:*\n` +
                    `> \`${m.prefix}${cmd} ! G #\`\n\n` +
                    `*Especial:*\n` +
                    `> \`${m.prefix}${cmd} <noprefix>\` - Solo sin prefijo\n` +
                    `> \`${m.prefix}${cmd} . <noprefix>\` - Prefijo . + sin prefijo\n\n` +
                    `⚠️ ¡Esto eliminará todos los prefijos antiguos de la base de datos!`
                )
            }
            
            const hasNoprefix = args.includes('<noprefix>') || args.includes('noprefix')
            const newPrefixes = args.filter(p => {
                if (!p || p.length > 5) return false
                if (p === '<noprefix>' || p === 'noprefix') return false
                return true
            })
            
            data.prefixes = [...new Set(newPrefixes)]
            data.noprefix = hasNoprefix
            savePrefixes(data)
            
            let replyText = `✅ *ᴘʀᴇғɪᴊᴏ ᴄᴀᴍʙɪᴀᴅᴏ*\n\n`
            
            if (newPrefixes.length > 0) {
                replyText += `> Nuevos prefijos: \`${newPrefixes.join('` `')}\`\n`
            }
            
            if (hasNoprefix) {
                replyText += `> *Sin prefijo: Activo* (puedes escribir el comando directamente)\n`
            }
            
            replyText += `\n*Todos los prefijos activos:*\n`
            replyText += `> \`${getAllPrefixes().join('` `')}\``
            if (data.noprefix) replyText += `\n> + *sin prefijo* activo`
            
            m.reply(replyText)
            break
        }
        
        case 'delprefix': {
            if (args.length === 0) {
                return m.reply(
                    `🗑️ *ᴇʟɪᴍɪɴᴀʀ ᴘʀᴇғɪᴊᴏ*\n\n` +
                    `> Elimina un prefijo de la base de datos\n\n` +
                    `*Formato:*\n` +
                    `> \`${m.prefix}delprefix <prefijo1> <prefijo2> ...\`\n\n` +
                    `*Ejemplo:*\n` +
                    `> \`${m.prefix}delprefix ! $\`\n` +
                    `> \`${m.prefix}delprefix <noprefix>\` - Desactivar sin prefijo`
                )
            }
            
            if (args.includes('<noprefix>') || args.includes('noprefix')) {
                data.noprefix = false
                savePrefixes(data)
                return m.reply(`✅ *sɪɴ ᴘʀᴇғɪᴊᴏ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*`)
            }
            
            const toDelete = args
            const deleted = []
            
            data.prefixes = data.prefixes.filter(p => {
                if (toDelete.includes(p)) {
                    deleted.push(p)
                    return false
                }
                return true
            })
            
            savePrefixes(data)
            
            m.reply(
                `✅ *ᴘʀᴇғɪᴊᴏ ᴇʟɪᴍɪɴᴀᴅᴏ*\n\n` +
                `> Eliminado: \`${deleted.length > 0 ? deleted.join('` `') : 'Ninguno'}\`\n\n` +
                `*Todos los prefijos activos:*\n` +
                `> \`${getAllPrefixes().join('` `')}\`` +
                `${data.noprefix ? '\n> + *sin prefijo* activo' : ''}`
            )
            break
        }
        
        case 'listprefix': {
            const all = getAllPrefixes()
            const configPref = config.command?.prefix || '.'
            
            let text = `📋 *ʟɪsᴛᴀ ᴅᴇ ᴘʀᴇғɪᴊᴏs*\n\n`
            text += `╭┈┈⬡「 ⚙️ *ᴄᴏɴғɪɢ* 」\n`
            text += `┃ Predeterminado: \`${configPref}\`\n`
            text += `┃ Sin prefijo: ${data.noprefix ? '✅ Activo' : '❌ Inactivo'}\n`
            text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
            
            if (data.prefixes.length > 0) {
                text += `╭┈┈⬡「 📁 *ʙᴀsᴇ ᴅᴇ ᴅᴀᴛᴏs* 」\n`
                data.prefixes.forEach((p, i) => {
                    text += `┃ ${i + 1}. \`${p}\`\n`
                })
                text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
            }
            
            text += `*Total de prefijos activos:* ${all.length}`
            if (data.noprefix) text += ` + sin prefijo`
            text += `\n> \`${all.join('` `')}\``
            
            m.reply(text)
            break
        }
        
        case 'resetprefix': {
            data.prefixes = []
            data.noprefix = false
            savePrefixes(data)
            
            m.reply(
                `✅ *ᴘʀᴇғɪᴊᴏ ʀᴇɪɴɪᴄɪᴀᴅᴏ*\n\n` +
                `> ¡Se eliminaron todos los prefijos de la base de datos!\n` +
                `> ¡Se desactivó el modo sin prefijo!\n` +
                `> Solo queda el prefijo de config.js\n\n` +
                `*Prefijo activo:* \`${config.command?.prefix || '.'}\``
            )
            break
        }
    }
}

export { pluginConfig as config, handler, getAllPrefixes, loadPrefixes, savePrefixes, isNoPrefix }