import { execFile } from 'child_process'
import { promisify } from 'util'
import config from '../../config.js'

const execFileAsync = promisify(execFile)

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

async function runGit(args, cwd = process.cwd()) {
    const { stdout, stderr } = await execFileAsync('git', args, { cwd, maxBuffer: 1024 * 1024 * 10 })
    return { stdout: stdout?.trim(), stderr: stderr?.trim() }
}

const GITHUB_USER = 'sebas-mod'
const REPO_URL = 'https://github.com/sebas-mod/Luffy-Ai'

async function getIdentity() {
    const userName = GITHUB_USER
    const userEmail = `${GITHUB_USER}@users.noreply.github.com`

    try {
        await runGit(['remote', 'set-url', 'origin', REPO_URL])
    } catch {}

    return { userName, userEmail }
}

async function handler(m, { sock }) {
    try {
        const args = m.args || []
        const doPush = args[0]?.toLowerCase() === 'push'
        const messageParts = doPush ? args.slice(1) : args
        const commitMessage = messageParts.join(' ').trim() || 'update: cambios del bot'

        await m.react('🕕')

        const before = Date.now()

        const { stdout: statusOut } = await runGit(['status', '--porcelain'])
        const changes = statusOut.split('\n').filter(l => l.trim())

        if (changes.length === 0) {
            await m.react('✅')
            return m.reply(`☽◯☾ ╭ ♰ ⚙️ SISTEMA ♰ ━╮ ☽◯☾\n┃ 📦 *sɪɴ ᴄᴀᴍʙɪᴏs*\n╰━━━━━━━━╯\n\n☽◯☾ ♰ No hay cambios que confirmar en el repositorio.\n› El árbol de trabajo está limpio.`)
        }

        await runGit(['add', '-A'])

        const { userName, userEmail } = await getIdentity()
        const authorArgs = ['-c', `user.name=${userName}`, '-c', `user.email=${userEmail}`]

        const commitMsg = `${commitMessage}\n\nActualizado: ${new Date().toISOString()}`
        await runGit([...authorArgs, 'commit', '-m', commitMsg])

        let pushInfo = ''
        if (doPush) {
            const { stdout: branch } = await runGit(['rev-parse', '--abbrev-ref', 'HEAD'])
            const currentBranch = branch || 'main'
            try {
                await runGit(['push', 'origin', currentBranch])
                pushInfo = `┃ 📤 Push: *✅ ${currentBranch}*\n`
            } catch (pushError) {
                pushInfo = `┃ 📤 Push: *❌ ${currentBranch}*\n` +
                           `┃ ↳ ${String(pushError.stderr || pushError.message).split('\n').find(l => l.trim()) || 'Error desconocido'}\n`
            }
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
            `┃ 🧑 Author: *${userName}*\n` +
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