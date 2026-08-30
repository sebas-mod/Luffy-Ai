import { exec } from 'child_process'
import util from 'util'
import te from '../../src/lib/luffy-error.js'

const execAsync = util.promisify(exec)

const pluginConfig = {
    name: 'update',
    alias: ['gitcommit', 'commit', 'pushrepo'],
    category: 'owner',
    description: 'Hacer commit de todos los cambios del repositorio (y push opcional)',
    usage: '.update [mensaje] | .update push [mensaje]',
    example: '.update fix: traducir comandos',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    carne: 0,
    isEnabled: true
}

async function runCmd(cmd, cwd = process.cwd()) {
    const { stdout, stderr } = await execAsync(cmd, { cwd, maxBuffer: 1024 * 1024 * 10 })
    return { stdout: stdout?.trim(), stderr: stderr?.trim() }
}

async function handler(m, { sock }) {
    try {
        const args = m.args || []
        const doPush = args[0]?.toLowerCase() === 'push'
        const messageParts = doPush ? args.slice(1) : args
        const commitMessage = messageParts.join(' ').trim() || 'update: cambios del bot'

        await m.react('🕕')

        const before = Date.now()

        const { stdout: statusOut } = await runCmd('git status --porcelain')
        const changes = statusOut.split('\n').filter(l => l.trim())

        if (changes.length === 0) {
            await m.react('✅')
            return m.reply(`☽◯☾ ╭ ♰ ⚙️ SISTEMA ♰ ━╮ ☽◯☾\n┃ 📦 *sɪɴ ᴄᴀᴍʙɪᴏs*\n╰━━━━━━━━╯\n\n☽◯☾ ♰ No hay cambios que confirmar en el repositorio.\n› El árbol de trabajo está limpio.`)
        }

        await runCmd('git add -A')

        const commitMsg = `${commitMessage}\n\nActualizado: ${new Date().toISOString()}`
        await runCmd(`git commit -m ${JSON.stringify(commitMsg)}`)

        let pushInfo = ''
        if (doPush) {
            const branch = (await runCmd('git rev-parse --abbrev-ref HEAD')).stdout || 'main'
            await runCmd(`git push origin ${branch}`)
            pushInfo = `┃ 📤 Push: *✅ ${branch}*\n`
        }

        const elapsed = ((Date.now() - before) / 1000).toFixed(1)

        const fileList = changes.slice(0, 15).map(c => {
            const p = c.replace(/^\S+\s+/, '').trim()
            return p.length > 40 ? p.slice(0, 37) + '...' : p
        }).join('\n')

        await m.react('✅')
        await m.reply(
            `📦 *ᴄᴏᴍᴍɪᴛ ᴇxɪᴛᴏsᴏ*\n\n` +
            `☽◯☾ ♰ 「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
            `┃ 📝 Mensaje: *${commitMessage}*\n` +
            `┃ 📄 Archivos: *${changes.length}*\n` +
            (pushInfo ? `┃ ${pushInfo}` : '') +
            `┃ ⏱️ Tiempo: *${elapsed}s*\n` +
            `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
            `📂 *Archivos:*\n\`\`\`${fileList}\`\`\``
        )
    } catch (error) {
        await m.react('☢')
        await m.reply(
            `❌ *ғᴀʟʟɪᴅᴏ ᴇɴ ᴇʟ ᴄᴏᴍᴍɪᴛ*\n` +
            `──────────\n\n` +
            `☽◯☾ ♰ ${error.stderr || error.message || 'Error desconocido'}\n\n` +
            `› Comprueba la salida del comando para más detalles.`
        )
    }
}

export { pluginConfig as config, handler }
