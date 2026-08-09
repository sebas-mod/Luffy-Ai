import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'
const pluginConfig = {
    name: 'autoreply',
    alias: ['smarttrigger', 'smarttriggers', 'ar'],
    category: 'group',
    description: 'Configura autoreply/disparadores inteligentes por grupo',
    usage: '.autoreply on/off/add/del/list/private',
    example: '.autoreply on',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
}

const AUTOREPLY_MEDIA_DIR = path.join(process.cwd(), 'database', 'autoreply_media')

if (!fs.existsSync(AUTOREPLY_MEDIA_DIR)) {
    fs.mkdirSync(AUTOREPLY_MEDIA_DIR, { recursive: true })
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    const privateAutoreply = db.setting('autoreplyPrivate') ?? false
    
    if (action === 'private') {
        if (!m.isOwner) {
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡Solo el owner puede configurar el autoreply privado!`)
        }
        
        const subAction = args[1]?.toLowerCase()
        
        if (subAction === 'on') {
            db.setting('autoreplyPrivate', true)
            m.react('✅')
            return m.reply(`✅ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴘʀɪᴠᴀᴅᴏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot responderá automáticamente en el chat privado`)
        }
        
        if (subAction === 'off') {
            db.setting('autoreplyPrivate', false)
            m.react('❌')
            return m.reply(`❌ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴘʀɪᴠᴀᴅᴏ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot no responderá automáticamente en el chat privado`)
        }
        
        const currentStatus = db.setting('autoreplyPrivate') ?? false
        return m.reply(
            `📱 *AUTOREPLY PRIVADO*\n\n` +
            `Estado: *${currentStatus ? '✅ ACTIVO' : '❌ INACTIVO'}*\n\n` +
            `*COMANDOS DISPONIBLES:*\n` +
            `• *${m.prefix}autoreply private on* — Activar privado\n` +
            `• *${m.prefix}autoreply private off* — Desactivar privado`
        )
    }
    
    if (action === 'global') {
        if (!m.isOwner) {
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡Solo el owner puede configurar el autoreply global!`)
        }
        
        const subAction = args[1]?.toLowerCase()
        const globalCustomReplies = db.setting('globalCustomReplies') || []
        
        if (subAction === 'add') {
            const fullBody = m.body || ''
            const pipeIdx = fullBody.indexOf('|')
            if (pipeIdx === -1) {
                return m.reply(
                    `❌ *ꜰᴏʀᴍᴀᴛᴏ ɪɴᴄᴏʀʀᴇᴄᴛᴏ*\n\n` +
                    `> Usa el formato: \`trigger|reply\`\n\n` +
                    `> Ejemplo:\n` +
                    `> \`${m.prefix}autoreply global add halo|Hai {name}!\``
                )
            }
            
            const triggerStart = fullBody.toLowerCase().indexOf('global add ') + 'global add '.length
            const triggerEnd = pipeIdx
            const trigger = fullBody.substring(triggerStart, triggerEnd).trim()
            const reply = fullBody.substring(pipeIdx + 1)
            
            if (!trigger.trim() || !reply) {
                return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡El trigger y la respuesta no pueden estar vacíos!`)
            }
            
            const existingIndex = globalCustomReplies.findIndex(r => r.trigger.toLowerCase() === trigger.trim().toLowerCase())
            if (existingIndex !== -1) {
                globalCustomReplies[existingIndex].reply = reply
            } else {
                globalCustomReplies.push({ trigger: trigger.trim().toLowerCase(), reply: reply })
            }
            
            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()
            
            m.react('✅')
            return m.reply(
                `✅ *AUTOREPLY GLOBAL AGREGADO*\n\n` +
                `• Trigger: *${trigger.trim()}*\n` +
                `• Total: *${globalCustomReplies.length}* respuestas\n\n` +
                `_Activo en todos los grupos y chats privados_`
            )
        }
        
        if (subAction === 'del' || subAction === 'rm') {
            const trigger = args.slice(2).join(' ').toLowerCase().trim()
            if (!trigger) {
                return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡Ingresa el trigger que quieres eliminar!`)
            }
            
            const index = globalCustomReplies.findIndex(r => r.trigger === trigger)
            if (index === -1) {
                return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡Trigger \`${trigger}\` no encontrado!`)
            }
            
            globalCustomReplies.splice(index, 1)
            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()
            
            m.react('🗑️')
            return m.reply(`🗑️ *AUTOREPLY GLOBAL ELIMINADO*\n\n¡Trigger *${trigger}* eliminado correctamente!`)
        }
        
        if (subAction === 'list' || !subAction) {
            if (globalCustomReplies.length === 0) {
                return m.reply(
                    `📋 *AUTOREPLY GLOBAL*\n\n` +
                    `Estado: *❌ SIN DATOS*\n\n` +
                    `*COMANDOS DISPONIBLES:*\n` +
                    `• *${m.prefix}autoreply global add <trigger>|<reply>*`
                )
            }
            
            let text = `📋 *AUTOREPLY GLOBAL*\n\n`
            text += `Total: *${globalCustomReplies.length}* respuestas\n`
            text += `Válido en: *Todos los Grupos y Chats Privados*\n\n`
            text += `*LISTA DE TRIGGERS:*\n`
            globalCustomReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `${i + 1}. *${r.trigger}* ${hasImage}\n   ↳ ${r.reply.substring(0, 30)}${r.reply.length > 30 ? '...' : ''}\n\n`
            })
            return m.reply(text.trim())
        }
        
        return m.reply(
            `📱 *ɢʟᴏʙᴀʟ ᴀᴜᴛᴏʀᴇᴘʟʏ*\n\n` +
            `> \`${m.prefix}autoreply global add trigger|reply\`\n` +
            `> \`${m.prefix}autoreply global del trigger\`\n` +
            `> \`${m.prefix}autoreply global list\``
        )
    }
    
    if (!m.isGroup) {
        return m.reply(
            `📱 *SISTEMA AUTOREPLY*\n\n` +
            `Autoreply privado: *${privateAutoreply ? '✅ ACTIVO' : '❌ INACTIVO'}*\n\n` +
            `*COMANDOS DISPONIBLES:*\n` +
            `• *${m.prefix}autoreply private on/off* — Activar/desactivar privado\n` +
            `• *${m.prefix}autoreply global add/del/list* — Triggers globales\n\n` +
            `_Nota: Para configurar el autoreply del grupo, usa este comando dentro del grupo._`
        )
    }
    
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡Solo los admins pueden configurar el autoreply en el grupo!`)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const globalSmartTriggers = db.setting('smartTriggers') ?? config.features?.smartTriggers ?? false
    
    if (!action || action === 'status') {
        const groupStatus = groupData.autoreply
        const effectiveStatus = groupStatus ?? globalSmartTriggers
        const customReplies = groupData.customReplies || []
        
        let text = `🤖 *SISTEMA AUTOREPLY DEL GRUPO*\n\n`
        text += `Estado global: *${globalSmartTriggers ? '✅ ACTIVO' : '❌ INACTIVO'}*\n`
        text += `Estado de este grupo: *${groupStatus === undefined ? 'PREDETERMINADO' : (groupStatus ? '✅ ACTIVO' : '❌ INACTIVO')}*\n`
        text += `Estado privado: *${privateAutoreply ? '✅ ACTIVO' : '❌ INACTIVO'}*\n`
        text += `Efectivo en el grupo: *${effectiveStatus ? '✅ ACTIVO' : '❌ INACTIVO'}*\n`
        text += `Total de respuestas personalizadas (grupo): *${customReplies.length}*\n\n`
        text += `*GESTIÓN DEL GRUPO:*\n`
        text += `• *${m.prefix}autoreply on* — Activar en este grupo\n`
        text += `• *${m.prefix}autoreply off* — Desactivar en este grupo\n`
        text += `• *${m.prefix}autoreply add <trigger>|<reply>* — Agregar respuesta personalizada\n`
        text += `• *${m.prefix}autoreply del <trigger>* — Eliminar respuesta personalizada\n`
        text += `• *${m.prefix}autoreply list* — Ver todos los triggers de este grupo\n`
        text += `• *${m.prefix}autoreply reset* — Eliminar TODAS las personalizadas de este grupo\n\n`
        
        if (m.isOwner) {
            text += `*GESTIÓN GLOBAL (OWNER):*\n`
            text += `• *${m.prefix}autoreply global add <trigger>|<reply>*\n`
            text += `• *${m.prefix}autoreply global del <trigger>*\n`
            text += `• *${m.prefix}autoreply global list* — Triggers activos\n`
            text += `• *${m.prefix}autoreply private on/off* — Activar respuesta del bot en DM\n\n`
        }
        
        text += `*CÓMO AGREGAR IMÁGENES:*\n`
        text += `1. Envía la imagen con caption: *${m.prefix}autoreply add trigger|reply*\n`
        text += `2. O responde a una imagen con: *${m.prefix}autoreply add trigger|reply*\n\n`
        text += `*PUEDES USAR PLACEHOLDERS:*\n`
        text += `{name} • {tag} • {sender} • {botname} • {time} • {date}`
        
        return m.reply(text)
    }
    
    if (action === 'on') {
        db.setGroup(m.chat, { ...groupData, autoreply: true })
        m.react('✅')
        return m.reply(`✅ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot responderá automáticamente en este grupo`)
    }
    
    if (action === 'off') {
        db.setGroup(m.chat, { ...groupData, autoreply: false })
        m.react('❌')
        return m.reply(`❌ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot no responderá automáticamente en este grupo`)
    }
    
    if (action === 'add') {
        const fullBody = m.body || ''
        const pipeIdx = fullBody.indexOf('|')
        
        if (pipeIdx === -1) {
            return m.reply(
                `❌ *FORMATO INCORRECTO*\n\n` +
                `Usa el formato: *trigger|reply*\n\n` +
                `*Solo texto:*\n` +
                `• ${m.prefix}ar add halo|Hai {name}! 👋\n\n` +
                `*Con imagen:*\n` +
                `1. Responde a la imagen + ${m.prefix}ar add trigger|caption\n` +
                `2. Envía imagen + caption ${m.prefix}ar add trigger|caption\n\n` +
                `*Placeholders:*\n` +
                `• {name} - Nombre del usuario\n` +
                `• {tag} - Tag @user\n` +
                `• {sender} - Número del usuario\n` +
                `• {botname} - Nombre del bot\n` +
                `• {time} - Hora actual\n` +
                `• {date} - Fecha actual`
            )
        }
        
        const addIdx = fullBody.toLowerCase().indexOf('add ')
        const triggerStart = addIdx + 'add '.length
        const trigger = fullBody.substring(triggerStart, pipeIdx).trim()
        const reply = fullBody.substring(pipeIdx + 1)
        
        if (!trigger) {
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡El trigger no puede estar vacío!`)
        }
        
        let imageBuffer = null
        let imagePath = null
        
        const hasQuotedImage = m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.type === 'image')
        const hasDirectImage = m.mtype === 'imageMessage' || m.type === 'image'
        
        if (hasQuotedImage) {
            try {
                imageBuffer = await m.quoted.download()
            } catch (e) {
                console.error('[Autoreply] Failed to download quoted image:', e.message)
            }
        } else if (hasDirectImage) {
            try {
                imageBuffer = await m.download()
            } catch (e) {
                console.error('[Autoreply] Failed to download direct image:', e.message)
            }
        }
        
        if (imageBuffer) {
            const filename = `${m.chat.replace('@g.us', '')}_${trigger.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`
            imagePath = path.join(AUTOREPLY_MEDIA_DIR, filename)
            fs.writeFileSync(imagePath, imageBuffer)
        }
        
        const customReplies = groupData.customReplies || []
        const existingIndex = customReplies.findIndex(r => r.trigger.toLowerCase() === trigger.toLowerCase())
        
        const replyData = {
            trigger: trigger.toLowerCase(),
            reply: reply || '',
            image: imagePath || null,
            createdAt: Date.now()
        }
        
        if (existingIndex !== -1) {
            if (customReplies[existingIndex].image && customReplies[existingIndex].image !== imagePath) {
                try {
                    if (fs.existsSync(customReplies[existingIndex].image)) {
                        fs.unlinkSync(customReplies[existingIndex].image)
                    }
                } catch {}
            }
            customReplies[existingIndex] = replyData
        } else {
            customReplies.push(replyData)
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies })
        
        m.react('✅')
        
        let successMsg = `✅ *AUTOREPLY AGREGADO*\n\n`
        successMsg += `*DETALLE:*\n`
        successMsg += `• Trigger: *${trigger.trim()}*\n`
        if (reply) {
            successMsg += `• Respuesta: ${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}\n`
        }
        if (imagePath) {
            successMsg += `• Imagen: ✅ Guardada\n`
        }
        successMsg += `\nTotal: *${customReplies.length}* respuestas en este grupo`
        
        return m.reply(successMsg)
    }
    
    if (action === 'del' || action === 'rm' || action === 'remove') {
        const trigger = args.slice(1).join(' ').toLowerCase().trim()
        
        if (!trigger) {
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡Ingresa el trigger que quieres eliminar!\n\n\`${m.prefix}autoreply del halo\``)
        }
        
        const customReplies = groupData.customReplies || []
        const index = customReplies.findIndex(r => r.trigger === trigger)
        
        if (index === -1) {
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡Trigger \`${trigger}\` no encontrado!`)
        }
        
        if (customReplies[index].image) {
            try {
                if (fs.existsSync(customReplies[index].image)) {
                    fs.unlinkSync(customReplies[index].image)
                }
            } catch {}
        }
        
        customReplies.splice(index, 1)
        db.setGroup(m.chat, { ...groupData, customReplies })
        
        m.react('🗑️')
        return m.reply(
            `🗑️ *AUTOREPLY ELIMINADO*\n\n` +
            `¡Trigger *${trigger}* eliminado correctamente!\n` +
            `Restantes: *${customReplies.length}* respuestas`
        )
    }
    
    if (action === 'list') {
        const customReplies = groupData.customReplies || []
        
        const defaultTriggers = [
            { trigger: '@mention', reply: '👋 ¡Hola! ¿Alguien llamó al bot?' },
            { trigger: 'p', reply: '💬 ¡Saluda antes de la conversación!' },
            { trigger: 'bot / luffy', reply: '🤖 ¡Bot activo y listo!' },
            { trigger: 'assalamualaikum', reply: 'Waalaikumsalam, hermano' }
        ]
        
        let text = `📋 *LISTA DE AUTOREPLY DEL GRUPO*\n\n`
        
        text += `*TRIGGERS PREDETERMINADOS:*\n`
        defaultTriggers.forEach((r, i) => {
            text += `• *${r.trigger}*\n`
            text += `  ↳ ${r.reply}\n`
        })
        text += `\n`
        
        if (customReplies.length > 0) {
            text += `*TRIGGERS PERSONALIZADOS:*\n`
            customReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `• *${r.trigger}* ${hasImage}\n`
                if (r.reply) {
                    text += `  ↳ ${r.reply.substring(0, 35)}${r.reply.length > 35 ? '...' : ''}\n`
                }
            })
            text += `\n`
        } else {
            text += `*TRIGGERS PERSONALIZADOS:*\n`
            text += `_Aún no hay triggers personalizados en este grupo_\n\n`
        }
        
        text += `_Nota: Los triggers predeterminados del bot no se pueden editar._`
        
        return m.reply(text)
    }
    
    if (action === 'reset' || action === 'clear') {
        const customReplies = groupData.customReplies || []
        for (const r of customReplies) {
            if (r.image) {
                try {
                    if (fs.existsSync(r.image)) fs.unlinkSync(r.image)
                } catch {}
            }
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies: [] })
        m.react('🗑️')
        return m.reply(`🗑️ *ᴀᴜᴛᴏʀᴇᴘʟʏ ʀᴇsᴇᴛᴇᴀᴅᴏ*\n\n> ¡Todos los autoreply personalizados fueron eliminados!`)
    }
    
    return m.reply(`❌ *ᴀᴄᴄɪóɴ ɪɴᴠáʟɪᴅᴀ*\n\n> Usa: \`on\`, \`off\`, \`private on/off\`, \`add\`, \`del\`, \`list\`, \`reset\``)
}

export { pluginConfig as config, handler }