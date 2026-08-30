import { spawn } from 'child_process'
import path from 'path'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'restart',
    alias: ['reset', 'reboot', 'restartbot'],
    category: 'owner',
    description: 'Reiniciar el proceso del bot (reinicio real)',
    usage: '.restart',
    example: '.restart',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        await m.react('🔄')
        
        const startTime = Date.now()
        
        await sock.sendMessage(m.chat, {
            text: `🔄 *ʀᴇɪɴɪᴄɪᴀɴᴅᴏ ʙᴏᴛ...*\n\n` +
                  `☽◯☾ ♰ 「 📊 *ɪɴꜰᴏ* 」\n` +
                  `┃ ⏰ Hora: ${new Date().toLocaleTimeString('es-ES')}\n` +
                  `┃ 🔧 Método: Process Spawn\n` +
                  `┃ 📦 PID: ${process.pid}\n` +
                  `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
                  `> El bot se reiniciará en 2 segundos...\n` +
                  `> El proceso puede tardar de 10 a 30 segundos`
        }, { quoted: m })
        
        console.log('[Restart] Command triggered by:', m.sender)
        console.log('[Restart] Initiating graceful restart...')
        
        setTimeout(() => {
            const cwd = process.cwd()
            const isWindows = process.platform === 'win32'
            
            let command, args
            
            if (isWindows) {
                command = 'cmd.exe'
                args = ['/c', 'start', '/b', 'node', 'index.js']
            } else {
                command = 'node'
                args = ['index.js']
            }
            
            const child = spawn(command, args, {
                cwd: cwd,
                detached: true,
                stdio: 'ignore',
                shell: isWindows,
                env: { ...process.env, RESTARTED: 'true', RESTART_TIME: startTime.toString() }
            })
            
            child.unref()
            
            console.log('[Restart] New process spawned, exiting current process...')
            
            setTimeout(() => {
                process.exit(0)
            }, 500)
            
        }, 2000)
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }