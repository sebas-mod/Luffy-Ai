import fs from 'fs'
import path from 'path'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'clearsessions',
    alias: ['clearsession', 'delsession', 'delsessions'],
    category: 'owner',
    description: 'Eliminar todas las sessions en storage/sessions/',
    usage: '.clearsessions',
    example: '.clearsessions',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    carne: 0,
    isEnabled: true
}

async function handler(m)  {
    const sessionsPath = path.join(process.cwd(), 'storage', 'sessions')
    
    if (!fs.existsSync(sessionsPath)) {
        return m.reply(`╰┈➤ ❌ ¡La carpeta de sessions no existe!`)
    }
    
    await m.react('🗑️')
    
    try {
        const files = fs.readdirSync(sessionsPath)
        
        if (files.length === 0) {
            return m.reply(`╰┈➤ 📁 ¡La carpeta de sessions ya está vacía!`)
        }
        
        let deleted = 0
        let skipped = 0
        
        for (const file of files) {
            if (file === 'creds.json') {
                skipped++
                continue
            }
            
            const filePath = path.join(sessionsPath, file)
            try {
                const stat = fs.statSync(filePath)
                if (stat.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true })
                } else {
                    fs.unlinkSync(filePath)
                }
                deleted++
            } catch {}
        }
        
        await m.react('✅')
        await m.reply(
            `╭┈┈⬡「 🗑️ *ᴄʟᴇᴀʀ sᴇssɪᴏɴs* 」
┃
┃ ㊗ ᴇʟɪᴍɪɴᴀᴅᴏs: *${deleted}* archivos
┃ ㊗ ᴏᴍɪᴛɪᴅᴏs: *${skipped}* archivos
┃ ㊗ ɴᴏᴛᴀ: creds.json no se elimina
┃
╰┈┈⬡

> _¡Los archivos de session se limpiaron con éxito!_
> _Reinicia el bot si es necesario._`
        )
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }