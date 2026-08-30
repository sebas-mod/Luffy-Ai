import fs from 'fs'
import path from 'path'
import te from '../../src/lib/luffy-error.js'
import { updateAssetUrl } from '../../src/lib/luffy-uploader.js'
const pluginConfig = {
    name: 'cambiar_luffy_rpg',
    alias: ["configurar_luffy_rpg"],
    category: 'owner',
    description: 'Cambiar la imagen luffy-rpg.jpg (miniatura de rpg)',
    usage: '.cambiar_luffy_rpg (responde/envía imagen)',
    example: '.cambiar_luffy_rpg',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    
    if (!isImage) {
        return m.reply(`👑•─────•👑\n🖼️ *ᴄᴀᴍʙɪᴀʀ ᴏᴜʀɪɴ-ʀᴘɢ.ᴊᴘɢ*\n\n> Envía/responde una imagen para reemplazarla\n> Archivo: assets/images/luffy-rpg.jpg\n♰ ──────── ♱`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`☽◯☾ ♰ ❌ Error al descargar la imagen`)
        }
        
        await m.reply(`☽◯☾ ♰ ⏳ Subiendo la imagen...`)
        try {
            const newUrl = await updateAssetUrl('luffy-rpg', buffer, 'luffy-rpg.jpg')
            m.reply(`👑•─────•👑\n✅ *ᴇxɪᴛᴏsᴏ*\n\n> La imagen luffy-rpg.jpg fue reemplazada por la nueva URL:\n> ${newUrl}\n> ¡La config se actualizó en tiempo real!\n♰ ──────── ♱`)
        } catch (e) {
            m.reply(`☽◯☾ ♰ ❌ Error al subir la imagen: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }