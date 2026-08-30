import fs from 'fs'
import path from 'path'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'luffy-large',
    alias: ["configurar_luffy_grande"],
    category: 'owner',
    description: 'Preset: cambiar la imagen luffy.jpg, y también de luffy-v7 hasta luffy-v11.jpg a la vez',
    usage: '.luffy-large (responde/envía imagen)',
    example: '.luffy-large',
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
        return m.reply(`👑•─────•👑\n🖼️ *ᴘʀᴇsᴇᴛ ʟᴜꜰꜰʏ ɢʀᴀɴᴅᴇ*\n\n> Envía/responde una imagen para reemplazar el conjunto de fotos grandes (luffy.jpg, luffy-v8.jpg, luffy-v10.jpg) a la vez.\n> Asegúrate de que la proporción de la imagen sea la deseada.\n♰ ──────── ♱`)
    }
    
    await m.react('🕕')
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            await m.react('❌')
            return m.reply(`☽◯☾ ♰ ❌ Error al descargar la imagen`)
        }
        
        const targetImages = [
            'luffy.jpg',
            'luffy-v8.jpg',
            'luffy-v10.jpg'
        ]
        
        const assetsDir = path.join(process.cwd(), 'assets', 'images')
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true })
        }
        
        for (const imgName of targetImages) {
            const targetPath = path.join(assetsDir, imgName)
            fs.writeFileSync(targetPath, buffer)
        }
        
        await m.react('✅')
        m.reply(`👑•─────•👑\n✅ *ᴇxɪᴛᴏsᴏ*\n\n> El bundle de imágenes *luffy-large* fue reemplazado masivamente.\n> Incluye: ${targetImages.join(', ')}\n> Reinicia el bot si la imagen no cambia de inmediato.\n♰ ──────── ♱`)
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }